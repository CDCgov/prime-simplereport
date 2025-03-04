package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.util.ReflectionTestUtils;

class DeviceTypeProdSyncServiceTest extends BaseServiceTest<DeviceTypeProdSyncService> {
  @InjectMocks private DeviceTypeProdSyncService _deviceTypeProdSyncService;

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(_deviceTypeProdSyncService, "token", "real-token");
  }

  @Test
  void validateToken_withValidToken_success() {
    assertThat(_deviceTypeProdSyncService.validateToken("real-token")).isTrue();
  }

  @Test
  void validateToken_withInvalidToken_throwsException() {
    assertThrows(
        AccessDeniedException.class, () -> _deviceTypeProdSyncService.validateToken("foo"));
  }

  @Test
  void getProd_DeviceTypes_withDeviceSyncDisabled_throwsException() {
    ReflectionTestUtils.setField(_deviceTypeProdSyncService, "deviceSyncEnabled", false);
    assertThrows(
        BadRequestException.class, () -> _deviceTypeProdSyncService.getDeviceTypesFromProduction());
  }
}
