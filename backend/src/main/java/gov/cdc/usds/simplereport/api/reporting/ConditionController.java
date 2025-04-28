package gov.cdc.usds.simplereport.api.reporting;

import gov.cdc.usds.simplereport.service.ConditionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
}
