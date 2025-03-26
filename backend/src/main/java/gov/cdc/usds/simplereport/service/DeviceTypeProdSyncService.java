package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Service to fetch and save DeviceTypes from our prod env */
@Service
@Slf4j
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DeviceTypeProdSyncService {
  @Value("${simple-report.production.devices-token}")
  private String token;

  @Value("${simple-report.production.device-sync-enabled}")
  private boolean deviceSyncEnabled;

  private final SRProductionClient _client;

  public List<DeviceType> getDeviceTypesFromProduction() {
    if (deviceSyncEnabled) {
      return _client.getProdDeviceTypes();
    }
    throw new BadRequestException(
        "The device sync with production is not enabled for this environment");
  }

  public boolean validateToken(String headerToken) throws AccessDeniedException {
    if (token.equals(headerToken)) {
      return true;
    }
    throw new AccessDeniedException("Access denied");
  }
}
