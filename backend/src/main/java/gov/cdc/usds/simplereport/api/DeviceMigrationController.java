package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.service.DeviceMigrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class DeviceMigrationController {
  private final DeviceMigrationService deviceMigrationService;

  @GetMapping("/devices/mergeDuplicates")
  public String mergeDuplicates() {
    deviceMigrationService.mergeDuplicateDevices();
    return "Done";
  }

  @GetMapping("/specimenTypes/updateSpecimenTypes")
  public String updateSpecimenTypes() {
    return deviceMigrationService.updateSpecimenTypes();
  }
}
