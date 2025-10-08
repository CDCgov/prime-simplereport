package gov.cdc.usds.simplereport.api.reporting;

import gov.cdc.usds.simplereport.service.AimsTestingService;
import gov.cdc.usds.simplereport.service.model.aphl.AimsTestingRequestBody;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequiredArgsConstructor
public class AimsController {
  private final AimsTestingService aimsTestingService;

  @PostMapping("/aims/test/legacy")
  public String sendLegacyDeviceTestData(
      @RequestParam boolean dryRun, @RequestBody AimsTestingRequestBody requestBody) {
    return aimsTestingService.sendLegacyDeviceTestData(
        requestBody.getJurisdictions(),
        requestBody.getDeviceTypeDiseases(),
        requestBody.getDeviceSpecimenMappings(),
        dryRun);
  }
}
