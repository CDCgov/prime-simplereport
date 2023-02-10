package gov.cdc.usds.simplereport.service;

import static java.util.Collections.emptyList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.SupportedDiseaseTestPerformedInput;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceSpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTestPerformedLoincCodeRepository;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SupportedDiseaseRepository;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;
import java.util.List;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@TestPropertySource(
    properties = {
      "hibernate.query.interceptor.error-level=ERROR",
      "spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"
    })
class DeviceTypeServiceTest extends BaseServiceTest<DeviceTypeService> {

  private static final String FAKE_SWAB_TYPE = "012345678";
  private static final int STANDARD_TEST_LENGTH = 15;
  @Autowired private DeviceTypeRepository _deviceTypeRepo;
  @Autowired private SpecimenTypeRepository specimenTypeRepository;
  @Autowired private DeviceTestPerformedLoincCodeRepository deviceTestPerformedLoincCodeRepository;

  @Mock private DeviceTypeRepository _deviceTypeRepoMock;
  @Mock private DataHubClient dataHubMock;

  private DeviceTypeService deviceTypeServiceWithMock;

  @BeforeAll
  void setup() {
    this.deviceTypeServiceWithMock =
        new DeviceTypeService(
            _deviceTypeRepoMock,
            // dataHubMock,
            mock(DataHubClient.class),
            mock(DeviceSpecimenTypeRepository.class),
            mock(SpecimenTypeRepository.class),
            mock(SupportedDiseaseRepository.class));
  }

  @Test
  void fetchDeviceTypes() {
    _deviceTypeRepo.save(new DeviceType("A", "B", "C", "D", FAKE_SWAB_TYPE, STANDARD_TEST_LENGTH));

    DeviceType deviceType = _service.fetchDeviceTypes().get(0);

    assertEquals("A", deviceType.getName());
    assertEquals("B", deviceType.getManufacturer());
    assertEquals("C", deviceType.getModel());
    assertEquals("D", deviceType.getLoincCode());
    assertEquals(FAKE_SWAB_TYPE, deviceType.getSwabType());
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
                    .loincCode("D")
                    .swabTypes(emptyList())
                    .supportedDiseases(emptyList())
                    .testLength(15)
                    .build()));
  }

  @Test
  void updateDeviceType_baseUser_error() {
    DeviceType deviceType =
        _deviceTypeRepo.save(
            new DeviceType("A", "B", "C", "D", FAKE_SWAB_TYPE, STANDARD_TEST_LENGTH));
    assertSecurityError(
        () ->
            _service.updateDeviceType(
                UpdateDeviceType.builder().internalId(deviceType.getInternalId()).build()));
  }

  @Test
  void removeDeviceType_baseUser_error() {
    DeviceType deviceType =
        _deviceTypeRepo.save(
            new DeviceType("A", "B", "C", "D", FAKE_SWAB_TYPE, STANDARD_TEST_LENGTH));
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
  void createAndDeleteDeviceTypes_withSupportedDisease_adminUser_success() {
    // GIVEN
    SpecimenType swab1 = specimenTypeRepository.save(new SpecimenType("Hair", "000111222"));
    SupportedDisease disease1 = _diseaseService.covid();

    // WHEN
    DeviceType devA =
        _service.createDeviceType(
            CreateDeviceType.builder()
                .name("A")
                .model("B")
                .manufacturer("C")
                .loincCode("D")
                .swabTypes(List.of(swab1.getInternalId()))
                .supportedDiseases(List.of(disease1.getInternalId()))
                .testLength(1)
                .build());

    // THEN
    devA = _deviceTypeRepo.findById(devA.getInternalId()).get();
    assertNotNull(devA);
    assertEquals("A", devA.getName());
    assertEquals("B", devA.getModel());
    assertEquals("C", devA.getManufacturer());
    assertEquals("D", devA.getLoincCode());
    assertEquals("COVID-19", devA.getSupportedDiseases().get(0).getName());
    assertNull(devA.getSwabType());
    List<SpecimenType> devASwabTypes = devA.getSwabTypes();
    assertThat(devASwabTypes).hasSize(1);
    assertThat(devASwabTypes.get(0).getName()).isEqualTo("Hair");
    assertEquals(1, devA.getTestLength());

    assertThat(devA.getSupportedDiseaseTestPerformed()).isEmpty();

    List<DeviceType> found = _service.fetchDeviceTypes();
    assertThat(found).hasSize(1);
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
                .loincCode("D")
                .swabTypes(List.of(swab1.getInternalId()))
                .supportedDiseaseTestPerformed(
                    List.of(
                        SupportedDiseaseTestPerformedInput.builder()
                            .supportedDisease(disease1.getInternalId())
                            .testPerformedLoincCode("loinc1")
                            .equipmentUid("equipmentUid1")
                            .testkitNameId("testkitNameId1")
                            .build()))
                .testLength(1)
                .build());
    DeviceType devB =
        _service.createDeviceType(
            CreateDeviceType.builder()
                .name("F")
                .model("G")
                .manufacturer("H")
                .loincCode("I")
                .swabTypes(List.of(swab2.getInternalId()))
                .supportedDiseaseTestPerformed(
                    List.of(
                        SupportedDiseaseTestPerformedInput.builder()
                            .supportedDisease(disease2.getInternalId())
                            .testPerformedLoincCode("loinc2")
                            .equipmentUid("equipmentUid2")
                            .testkitNameId("testkitNameId2")
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
    assertEquals("D", devA.getLoincCode());
    assertEquals("COVID-19", devA.getSupportedDiseases().get(0).getName());
    assertNull(devA.getSwabType());
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
    SupportedDisease disease2 = _diseaseService.fluA();

    DeviceType device =
        _service.createDeviceType(
            CreateDeviceType.builder()
                .name("A")
                .model("B")
                .manufacturer("C")
                .loincCode("D")
                .swabTypes(List.of(swab1.getInternalId()))
                .supportedDiseases(List.of(disease1.getInternalId()))
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
                .loincCode("W")
                .swabTypes(List.of(swab2.getInternalId()))
                .supportedDiseases(List.of(disease2.getInternalId()))
                .testLength(22)
                .build());

    // THEN
    assertEquals(updatedDevice.getInternalId(), device.getInternalId());
    assertEquals("Z", updatedDevice.getName());
    assertEquals("Y", updatedDevice.getModel());
    assertEquals("X", updatedDevice.getManufacturer());
    assertEquals("W", updatedDevice.getLoincCode());
    assertEquals("Flu A", updatedDevice.getSupportedDiseases().get(0).getName());
    assertEquals(22, updatedDevice.getTestLength());
    assertNull(updatedDevice.getSwabType());

    List<SpecimenType> updatedSwabTypes = updatedDevice.getSwabTypes();
    assertThat(updatedSwabTypes.size()).isEqualTo(1);
    assertThat(updatedSwabTypes.get(0).getName()).isEqualTo("Mouth");
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
                .loincCode("D")
                .swabTypes(List.of(swab1.getInternalId()))
                .supportedDiseaseTestPerformed(
                    List.of(
                        SupportedDiseaseTestPerformedInput.builder()
                            .supportedDisease(disease1.getInternalId())
                            .testPerformedLoincCode("loinc1")
                            .equipmentUid("equipmentUid1")
                            .testkitNameId("testkitNameId1")
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
                            .build(),
                        SupportedDiseaseTestPerformedInput.builder()
                            .supportedDisease(disease2.getInternalId())
                            .testPerformedLoincCode("loinc3")
                            .equipmentUid("equipmentUid3")
                            .testkitNameId("testkitNameId3")
                            .build()))
                .build());

    // THEN
    assertEquals(updatedDevice.getInternalId(), device.getInternalId());
    assertThat(updatedDevice.getSupportedDiseases()).hasSize(2);
    assertThat(updatedDevice.getSupportedDiseases()).contains(disease1, disease2);
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

    var deviceTestPerformedLoincCodeRepositoryAll =
        deviceTestPerformedLoincCodeRepository.findAll();
    assertThat(deviceTestPerformedLoincCodeRepositoryAll).hasSize(2);
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void updateDeviceTypeSupportedDiseaseToSupportedDiseaseTestPerformed_adminUser_success() {
    // GIVEN
    SpecimenType swab1 = specimenTypeRepository.save(new SpecimenType("Nose", "111222333"));
    SupportedDisease disease1 = _diseaseService.covid();

    DeviceType device =
        _service.createDeviceType(
            CreateDeviceType.builder()
                .name("A")
                .model("B")
                .manufacturer("C")
                .loincCode("D")
                .swabTypes(List.of(swab1.getInternalId()))
                .supportedDiseases(List.of(disease1.getInternalId()))
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
                            .testPerformedLoincCode("loinc1")
                            .equipmentUid("equipmentUid1")
                            .testkitNameId("testkitNameId1")
                            .build()))
                .build());

    // THEN
    assertThat(updatedDevice.getInternalId()).isEqualTo(device.getInternalId());
    assertThat(updatedDevice.getSupportedDiseases()).hasSize(1);
    assertThat(updatedDevice.getSupportedDiseases().get(0).getName()).isEqualTo("COVID-19");
    assertThat(updatedDevice.getSupportedDiseaseTestPerformed()).hasSize(1);
    assertThat(updatedDevice.getSupportedDiseaseTestPerformed().get(0).getTestPerformedLoincCode())
        .isEqualTo("loinc1");
    assertThat(updatedDevice.getSupportedDiseaseTestPerformed().get(0).getEquipmentUid())
        .isEqualTo("equipmentUid1");
    assertThat(updatedDevice.getSupportedDiseaseTestPerformed().get(0).getTestkitNameId())
        .isEqualTo("testkitNameId1");
    assertThat(
            updatedDevice
                .getSupportedDiseaseTestPerformed()
                .get(0)
                .getSupportedDisease()
                .getInternalId())
        .isEqualTo(disease1.getInternalId());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void updateDeviceTypeName_adminUser_success_no_changes() {
    // GIVEN
    SpecimenType swab1 = specimenTypeRepository.save(new SpecimenType("Nose", "111222333"));
    SupportedDisease disease1 = _diseaseService.covid();
    DeviceType device =
        _service.createDeviceType(
            CreateDeviceType.builder()
                .name("A")
                .model("B")
                .manufacturer("C")
                .loincCode("D")
                .swabTypes(List.of(swab1.getInternalId()))
                .supportedDiseases(List.of(disease1.getInternalId()))
                .testLength(15)
                .build());

    // WHEN
    DeviceType updatedDevice =
        _service.updateDeviceType(
            UpdateDeviceType.builder().internalId(device.getInternalId()).build());

    // THEN
    assertEquals(updatedDevice.getInternalId(), device.getInternalId());
    assertEquals("A", updatedDevice.getName());
    assertEquals("B", updatedDevice.getModel());
    assertEquals("C", updatedDevice.getManufacturer());
    assertEquals("D", updatedDevice.getLoincCode());
    assertEquals("COVID-19", updatedDevice.getSupportedDiseases().get(0).getName());
    assertNull(updatedDevice.getSwabType());
    assertEquals(15, updatedDevice.getTestLength());

    List<SpecimenType> updatedSwabTypes = updatedDevice.getSwabTypes();
    assertThat(updatedSwabTypes.size()).isEqualTo(1);
    assertThat(updatedSwabTypes.get(0).getName()).isEqualTo("Nose");
  }
}
