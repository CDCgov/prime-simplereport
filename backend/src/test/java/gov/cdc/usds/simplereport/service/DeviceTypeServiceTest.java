package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;

public class DeviceTypeServiceTest extends BaseServiceTestOrgUser<DeviceTypeService> {

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
    public void createDeviceType() {
        Exception exception = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            _service.createDeviceType("A", "B", "C", "D");;
        });
    
        assertEquals("Current User does not have permission for this action", exception.getMessage());
    }

    @Test
    public void updateDeviceType() {
        DeviceType deviceType = _deviceTypeRepo.save(new DeviceType("A", "B", "C", "D"));

        Exception exception = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            _service.updateDeviceType(deviceType.getInternalId(), "1", "2", "3", "4");;
        });
    
        assertEquals("Current User does not have permission for this action", exception.getMessage());
    }


    @Test
    public void removeDeviceType() {
        DeviceType deviceType = _deviceTypeRepo.save(new DeviceType("A", "B", "C", "D"));

        Exception exception = assertThrows(IllegalGraphqlArgumentException.class, () -> {
            _service.removeDeviceType(deviceType);
        });
    
        assertEquals("Current User does not have permission for this action", exception.getMessage());
    }

}
