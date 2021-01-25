package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;

public class DeviceTypeServiceTest extends BaseServiceTest<DeviceTypeService> {

    @Autowired
    private DeviceTypeRepository _deviceTypeRepo;

    @Test
    public void fetchDeviceTypes() {
        _deviceTypeRepo.save(new DeviceType("A", "B", "C", "D"));

        DeviceType deviceType = _service.fetchDeviceTypes().get(0);
    
        assertEquals(deviceType.getName(), "A");
        assertEquals(deviceType.getManufacturer(), "B");
        assertEquals(deviceType.getModel(), "C");
        assertEquals(deviceType.getLoincCode(), "D");
    }

    @Test
    public void createDeviceType_baseUser_error() {
        assertSecurityError(() -> _service.createDeviceType("A", "B", "C", "D"));
    }

    @Test
    public void updateDeviceType_baseUser_error() {
        DeviceType deviceType = _deviceTypeRepo.save(new DeviceType("A", "B", "C", "D"));
        assertSecurityError(() -> _service.updateDeviceType(deviceType.getInternalId(), "1", "2", "3", "4"));
    }


    @Test
    public void removeDeviceType_baseUser_eror() {
        DeviceType deviceType = _deviceTypeRepo.save(new DeviceType("A", "B", "C", "D"));
        assertSecurityError(() -> _service.removeDeviceType(deviceType));
    }

    @Test
    @WithSimpleReportSiteAdminUser
    public void createAndDeleteDeviceTypes_adminUser_success() {
        DeviceType devA = _service.createDeviceType("A", "B", "C", "DUMMY");
        DeviceType devB = _service.createDeviceType("D", "E", "F", "DUMMY");
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
    public void updateDeviceTypeName_adminUser_success() {
        DeviceType device = _service.createDeviceType("A", "B", "C", "D");

        DeviceType updatedDevice = _service.updateDeviceType(device.getInternalId(), "Tim", null, null, null);

        assertEquals(updatedDevice.getInternalId(), device.getInternalId());
        assertEquals(updatedDevice.getName(), "Tim");
        assertEquals(updatedDevice.getModel(), "B");
        assertEquals(updatedDevice.getManufacturer(), "C");
        assertEquals(updatedDevice.getLoincCode(), "D");
    }
}
