package gov.cdc.usds.simplereport.api.devicetype;

import com.fasterxml.jackson.annotation.JsonView;
import gov.cdc.usds.simplereport.api.model.errors.DryRunException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.service.DeviceTypeService;
import gov.cdc.usds.simplereport.service.DeviceTypeSyncService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequiredArgsConstructor
public class DeviceTypeController {
  private final DeviceTypeSyncService deviceTypeSyncService;
  private final DeviceTypeService deviceTypeService;

  @GetMapping("/devices/sync")
  public void syncDevices(@RequestParam boolean dryRun) {
    try {
      deviceTypeSyncService.syncDevices(dryRun);
    } catch (DryRunException e) {
      log.info("Dry run");
    }
  }

  @GetMapping("/devices")
  @JsonView(PublicDeviceType.class)
  public List<DeviceType> getDevices() {
    try {
      return deviceTypeService.fetchDeviceTypes();
    } catch (Exception e) {
      return null;
    }
  }
}
