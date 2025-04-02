package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.DeviceTypeSpecimenTypeMapping;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeNewRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class DeviceTypeSyncService {
  @Autowired private SpecimenTypeRepository _specimenTypeRepo;
  @Autowired private DeviceSpecimenTypeNewRepository _deviceSpecimenTypeNewRepo;
  @Autowired private SupportedDiseaseRepository _supportedDiseaseRepo;
  @Autowired private DeviceTypeRepository _deviceTypeRepo;
  private static final String SWAB_TYPE_DELETED_MESSAGE =
      "swab type has been deleted and cannot be used";
  private static final String DUPLICATE_DEVICE_MESSAGE =
      "an active device type already exists with the same manufacturer and model";

  /**
   * This method to create a DeviceType has no permission check NOTE: Use the equivalent
   * createDeviceType method in {@link DeviceTypeService} if authorization is required
   *
   * @param createDevice CreateDeviceType
   * @return created DeviceType
   */
  @Transactional
  public DeviceType createDeviceType(CreateDeviceType createDevice) {
    List<SpecimenType> specimenTypes =
        createDevice.getSwabTypes().stream()
            .map(_specimenTypeRepo::findById)
            .filter(Optional::isPresent)
            .map(Optional::get)
            .toList();

    specimenTypes.forEach(
        specimenType -> {
          if (specimenType.getIsDeleted()) {
            throw new IllegalGraphqlArgumentException(SWAB_TYPE_DELETED_MESSAGE);
          }
        });

    _deviceTypeRepo
        .findDeviceTypeByManufacturerAndModelAndIsDeletedFalse(
            createDevice.getManufacturer(), createDevice.getModel())
        .ifPresent(
            deviceType -> {
              throw new IllegalGraphqlArgumentException(DUPLICATE_DEVICE_MESSAGE);
            });

    DeviceType dt =
        _deviceTypeRepo.save(
            new DeviceType(
                createDevice.getName(),
                createDevice.getManufacturer(),
                createDevice.getModel(),
                createDevice.getTestLength()));

    specimenTypes.stream()
        .map(
            specimenType ->
                new DeviceTypeSpecimenTypeMapping(dt.getInternalId(), specimenType.getInternalId()))
        .forEach(_deviceSpecimenTypeNewRepo::save);

    List<DeviceTypeDisease> deviceTypeDiseaseList =
        createUpdatedDeviceTypeDiseaseList(createDevice.getSupportedDiseaseTestPerformed(), dt);
    dt.getSupportedDiseaseTestPerformed().addAll(deviceTypeDiseaseList);
    _deviceTypeRepo.save(dt);

    return dt;
  }

  /**
   * This method to update a DeviceType has no permission check NOTE: Use the equivalent
   * updateDeviceType method in {@link DeviceTypeService} if authorization is required
   *
   * @param deviceToUpdate UpdateDeviceType
   * @return updated DeviceType
   */
  @Transactional
  public DeviceType updateDeviceType(UpdateDeviceType deviceToUpdate) {
    Optional<DeviceType> foundDevice = _deviceTypeRepo.findById(deviceToUpdate.getInternalId());
    if (foundDevice.isEmpty()) {
      throw new BadRequestException(
          String.format("DeviceType with ID %s not found", deviceToUpdate.getInternalId()));
    }

    DeviceType device = foundDevice.get();

    if (deviceToUpdate.getName() != null) {
      device.setName(deviceToUpdate.getName());
    }
    if (deviceToUpdate.getManufacturer() != null) {
      device.setManufacturer(deviceToUpdate.getManufacturer());
    }
    if (deviceToUpdate.getModel() != null) {
      device.setModel(deviceToUpdate.getModel());
    }
    if (deviceToUpdate.getTestLength() > 0) {
      device.setTestLength(deviceToUpdate.getTestLength());
    }

    if (deviceToUpdate.getSwabTypes() != null) {
      List<SpecimenType> updatedSpecimenTypes =
          deviceToUpdate.getSwabTypes().stream()
              .map(_specimenTypeRepo::findById)
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
          _deviceSpecimenTypeNewRepo.findAllByDeviceTypeId(device.getInternalId());

      // delete old ones
      ArrayList<DeviceTypeSpecimenTypeMapping> toBeDeletedDeviceSpecimenTypes =
          new ArrayList<>(exitingDeviceSpecimenTypes);
      toBeDeletedDeviceSpecimenTypes.removeAll(newDeviceSpecimenTypes);
      _deviceSpecimenTypeNewRepo.deleteAll(toBeDeletedDeviceSpecimenTypes);

      // create new ones
      ArrayList<DeviceTypeSpecimenTypeMapping> toBeAddedDeviceSpecimenTypes =
          new ArrayList<>(newDeviceSpecimenTypes);
      toBeAddedDeviceSpecimenTypes.removeAll(exitingDeviceSpecimenTypes);
      _deviceSpecimenTypeNewRepo.saveAll(toBeAddedDeviceSpecimenTypes);
    }

    if (deviceToUpdate.getSupportedDiseaseTestPerformed() != null) {
      List<DeviceTypeDisease> deviceTypeDiseaseList =
          createUpdatedDeviceTypeDiseaseList(
              deviceToUpdate.getSupportedDiseaseTestPerformed(), device);
      device.getSupportedDiseaseTestPerformed().clear();
      device.getSupportedDiseaseTestPerformed().addAll(deviceTypeDiseaseList);
    }
    return _deviceTypeRepo.save(device);
  }

  public List<DeviceTypeDisease> createUpdatedDeviceTypeDiseaseList(
      List<SupportedDiseaseTestPerformedInput> supportedDiseaseTestPerformedInput,
      DeviceType deviceToUpdate) {
    List<DeviceTypeDisease> deviceTypeDiseaseList = new ArrayList<>();
    supportedDiseaseTestPerformedInput.forEach(
        input -> {
          Optional<SupportedDisease> supportedDisease =
              _supportedDiseaseRepo.findById(input.getSupportedDisease());
          supportedDisease.ifPresent(
              disease ->
                  deviceTypeDiseaseList.add(
                      DeviceTypeDisease.builder()
                          .deviceTypeId(deviceToUpdate.getInternalId())
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

  /**
   * @param incomingDiseases list of DeviceTypeDisease to compare to an existing DeviceType's list
   *     of DeviceTypeDisease
   * @param incomingSwabs list of SpecimenType to compare to an existing DeviceType's list of
   *     DeviceTypeDisease
   * @param existing the DeviceType to check against incomingDiseases and incomingSwabs for any
   *     changes
   * @return boolean of whether the DeviceType has changes compared to the incomingDiseases and
   *     incomingSwabs provided This does not check if the existing DeviceType's name, model,
   *     manufacturer, testLength has changed
   */
  public boolean hasUpdates(
      List<DeviceTypeDisease> incomingDiseases,
      List<SpecimenType> incomingSwabs,
      DeviceType existing) {
    boolean hasDiseaseUpdate;
    boolean hasSwabUpdate;

    if (CollectionUtils.isEmpty(existing.getSupportedDiseaseTestPerformed())) {
      return !incomingDiseases.isEmpty();
    } else {
      hasDiseaseUpdate = hasDiseaseUpdates(incomingDiseases, existing);
    }

    if (CollectionUtils.isEmpty(existing.getSwabTypes())) {
      return !incomingSwabs.isEmpty();
    } else {
      hasSwabUpdate = hasSwabUpdates(incomingSwabs, existing);
    }

    return hasDiseaseUpdate || hasSwabUpdate;
  }

  private boolean hasDiseaseUpdates(List<DeviceTypeDisease> incomingDiseases, DeviceType existing) {
    return !incomingDiseases.stream()
            .allMatch(
                incomingDisease ->
                    existing.getSupportedDiseaseTestPerformed().stream()
                        .anyMatch(
                            existingDisease ->
                                areEqualIgnoreDeviceTypeId(existingDisease, incomingDisease)))
        || incomingDiseases.size() != existing.getSupportedDiseaseTestPerformed().size();
  }

  private boolean hasSwabUpdates(List<SpecimenType> incomingSwabs, DeviceType existing) {
    return !incomingSwabs.stream()
            .allMatch(
                incomingSwab ->
                    existing.getSwabTypes().stream()
                        .anyMatch(existingSwab -> existingSwab.equals(incomingSwab)))
        || incomingSwabs.size() != existing.getSwabTypes().size();
  }

  /**
   * @param a DeviceTypeDisease to compare
   * @param b DeviceTypeDisease to compare
   * @return boolean of whether a and b are equal while not comparing their respective DeviceTypeIds
   *     The purpose of this method is to easily check if two DeviceTypeDiseases are equal
   */
  private static boolean areEqualIgnoreDeviceTypeId(DeviceTypeDisease a, DeviceTypeDisease b) {
    return a.getSupportedDisease().equals(b.getSupportedDisease())
        && StringUtils.equalsIgnoreCase(a.getTestOrderedLoincCode(), b.getTestOrderedLoincCode())
        && StringUtils.equalsIgnoreCase(
            a.getTestOrderedLoincLongName(), b.getTestOrderedLoincLongName())
        && StringUtils.equalsIgnoreCase(
            a.getTestPerformedLoincCode(), b.getTestPerformedLoincCode())
        && StringUtils.equalsIgnoreCase(
            a.getTestPerformedLoincLongName(), b.getTestPerformedLoincLongName())
        && StringUtils.equalsIgnoreCase(a.getEquipmentUid(), b.getEquipmentUid())
        && StringUtils.equalsIgnoreCase(a.getEquipmentUidType(), b.getEquipmentUidType())
        && StringUtils.equalsIgnoreCase(a.getTestkitNameId(), b.getTestkitNameId());
  }

  @Transactional
  public void updateDeviceTypes(Map<UUID, DeviceType> devicesToUpdate) {
    devicesToUpdate.forEach(
        (existingDeviceId, incoming) -> {
          List<UUID> swabTypeUUIDs = createUpdateOrFetchSpecimenTypes(incoming);
          DeviceType updatedDevice =
              updateDeviceType(
                  convertToUpdateDeviceType(existingDeviceId, incoming, swabTypeUUIDs));
          //          String msg =
          //              String.format(
          //                  "Device updated - name: %s, model: %s, manufacturer: %s",
          //                  updatedDevice.getName(),
          //                  updatedDevice.getModel(),
          //                  updatedDevice.getManufacturer());
          //          log.info(msg);
        });
  }

  @Transactional
  public void createDeviceTypes(List<DeviceType> devicesToCreate) {
    devicesToCreate.forEach(
        deviceToCreate -> {
          List<UUID> swabTypeUUIDs = createUpdateOrFetchSpecimenTypes(deviceToCreate);
          CreateDeviceType createDeviceType =
              convertToCreateDeviceType(deviceToCreate, swabTypeUUIDs);
          DeviceType createdDevice = createDeviceType(createDeviceType);
          //          String msg =
          //              String.format(
          //                  "Device created - name: %s, model: %s, manufacturer: %s",
          //                  createdDevice.getName(),
          //                  createdDevice.getModel(),
          //                  createdDevice.getManufacturer());
          //          log.info(msg);
        });
  }

  private CreateDeviceType convertToCreateDeviceType(DeviceType device, List<UUID> swabTypeUUIDs) {
    return CreateDeviceType.builder()
        .name(device.getName())
        .manufacturer(device.getManufacturer())
        .model(device.getModel())
        .swabTypes(swabTypeUUIDs)
        .supportedDiseaseTestPerformed(getSupportedDiseaseTestPerformedInputs(device))
        .testLength(device.getTestLength())
        .build();
  }

  private UpdateDeviceType convertToUpdateDeviceType(
      UUID existingDeviceId, DeviceType incoming, List<UUID> swabTypeUUIDs) {
    return UpdateDeviceType.builder()
        .internalId(existingDeviceId)
        .testLength(incoming.getTestLength())
        .supportedDiseaseTestPerformed(getSupportedDiseaseTestPerformedInputs(incoming))
        .swabTypes(swabTypeUUIDs)
        .build();
  }

  private List<UUID> createUpdateOrFetchSpecimenTypes(DeviceType device) {
    return device.getSwabTypes().stream()
        .map(
            swabType -> {
              Optional<SpecimenType> found =
                  _specimenTypeRepo.findByTypeCode(swabType.getTypeCode());
              if (found.isEmpty()) {
                return _specimenTypeRepo
                    .save(
                        new SpecimenType(
                            swabType.getName(),
                            swabType.getTypeCode(),
                            swabType.getCollectionLocationName(),
                            swabType.getCollectionLocationCode()))
                    .getInternalId();
              } else {
                SpecimenType foundSwabType = found.get();
                if (foundSwabType.getIsDeleted()) {
                  foundSwabType.setIsDeleted(false);
                }

                if (!found.get().equals(swabType)) {
                  foundSwabType.setName(swabType.getName());
                  foundSwabType.setCollectionLocationName(swabType.getCollectionLocationName());
                  foundSwabType.setCollectionLocationCode(swabType.getCollectionLocationCode());
                }
                _specimenTypeRepo.save(foundSwabType);
                return foundSwabType.getInternalId();
              }
            })
        .collect(Collectors.toList());
  }

  private List<SupportedDiseaseTestPerformedInput> getSupportedDiseaseTestPerformedInputs(
      DeviceType device) {
    return device.getSupportedDiseaseTestPerformed().stream()
        .map(
            input -> {
              String supportedDiseaseName = input.getSupportedDisease().getName();
              String supportedDiseaseLoinc = input.getSupportedDisease().getLoinc();
              SupportedDisease supportedDisease =
                  _supportedDiseaseRepo
                      .findByNameAndLoinc(supportedDiseaseName, supportedDiseaseLoinc)
                      .get(0);
              return SupportedDiseaseTestPerformedInput.builder()
                  .supportedDisease(supportedDisease.getInternalId())
                  .testPerformedLoincLongName(input.getTestPerformedLoincLongName())
                  .testPerformedLoincCode(input.getTestPerformedLoincCode())
                  .equipmentUid(input.getEquipmentUid())
                  .equipmentUidType(input.getEquipmentUidType())
                  .testkitNameId(input.getTestkitNameId())
                  .testOrderedLoincLongName(input.getTestOrderedLoincLongName())
                  .testOrderedLoincCode(input.getTestOrderedLoincCode())
                  .build();
            })
        .collect(Collectors.toList());
  }
}
