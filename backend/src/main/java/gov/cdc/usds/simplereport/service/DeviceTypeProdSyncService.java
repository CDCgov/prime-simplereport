package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.api.model.errors.DryRunException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Service to fetch and save DeviceTypes from our prod env */
@Service
@Slf4j
@Transactional(readOnly = true)
public class DeviceTypeProdSyncService {
  @Value("${simple-report.production.devices-token}")
  private String token;

  @Autowired private SRProductionClient _client;
  @Autowired private DeviceTypeRepository _deviceTypeRepo;
  @Autowired private SpecimenTypeRepository _specimenTypeRepo;
  @Autowired private SupportedDiseaseRepository _supportedDiseaseRepo;
  @Autowired private DeviceTypeSyncService _deviceTypeSyncService;

  public boolean validateToken(String headerToken) throws AccessDeniedException {
    if (token.equals(headerToken)) {
      return true;
    }
    throw new AccessDeniedException("Access denied");
  }

  @Transactional
  public void syncDevicesFromProd(boolean dryRun) {
    List<DeviceType> prodDevices = _client.getProdDeviceTypes();

    List<DeviceType> devicesToCreate = new ArrayList<>();
    HashMap<DeviceType, DeviceType> devicesToUpdate = new HashMap<>();

    prodDevices.forEach(
        prodDevice -> {
          Optional<DeviceType> foundDevice =
              _deviceTypeRepo.findDeviceTypeByManufacturerAndModelAndIsDeletedFalse(
                  prodDevice.getManufacturer(), prodDevice.getModel());

          if (foundDevice.isEmpty()) {
            devicesToCreate.add(prodDevice);
          } else {
            DeviceType existing = foundDevice.get();
            if (_deviceTypeSyncService.hasUpdates(
                prodDevice.getSupportedDiseaseTestPerformed(),
                prodDevice.getSwabTypes(),
                existing)) {
              devicesToUpdate.put(existing, prodDevice);
            }
          }
        });

    if (dryRun) {
      String exceptionMsg =
          MessageFormat.format(
              "Device sync from prod (dry run) - Devices expected to be created: {0} | Devices expected to be updated: {1}",
              devicesToCreate.size(), devicesToUpdate.size());
      throw new DryRunException(exceptionMsg);
    } else {
      devicesToCreate.forEach(
          (deviceToCreate) -> {
            List<UUID> swabTypeUUIDs = createOrFetchSpecimenTypes(deviceToCreate);
            CreateDeviceType createDeviceType =
                convertToCreateDeviceType(deviceToCreate, swabTypeUUIDs);
            _deviceTypeSyncService.createDeviceType(createDeviceType);
          });
      devicesToUpdate.forEach(
          (existing, incoming) -> {
            List<UUID> swabTypeUUIDs = createOrFetchSpecimenTypes(incoming);
            _deviceTypeSyncService.updateDeviceType(
                convertToUpdateDeviceType(existing, incoming, swabTypeUUIDs));
          });

      String msg =
          MessageFormat.format(
              "Device sync from prod - Devices created: {0} | Devices updated: {1}",
              devicesToCreate.size(), devicesToUpdate.size());
      log.info(msg);
    }
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
      DeviceType existing, DeviceType incoming, List<UUID> swabTypeUUIDs) {
    return UpdateDeviceType.builder()
        .internalId(existing.getInternalId())
        .testLength(incoming.getTestLength())
        .supportedDiseaseTestPerformed(getSupportedDiseaseTestPerformedInputs(incoming))
        .swabTypes(swabTypeUUIDs)
        .build();
  }

  private List<UUID> createOrFetchSpecimenTypes(DeviceType device) {
    return device.getSwabTypes().stream()
        .map(
            (swabType) -> {
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
                return foundSwabType.getInternalId();
              }
            })
        .collect(Collectors.toList());
  }

  private List<SupportedDiseaseTestPerformedInput> getSupportedDiseaseTestPerformedInputs(
      DeviceType device) {
    return device.getSupportedDiseaseTestPerformed().stream()
        .map(
            (input) -> {
              SupportedDisease supportedDisease =
                  _supportedDiseaseRepo.findByName(input.getSupportedDisease().getName()).get();
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
