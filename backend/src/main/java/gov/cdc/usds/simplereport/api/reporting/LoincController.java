package gov.cdc.usds.simplereport.api.reporting;

import gov.cdc.usds.simplereport.db.model.Lab;
import gov.cdc.usds.simplereport.service.LoincService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.QueryMapping;
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

  @QueryMapping
  public List<Lab> labs() {
    return loincService.getAllSupportedLabs();
  }

  @GetMapping("universal/labs/clear")
  public String clearLabs() {
    // todo can we make this harder to do accidentally?
    loincService.clearLabs();
    return "Completed deleting all labs.";
  }
}
