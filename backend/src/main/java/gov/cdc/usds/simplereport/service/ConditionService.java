package gov.cdc.usds.simplereport.service;

import ca.uhn.fhir.context.ConfigurationException;
import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.DataFormatException;
import ca.uhn.fhir.parser.IParser;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hl7.fhir.r4.model.Bundle;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConditionService {

  private final TerminologyExchangeClient tesClient;

  public Bundle getConditions() {
    String responseString = tesClient.getConditions();
    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();
    Bundle bundle;
    try {
      bundle = (Bundle) parser.parseResource(responseString);
    } catch (ConfigurationException | DataFormatException exception) {
      log.error("Failed to parse TES response string.");
      throw exception;
    }
    return bundle;
  }
}
