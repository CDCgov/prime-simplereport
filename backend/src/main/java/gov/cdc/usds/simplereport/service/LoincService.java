package gov.cdc.usds.simplereport.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoincService {

  private final LoincFhirClient loincFhirClient;

  public String getCodeSystemLookup(String code) {
    return loincFhirClient.getCodeSystemLookup(code);
  }

  public String  syncLabs() {
    return "Labs Synced!";
  }
}
