package gov.cdc.usds.simplereport.service;

import static java.util.Collections.emptyList;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;

import gov.cdc.usds.simplereport.api.model.CreateDeviceType;
import gov.cdc.usds.simplereport.api.model.UpdateDeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
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

    assertEquals(deviceType.getName(), "A");
    assertEquals(deviceType.getManufacturer(), "B");
    assertEquals(deviceType.getModel(), "C");
    assertEquals(deviceType.getLoincCode(), "D");
    assertEquals(deviceType.getSwabType(), FAKE_SWAB_TYPE);
    assertEquals(15, deviceType.getTestLength());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void fetchDeviceType_carestartTestLength() {

    _service.createDeviceTypeNew(
        CreateDeviceType.builder()
            .name("CareStart")
            .model("B")
            .manufacturer("C")
            .loincCode("D")
            .swabTypes(emptyList())
            .build());

    DeviceType deviceType = _service.fetchDeviceTypes().get(0);
    System.out.print(deviceType.toString());

    assertEquals(10, deviceType.getTestLength());
  }

  @Test
  void createDeviceType_baseUser_error() {
    assertSecurityError(
        () ->
            _service.createDeviceTypeNew(
                CreateDeviceType.builder()
                    .name("A")
                    .model("B")
                    .manufacturer("C")
                    .loincCode("D")
                    .swabTypes(emptyList())
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

    // WHEN
    DeviceType devA =
        _service.createDeviceTypeNew(
            CreateDeviceType.builder()
                .name("A")
                .model("B")
                .manufacturer("C")
                .loincCode("D")
                .swabTypes(List.of(swab1.getInternalId()))
                .build());
    DeviceType devB =
        _service.createDeviceTypeNew(
            CreateDeviceType.builder()
                .name("F")
                .model("G")
                .manufacturer("H")
                .loincCode("I")
                .swabTypes(List.of(swab2.getInternalId()))
                .build());

    // THEN
    assertNotEquals(devA.getInternalId(), devB.getInternalId());

    devA = _deviceTypeRepo.findById(devA.getInternalId()).get();
    assertNotNull(devA);
    assertEquals(devA.getName(), "A");
    assertEquals(devA.getModel(), "B");
    assertEquals(devA.getManufacturer(), "C");
    assertEquals(devA.getLoincCode(), "D");
    assertNull(devA.getSwabType());
    List<SpecimenType> devASwabTypes = devA.getSwabTypes();
    assertThat(devASwabTypes.size()).isEqualTo(1);
    assertThat(devASwabTypes.get(0).getName()).isEqualTo("Hair");

    devB = _deviceTypeRepo.findById(devB.getInternalId()).get();
    assertNotNull(devB);
    assertEquals(devB.getName(), "F");
    assertEquals(devB.getModel(), "G");
    assertEquals(devB.getManufacturer(), "H");
    assertEquals(devB.getLoincCode(), "I");
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
    DeviceType device =
        _service.createDeviceTypeNew(
            CreateDeviceType.builder()
                .name("A")
                .model("B")
                .manufacturer("C")
                .loincCode("D")
                .swabTypes(List.of(swab1.getInternalId()))
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
                .build());

    // THEN
    assertEquals(updatedDevice.getInternalId(), device.getInternalId());
    assertEquals("Z", updatedDevice.getName());
    assertEquals("Y", updatedDevice.getModel());
    assertEquals("X", updatedDevice.getManufacturer());
    assertEquals("W", updatedDevice.getLoincCode());
    assertNull(updatedDevice.getSwabType());

    List<SpecimenType> updatedSwabTypes = updatedDevice.getSwabTypes();
    assertThat(updatedSwabTypes.size()).isEqualTo(1);
    assertThat(updatedSwabTypes.get(0).getName()).isEqualTo("Mouth");
  }
}
