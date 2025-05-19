package gov.cdc.usds.simplereport.api.reporting;

import gov.cdc.usds.simplereport.db.model.Condition;
import gov.cdc.usds.simplereport.service.ConditionService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/universal/conditions")
@Slf4j
@RequiredArgsConstructor
public class ConditionController {
  private final ConditionService conditionService;

  @GetMapping("/sync")
  public String syncConditions() {
    conditionService.syncConditions();
    return "Condition sync has been started successfully.";
  }

  @GetMapping("/syncHasLabs")
  public String syncHasLabs() {
    return conditionService.syncHasLabs();
  }

  @QueryMapping
  public List<Condition> conditions() {
    return conditionService.getConditions();
  }

  @GetMapping("/clear")
  public String clearConditions() {
    // todo can we make this harder to do accidentally?
    conditionService.clearConditions();
    return "Completed deleting all conditions.";
  }
}
