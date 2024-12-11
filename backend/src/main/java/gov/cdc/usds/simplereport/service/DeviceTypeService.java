package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.DeviceTypeSpecimenTypeMapping;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeNewRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeDiseaseRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for fetching the device-type reference list (<i>not</i> the device types available for a
 * specific facility or organization).
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class DeviceTypeService {

  private static final String SWAB_TYPE_DELETED_MESSAGE =
      "swab type has been deleted and cannot be used";
  private static final String DUPLICATE_DEVICE_MESSAGE =
      "an active device type already exists with the same manufacturer and model";

  private final DeviceTypeRepository deviceTypeRepository;
  private final DeviceSpecimenTypeNewRepository deviceSpecimenTypeNewRepository;
  private final SpecimenTypeRepository specimenTypeRepository;
  private final SupportedDiseaseRepository supportedDiseaseRepository;
  private final DeviceTypeDiseaseRepository deviceTypeDiseaseRepository;

  @Transactional
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public void removeDeviceType(DeviceType d) {
    deviceTypeRepository.delete(d);
  }

  public List<DeviceType> fetchDeviceTypes() {
    return deviceTypeRepository.findAll();
  }

  public DeviceType getDeviceType(UUID internalId) {
    return deviceTypeRepository
        .findById(internalId)
        .orElseThrow(() -> new IllegalGraphqlArgumentException("invalid device type ID"));
  }

  public DeviceType getDeviceType(String name) {
    return deviceTypeRepository.findDeviceTypeByName(name);
  }

  @Transactional
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public DeviceType updateDeviceType(UpdateDeviceType updateDevice) {

    DeviceType device = getDeviceType(updateDevice.getInternalId());
    if (updateDevice.getName() != null) {
      device.setName(updateDevice.getName());
    }
    if (updateDevice.getTestLength() > 0) {
      device.setTestLength(updateDevice.getTestLength());
    }
    if (updateDevice.getManufacturer() != null) {
      device.setManufacturer(updateDevice.getManufacturer());
    }
    if (updateDevice.getModel() != null) {
      device.setModel(updateDevice.getModel());
    }
    if (updateDevice.getSwabTypes() != null) {
      List<SpecimenType> updatedSpecimenTypes =
          updateDevice.getSwabTypes().stream()
              .map(specimenTypeRepository::findById)
              .filter(Optional::isPresent)
              .map(Optional::get)
              .toList();

      updatedSpecimenTypes.forEach(
          specimenType -> {
            if (specimenType.getIsDeleted()) {
              throw new IllegalGraphqlArgumentException(SWAB_TYPE_DELETED_MESSAGE);
            }
          });

      List<DeviceTypeSpecimenTypeMapping> newDeviceSpecimenTypes =
          updatedSpecimenTypes.stream()
              .map(
                  specimenType ->
                      new DeviceTypeSpecimenTypeMapping(
                          device.getInternalId(), specimenType.getInternalId()))
              .toList();

      List<DeviceTypeSpecimenTypeMapping> exitingDeviceSpecimenTypes =
          deviceSpecimenTypeNewRepository.findAllByDeviceTypeId(device.getInternalId());

      // delete old ones
      ArrayList<DeviceTypeSpecimenTypeMapping> toBeDeletedDeviceSpecimenTypes =
          new ArrayList<>(exitingDeviceSpecimenTypes);
      toBeDeletedDeviceSpecimenTypes.removeAll(newDeviceSpecimenTypes);
      deviceSpecimenTypeNewRepository.deleteAll(toBeDeletedDeviceSpecimenTypes);

      // create new ones
      ArrayList<DeviceTypeSpecimenTypeMapping> toBeAddedDeviceSpecimenTypes =
          new ArrayList<>(newDeviceSpecimenTypes);
      toBeAddedDeviceSpecimenTypes.removeAll(exitingDeviceSpecimenTypes);
      deviceSpecimenTypeNewRepository.saveAll(toBeAddedDeviceSpecimenTypes);
    }

    if (updateDevice.getSupportedDiseaseTestPerformed() != null) {
      List<DeviceTypeDisease> deviceTypeDiseaseList =
          createDeviceTypeDiseaseList(updateDevice.getSupportedDiseaseTestPerformed(), device);
      device.getSupportedDiseaseTestPerformed().clear();
      device.getSupportedDiseaseTestPerformed().addAll(deviceTypeDiseaseList);
    }
    return deviceTypeRepository.save(device);
  }

  @Transactional
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public DeviceType createDeviceType(CreateDeviceType createDevice) {
    List<SpecimenType> specimenTypes =
        createDevice.getSwabTypes().stream()
            .map(specimenTypeRepository::findById)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .toList();

    specimenTypes.forEach(
        specimenType -> {
          if (specimenType.getIsDeleted()) {
            throw new IllegalGraphqlArgumentException(SWAB_TYPE_DELETED_MESSAGE);
          }
        });

    deviceTypeRepository
        .findDeviceTypeByManufacturerAndModelAndIsDeletedFalse(
            createDevice.getManufacturer(), createDevice.getModel())
        .ifPresent(
            deviceType -> {
              throw new IllegalGraphqlArgumentException(DUPLICATE_DEVICE_MESSAGE);
            });

    DeviceType dt =
        deviceTypeRepository.save(
            new DeviceType(
                createDevice.getName(),
                createDevice.getManufacturer(),
                createDevice.getModel(),
                createDevice.getTestLength()));

    specimenTypes.stream()
        .map(
            specimenType ->
                new DeviceTypeSpecimenTypeMapping(dt.getInternalId(), specimenType.getInternalId()))
        .forEach(deviceSpecimenTypeNewRepository::save);

    var deviceTypeDiseaseList =
        createDeviceTypeDiseaseList(createDevice.getSupportedDiseaseTestPerformed(), dt);
    dt.getSupportedDiseaseTestPerformed().addAll(deviceTypeDiseaseList);
    deviceTypeRepository.save(dt);

    return dt;
  }

  public List<DeviceTypeDisease> createDeviceTypeDiseaseList(
      List<SupportedDiseaseTestPerformedInput> supportedDiseaseTestPerformedInput,
      DeviceType device) {
    var deviceTypeDiseaseList = new ArrayList<DeviceTypeDisease>();
    supportedDiseaseTestPerformedInput.forEach(
        input -> {
          var supportedDisease = supportedDiseaseRepository.findById(input.getSupportedDisease());
          supportedDisease.ifPresent(
              disease ->
                  deviceTypeDiseaseList.add(
                      DeviceTypeDisease.builder()
                          .deviceTypeId(device.getInternalId())
                          .supportedDisease(disease)
                          .testPerformedLoincCode(input.getTestPerformedLoincCode())
                          .testPerformedLoincLongName(input.getTestPerformedLoincLongName())
                          .testOrderedLoincCode(input.getTestOrderedLoincCode())
                          .testOrderedLoincLongName(input.getTestOrderedLoincLongName())
                          .equipmentUid(input.getEquipmentUid())
                          .equipmentUidType(input.getEquipmentUidType())
                          .testkitNameId(input.getTestkitNameId())
                          .build()));
        });
    return deviceTypeDiseaseList;
  }
}
