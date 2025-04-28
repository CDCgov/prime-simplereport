package gov.cdc.usds.simplereport.api.reporting;

import gov.cdc.usds.simplereport.service.SpecimenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequiredArgsConstructor
@SuppressWarnings({"checkstyle:TodoComment"})
public class SpecimenController {
  private final SpecimenService specimenService;

  @GetMapping("/universal/specimen/sync")
  // TODO: Test that syncConditions returns the expected success message
  public String syncConditions() {
    specimenService.syncSpecimens();
    return "Specimen sync completed successfully";
  }
}
