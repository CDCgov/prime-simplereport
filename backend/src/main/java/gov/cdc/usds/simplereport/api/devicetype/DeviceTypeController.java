package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.service.DeviceTypeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class DeviceTypeController {
    @Autowired
    private DeviceTypeService dts;

    @GetMapping("/devices/sync")
    public void syncDevices() {
       dts.syncDevices();
    }

}

