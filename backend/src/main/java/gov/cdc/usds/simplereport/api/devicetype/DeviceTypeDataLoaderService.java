package gov.cdc.usds.simplereport.api.devicetype;

import static java.util.Collections.emptyList;

import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.DeviceTypeSpecimenTypeMapping;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeNewRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeDiseaseRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.service.DiseaseService;
import java.util.ArrayList;
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

  final DiseaseService diseaseService;
  final DeviceSpecimenTypeNewRepository deviceSpecimenTypeNewRepository;
  final SpecimenTypeRepository specimenTypeRepository;
  final DeviceTypeDiseaseRepository deviceTypeDiseaseRepository;

  Map<UUID, List<SupportedDisease>> getSupportedDiseases(Set<UUID> deviceTypeIds) {
    // load cached supportedDisease
    Map<UUID, SupportedDisease> supportedDiseasesMap =
        diseaseService.getKnownSupportedDiseasesMap();

    // load deviceType -> [supportedDisease]
    List<DeviceTypeDisease> allByDeviceTypeIdIn =
        deviceTypeDiseaseRepository.findAllByDeviceTypeIdIn(deviceTypeIds);
    Map<UUID, List<DeviceTypeDisease>> deviceTypeIdSupportedDiseaseIdsMapping =
        allByDeviceTypeIdIn.stream()
            .collect(Collectors.groupingBy(DeviceTypeDisease::getDeviceTypeId));

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
                              deviceSupportedDisease.getSupportedDisease().getInternalId()))
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

  Map<UUID, List<DeviceTypeDisease>> getDeviceTypeDisease(Set<UUID> deviceTypeIds) {
    var found = new HashMap<UUID, List<DeviceTypeDisease>>();
    deviceTypeIds.forEach(id -> found.put(id, new ArrayList<>()));
    deviceTypeDiseaseRepository
        .findAllByDeviceTypeIdIn(deviceTypeIds)
        .forEach(
            deviceTypeDisease ->
                found.get(deviceTypeDisease.getDeviceTypeId()).add(deviceTypeDisease));
    return found;
  }
}
