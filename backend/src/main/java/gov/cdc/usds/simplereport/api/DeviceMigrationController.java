package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.service.DeviceMigrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
@RequiredArgsConstructor
public class DeviceMigrationController {
  private final DeviceMigrationService deviceMigrationService;

  @GetMapping("/devices/mergeDuplicates")
  public void mergeDuplicates() {
    deviceMigrationService.mergeDuplicateDevices();
  }
}
