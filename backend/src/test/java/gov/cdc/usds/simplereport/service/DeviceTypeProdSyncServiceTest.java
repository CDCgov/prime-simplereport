package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;

class DeviceTypeProdSyncServiceTest extends BaseServiceTest<DeviceTypeProdSyncService> {
  @Value("${simple-report.production.devices-token}")
  private String token;

  @Test
  void validateToken_withValidToken_success() {
    assertThat(_service.validateToken(token)).isTrue();
  }

  @Test
  void validateToken_withInvalidToken_throwsException() {
    assertThrows(AccessDeniedException.class, () -> _service.validateToken("foo"));
  }
}
