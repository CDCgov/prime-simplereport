package gov.cdc.usds.simplereport.service;

import static java.util.Collections.emptyList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;

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
  @WithSimpleReportSiteAdminUser
  void fetchDeviceType_carestartTestLength() {

    _service.createDeviceType(
        CreateDeviceType.builder()
            .name("CareStart")
            .model("B")
            .manufacturer("C")
            .loincCode("D")
            .swabTypes(emptyList())
            .supportedDiseases(emptyList())
            .build());

    DeviceType deviceType = _service.fetchDeviceTypes().get(0);
    System.out.print(deviceType.toString());

    assertEquals(10, deviceType.getTestLength());
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
  void removeDeviceType_baseUser_eror() {
    DeviceType deviceType =
        _deviceTypeRepo.save(
            new DeviceType("A", "B", "C", "D", FAKE_SWAB_TYPE, STANDARD_TEST_LENGTH));
    assertSecurityError(() -> _service.removeDeviceType(deviceType));
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void createAndDeleteDeviceTypes_adminUser_success() {
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
                .supportedDiseases(List.of(disease1.getInternalId()))
                .build());
    DeviceType devB =
        _service.createDeviceType(
            CreateDeviceType.builder()
                .name("F")
                .model("G")
                .manufacturer("H")
                .loincCode("I")
                .swabTypes(List.of(swab2.getInternalId()))
                .supportedDiseases(List.of(disease2.getInternalId()))
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
    assertThat(devASwabTypes.size()).isEqualTo(1);
    assertThat(devASwabTypes.get(0).getName()).isEqualTo("Hair");

    devB = _deviceTypeRepo.findById(devB.getInternalId()).get();
    assertNotNull(devB);
    assertEquals("F", devB.getName());
    assertEquals("G", devB.getModel());
    assertEquals("H", devB.getManufacturer());
    assertEquals("I", devB.getLoincCode());
    assertEquals("Flu A", devB.getSupportedDiseases().get(0).getName());
    assertNull(devB.getSwabType());
    List<SpecimenType> devBSwabTypes = devB.getSwabTypes();
    assertThat(devBSwabTypes.size()).isEqualTo(1);
    assertThat(devBSwabTypes.get(0).getName()).isEqualTo("Mouth");

    List<DeviceType> found = _service.fetchDeviceTypes();
    assertEquals(2, found.size());
    _service.removeDeviceType(devB);
    found = _service.fetchDeviceTypes();
    assertEquals(1, found.size());
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
                .build());

    // THEN
    assertEquals(updatedDevice.getInternalId(), device.getInternalId());
    assertEquals("Z", updatedDevice.getName());
    assertEquals("Y", updatedDevice.getModel());
    assertEquals("X", updatedDevice.getManufacturer());
    assertEquals("W", updatedDevice.getLoincCode());
    assertEquals("Flu A", updatedDevice.getSupportedDiseases().get(0).getName());
    assertNull(updatedDevice.getSwabType());

    List<SpecimenType> updatedSwabTypes = updatedDevice.getSwabTypes();
    assertThat(updatedSwabTypes.size()).isEqualTo(1);
    assertThat(updatedSwabTypes.get(0).getName()).isEqualTo("Mouth");
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

    List<SpecimenType> updatedSwabTypes = updatedDevice.getSwabTypes();
    assertThat(updatedSwabTypes.size()).isEqualTo(1);
    assertThat(updatedSwabTypes.get(0).getName()).isEqualTo("Nose");
  }
}
