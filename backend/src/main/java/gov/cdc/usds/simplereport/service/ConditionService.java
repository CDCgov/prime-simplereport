package gov.cdc.usds.simplereport.service;

import ca.uhn.fhir.context.ConfigurationException;
import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.DataFormatException;
import ca.uhn.fhir.parser.IParser;
import feign.Response;
import gov.cdc.usds.simplereport.db.model.Condition;
import gov.cdc.usds.simplereport.db.repository.ConditionRepository;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.Coding;
import org.hl7.fhir.r4.model.UsageContext;
import org.hl7.fhir.r4.model.ValueSet;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class ConditionService {

  private final TerminologyExchangeClient tesClient;
  private final ConditionRepository conditionRepository;

  public List<Condition> syncConditions() {
    List<Condition> conditionList = new ArrayList<>();

    int count = 20;
    int pageOffset = 0;

    boolean hasNext = true;

    while (hasNext) {
      Response response = tesClient.getConditions(count, pageOffset);

      String responseBody;
      try {
        responseBody = IOUtils.toString(response.body().asInputStream(), StandardCharsets.UTF_8);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }

      Bundle bundle = parseResponseToBundle(responseBody);

      for (var entry : bundle.getEntry()) {
        ValueSet valueSet = (ValueSet) entry.getResource();
        CodeableConcept conditionConcept = parseCondition(valueSet);
        Optional<Condition> condition = saveCondition(conditionConcept);
        condition.ifPresent(conditionList::add);
      }

      hasNext = bundle.getLink().stream().anyMatch(link -> link.getRelation().equals("next"));
      pageOffset = pageOffset + count;
    }

    return conditionList;
  }

  private Bundle parseResponseToBundle(String responseString) {
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

  private CodeableConcept parseCondition(ValueSet valueSet) {
    List<UsageContext> useContext = valueSet.getUseContext();
    for (UsageContext context : useContext) {
      Coding code = context.getCode();
      if (code.getCode().equals("focus")) {
        return context.getValueCodeableConcept();
      }
    }
    return new CodeableConcept();
  }

  private Optional<Condition> saveCondition(CodeableConcept conditionConcept) {
    String code = conditionConcept.getCoding().get(0).getCode();
    String display = conditionConcept.getText();

    Condition foundCondition = conditionRepository.findConditionByCode(code);

    if (foundCondition == null) {
      return Optional.of(conditionRepository.save(new Condition(code, display)));
    }
    return Optional.empty();
  }
}
