package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.db.model.Condition;
import gov.cdc.usds.simplereport.service.ConditionService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequiredArgsConstructor
public class ConditionController {
  private final ConditionService conditionService;

  @GetMapping("/universal/conditions")
  public List<Condition> syncConditions() {
    return conditionService.syncConditions();
  }
}
