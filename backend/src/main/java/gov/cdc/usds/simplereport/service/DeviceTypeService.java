package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceTestPerformedLoincCode;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTestPerformedLoincCodeRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for fetching the device-type reference list (<i>not</i> the device types available for a
 * specific facility or organization).
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeviceTypeService {

  public static final String SWAB_TYPE_DELETED_MESSAGE =
      "swab type has been deleted and cannot be used";
  private final DeviceTypeRepository deviceTypeRepository;
  private final DeviceSpecimenTypeRepository deviceSpecimenTypeRepository;
  private final SpecimenTypeRepository specimenTypeRepository;
  private final SupportedDiseaseRepository supportedDiseaseRepository;
  private final DeviceTestPerformedLoincCodeRepository testPerformedRepository;

  @Transactional(readOnly = false)
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

  @Transactional(readOnly = false)
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
    if (updateDevice.getLoincCode() != null) {
      device.setLoincCode(updateDevice.getLoincCode());
    }
    if (updateDevice.getSwabTypes() != null) {
      List<SpecimenType> updatedSpecimenTypes =
          updateDevice.getSwabTypes().stream()
              .map(specimenTypeRepository::findById)
              .filter(Optional::isPresent)
              .map(Optional::get)
              .collect(Collectors.toList());

      updatedSpecimenTypes.forEach(
          specimenType -> {
            if (specimenType.isDeleted()) {
              throw new IllegalGraphqlArgumentException(SWAB_TYPE_DELETED_MESSAGE);
            }
          });

      List<DeviceSpecimenType> newDeviceSpecimenTypes =
          updatedSpecimenTypes.stream()
              .map(specimenType -> new DeviceSpecimenType(device, specimenType))
              .collect(Collectors.toList());

      List<DeviceSpecimenType> exitingDeviceSpecimenTypes =
          deviceSpecimenTypeRepository.findAllByDeviceType(device);

      // delete old ones
      ArrayList<DeviceSpecimenType> toBeDeletedDeviceSpecimenTypes =
          new ArrayList<>(exitingDeviceSpecimenTypes);
      toBeDeletedDeviceSpecimenTypes.removeAll(newDeviceSpecimenTypes);
      deviceSpecimenTypeRepository.deleteAll(toBeDeletedDeviceSpecimenTypes);

      // create new ones
      ArrayList<DeviceSpecimenType> toBeAddedDeviceSpecimenTypes =
          new ArrayList<>(newDeviceSpecimenTypes);
      toBeAddedDeviceSpecimenTypes.removeAll(exitingDeviceSpecimenTypes);
      deviceSpecimenTypeRepository.saveAll(toBeAddedDeviceSpecimenTypes);
    }
    if (updateDevice.getSupportedDiseases() != null) {
      List<SupportedDisease> supportedDiseases =
          updateDevice.getSupportedDiseases().stream()
              .map(supportedDiseaseRepository::findById)
              .filter(Optional::isPresent)
              .map(Optional::get)
              .collect(Collectors.toList());
      device.setSupportedDiseases(supportedDiseases);
    }
    return deviceTypeRepository.save(device);
  }

  @Transactional(readOnly = false)
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public DeviceType createDeviceType(CreateDeviceType createDevice) {

    List<SpecimenType> specimenTypes =
        createDevice.getSwabTypes().stream()
            .map(uuid -> specimenTypeRepository.findById(uuid).get())
            .collect(Collectors.toList());

    specimenTypes.forEach(
        specimenType -> {
          if (specimenType.isDeleted()) {
            throw new IllegalGraphqlArgumentException(SWAB_TYPE_DELETED_MESSAGE);
          }
        });

    DeviceType dt =
        deviceTypeRepository.save(
            new DeviceType(
                createDevice.getName(),
                createDevice.getManufacturer(),
                createDevice.getModel(),
                createDevice.getLoincCode(),
                null,
                createDevice.getTestLength()));

    specimenTypes.stream()
        .map(specimenType -> new DeviceSpecimenType(dt, specimenType))
        .forEach(deviceSpecimenTypeRepository::save);

    if (createDevice.getSupportedDiseaseTestPerformed() != null) {
      // todo: make this a map
      List<Pair<SupportedDisease, String>> supportedDiseaseStringList =
          createDevice.getSupportedDiseaseTestPerformed().stream()
              .map(
                  input -> {
                    var supportedDisease =
                        supportedDiseaseRepository.findById(input.getSupportedDisease());
                    return supportedDisease
                        .map(disease -> Pair.of(disease, input.getTestPerformed()))
                        .orElse(null);
                  })
              .filter(Objects::nonNull)
              .collect(Collectors.toList());

      dt.setSupportedDiseases(
          supportedDiseaseStringList.stream().map(Pair::getFirst).collect(Collectors.toList()));

      var deviceTestPerformedLoincCodeList =
          supportedDiseaseStringList.stream()
              .map(pair -> new DeviceTestPerformedLoincCode(dt, pair.getFirst(), pair.getSecond()))
              .collect(Collectors.toList());
      testPerformedRepository.saveAll(deviceTestPerformedLoincCodeList);
    } else {
      List<SupportedDisease> supportedDiseases =
          createDevice.getSupportedDiseases().stream()
              .map(supportedDiseaseRepository::findById)
              .filter(Optional::isPresent)
              .map(Optional::get)
              .collect(Collectors.toList());
      dt.setSupportedDiseases(supportedDiseases);
    }
    deviceTypeRepository.save(dt);

    return dt;
  }
}
