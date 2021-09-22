package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.FacilityDeviceSpecimenType;
import gov.cdc.usds.simplereport.db.repository.FacilityDeviceSpecimenTypeRepository;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FacilityDeviceTypeService {
  private final FacilityDeviceSpecimenTypeRepository _facilityDeviceSpecimenRepo;

  DeviceSpecimenType getDefaultForDeviceId(UUID facilityId, UUID deviceTypeId) {
    return _facilityDeviceSpecimenRepo
        .findFirstByFacilityInternalIdAndDeviceSpecimenTypeDeviceTypeInternalIdOrderByDeviceSpecimenTypeCreatedAt(
            facilityId, deviceTypeId)
        .orElseThrow(
            () ->
                new IllegalGraphqlArgumentException(
                    "Device is not configured with a specimen type"))
        .getDeviceSpecimenType();
  }

  List<DeviceSpecimenType> getDeviceSpecimenTypes(UUID facilityId) {
    List<FacilityDeviceSpecimenType> facilityDeviceSpecimenTypes =
        _facilityDeviceSpecimenRepo
            .findByFacilityInternalIdOrderByDeviceSpecimenTypeCreatedAt(facilityId)
            .orElseThrow(
                () ->
                    new IllegalGraphqlArgumentException(
                        "Device is not configured with a specimen type"));

    return facilityDeviceSpecimenTypes.stream()
        .map(FacilityDeviceSpecimenType::getDeviceSpecimenType)
        .collect(Collectors.toList());
  }
}
