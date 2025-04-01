package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.errors.DryRunException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test")
@SliceTestConfiguration.WithSimpleReportStandardUser
class DeviceTypeProdSyncServiceTest {
  @Autowired private SpecimenTypeRepository _specimenTypeRepo;
  @Autowired private DeviceTypeRepository _deviceTypeRepo;
  @Autowired private SupportedDiseaseRepository _supportedDiseaseRepo;
  @MockBean private DeviceTypeSyncService _deviceTypeSyncService;
  @MockBean private SRProductionClient _mockSRProdClient;
  @Autowired private DeviceTypeProdSyncService _service;

  @Value("${simple-report.production.devices-token}")
  private String token;

  private SpecimenType swab1;
  private SpecimenType swab2;
  private SupportedDisease covid;
  private SupportedDisease flu;
  @Autowired private DbTruncator dbTruncator;

  @BeforeEach
  void setup() {
    dbTruncator.truncateAll();
    swab1 = TestDataBuilder.createSpecimenType("Anterior nares swab", "697989009");
    swab2 = TestDataBuilder.createSpecimenType("Nasopharyngeal swab", "258500001");
    _specimenTypeRepo.saveAll(List.of(swab1, swab2));
    covid = _supportedDiseaseRepo.findByNameAndLoinc("COVID-19", "96741-4").get(0);
    flu = _supportedDiseaseRepo.findByNameAndLoinc("Flu A", "LP14239-5").get(0);
  }

  @AfterEach
  void cleanup() {
    dbTruncator.truncateAll();
  }

  @Test
  void validateToken_withValidToken_success() {
    assertThat(_service.validateToken(token)).isTrue();
  }

  @Test
  void validateToken_withInvalidToken_throwsException() {
    assertThrows(AccessDeniedException.class, () -> _service.validateToken("foo"));
  }

  @Test
  void syncDevicesFromProd_dryRun_throwsException() {
    DeviceType savedDevice =
        TestDataBuilder.createDeviceType("Quidel Sofia 2", List.of(swab1, swab2));

    _deviceTypeRepo.save(savedDevice);
    DeviceTypeDisease supportedDiseaseTestPerformed1 =
        TestDataBuilder.createDeviceTypeDisease(savedDevice.getInternalId(), covid);
    DeviceTypeDisease supportedDiseaseTestPerformed2 =
        TestDataBuilder.createDeviceTypeDisease(savedDevice.getInternalId(), flu);
    savedDevice.setSupportedDiseaseTestPerformed(List.of(supportedDiseaseTestPerformed1));
    DeviceType existing = _deviceTypeRepo.save(savedDevice);
    DeviceType incomingNewDevice =
        TestDataBuilder.createDeviceType("New Device", List.of(swab1, swab2));
    incomingNewDevice.setSwabTypes(List.of(swab1));
    incomingNewDevice.setSupportedDiseaseTestPerformed(
        List.of(supportedDiseaseTestPerformed1, supportedDiseaseTestPerformed2));
    DeviceType incomingUpdatedDevice =
        TestDataBuilder.createDeviceType(
            "Quidel Sofia 2", 35, List.of(swab1), List.of(supportedDiseaseTestPerformed2));

    when(_mockSRProdClient.getProdDeviceTypes())
        .thenReturn(List.of(incomingNewDevice, incomingUpdatedDevice));
    when(_deviceTypeSyncService.hasUpdates(
            incomingUpdatedDevice.getSupportedDiseaseTestPerformed(),
            incomingUpdatedDevice.getSwabTypes(),
            existing))
        .thenReturn(true);

    DryRunException caught =
        assertThrows(DryRunException.class, () -> _service.syncDevicesFromProd(true));

    assertEquals(
        "Device sync from prod (dry run) - Devices created: 1 | Devices updated: 1",
        caught.getMessage());
    verify(_deviceTypeSyncService, times(1)).createDeviceTypes(List.of(incomingNewDevice));
    verify(_deviceTypeSyncService, times(1))
        .updateDeviceTypes(Map.of(savedDevice.getInternalId(), incomingUpdatedDevice));
  }

  @Test
  void syncDevicesFromProd_withUpdates_success() {
    DeviceType savedDevice =
        TestDataBuilder.createDeviceType("Quidel Sofia 2", List.of(swab1, swab2));
    _deviceTypeRepo.save(savedDevice);
    DeviceTypeDisease supportedDiseaseTestPerformed1 =
        TestDataBuilder.createDeviceTypeDisease(savedDevice.getInternalId(), covid);
    DeviceTypeDisease supportedDiseaseTestPerformed2 =
        TestDataBuilder.createDeviceTypeDisease(savedDevice.getInternalId(), flu);
    savedDevice.setSupportedDiseaseTestPerformed(List.of(supportedDiseaseTestPerformed1));
    DeviceType existing = _deviceTypeRepo.save(savedDevice);

    DeviceType incomingNewDevice =
        TestDataBuilder.createDeviceType("Acme Device", List.of(swab1, swab2));

    incomingNewDevice.setSwabTypes(List.of(swab1));
    incomingNewDevice.setSupportedDiseaseTestPerformed(
        List.of(supportedDiseaseTestPerformed1, supportedDiseaseTestPerformed2));
    DeviceType incomingUpdatedDevice =
        TestDataBuilder.createDeviceType(
            "Quidel Sofia 2", 35, List.of(swab1), List.of(supportedDiseaseTestPerformed2));

    when(_mockSRProdClient.getProdDeviceTypes())
        .thenReturn(List.of(incomingNewDevice, incomingUpdatedDevice));
    when(_deviceTypeSyncService.hasUpdates(
            incomingUpdatedDevice.getSupportedDiseaseTestPerformed(),
            incomingUpdatedDevice.getSwabTypes(),
            existing))
        .thenReturn(true);

    String msg = _service.syncDevicesFromProd(false);
    assertEquals("Device sync from prod - Devices created: 1 | Devices updated: 1", msg);
    verify(_deviceTypeSyncService, times(1)).createDeviceTypes(List.of(incomingNewDevice));
    verify(_deviceTypeSyncService, times(1))
        .updateDeviceTypes(Map.of(savedDevice.getInternalId(), incomingUpdatedDevice));
  }

  @Test
  void syncDevicesFromProd_noUpdates_success() {
    DeviceType savedDevice = TestDataBuilder.createDeviceType("Quidel Sofia 2", List.of(swab1));
    _deviceTypeRepo.save(savedDevice);
    DeviceTypeDisease supportedDiseaseTestPerformed1 =
        TestDataBuilder.createDeviceTypeDisease(savedDevice.getInternalId(), covid);
    savedDevice.setSupportedDiseaseTestPerformed(List.of(supportedDiseaseTestPerformed1));
    _deviceTypeRepo.save(savedDevice);
    when(_mockSRProdClient.getProdDeviceTypes()).thenReturn(List.of(savedDevice));

    String msg = _service.syncDevicesFromProd(false);
    verify(_deviceTypeSyncService, times(1)).hasUpdates(any(), any(), any());
    verify(_deviceTypeSyncService, times(0)).createDeviceTypes(any());
    verify(_deviceTypeSyncService, times(0)).updateDeviceTypes(any());
    assertEquals("Device sync from prod - Devices created: 0 | Devices updated: 0", msg);
  }
}
