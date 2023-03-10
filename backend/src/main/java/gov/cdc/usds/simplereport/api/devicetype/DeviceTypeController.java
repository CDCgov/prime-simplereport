package gov.cdc.usds.simplereport.api.devicetype;

import static gov.cdc.usds.simplereport.config.BeanProfiles.PROD;

import gov.cdc.usds.simplereport.service.DeviceTypeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Profile("!" + PROD)
@RestController
@Slf4j
public class DeviceTypeController {
  @Autowired private DeviceTypeService dts;

  @GetMapping("/devices/sync")
  public void syncDevices() {
    dts.syncDevices();
  }
}
