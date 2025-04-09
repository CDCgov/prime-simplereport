package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.service.LoincService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequiredArgsConstructor
public class LoincController {
  private final LoincService loincService;

  @GetMapping("universal/labs/sync")
  public String syncLabs() {
    loincService.syncLabs();
    return "Lab sync has been started successfully.";
  }

  @GetMapping("universal/loinc-staging/clear")
  public String clearLoincStaging() {
    return loincService.clearLoincStaging();
  }
}
