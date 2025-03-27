package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.service.LoincService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequiredArgsConstructor
public class LoincController {
  private final LoincService loincService;

  @GetMapping("/universal/loinc/codeSystem")
  public String getCodeSystemLookup(@RequestParam String code) {
    return loincService.getCodeSystemLookup(code);
  }

  @GetMapping("universal/syncLabs")
  public String syncLabs() { return loincService.syncLabs(); }
}
