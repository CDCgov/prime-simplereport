package gov.cdc.usds.simplereport.api.reporting;

import gov.cdc.usds.simplereport.service.SpecimenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequiredArgsConstructor
public class SpecimenController {
  private final SpecimenService specimenService;

  @GetMapping("/universal/specimen/sync")
  public String syncConditions() {
    return specimenService.syncSpecimens();
  }
}
