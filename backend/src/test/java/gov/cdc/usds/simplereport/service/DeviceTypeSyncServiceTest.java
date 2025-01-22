package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class DeviceTypeSyncServiceTest extends BaseServiceTest<DeviceTypeSyncService> {
  @Autowired private SupportedDiseaseRepository _supportedDiseaseRepo;
  @Autowired private DeviceTypeRepository _deviceTypeRepo;

  @Test
  void createUpdatedDeviceTypeDiseaseList_success() {
    DeviceType device = TestDataBuilder.createDeviceType();
    _deviceTypeRepo.save(device);
    SupportedDisease covid = new SupportedDisease("covid-19", "96741-4");
    _supportedDiseaseRepo.save(covid);
    SupportedDiseaseTestPerformedInput input1 =
        SupportedDiseaseTestPerformedInput.builder()
            .supportedDisease(covid.getInternalId())
            .testPerformedLoincCode("loinc1")
            .equipmentUid("equipmentUid1")
            .equipmentUidType("equipmentUid1Type")
            .testkitNameId("testkitNameId1")
            .testOrderedLoincCode("loinc3")
            .testPerformedLoincLongName(
                "SARS coronavirus 2 RNA [Presence] in Respiratory specimen by NAA with probe detection")
            .testOrderedLoincLongName(
                "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection")
            .build();

    List<DeviceTypeDisease> deviceTypeDiseases =
        _service.createUpdatedDeviceTypeDiseaseList(List.of(input1), device);
    assertThat(deviceTypeDiseases.size()).isEqualTo(1);

    DeviceTypeDisease deviceTypeDisease = deviceTypeDiseases.get(0);
    assertThat(deviceTypeDisease.getDeviceTypeId()).isEqualTo(device.getInternalId());
    assertTrue(deviceTypeDisease.getSupportedDisease().equals(covid));
    assertThat(deviceTypeDisease.getTestPerformedLoincCode()).isEqualTo("loinc1");
    assertThat(deviceTypeDisease.getEquipmentUid()).isEqualTo("equipmentUid1");
    assertThat(deviceTypeDisease.getEquipmentUidType()).isEqualTo("equipmentUid1Type");
    assertThat(deviceTypeDisease.getTestkitNameId()).isEqualTo("testkitNameId1");
    assertThat(deviceTypeDisease.getTestOrderedLoincCode()).isEqualTo("loinc3");
    assertThat(deviceTypeDisease.getTestPerformedLoincLongName())
        .isEqualTo(
            "SARS coronavirus 2 RNA [Presence] in Respiratory specimen by NAA with probe detection");
    assertThat(deviceTypeDisease.getTestOrderedLoincLongName())
        .isEqualTo(
            "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection");
  }

  @Test
  void hasUpdates_withNoSwabTypes_returnsTrue() {
    DeviceType device = TestDataBuilder.createDeviceType();
    assertTrue(_service.hasUpdates(List.of(), List.of(), device));
  }

  @Test
  void hasUpdates_withNoSupportedDiseaseTestPerformed_returnsTrue() {
    DeviceType device = TestDataBuilder.createDeviceType();
    SpecimenType swab1 = TestDataBuilder.createSpecimenType("Anterior nares swab", "697989009");
    device.setSwabTypes(List.of(swab1));
    assertTrue(_service.hasUpdates(List.of(), List.of(), device));
  }

  @Test
  void hasUpdates_withDifferentSupportedDiseaseTestPerformed_returnsTrue() {
    DeviceType device = TestDataBuilder.createDeviceType();
    SpecimenType swab1 = TestDataBuilder.createSpecimenType("Anterior nares swab", "697989009");
    device.setSwabTypes(List.of(swab1));
    SupportedDisease covid = new SupportedDisease("covid-19", "96741-4");

    DeviceTypeDisease supportedDiseaseTestPerformed1 =
        new DeviceTypeDisease(
            UUID.randomUUID(),
            covid,
            "94500-6",
            "SARS coronavirus 2 RNA [Presence] in Respiratory specimen by NAA with probe detection",
            "covidEquipmentUID",
            "covidEquipmentUIDType",
            "covidTestkitNameId1",
            "94500-0",
            "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection");
    device.setSupportedDiseaseTestPerformed(List.of(supportedDiseaseTestPerformed1));

    SupportedDisease flu = new SupportedDisease("FLU A", "LP14239-5");
    DeviceTypeDisease supportedDiseaseTestPerformed2 =
        new DeviceTypeDisease(
            UUID.randomUUID(),
            flu,
            "85477-8",
            "Influenza virus A RNA [Presence] in Upper respiratory specimen by NAA with probe detection",
            "fluEquipmentUID",
            "fluEquipmentUidType",
            "fluTestkitNameId",
            "85477-0",
            "Influenza virus A and B and SARS-CoV-2 (COVID-19) and Respiratory syncytial virus RNA panel - Respiratory specimen by NAA with probe detection");

    device.setSupportedDiseaseTestPerformed(
        List.of(supportedDiseaseTestPerformed1, supportedDiseaseTestPerformed2));

    assertTrue(_service.hasUpdates(List.of(supportedDiseaseTestPerformed1), List.of(), device));
  }

  @Test
  void hasUpdates_withDifferentSwabTypes_returnsTrue() {
    DeviceType device = TestDataBuilder.createDeviceType();
    SpecimenType swab1 = TestDataBuilder.createSpecimenType("Anterior nares swab", "697989009");
    SpecimenType swab2 = new SpecimenType("Nasopharyngeal swab", "258500001");
    SpecimenType swab3 = new SpecimenType("A fake specimen type", "000000000");
    device.setSwabTypes(List.of(swab1, swab2));
    SupportedDisease covid = new SupportedDisease("covid-19", "96741-4");
    DeviceTypeDisease supportedDiseaseTestPerformed1 =
        new DeviceTypeDisease(
            UUID.randomUUID(),
            covid,
            "94500-6",
            "SARS coronavirus 2 RNA [Presence] in Respiratory specimen by NAA with probe detection",
            "covidEquipmentUID",
            "covidEquipmentUIDType",
            "covidTestkitNameId1",
            "94500-0",
            "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection");
    device.setSupportedDiseaseTestPerformed(List.of(supportedDiseaseTestPerformed1));

    SupportedDisease flu = new SupportedDisease("FLU A", "LP14239-5");
    DeviceTypeDisease supportedDiseaseTestPerformed2 =
        new DeviceTypeDisease(
            UUID.randomUUID(),
            flu,
            "85477-8",
            "Influenza virus A RNA [Presence] in Upper respiratory specimen by NAA with probe detection",
            "fluEquipmentUID",
            "fluEquipmentUidType",
            "fluTestkitNameId",
            "85477-0",
            "Influenza virus A and B and SARS-CoV-2 (COVID-19) and Respiratory syncytial virus RNA panel - Respiratory specimen by NAA with probe detection");

    device.setSupportedDiseaseTestPerformed(
        List.of(supportedDiseaseTestPerformed1, supportedDiseaseTestPerformed2));

    assertTrue(
        _service.hasUpdates(
            List.of(supportedDiseaseTestPerformed2, supportedDiseaseTestPerformed1),
            List.of(swab3, swab1),
            device));
  }

  @Test
  void hasUpdates_withNoUpdates_returnsFalse() {
    DeviceType device = TestDataBuilder.createDeviceType();
    SpecimenType swab1 = TestDataBuilder.createSpecimenType("Anterior nares swab", "697989009");
    SpecimenType swab2 = new SpecimenType("Nasopharyngeal swab", "258500001");
    SpecimenType swab3 = new SpecimenType("A fake specimen type", "000000000");
    device.setSwabTypes(List.of(swab1, swab2, swab3));
    SupportedDisease covid = new SupportedDisease("covid-19", "96741-4");

    DeviceTypeDisease supportedDiseaseTestPerformed1A =
        new DeviceTypeDisease(
            UUID.randomUUID(),
            covid,
            "94500-6",
            "SARS coronavirus 2 RNA [Presence] in Respiratory specimen by NAA with probe detection",
            "covidEquipmentUID",
            "covidEquipmentUIDType",
            "covidTestkitNameId1",
            "94500-0",
            "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection");
    DeviceTypeDisease supportedDiseaseTestPerformed1B =
        new DeviceTypeDisease(
            UUID.randomUUID(),
            covid,
            "94500-6",
            "SARS coronavirus 2 RNA [Presence] in Respiratory specimen by NAA with probe detection",
            "covidEquipmentUID",
            "covidEquipmentUIDType",
            "covidTestkitNameId1",
            "94500-0",
            "SARS-CoV-2 (COVID-19) RNA panel - Respiratory specimen by NAA with probe detection");

    SupportedDisease flu = new SupportedDisease("FLU A", "LP14239-5");
    DeviceTypeDisease supportedDiseaseTestPerformed2A =
        new DeviceTypeDisease(
            UUID.randomUUID(),
            flu,
            "85477-8",
            "Influenza virus A RNA [Presence] in Upper respiratory specimen by NAA with probe detection",
            "fluEquipmentUID",
            "fluEquipmentUidType",
            "fluTestkitNameId",
            "85477-0",
            "Influenza virus A and B and SARS-CoV-2 (COVID-19) and Respiratory syncytial virus RNA panel - Respiratory specimen by NAA with probe detection");

    DeviceTypeDisease supportedDiseaseTestPerformed2B =
        new DeviceTypeDisease(
            UUID.randomUUID(),
            flu,
            "85477-8",
            "Influenza virus A RNA [Presence] in Upper respiratory specimen by NAA with probe detection",
            "fluEquipmentUID",
            "fluEquipmentUidType",
            "fluTestkitNameId",
            "85477-0",
            "Influenza virus A and B and SARS-CoV-2 (COVID-19) and Respiratory syncytial virus RNA panel - Respiratory specimen by NAA with probe detection");

    device.setSupportedDiseaseTestPerformed(
        List.of(supportedDiseaseTestPerformed1A, supportedDiseaseTestPerformed2A));

    assertFalse(
        _service.hasUpdates(
            List.of(supportedDiseaseTestPerformed2B, supportedDiseaseTestPerformed1B),
            List.of(swab3, swab1, swab2),
            device));
  }
}
