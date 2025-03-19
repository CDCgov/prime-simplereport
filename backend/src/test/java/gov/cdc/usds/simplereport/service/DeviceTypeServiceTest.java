package gov.cdc.usds.simplereport.service;

import static java.util.Collections.emptyList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeDiseaseRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;
import java.util.List;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestPropertySource(properties = {"spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"})
class DeviceTypeServiceTest extends BaseServiceTest<DeviceTypeService> {

  private static final int STANDARD_TEST_LENGTH = 15;
  @Autowired private DeviceTypeRepository _deviceTypeRepo;
  @Autowired private SpecimenTypeRepository specimenTypeRepository;
  @Autowired private DeviceTypeDiseaseRepository deviceTypeDiseaseRepository;

  @Mock private DeviceTypeRepository _deviceTypeRepoMock;
  @Mock private DeviceTypeSyncService _deviceTypeSyncServiceMock;
  private DeviceTypeService deviceTypeServiceWithMock;

  @BeforeAll
  void setup() {
    this.deviceTypeServiceWithMock =
        new DeviceTypeService(_deviceTypeRepoMock, _deviceTypeSyncServiceMock);
  }

  @Test
  void fetchDeviceTypes() {
    _deviceTypeRepo.save(new DeviceType("A", "B", "C", STANDARD_TEST_LENGTH));

    DeviceType deviceType = _service.fetchDeviceTypes().get(0);

    assertEquals("A", deviceType.getName());
    assertEquals("B", deviceType.getManufacturer());
    assertEquals("C", deviceType.getModel());
    assertEquals(15, deviceType.getTestLength());
  }

  @Test
  void createDeviceType_baseUser_error() {
    assertSecurityError(
        () ->
            _service.createDeviceType(
                CreateDeviceType.builder()
                    .name("A")
                    .model("B")
                    .manufacturer("C")
                    .swabTypes(emptyList())
                    .testLength(15)
                    .build()));
  }

  @Test
  void updateDeviceType_baseUser_error() {
    DeviceType deviceType =
        _deviceTypeRepo.save(new DeviceType("A", "B", "C", STANDARD_TEST_LENGTH));
    assertSecurityError(
        () ->
            _service.updateDeviceType(
                UpdateDeviceType.builder().internalId(deviceType.getInternalId()).build()));
  }

  @Test
  void removeDeviceType_baseUser_error() {
    DeviceType deviceType =
        _deviceTypeRepo.save(new DeviceType("A", "B", "C", STANDARD_TEST_LENGTH));
    assertSecurityError(() -> _service.removeDeviceType(deviceType));
  }

  @Test
  void getDeviceType_withDeviceName() {
    String deviceName = "dummyDevice";
    DeviceType dummyDevice = mock(DeviceType.class);
    when(this._deviceTypeRepoMock.findDeviceTypeByName(anyString())).thenReturn(dummyDevice);
    assertEquals(this.deviceTypeServiceWithMock.getDeviceType(deviceName), dummyDevice);
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void createDuplicateDeviceType_error() {
    // GIVEN
    SpecimenType swab = specimenTypeRepository.save(new SpecimenType("Hair", "000111222"));
    SupportedDisease disease = _diseaseService.covid();

    CreateDeviceType createDeviceType =
        CreateDeviceType.builder()
            .name("A")
            .model("B")
            .manufacturer("C")
            .swabTypes(List.of(swab.getInternalId()))
            .supportedDiseaseTestPerformed(
                List.of(
                    SupportedDiseaseTestPerformedInput.builder()
                        .supportedDisease(disease.getInternalId())
                        .testPerformedLoincCode("loinc1")
                        .equipmentUid("equipmentUid1")
                        .equipmentUidType("equipmentUidType1")
                        .testkitNameId("testkitNameId1")
                        .testOrderedLoincCode("loinc3")
                        .build()))
            .testLength(1)
            .build();

    _service.createDeviceType(createDeviceType);

    // WHEN trying to create a device with the same model/manufacturer
    IllegalGraphqlArgumentException exception =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _service.createDeviceType(createDeviceType));

    // THEN
    assertThat(exception.getMessage())
        .isEqualTo("an active device type already exists with the same manufacturer and model");
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void createAndDeleteDeviceTypes_withSupportedDiseaseTestPerformed_adminUser_success() {
    // GIVEN
    SpecimenType swab1 = specimenTypeRepository.save(new SpecimenType("Hair", "000111222"));
    SpecimenType swab2 = specimenTypeRepository.save(new SpecimenType("Mouth", "112233445"));
    SupportedDisease disease1 = _diseaseService.covid();
    SupportedDisease disease2 = _diseaseService.fluA();

    // WHEN
    DeviceType devA =
        _service.createDeviceType(
            CreateDeviceType.builder()
                .name("A")
                .model("B")
                .manufacturer("C")
                .swabTypes(List.of(swab1.getInternalId()))
                .supportedDiseaseTestPerformed(
                    List.of(
                        SupportedDiseaseTestPerformedInput.builder()
                            .supportedDisease(disease1.getInternalId())
                            .testPerformedLoincCode("loinc1")
                            .equipmentUid("equipmentUid1")
                            .equipmentUidType("equipmentUidType1")
                            .testkitNameId("testkitNameId1")
                            .testOrderedLoincCode("loinc3")
                            .build()))
                .testLength(1)
                .build());
    DeviceType devB =
        _service.createDeviceType(
            CreateDeviceType.builder()
                .name("F")
                .model("G")
                .manufacturer("H")
                .swabTypes(List.of(swab2.getInternalId()))
                .supportedDiseaseTestPerformed(
                    List.of(
                        SupportedDiseaseTestPerformedInput.builder()
                            .supportedDisease(disease2.getInternalId())
                            .testPerformedLoincCode("loinc2")
                            .equipmentUid("equipmentUid2")
                            .equipmentUidType("equipmentUidType2")
                            .testkitNameId("testkitNameId2")
                            .testOrderedLoincCode("loinc3")
                            .build()))
                .testLength(2)
                .build());

    // THEN
    assertNotEquals(devA.getInternalId(), devB.getInternalId());

    devA = _deviceTypeRepo.findById(devA.getInternalId()).get();
    assertNotNull(devA);
    assertEquals("A", devA.getName());
    assertEquals("B", devA.getModel());
    assertEquals("C", devA.getManufacturer());
    List<SpecimenType> devASwabTypes = devA.getSwabTypes();
    assertThat(devASwabTypes).hasSize(1);
    assertThat(devASwabTypes.get(0).getName()).isEqualTo("Hair");
    assertEquals(1, devA.getTestLength());

    assertThat(devA.getSupportedDiseaseTestPerformed()).hasSize(1);
    var disease1TestPerformed =
        devA.getSupportedDiseaseTestPerformed().stream()
            .filter(
                testPerformed ->
                    testPerformed
                        .getSupportedDisease()
                        .getInternalId()
                        .equals(disease1.getInternalId()))
            .findFirst();
    assertThat(disease1TestPerformed).isPresent();
    assertThat(disease1TestPerformed.get().getTestPerformedLoincCode()).isEqualTo("loinc1");
    assertThat(disease1TestPerformed.get().getEquipmentUid()).isEqualTo("equipmentUid1");
    assertThat(disease1TestPerformed.get().getTestkitNameId()).isEqualTo("testkitNameId1");
    assertThat(disease1TestPerformed.get().getTestOrderedLoincCode()).isEqualTo("loinc3");

    devB = _deviceTypeRepo.findById(devB.getInternalId()).get();
    assertNotNull(devB);

    List<DeviceType> found = _service.fetchDeviceTypes();
    assertThat(found).hasSize(2);
    _service.removeDeviceType(devB);
    found = _service.fetchDeviceTypes();
    assertThat(found).hasSize(1);
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void updateDeviceTypeName_adminUser_success() {
    // GIVEN
    SpecimenType swab1 = specimenTypeRepository.save(new SpecimenType("Nose", "111222333"));
    SpecimenType swab2 = specimenTypeRepository.save(new SpecimenType("Mouth", "555666444"));
    SupportedDisease disease1 = _diseaseService.covid();

    DeviceType device =
        _service.createDeviceType(
            CreateDeviceType.builder()
                .name("A")
                .model("B")
                .manufacturer("C")
                .swabTypes(List.of(swab1.getInternalId()))
                .supportedDiseaseTestPerformed(
                    List.of(
                        SupportedDiseaseTestPerformedInput.builder()
                            .supportedDisease(disease1.getInternalId())
                            .testPerformedLoincCode("loinc1")
                            .equipmentUid("equipmentUid1")
                            .equipmentUidType("equipmentUidType1")
                            .testkitNameId("testkitNameId1")
                            .testOrderedLoincCode("loinc3")
                            .build()))
                .testLength(10)
                .build());

    // WHEN
    DeviceType updatedDevice =
        _service.updateDeviceType(
            UpdateDeviceType.builder()
                .internalId(device.getInternalId())
                .name("Z")
                .model("Y")
                .manufacturer("X")
                .swabTypes(List.of(swab2.getInternalId()))
                .supportedDiseaseTestPerformed(
                    List.of(
                        SupportedDiseaseTestPerformedInput.builder()
                            .supportedDisease(disease1.getInternalId())
                            .testPerformedLoincCode("loinc2")
                            .equipmentUid("equipmentUid2")
                            .testkitNameId("testkitNameId2")
                            .testOrderedLoincCode("loinc3")
                            .build()))
                .testLength(22)
                .build());

    // THEN
    assertEquals(updatedDevice.getInternalId(), device.getInternalId());
    assertEquals("Z", updatedDevice.getName());
    assertEquals("Y", updatedDevice.getModel());
    assertEquals("X", updatedDevice.getManufacturer());
    assertEquals(22, updatedDevice.getTestLength());
    assertThat(updatedDevice.getSupportedDiseaseTestPerformed()).hasSize(1);
    var disease1TestPerformed =
        updatedDevice.getSupportedDiseaseTestPerformed().stream()
            .filter(
                testPerformed ->
                    testPerformed
                        .getSupportedDisease()
                        .getInternalId()
                        .equals(disease1.getInternalId()))
            .findFirst();
    assertThat(disease1TestPerformed).isPresent();
    assertThat(disease1TestPerformed.get().getTestPerformedLoincCode()).isEqualTo("loinc2");
    assertThat(disease1TestPerformed.get().getEquipmentUid()).isEqualTo("equipmentUid2");
    assertThat(disease1TestPerformed.get().getTestkitNameId()).isEqualTo("testkitNameId2");
    assertThat(disease1TestPerformed.get().getTestOrderedLoincCode()).isEqualTo("loinc3");

    List<SpecimenType> updatedSwabTypes = updatedDevice.getSwabTypes();
    assertThat(updatedSwabTypes).hasSize(1);
    assertThat(updatedSwabTypes.get(0).getName()).isEqualTo("Mouth");
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void updateDeviceEquipmentUidType_adminUser_success() {
    // GIVEN
    SpecimenType swab1 = specimenTypeRepository.save(new SpecimenType("Nose", "111222333"));
    SupportedDisease disease1 = _diseaseService.covid();

    DeviceType device =
        _service.createDeviceType(
            CreateDeviceType.builder()
                .name("A")
                .model("B")
                .manufacturer("C")
                .swabTypes(List.of(swab1.getInternalId()))
                .supportedDiseaseTestPerformed(
                    List.of(
                        SupportedDiseaseTestPerformedInput.builder()
                            .supportedDisease(disease1.getInternalId())
                            .testPerformedLoincCode("loinc1")
                            .equipmentUid("equipmentUid1")
                            .equipmentUidType("equipmentUidType1")
                            .testkitNameId("testkitNameId1")
                            .testOrderedLoincCode("loinc3")
                            .build()))
                .testLength(10)
                .build());

    UpdateDeviceType deviceUpdate =
        UpdateDeviceType.builder()
            .internalId(device.getInternalId())
            .supportedDiseaseTestPerformed(
                List.of(
                    SupportedDiseaseTestPerformedInput.builder()
                        .supportedDisease(disease1.getInternalId())
                        .testPerformedLoincCode("loinc1")
                        .equipmentUid("equipmentUid1")
                        .testkitNameId("testkitNameId1")
                        .testOrderedLoincCode("loinc3")
                        .equipmentUidType("equipmentUidType2")
                        .build()))
            .build();
    DeviceType updatedDevice = _service.updateDeviceType(deviceUpdate);

    // THEN
    assertEquals(
        "equipmentUidType2",
        updatedDevice.getSupportedDiseaseTestPerformed().get(0).getEquipmentUidType());
    assertThat(updatedDevice.getSupportedDiseaseTestPerformed()).hasSize(1);
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void updateDeviceTypeSupportedDiseaseTestPerformed_adminUser_success() {
    // GIVEN
    SpecimenType swab1 = specimenTypeRepository.save(new SpecimenType("Nose", "111222333"));
    SupportedDisease disease1 = _diseaseService.covid();
    SupportedDisease disease2 = _diseaseService.fluA();

    DeviceType device =
        _service.createDeviceType(
            CreateDeviceType.builder()
                .name("A")
                .model("B")
                .manufacturer("C")
                .swabTypes(List.of(swab1.getInternalId()))
                .supportedDiseaseTestPerformed(
                    List.of(
                        SupportedDiseaseTestPerformedInput.builder()
                            .supportedDisease(disease1.getInternalId())
                            .testPerformedLoincCode("loinc1")
                            .equipmentUid("equipmentUid1")
                            .equipmentUidType("equipmentUidType1")
                            .testkitNameId("testkitNameId1")
                            .testOrderedLoincCode("loinc3")
                            .build()))
                .testLength(10)
                .build());

    // WHEN
    DeviceType updatedDevice =
        _service.updateDeviceType(
            UpdateDeviceType.builder()
                .internalId(device.getInternalId())
                .supportedDiseaseTestPerformed(
                    List.of(
                        SupportedDiseaseTestPerformedInput.builder()
                            .supportedDisease(disease1.getInternalId())
                            .testPerformedLoincCode("loinc2")
                            .equipmentUid("equipmentUid2")
                            .testkitNameId("testkitNameId2")
                            .testOrderedLoincCode("loinc3")
                            .build(),
                        SupportedDiseaseTestPerformedInput.builder()
                            .supportedDisease(disease2.getInternalId())
                            .testPerformedLoincCode("loinc3")
                            .equipmentUid("equipmentUid3")
                            .testkitNameId("testkitNameId3")
                            .testOrderedLoincCode("loinc4")
                            .build()))
                .build());

    // THEN
    assertEquals(updatedDevice.getInternalId(), device.getInternalId());
    assertThat(updatedDevice.getSupportedDiseaseTestPerformed()).hasSize(2);
    var disease1TestPerformed =
        updatedDevice.getSupportedDiseaseTestPerformed().stream()
            .filter(
                testPerformed ->
                    testPerformed
                        .getSupportedDisease()
                        .getInternalId()
                        .equals(disease1.getInternalId()))
            .findFirst();
    assertThat(disease1TestPerformed).isPresent();
    assertThat(disease1TestPerformed.get().getTestPerformedLoincCode()).isEqualTo("loinc2");
    assertThat(disease1TestPerformed.get().getEquipmentUid()).isEqualTo("equipmentUid2");
    assertThat(disease1TestPerformed.get().getTestkitNameId()).isEqualTo("testkitNameId2");
    assertThat(disease1TestPerformed.get().getTestOrderedLoincCode()).isEqualTo("loinc3");

    var disease2TestPerformed =
        updatedDevice.getSupportedDiseaseTestPerformed().stream()
            .filter(
                testPerformed ->
                    testPerformed
                        .getSupportedDisease()
                        .getInternalId()
                        .equals(disease2.getInternalId()))
            .findFirst();
    assertThat(disease2TestPerformed).isPresent();
    assertThat(disease2TestPerformed.get().getTestPerformedLoincCode()).isEqualTo("loinc3");
    assertThat(disease2TestPerformed.get().getEquipmentUid()).isEqualTo("equipmentUid3");
    assertThat(disease2TestPerformed.get().getTestkitNameId()).isEqualTo("testkitNameId3");
    assertThat(disease2TestPerformed.get().getTestOrderedLoincCode()).isEqualTo("loinc4");

    var deviceTypeDiseaseRepositoryAll = deviceTypeDiseaseRepository.findAll();
    assertThat(deviceTypeDiseaseRepositoryAll).hasSize(2);
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void updateDeviceTypeName_adminUser_success_no_changes() {
    // GIVEN
    SpecimenType swab1 = specimenTypeRepository.save(new SpecimenType("Nose", "111222333"));
    SupportedDisease disease1 = _diseaseService.covid();
    List<SupportedDiseaseTestPerformedInput> supportedDiseaseInput =
        List.of(
            SupportedDiseaseTestPerformedInput.builder()
                .supportedDisease(disease1.getInternalId())
                .testPerformedLoincCode("loinc2")
                .equipmentUid("equipmentUid2")
                .equipmentUidType("equipmentUidType1")
                .testkitNameId("testkitNameId2")
                .testOrderedLoincCode("loinc3")
                .build());

    DeviceType device =
        _service.createDeviceType(
            CreateDeviceType.builder()
                .name("A")
                .model("B")
                .manufacturer("C")
                .swabTypes(List.of(swab1.getInternalId()))
                .supportedDiseaseTestPerformed(supportedDiseaseInput)
                .testLength(15)
                .build());

    // WHEN
    DeviceType updatedDevice =
        _service.updateDeviceType(
            UpdateDeviceType.builder()
                .internalId(device.getInternalId())
                .supportedDiseaseTestPerformed(supportedDiseaseInput)
                .build());

    // THEN
    assertEquals(updatedDevice.getInternalId(), device.getInternalId());
    assertEquals("A", updatedDevice.getName());
    assertEquals("B", updatedDevice.getModel());
    assertEquals("C", updatedDevice.getManufacturer());

    assertEquals(15, updatedDevice.getTestLength());
    assertThat(updatedDevice.getSupportedDiseaseTestPerformed()).hasSize(1);
    var disease1TestPerformed =
        updatedDevice.getSupportedDiseaseTestPerformed().stream()
            .filter(
                testPerformed ->
                    testPerformed
                        .getSupportedDisease()
                        .getInternalId()
                        .equals(disease1.getInternalId()))
            .findFirst();
    assertThat(disease1TestPerformed).isPresent();
    assertThat(disease1TestPerformed.get().getTestPerformedLoincCode()).isEqualTo("loinc2");
    assertThat(disease1TestPerformed.get().getEquipmentUid()).isEqualTo("equipmentUid2");
    assertThat(disease1TestPerformed.get().getTestkitNameId()).isEqualTo("testkitNameId2");
    assertThat(disease1TestPerformed.get().getTestOrderedLoincCode()).isEqualTo("loinc3");

    List<SpecimenType> updatedSwabTypes = updatedDevice.getSwabTypes();
    assertThat(updatedSwabTypes).hasSize(1);
    assertThat(updatedSwabTypes.get(0).getName()).isEqualTo("Nose");
  }
}
