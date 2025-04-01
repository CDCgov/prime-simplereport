package gov.cdc.usds.simplereport.service;

import ca.uhn.fhir.context.ConfigurationException;
import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.DataFormatException;
import ca.uhn.fhir.parser.IParser;
import feign.Response;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
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
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings({"checkstyle:TodoComment"})
public class ConditionService {

  private final TerminologyExchangeClient tesClient;
  private final ConditionRepository conditionRepository;
  private final LoincStagingRepository loincStagingRepository;

  private static final int PAGE_SIZE = 20;

  public List<Condition> getConditions() {
    return conditionRepository.findAll();
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public String syncHasLabs() {
    List<Condition> allConditions = conditionRepository.findAll();
    List<Condition> conditionsToUpdate = new ArrayList<>();
    allConditions.forEach(
        condition -> {
          boolean hasLabs = !condition.getLabs().isEmpty();
          if (condition.getHasLabs() != hasLabs) {
            // TODO if we want to future-proof this a bit, we could create new condition objects to
            //  add to the conditionsToUpdate list so that we aren't modifying the objects in the
            //  original allConditions list. This would guard against any future operations where
            //  someone may wrongfully assume that the allConditions list's objects have not been
            //  modified.
            condition.setHasLabs(hasLabs);
            conditionsToUpdate.add(condition);
          }
        });
    List<Condition> updatedConditions =
        (List<Condition>) conditionRepository.saveAll(conditionsToUpdate);
    return String.format("Updated has_labs column on %s conditions.", updatedConditions.size());
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  @Async
  public void syncConditions() {
    // TODO let's track a count of conditions instead of all the conditions if all we are doing is
    // aggregating for the response
    // TODO add handling for HTTP 429 in case we get into a rate limiting situation.
    List<Condition> conditionList = new ArrayList<>();

    int pageOffset = 0;

    boolean hasNext = true;
    // TODO add something here to ensure this doesn't turn into an infinite by mistake e.g. max 1k
    // iterations.
    log.info("Starting sync conditions");
    while (hasNext) {
      log.info("Requesting TES condition page with offset {}", pageOffset);
      // TODO: Add error handling for this network call.
      Response response = tesClient.getConditions(PAGE_SIZE, pageOffset);

      String responseBody;
      try {
        responseBody = IOUtils.toString(response.body().asInputStream(), StandardCharsets.UTF_8);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }

      Bundle bundle = parseResponseToBundle(responseBody);
      log.info("TES response parsed to bundle.");

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
      pageOffset = pageOffset + PAGE_SIZE;
    }

    log.info("Condition sync completed successfully with {} conditions", conditionList.size());
  }

  private void saveLoincList(
      List<ValueSet.ConceptReferenceComponent> conceptList, Condition condition) {
    List<LoincStaging> loincStagingList = new ArrayList<>();
    for (var concept : conceptList) {
      String code = concept.getCode();
      String display = concept.getDisplay();

      loincStagingList.add(new LoincStaging(code, display, condition));
    }
    log.info(
        "Saving {} records to loinc staging for condition {}",
        loincStagingList.size(),
        condition.getDisplay());
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
      // TODO: Let's make our logs explicitly state the process stopped. We should also move error
      // handling into the syncLabs allowing us to lab page information about where we encountered a
      // problem.
      log.error("Failed to parse TES response string.");
      throw exception;
    }
    return bundle;
  }

  // TODO rename to extractCondition? I'm seeing more searching/extracting than parsing
  private CodeableConcept parseCondition(ValueSet valueSet) {
    List<UsageContext> useContext = valueSet.getUseContext();
    for (UsageContext context : useContext) {
      Coding code = context.getCode();
      // TODO extract 'focus' into a variable whose variable name captures the
      //  significance of the word 'focus'
      if (code.getCode().equals("focus")) {
        return context.getValueCodeableConcept();
      }
    }
    return new CodeableConcept();
  }

  // TODO rename to something like findOrSaveCondition
  private Condition saveCondition(CodeableConcept conditionConcept) {
    String code = conditionConcept.getCoding().get(0).getCode();
    String display = conditionConcept.getText();

    Condition foundCondition = conditionRepository.findConditionByCode(code);

    if (foundCondition == null) {
      log.info("Saving new condition {}", display);
      return conditionRepository.save(new Condition(code, display));
    }
    log.info("Found existing condition {}", display);
    return foundCondition;
  }
}
