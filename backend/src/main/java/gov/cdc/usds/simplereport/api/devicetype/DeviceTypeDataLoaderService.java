package gov.cdc.usds.simplereport.api.devicetype;

import static java.util.Collections.emptyList;

import gov.cdc.usds.simplereport.db.model.DeviceSupportedDisease;
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
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class DeviceTypeDataLoaderService {

  final DeviceSupportedDiseaseRepository deviceSupportedDiseaseRepository;
  final DiseaseService diseaseService;
  final DeviceSpecimenTypeNewRepository deviceSpecimenTypeNewRepository;
  final SpecimenTypeRepository specimenTypeRepository;

  Map<UUID, List<SupportedDisease>> getSupportedDiseases(Set<UUID> deviceTypeIds) {
    // load cached supportedDisease
    Map<UUID, SupportedDisease> supportedDiseasesMap =
        diseaseService.getKnownSupportedDiseasesMap();

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
                          supportedDiseasesMap.get(deviceSupportedDisease.getSupportedDiseaseId()))
                  .collect(Collectors.toList());
          found.put(deviceTypeId, deviceSupportedDiseases);
        });

    return found;
  }

  Map<UUID, List<SpecimenType>> getSpecimenTypes(Set<UUID> deviceTypeIds) {
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
            .collect(Collectors.toMap(SpecimenType::getInternalId, specimenType -> specimenType));

    // calc map of deviceType to specimenTypes
    Map<UUID, List<DeviceTypeSpecimenTypeMapping>> deviceTypeIdSpecimenTypeIdsMapping =
        deviceTypeSpecimenTypeList.stream()
            .collect(Collectors.groupingBy(DeviceTypeSpecimenTypeMapping::getDeviceTypeId));

    Map<UUID, List<SpecimenType>> found = new HashMap<>();
    // this makes sure we return an empty array if no supported diseases exist
    deviceTypeIds.forEach(deviceTypeId -> found.put(deviceTypeId, emptyList()));

    deviceTypeIdSpecimenTypeIdsMapping.forEach(
        (deviceTypeId, deviceTypeSpecimenTypeMappingList) -> {
          List<SpecimenType> specimenTypes =
              deviceTypeSpecimenTypeMappingList.stream()
                  .map(
                      deviceTypeSpecimenTypeMapping ->
                          specimenTypeMap.get(deviceTypeSpecimenTypeMapping.getSpecimenTypeId()))
                  .collect(Collectors.toList());
          found.put(deviceTypeId, specimenTypes);
        });

    return found;
  }
}
