package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.List;

import org.junit.jupiter.api.Test;

import gov.cdc.usds.simplereport.db.model.DeviceType;

public class DeviceTypeServiceAdminTest extends BaseServiceTestAdmin<DeviceTypeService> {

    @Test
    public void createDeviceTypes() {
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
    public void updateDeviceTypeName() {
        DeviceType device = _service.createDeviceType("A", "B", "C", "D");

        DeviceType updatedDevice = _service.updateDeviceType(device.getInternalId(), "Tim", null, null, null);

        assertEquals(updatedDevice.getInternalId(), device.getInternalId());
        assertEquals(updatedDevice.getName(), "Tim");
        assertEquals(updatedDevice.getModel(), "B");
        assertEquals(updatedDevice.getManufacturer(), "C");
        assertEquals(updatedDevice.getLoincCode(), "D");
    }
}
