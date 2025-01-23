package gov.cdc.usds.simplereport.service;

import lombok.extern.slf4j.Slf4j;
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

  public boolean validateToken(String headerToken) throws AccessDeniedException {
    if (token.equals(headerToken)) {
      return true;
    }
    throw new AccessDeniedException("Access denied");
  }
}
