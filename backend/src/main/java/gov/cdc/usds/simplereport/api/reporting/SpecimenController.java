package gov.cdc.usds.simplereport.api.reporting;

import gov.cdc.usds.simplereport.service.SpecimenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/universal/specimens")
@Slf4j
@RequiredArgsConstructor
@SuppressWarnings({"checkstyle:TodoComment"})
public class SpecimenController {
  private final SpecimenService specimenService;

  @GetMapping("/sync")
  // TODO: Test that syncConditions returns the expected success message
  public String syncConditions() {
    specimenService.syncSpecimens();
    return "Specimen sync completed successfully";
  }

  @GetMapping("/clear")
  public String clearSpecimensAndBodySites() {
    // todo can we make this harder to do accidentally?
    specimenService.clearSpecimensAndBodySites();
    return "Completed attempting to delete all specimens and specimen body sites.";
  }
}
