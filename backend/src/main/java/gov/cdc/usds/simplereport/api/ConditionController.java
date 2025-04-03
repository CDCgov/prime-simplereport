package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.service.ConditionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequiredArgsConstructor
public class ConditionController {
  private final ConditionService conditionService;

  @GetMapping("/universal/conditions/sync")
  public String syncConditions() {
    return conditionService.syncConditions();
  }

  @GetMapping("/universal/conditions/syncHasLabs")
  public String syncHasLabs() {
    return conditionService.syncHasLabs();
  }
}
