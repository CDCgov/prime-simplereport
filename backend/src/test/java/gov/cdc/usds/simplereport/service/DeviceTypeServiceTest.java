package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class DeviceTypeServiceTest extends BaseServiceTest<DeviceTypeService> {

  private static final String FAKE_SWAB_TYPE = "012345678";
  private static final int STANDARD_TEST_LENGTH = 15;
  @Autowired private DeviceTypeRepository _deviceTypeRepo;

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
    _service.createDeviceType("CareStart", "B", "C", "D", FAKE_SWAB_TYPE);

    DeviceType deviceType = _service.fetchDeviceTypes().get(0);
    System.out.print(deviceType.toString());

    assertEquals(10, deviceType.getTestLength());
  }

  @Test
  void createDeviceType_baseUser_error() {
    assertSecurityError(() -> _service.createDeviceType("A", "B", "C", "D", FAKE_SWAB_TYPE));
  }

  @Test
  void updateDeviceType_baseUser_error() {
    DeviceType deviceType =
        _deviceTypeRepo.save(
            new DeviceType("A", "B", "C", "D", FAKE_SWAB_TYPE, STANDARD_TEST_LENGTH));
    assertSecurityError(
        () -> _service.updateDeviceType(deviceType.getInternalId(), "1", "2", "3", "4", "5"));
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
    DeviceType devA = _service.createDeviceType("A", "B", "C", "D", FAKE_SWAB_TYPE);
    DeviceType devB = _service.createDeviceType("F", "G", "H", "I", "91234567");
    assertNotNull(devA);
    assertNotNull(devB);
    assertNotEquals(devA.getInternalId(), devB.getInternalId());
    List<DeviceType> found = _service.fetchDeviceTypes();
    assertEquals(2, found.size());
    _service.removeDeviceType(devB);
    found = _service.fetchDeviceTypes();
    assertEquals(1, found.size());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void updateDeviceTypeName_adminUser_success() {
    DeviceType device = _service.createDeviceType("A", "B", "C", "D", FAKE_SWAB_TYPE);

    DeviceType updatedDevice =
        _service.updateDeviceType(device.getInternalId(), "Tim", null, null, null, null);

    assertEquals(updatedDevice.getInternalId(), device.getInternalId());
    assertEquals(updatedDevice.getName(), "Tim");
    assertEquals(updatedDevice.getModel(), "B");
    assertEquals(updatedDevice.getManufacturer(), "C");
    assertEquals(updatedDevice.getLoincCode(), "D");
    assertEquals(updatedDevice.getSwabType(), FAKE_SWAB_TYPE);
  }
}
