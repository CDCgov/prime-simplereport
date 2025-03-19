package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeDiseaseRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = {"spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"})
class DeviceTypeSyncServiceTest extends BaseServiceTest<DeviceTypeSyncService> {
  @Autowired private SupportedDiseaseRepository _supportedDiseaseRepo;
  @Autowired private DeviceTypeDiseaseRepository _deviceTypeDiseaseRepo;
  @Autowired private SpecimenTypeRepository _specimenTypeRepo;
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
    assertThat(deviceTypeDiseases).hasSize(1);

    DeviceTypeDisease deviceTypeDisease = deviceTypeDiseases.get(0);
    assertThat(deviceTypeDisease.getDeviceTypeId()).isEqualTo(device.getInternalId());
    assertEquals(deviceTypeDisease.getSupportedDisease(), covid);
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
  void hasUpdates_withNoIncomingSwabTypes_withNoSwabsOnExistingDevice_returnsFalse() {
    DeviceType device = TestDataBuilder.createDeviceType();
    SupportedDisease covid = TestDataBuilder.createCovidSupportedDisease();
    device.setSupportedDiseaseTestPerformed(
        List.of(TestDataBuilder.createDeviceTypeDisease(covid)));
    assertFalse(_service.hasUpdates(List.of(), List.of(), device));
  }

  @Test
  void hasUpdates_withNoIncomingSwabTypes_withSwabOnExistingDevice_returnsTrue() {
    DeviceType device = TestDataBuilder.createDeviceType();
    SupportedDisease covid = TestDataBuilder.createCovidSupportedDisease();
    device.setSupportedDiseaseTestPerformed(
        List.of(TestDataBuilder.createDeviceTypeDisease(covid)));
    SpecimenType swab1 = TestDataBuilder.createSpecimenType("Anterior nares swab", "697989009");
    device.setSwabTypes(List.of(swab1));
    assertTrue(_service.hasUpdates(List.of(), List.of(), device));
  }

  @Test
  void hasUpdates_withNoIncomingDisease_withNoDiseaseOnExistingDevice_returnsFalse() {
    DeviceType device = TestDataBuilder.createDeviceType();
    SpecimenType swab1 = TestDataBuilder.createSpecimenType("Anterior nares swab", "697989009");
    device.setSwabTypes(List.of(swab1));
    assertFalse(_service.hasUpdates(List.of(), List.of(swab1), device));
  }

  @Test
  void hasUpdates_withNoIncomingDisease_withDiseaseOnExistingDevice_returnsTrue() {
    DeviceType device = TestDataBuilder.createDeviceType();
    SpecimenType swab1 = TestDataBuilder.createSpecimenType("Anterior nares swab", "697989009");
    device.setSwabTypes(List.of(swab1));
    SupportedDisease covid = TestDataBuilder.createCovidSupportedDisease();
    device.setSupportedDiseaseTestPerformed(
        List.of(TestDataBuilder.createDeviceTypeDisease(covid)));
    assertTrue(_service.hasUpdates(List.of(), List.of(swab1), device));
  }

  @Test
  void hasUpdates_withIncomingDisease_withNoDiseaseOnExistingDevice_returnsTrue() {
    DeviceType device = TestDataBuilder.createDeviceType();
    SpecimenType swab1 = TestDataBuilder.createSpecimenType("Anterior nares swab", "697989009");
    device.setSwabTypes(List.of(swab1));
    SupportedDisease covid = TestDataBuilder.createCovidSupportedDisease();
    List<DeviceTypeDisease> deviceTypeDiseases =
        List.of(TestDataBuilder.createDeviceTypeDisease(covid));
    assertTrue(_service.hasUpdates(deviceTypeDiseases, List.of(swab1), device));
  }

  @Test
  void hasUpdates_withDifferentSupportedDiseaseTestPerformed_returnsTrue() {
    DeviceType device = TestDataBuilder.createDeviceType();
    SpecimenType swab1 = TestDataBuilder.createSpecimenType("Anterior nares swab", "697989009");
    device.setSwabTypes(List.of(swab1));
    SupportedDisease covid = TestDataBuilder.createCovidSupportedDisease();

    DeviceTypeDisease supportedDiseaseTestPerformed1 =
        TestDataBuilder.createDeviceTypeDisease(UUID.randomUUID(), covid);
    device.setSupportedDiseaseTestPerformed(List.of(supportedDiseaseTestPerformed1));

    SupportedDisease flu = TestDataBuilder.createFluASupportedDisease();
    DeviceTypeDisease supportedDiseaseTestPerformed2 =
        TestDataBuilder.createDeviceTypeDisease(UUID.randomUUID(), flu);
    device.setSupportedDiseaseTestPerformed(
        List.of(supportedDiseaseTestPerformed1, supportedDiseaseTestPerformed2));

    assertTrue(_service.hasUpdates(List.of(supportedDiseaseTestPerformed1), List.of(), device));
  }

  @Test
  void hasUpdates_withDifferentSwabTypes_returnsTrue() {
    DeviceType device = TestDataBuilder.createDeviceType();
    SpecimenType swab1 = TestDataBuilder.createSpecimenType("Anterior nares swab", "697989009");
    SpecimenType swab2 = TestDataBuilder.createSpecimenType("Nasopharyngeal swab", "258500001");
    SpecimenType swab3 = TestDataBuilder.createSpecimenType("A fake specimen type", "000000000");
    device.setSwabTypes(List.of(swab1, swab2));
    SupportedDisease covid = TestDataBuilder.createCovidSupportedDisease();
    DeviceTypeDisease supportedDiseaseTestPerformed1 =
        TestDataBuilder.createDeviceTypeDisease(UUID.randomUUID(), covid);
    device.setSupportedDiseaseTestPerformed(List.of(supportedDiseaseTestPerformed1));

    SupportedDisease flu = TestDataBuilder.createFluASupportedDisease();
    DeviceTypeDisease supportedDiseaseTestPerformed2 =
        TestDataBuilder.createDeviceTypeDisease(UUID.randomUUID(), flu);
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
    SpecimenType swab2 = TestDataBuilder.createSpecimenType("Nasopharyngeal swab", "258500001");
    SpecimenType swab3 = TestDataBuilder.createSpecimenType("A fake specimen type", "000000000");
    device.setSwabTypes(List.of(swab1, swab2, swab3));
    SupportedDisease covid = TestDataBuilder.createCovidSupportedDisease();

    DeviceTypeDisease supportedDiseaseTestPerformed1 =
        TestDataBuilder.createDeviceTypeDisease(UUID.randomUUID(), covid);
    SupportedDisease flu = TestDataBuilder.createFluASupportedDisease();
    DeviceTypeDisease supportedDiseaseTestPerformed2 =
        TestDataBuilder.createDeviceTypeDisease(UUID.randomUUID(), flu);
    device.setSupportedDiseaseTestPerformed(
        List.of(supportedDiseaseTestPerformed1, supportedDiseaseTestPerformed2));

    assertFalse(
        _service.hasUpdates(
            List.of(supportedDiseaseTestPerformed2, supportedDiseaseTestPerformed1),
            List.of(swab3, swab1, swab2),
            device));
  }

  @Test
  void createDeviceType_swabTypeDeleted_throwsException() {
    _specimenTypeRepo.save(TestDataBuilder.createSpecimenType("Anterior nares swab", "697989009"));
    SpecimenType swab = _specimenTypeRepo.findByTypeCode("697989009").get();
    CreateDeviceType deviceToCreate =
        CreateDeviceType.builder()
            .name("COVID Device")
            .manufacturer("COVID Manufacturer")
            .model("COVID Model")
            .testLength(15)
            .swabTypes(List.of(swab.getInternalId()))
            .supportedDiseaseTestPerformed(List.of())
            .build();
    _specimenTypeRepo.delete(swab);

    IllegalGraphqlArgumentException caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _service.createDeviceType(deviceToCreate));
    assertEquals("swab type has been deleted and cannot be used", caught.getMessage());
  }

  @Test
  void updateDeviceType_deviceNotFound_throwsException() {
    UUID uuid = UUID.randomUUID();
    UpdateDeviceType deviceToUpdate =
        UpdateDeviceType.builder()
            .internalId(uuid)
            .name("COVID Device")
            .manufacturer("COVID Device Manufacturer")
            .model("COVID Device Model")
            .testLength(15)
            .swabTypes(List.of())
            .supportedDiseaseTestPerformed(List.of())
            .build();

    BadRequestException caught =
        assertThrows(BadRequestException.class, () -> _service.updateDeviceType(deviceToUpdate));
    assertEquals(String.format("DeviceType with ID %s not found", uuid), caught.getMessage());
  }

  @Test
  void updateDeviceType_swabTypeDeleted_throwsException() {
    _specimenTypeRepo.save(TestDataBuilder.createSpecimenType("Anterior nares swab", "697989009"));
    SpecimenType swab = _specimenTypeRepo.findByTypeCode("697989009").get();
    DeviceType savedDevice =
        TestDataBuilder.createDeviceType("COVID Device", 15, List.of(swab), List.of());
    _deviceTypeRepo.save(savedDevice);
    UpdateDeviceType deviceToUpdate =
        UpdateDeviceType.builder()
            .internalId(savedDevice.getInternalId())
            .name("COVID Device")
            .manufacturer("COVID Manufacturer")
            .model("COVID Model")
            .testLength(15)
            .swabTypes(List.of(swab.getInternalId()))
            .supportedDiseaseTestPerformed(List.of())
            .build();
    _specimenTypeRepo.delete(swab);

    IllegalGraphqlArgumentException caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _service.updateDeviceType(deviceToUpdate));
    assertEquals("swab type has been deleted and cannot be used", caught.getMessage());
  }

  @Test
  void createDeviceTypes_success() {
    SpecimenType savedSwab = TestDataBuilder.createSpecimenType("Anterior nares swab", "697989009");
    SpecimenType deletedSwab =
        TestDataBuilder.createSpecimenType("Nasopharyngeal swab", "258500001");
    SpecimenType newSwab = TestDataBuilder.createSpecimenType("Oral fluid specimen", "441620008");
    _specimenTypeRepo.saveAll(List.of(savedSwab, deletedSwab));

    SpecimenType updatedSavedSwab =
        TestDataBuilder.createSpecimenType("Anterior nares updated swab", "697989009");
    DeviceType deviceToCreate =
        TestDataBuilder.createDeviceType(
            "COVID Device", 15, List.of(updatedSavedSwab, deletedSwab, newSwab), List.of());
    _specimenTypeRepo.delete(deletedSwab);

    assertTrue(_specimenTypeRepo.findByTypeCode("258500001").get().getIsDeleted());
    _service.createDeviceTypes(List.of(deviceToCreate));
    assertEquals(_specimenTypeRepo.findByTypeCode("697989009").get(), updatedSavedSwab);
    assertFalse(_specimenTypeRepo.findByTypeCode("258500001").get().getIsDeleted());
    assertEquals(_specimenTypeRepo.findByTypeCode("441620008").get(), newSwab);
    assertNotNull(_deviceTypeRepo.findDeviceTypeByName("COVID Device"));
  }
}
