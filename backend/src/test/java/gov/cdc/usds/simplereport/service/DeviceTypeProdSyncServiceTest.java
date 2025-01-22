package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.api.model.errors.DryRunException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeDiseaseRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = {"spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"})
class DeviceTypeProdSyncServiceTest extends BaseServiceTest<DeviceTypeProdSyncService> {
  @Autowired private SpecimenTypeRepository _specimenTypeRepo;
  @Autowired private DeviceTypeRepository _deviceTypeRepo;
  @Autowired @SpyBean private DeviceTypeSyncService _deviceTypeSyncService;
  @Autowired DeviceTypeDiseaseRepository _deviceTypeDiseaseRepo;
  @MockBean private SRProductionClient _mockSRProdClient;

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

  @Test
  void syncDevicesFromProd_dryRun_throwsException() {
    SpecimenType swab1 = TestDataBuilder.createSpecimenType("Anterior nares swab", "697989009");
    SpecimenType swab2 = TestDataBuilder.createSpecimenType("Nasopharyngeal swab", "258500001");
    _specimenTypeRepo.saveAll(List.of(swab1, swab2));
    SupportedDisease covid = _supportedDiseaseRepo.findByName("COVID-19").get();
    SupportedDisease flu = _supportedDiseaseRepo.findByName("Flu A").get();

    DeviceType savedDevice =
        TestDataBuilder.createDeviceType("Quidel Sofia 2", List.of(swab1, swab2));
    _deviceTypeRepo.save(savedDevice);
    DeviceTypeDisease supportedDiseaseTestPerformed1 =
        new DeviceTypeDisease(
            savedDevice.getInternalId(),
            covid,
            "94500-6",
            "SARS coronavirus 2 RNA [Presence] in Respiratory specimen by NAA with probe detection",
            "covidEquipmentUID",
            "covidEquipmentUIDType",
            "covidTestkitNameId1",
            "94500-0",
            "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection");
    DeviceTypeDisease supportedDiseaseTestPerformed2 =
        new DeviceTypeDisease(
            savedDevice.getInternalId(),
            flu,
            "85477-8",
            "Influenza virus A RNA [Presence] in Upper respiratory specimen by NAA with probe detection",
            "fluEquipmentUID",
            "fluEquipmentUidType",
            "fluTestkitNameId",
            "85477-0",
            "Influenza virus A and B and SARS-CoV-2 (COVID-19) and Respiratory syncytial virus RNA panel - Respiratory specimen by NAA with probe detection");
    savedDevice.setSupportedDiseaseTestPerformed(List.of(supportedDiseaseTestPerformed1));
    _deviceTypeRepo.save(savedDevice);

    DeviceType incomingNewDevice = TestDataBuilder.createDeviceType();
    incomingNewDevice.setSwabTypes(List.of(swab1));
    incomingNewDevice.setSupportedDiseaseTestPerformed(
        List.of(supportedDiseaseTestPerformed1, supportedDiseaseTestPerformed2));

    DeviceType incomingUpdatedDevice =
        new DeviceType(
            "Quidel Sofia 2",
            "Quidel Sofia 2 Manufacturer",
            "Quidel Sofia 2 Model",
            35,
            List.of(swab1),
            List.of(supportedDiseaseTestPerformed2));

    when(_mockSRProdClient.getProdDeviceTypes())
        .thenReturn(List.of(incomingNewDevice, incomingUpdatedDevice));
    DryRunException caught =
        assertThrows(
            DryRunException.class,
            () -> {
              _service.syncDevicesFromProd(true);
            });
    assertEquals(
        "Device sync from prod (dry run) - Devices expected to be created: 1 | Devices expected to be updated: 1",
        caught.getMessage());
    verify(_deviceTypeSyncService, times(0)).createDeviceType(any());
    verify(_deviceTypeSyncService, times(0)).updateDeviceType(any());
  }

  @Test
  void syncDevicesFromProd_success() {
    SpecimenType swab1 = TestDataBuilder.createSpecimenType("Anterior nares swab", "697989009");
    SpecimenType swab2 = TestDataBuilder.createSpecimenType("Nasopharyngeal swab", "258500001");
    _specimenTypeRepo.saveAll(List.of(swab1, swab2));
    SupportedDisease covid = _supportedDiseaseRepo.findByName("COVID-19").get();
    SupportedDisease flu = _supportedDiseaseRepo.findByName("Flu A").get();

    DeviceType savedDevice =
        TestDataBuilder.createDeviceType("Quidel Sofia 2", List.of(swab1, swab2));
    _deviceTypeRepo.save(savedDevice);
    DeviceTypeDisease supportedDiseaseTestPerformed1 =
        new DeviceTypeDisease(
            savedDevice.getInternalId(),
            covid,
            "94500-6",
            "SARS coronavirus 2 RNA [Presence] in Respiratory specimen by NAA with probe detection",
            "covidEquipmentUID",
            "covidEquipmentUIDType",
            "covidTestkitNameId1",
            "94500-0",
            "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection");
    DeviceTypeDisease supportedDiseaseTestPerformed2 =
        new DeviceTypeDisease(
            savedDevice.getInternalId(),
            flu,
            "85477-8",
            "Influenza virus A RNA [Presence] in Upper respiratory specimen by NAA with probe detection",
            "fluEquipmentUID",
            "fluEquipmentUidType",
            "fluTestkitNameId",
            "85477-0",
            "Influenza virus A and B and SARS-CoV-2 (COVID-19) and Respiratory syncytial virus RNA panel - Respiratory specimen by NAA with probe detection");
    savedDevice.setSupportedDiseaseTestPerformed(List.of(supportedDiseaseTestPerformed1));
    _deviceTypeRepo.save(savedDevice);

    DeviceType incomingNewDevice = TestDataBuilder.createDeviceType();
    incomingNewDevice.setSwabTypes(List.of(swab1));
    incomingNewDevice.setSupportedDiseaseTestPerformed(
        List.of(supportedDiseaseTestPerformed1, supportedDiseaseTestPerformed2));

    DeviceType incomingUpdatedDevice =
        new DeviceType(
            "Quidel Sofia 2",
            "Quidel Sofia 2 Manufacturer",
            "Quidel Sofia 2 Model",
            35,
            List.of(swab1),
            List.of(supportedDiseaseTestPerformed2));

    when(_mockSRProdClient.getProdDeviceTypes())
        .thenReturn(List.of(incomingNewDevice, incomingUpdatedDevice));
    _service.syncDevicesFromProd(false);

    SupportedDiseaseTestPerformedInput input1 =
        SupportedDiseaseTestPerformedInput.builder()
            .supportedDisease(covid.getInternalId())
            .testPerformedLoincCode("94500-6")
            .testPerformedLoincLongName(
                "SARS coronavirus 2 RNA [Presence] in Respiratory specimen by NAA with probe detection")
            .testOrderedLoincCode("94500-0")
            .testOrderedLoincLongName(
                "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection")
            .equipmentUid("covidEquipmentUID")
            .equipmentUidType("covidEquipmentUIDType")
            .testkitNameId("covidTestkitNameId1")
            .build();

    SupportedDiseaseTestPerformedInput input2 =
        SupportedDiseaseTestPerformedInput.builder()
            .supportedDisease(flu.getInternalId())
            .testPerformedLoincCode("85477-8")
            .testPerformedLoincLongName(
                "Influenza virus A RNA [Presence] in Upper respiratory specimen by NAA with probe detection")
            .testOrderedLoincCode("85477-0")
            .testOrderedLoincLongName(
                "Influenza virus A and B and SARS-CoV-2 (COVID-19) and Respiratory syncytial virus RNA panel - Respiratory specimen by NAA with probe detection")
            .equipmentUid("fluEquipmentUID")
            .equipmentUidType("fluEquipmentUidType")
            .testkitNameId("fluTestkitNameId")
            .build();
    ArgumentCaptor<CreateDeviceType> arg1 = ArgumentCaptor.forClass(CreateDeviceType.class);
    verify(_deviceTypeSyncService, times(1)).hasUpdates(any(), any(), any());
    CreateDeviceType deviceToBeCreated =
        CreateDeviceType.builder()
            .name(incomingNewDevice.getName())
            .manufacturer(incomingNewDevice.getManufacturer())
            .model(incomingNewDevice.getModel())
            .swabTypes(
                incomingNewDevice.getSwabTypes().stream()
                    .map(s -> s.getInternalId())
                    .collect(Collectors.toList()))
            .supportedDiseaseTestPerformed(List.of(input1, input2))
            .testLength(15)
            .build();
    verify(_deviceTypeSyncService, times(1)).createDeviceType(arg1.capture());
    assertTrue(deviceToBeCreated.equals(arg1.getValue()));

    UpdateDeviceType deviceToBeUpdated =
        UpdateDeviceType.builder()
            .internalId(savedDevice.getInternalId())
            .testLength(incomingUpdatedDevice.getTestLength())
            .swabTypes(
                incomingUpdatedDevice.getSwabTypes().stream()
                    .map(s -> s.getInternalId())
                    .collect(Collectors.toList()))
            .supportedDiseaseTestPerformed(List.of(input2))
            .build();
    ArgumentCaptor<UpdateDeviceType> arg2 = ArgumentCaptor.forClass(UpdateDeviceType.class);

    verify(_deviceTypeSyncService, times(1)).updateDeviceType(arg2.capture());
    assertTrue(deviceToBeUpdated.equals(arg2.getValue()));
  }
}
