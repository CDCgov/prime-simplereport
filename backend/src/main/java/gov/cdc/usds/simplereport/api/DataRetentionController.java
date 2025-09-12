package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.service.DataRetentionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/*
NOTE:  THIS FILE IS FOR MANUALLY TRIGGERING THE DELETION CHRON IT IS MEANT FOR TESTING PURPOSES ONLY I WILL REMOVE IT ONCE I DEPLOY THIS TICKET
 */

@RestController
@RequestMapping("/api/data-retention")
@Slf4j
public class DataRetentionController {

  private final DataRetentionService dataRetentionService;

  public DataRetentionController(DataRetentionService dataRetentionService) {
    this.dataRetentionService = dataRetentionService;
  }

  /** Manual trigger endpoint for testing data retention job in non-production environments. */
  @PostMapping("/manual-trigger")
  public ResponseEntity<String> manualTrigger() {

    log.info("Manual data retention job trigger requested via API endpoint");

    try {
      dataRetentionService.manualTriggerDeleteOldData();
      return ResponseEntity.ok(
          "Data retention job triggered successfully. Check logs for details.");
    } catch (IllegalArgumentException | IllegalStateException e) {
      log.error("Manual data retention job trigger failed: {}", e.getMessage(), e);
      return ResponseEntity.internalServerError()
          .body("Data retention job failed: " + e.getMessage());
    }
  }
}
