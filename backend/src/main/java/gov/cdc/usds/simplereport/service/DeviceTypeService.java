package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.utils.DeviceTestLengthConverter.determineTestLength;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.service.model.DeviceSpecimenTypeHolder;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for fetching the device-type reference list (<i>not</i> the device types available for a
 * specific facility or organization).
 */
@Service
@Transactional(readOnly = true)
public class DeviceTypeService {

  public static final String SWAB_TYPE_DELETED_MESSAGE =
      "swab type has been deleted and cannot be used";
  private DeviceTypeRepository _repo;
  private DeviceSpecimenTypeRepository _deviceSpecimenRepo;
  private SpecimenTypeRepository _specimenTypeRepo;

  public DeviceTypeService(
      DeviceTypeRepository repo,
      DeviceSpecimenTypeRepository deviceSpecimenRepo,
      SpecimenTypeRepository specimenTypeRepo) {
    _repo = repo;
    _deviceSpecimenRepo = deviceSpecimenRepo;
    _specimenTypeRepo = specimenTypeRepo;
  }

  @Transactional(readOnly = false)
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public void removeDeviceType(DeviceType d) {
    _repo.delete(d);
  }

  public List<DeviceType> fetchDeviceTypes() {
    return _repo.findAll();
  }

  public DeviceType getDeviceType(UUID internalId) {
    return _repo
        .findById(internalId)
        .orElseThrow(() -> new IllegalGraphqlArgumentException("invalid device type ID"));
  }

  public List<DeviceSpecimenType> getDeviceSpecimenTypesByIds(List<UUID> deviceSpecimenTypeIds) {
    return StreamSupport.stream(
            _deviceSpecimenRepo.findAllById(deviceSpecimenTypeIds).spliterator(), false)
        .collect(Collectors.toList());
  }

  public List<DeviceSpecimenType> getDeviceSpecimenTypes() {
    return _deviceSpecimenRepo.findAll();
  }

  public DeviceSpecimenType getDeviceSpecimenType(UUID deviceSpecimenTypeId) {
    return _deviceSpecimenRepo
        .findById(deviceSpecimenTypeId)
        .orElseThrow(() -> new IllegalGraphqlArgumentException("invalid device specimen type ID"));
  }

  /**
   * Find the original device/specimen type combination created for this DeviceType, since that will
   * be the one that is assumed by callers who aren't aware that you can have multiple specimen
   * types for a given device type.
   */
  @Deprecated // this is a backward-compatibility shim!
  public DeviceSpecimenType getDefaultForDeviceId(UUID deviceId) {
    return _deviceSpecimenRepo
        .findFirstByDeviceTypeInternalIdOrderByCreatedAt(deviceId)
        .orElseThrow(
            () ->
                new IllegalGraphqlArgumentException(
                    "Device is not configured with a specimen type"));
  }

  @Transactional(readOnly = false)
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public DeviceType updateDeviceType(UpdateDeviceType updateDevice) {

    DeviceType device = getDeviceType(updateDevice.getInternalId());
    if (updateDevice.getName() != null) {
      device.setName(updateDevice.getName());
      device.setTestLength((determineTestLength(updateDevice.getName())));
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
              .map(uuid -> _specimenTypeRepo.findById(uuid))
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
          _deviceSpecimenRepo.findAllByDeviceType(device);

      // delete old ones
      ArrayList<DeviceSpecimenType> toBeDeletedDeviceSpecimenTypes =
          new ArrayList<>(exitingDeviceSpecimenTypes);
      toBeDeletedDeviceSpecimenTypes.removeAll(newDeviceSpecimenTypes);
      _deviceSpecimenRepo.deleteAll(toBeDeletedDeviceSpecimenTypes);

      // create new ones
      ArrayList<DeviceSpecimenType> toBeAddedDeviceSpecimenTypes =
          new ArrayList<>(newDeviceSpecimenTypes);
      toBeAddedDeviceSpecimenTypes.removeAll(exitingDeviceSpecimenTypes);
      _deviceSpecimenRepo.saveAll(toBeAddedDeviceSpecimenTypes);
    }
    return _repo.save(device);
  }

  @Transactional(readOnly = false)
  @AuthorizationConfiguration.RequireGlobalAdminUser
  public DeviceType createDeviceType(CreateDeviceType createDevice) {

    List<SpecimenType> specimenTypes =
        createDevice.getSwabTypes().stream()
            .map(uuid -> _specimenTypeRepo.findById(uuid).get())
            .collect(Collectors.toList());

    specimenTypes.forEach(
        specimenType -> {
          if (specimenType.isDeleted()) {
            throw new IllegalGraphqlArgumentException(SWAB_TYPE_DELETED_MESSAGE);
          }
        });

    DeviceType dt =
        _repo.save(
            new DeviceType(
                createDevice.getName(),
                createDevice.getManufacturer(),
                createDevice.getModel(),
                createDevice.getLoincCode(),
                null,
                determineTestLength(createDevice.getName())));

    specimenTypes.stream()
        .map(specimenType -> new DeviceSpecimenType(dt, specimenType))
        .forEach(_deviceSpecimenRepo::save);

    return dt;
  }

  /**
   * Retrieve the {@link DeviceSpecimenTypeHolder} that this operation needs based on the <b>DEVICE
   * TYPE</b> IDs supplied to a mutation.
   *
   * @deprecated in favor of (eventually) using device-specimen-type IDs instead of device-type IDs.
   * @param defaultDeviceTypeId the default DEVICE TYPE id to configure for this operation.
   * @param configuredDeviceTypeIds the list of device type IDS to configure. <b>Must contain the
   *     default value.</b>
   * @return a {@link DeviceSpecimenTypeHolder} that holds the default {@link DeviceSpecimenType}
   *     for each of the device types that was supplied either in the configured list or as the
   *     default.
   */
  @Deprecated
  public DeviceSpecimenTypeHolder getTypesForFacility(
      UUID defaultDeviceTypeId, List<UUID> configuredDeviceTypeIds) {
    if (!configuredDeviceTypeIds.contains(defaultDeviceTypeId)) {
      throw new IllegalGraphqlArgumentException(
          "default device type must be included in device type list");
    }
    List<DeviceSpecimenType> configuredTypes =
        configuredDeviceTypeIds.stream()
            .map(this::getDefaultForDeviceId)
            .collect(Collectors.toList());

    DeviceSpecimenType defaultType =
        configuredTypes.stream()
            .filter(dt -> dt.getDeviceType().getInternalId().equals(defaultDeviceTypeId))
            .findFirst()
            .orElseThrow(
                () ->
                    new RuntimeException(
                        "Inexplicable inability to find device for ID "
                            + defaultDeviceTypeId.toString()));
    return new DeviceSpecimenTypeHolder(defaultType, configuredTypes);
  }

  public DeviceSpecimenTypeHolder getDeviceSpecimenTypesForFacility(
      UUID defaultDeviceTypeId, List<UUID> configuredDeviceSpecimenTypeIds) {
    List<DeviceSpecimenType> dsts =
        this.getDeviceSpecimenTypesByIds(configuredDeviceSpecimenTypeIds);

    DeviceSpecimenType defaultDeviceSpecimenType =
        dsts.stream()
            .filter(dst -> defaultDeviceTypeId.equals(dst.getDeviceType().getInternalId()))
            .findAny()
            .orElseThrow(
                () ->
                    new IllegalGraphqlArgumentException(
                        "No default device specimen type selected"));

    return new DeviceSpecimenTypeHolder(defaultDeviceSpecimenType, dsts);
  }

  public List<SpecimenType> getSpecimenTypes() {
    return _specimenTypeRepo.findAllByIsDeletedFalse();
  }
}
