package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.db.model.Lab;
import gov.cdc.usds.simplereport.db.model.LoincStaging;
import gov.cdc.usds.simplereport.service.LoincService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Slf4j
@RequiredArgsConstructor
public class LoincController {
  private final LoincService loincService;

  @GetMapping("universal/syncLabs")
  public List<Lab> syncLabs() { return loincService.syncLabs(); }
}
