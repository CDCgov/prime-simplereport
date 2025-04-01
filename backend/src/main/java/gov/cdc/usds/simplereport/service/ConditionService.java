package gov.cdc.usds.simplereport.service;

import ca.uhn.fhir.context.ConfigurationException;
import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.DataFormatException;
import ca.uhn.fhir.parser.IParser;
import feign.Response;
import gov.cdc.usds.simplereport.db.model.Condition;
import gov.cdc.usds.simplereport.db.model.LoincStaging;
import gov.cdc.usds.simplereport.db.repository.ConditionRepository;
import gov.cdc.usds.simplereport.db.repository.LoincStagingRepository;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
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
  private final LoincStagingRepository loincStagingRepository;

  public List<Condition> getConditions() {
    return conditionRepository.findAll();
  }

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
        Condition condition = saveCondition(conditionConcept);
        conditionList.add(condition);
        var loincList = parseLoinc(valueSet);
        loincList.ifPresent(
            conceptSetComponent -> saveLoincList(conceptSetComponent.getConcept(), condition));
      }

      hasNext = bundle.getLink().stream().anyMatch(link -> link.getRelation().equals("next"));
      pageOffset = pageOffset + count;
    }

    return conditionList;
  }

  private void saveLoincList(
      List<ValueSet.ConceptReferenceComponent> conceptList, Condition condition) {
    List<LoincStaging> loincStagingList = new ArrayList<>();
    for (var concept : conceptList) {
      String code = concept.getCode();
      String display = concept.getDisplay();

      loincStagingList.add(new LoincStaging(code, display, condition));
    }
    loincStagingRepository.saveAll(loincStagingList);
  }

  private Optional<ValueSet.ConceptSetComponent> parseLoinc(ValueSet valueSet) {
    var composeList = valueSet.getCompose().getInclude();
    return composeList.stream()
        .filter(component -> Objects.equals(component.getSystem(), "http://loinc.org"))
        .findFirst();
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

  private Condition saveCondition(CodeableConcept conditionConcept) {
    String code = conditionConcept.getCoding().get(0).getCode();
    String display = conditionConcept.getText();

    Condition foundCondition = conditionRepository.findConditionByCode(code);

    if (foundCondition == null) {
      foundCondition = (conditionRepository.save(new Condition(code, display)));
    }
    return foundCondition;
  }
}
