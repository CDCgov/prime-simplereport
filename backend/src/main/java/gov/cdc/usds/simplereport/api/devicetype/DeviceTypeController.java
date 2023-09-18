package gov.cdc.usds.simplereport.api.devicetype;

import gov.cdc.usds.simplereport.api.model.errors.DryRunException;
import gov.cdc.usds.simplereport.service.DeviceTypeSyncService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class DeviceTypeController {
  @Autowired private DeviceTypeSyncService deviceTypeSyncService;

  @GetMapping("/devices/sync")
  public void syncDevices(@RequestParam boolean dryRun) {
    try {
      deviceTypeSyncService.syncDevices(dryRun);
    } catch (DryRunException e) {
      log.info("Dry run");
    }
  }
}
