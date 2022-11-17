package gov.cdc.usds.simplereport.api.devicetype;

import static java.util.Collections.emptyList;

import gov.cdc.usds.simplereport.db.model.DeviceSupportedDisease;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeSpecimenTypeMapping;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeNewRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceSupportedDiseaseRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.service.DiseaseService;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import org.dataloader.DataLoader;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.graphql.execution.BatchLoaderRegistry;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Mono;

@Controller
public class DeviceTypeDataResolver {

  public DeviceTypeDataResolver(
      BatchLoaderRegistry registry,
      DeviceSupportedDiseaseRepository deviceSupportedDiseaseRepository,
      DiseaseService diseaseService,
      DeviceSpecimenTypeNewRepository deviceSpecimenTypeNewRepository,
      SpecimenTypeRepository specimenTypeRepository) {

    Class<List<SupportedDisease>> supportedDiseasesListClazz = (Class) List.class;
    registry
        .forTypePair(UUID.class, supportedDiseasesListClazz)
        .withName("deviceTypeSupportedDiseasesLoader")
        .registerMappedBatchLoader(
            (deviceTypeIds, batchLoaderEnvironment) -> {

              // load cached supportedDisease
              Map<UUID, SupportedDisease> supportedDiseasesMap =
                  diseaseService.getSupportedDiseasesMap();

              // load deviceType -> [supportedDisease]
              List<DeviceSupportedDisease> allByDeviceTypeIdIn =
                  deviceSupportedDiseaseRepository.findAllByDeviceTypeIdIn(deviceTypeIds);
              Map<UUID, List<DeviceSupportedDisease>> deviceTypeIdSupportedDiseaseIdsMapping =
                  allByDeviceTypeIdIn.stream()
                      .collect(Collectors.groupingBy(DeviceSupportedDisease::getDeviceTypeId));

              Map<UUID, List<SupportedDisease>> found = new HashMap<>();

              // this makes sure we return an empty array if no supported diseases exist
              deviceTypeIds.forEach(deviceTypeId -> found.put(deviceTypeId, emptyList()));

              deviceTypeIdSupportedDiseaseIdsMapping.forEach(
                  (deviceTypeId, deviceSupportedDiseaseIds) -> {
                    List<SupportedDisease> deviceSupportedDiseases =
                        deviceSupportedDiseaseIds.stream()
                            .map(
                                deviceSupportedDisease ->
                                    supportedDiseasesMap.get(
                                        deviceSupportedDisease.getSupportedDiseaseId()))
                            .collect(Collectors.toList());
                    found.put(deviceTypeId, deviceSupportedDiseases);
                  });

              return Mono.just(found);
            });

    Class<List<SpecimenType>> specimenTypesListClazz = (Class) List.class;
    registry
        .forTypePair(UUID.class, specimenTypesListClazz)
        .withName("deviceTypeSpecimenTypesLoader")
        .registerMappedBatchLoader(
            (deviceTypeIds, batchLoaderEnvironment) -> {

              // get all deviceType and specimenType to deviceType mapping from db
              List<DeviceTypeSpecimenTypeMapping> deviceTypeSpecimenTypeList =
                  deviceSpecimenTypeNewRepository.findAllByDeviceTypeIdIn(deviceTypeIds);

              // load all needed specimen types ids
              List<UUID> specimenTypeIds =
                  deviceTypeSpecimenTypeList.stream()
                      .map(DeviceTypeSpecimenTypeMapping::getSpecimenTypeId)
                      .distinct()
                      .collect(Collectors.toList());

              // load needed specimen types from db
              Map<UUID, SpecimenType> specimenTypeMap =
                  specimenTypeRepository.findAllByInternalIdIn(specimenTypeIds).stream()
                      .collect(
                          Collectors.toMap(
                              SpecimenType::getInternalId, specimenType -> specimenType));

              // calc map of deviceType to specimenTypes
              Map<UUID, List<DeviceTypeSpecimenTypeMapping>> deviceTypeIdSpecimenTypeIdsMapping =
                  deviceTypeSpecimenTypeList.stream()
                      .collect(
                          Collectors.groupingBy(DeviceTypeSpecimenTypeMapping::getDeviceTypeId));

              Map<UUID, List<SpecimenType>> found = new HashMap<>();
              // this makes sure we return an empty array if no supported diseases exist
              deviceTypeIds.forEach(deviceTypeId -> found.put(deviceTypeId, emptyList()));

              deviceTypeIdSpecimenTypeIdsMapping.forEach(
                  (deviceTypeId, deviceTypeSpecimenTypeMappingList) -> {
                    List<SpecimenType> specimenTypes =
                        deviceTypeSpecimenTypeMappingList.stream()
                            .map(
                                deviceTypeSpecimenTypeMapping ->
                                    specimenTypeMap.get(
                                        deviceTypeSpecimenTypeMapping.getSpecimenTypeId()))
                            .collect(Collectors.toList());
                    found.put(deviceTypeId, specimenTypes);
                  });

              return Mono.just(found);
            });
  }

  @SchemaMapping(typeName = "DeviceType", field = "supportedDiseases")
  public CompletableFuture<List<SupportedDisease>> supportedDiseases(
      DeviceType deviceType,
      DataLoader<UUID, List<SupportedDisease>> deviceTypeSupportedDiseasesLoader) {
    return deviceTypeSupportedDiseasesLoader.load(deviceType.getInternalId());
  }

  @SchemaMapping(typeName = "DeviceType", field = "swabTypes")
  public CompletableFuture<List<SpecimenType>> swabTypes(
      DeviceType deviceType, DataLoader<UUID, List<SpecimenType>> deviceTypeSpecimenTypesLoader) {
    return deviceTypeSpecimenTypesLoader.load(deviceType.getInternalId());
  }
}
