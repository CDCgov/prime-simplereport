package gov.cdc.usds.simplereport.api.DataRetention;

import gov.cdc.usds.simplereport.api.model.errors.DryRunException;
import gov.cdc.usds.simplereport.service.DataRetentionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/dataRetention")
@Slf4j
@RequiredArgsConstructor
public class DataRetentionController {
  private final DataRetentionService dataRetentionService;

  @GetMapping("/delete")
  public void deleteOldData(@RequestParam boolean dryRun) {
    //  public void deleteOldData() {
    try {
      dataRetentionService.deleteOldData(dryRun);
    } catch (DryRunException e) {
      log.info("Dry run");
    }
  }
}
