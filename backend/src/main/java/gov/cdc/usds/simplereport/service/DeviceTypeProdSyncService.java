package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.DryRunException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.IdentifiedEntity;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import java.text.MessageFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
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
                prodDevice.getSwabTypes().stream().map(IdentifiedEntity::getInternalId).toList(),
                existing)) {
              devicesToUpdate.put(existing, prodDevice);
            }
          }
        });

    String msgInfo = String.format("Device sync from prod%s- ", (dryRun ? " (dry run) " : " "));
    String msg =
        MessageFormat.format(
            "{0}Devices created: {1} | Devices updated: {2}",
            msgInfo, devicesToCreate.size(), devicesToUpdate.size());

    if (dryRun) {
      throw new DryRunException(msg);
    }
    _deviceTypeSyncService.createDeviceTypesAsync(devicesToCreate);
    _deviceTypeSyncService.updateDeviceTypesAsync(devicesToUpdate);
    log.info(msg);
  }
}
