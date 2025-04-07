package gov.cdc.usds.simplereport.service;

import ca.uhn.fhir.context.ConfigurationException;
import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.DataFormatException;
import ca.uhn.fhir.parser.IParser;
import feign.Response;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Condition;
import gov.cdc.usds.simplereport.db.model.Lab;
import gov.cdc.usds.simplereport.db.model.LoincStaging;
import gov.cdc.usds.simplereport.db.repository.ConditionRepository;
import gov.cdc.usds.simplereport.db.repository.LabRepository;
import gov.cdc.usds.simplereport.db.repository.LoincStagingRepository;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpStatus;
import org.hl7.fhir.r4.model.Coding;
import org.hl7.fhir.r4.model.Parameters;
import org.hl7.fhir.r4.model.Type;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

// TODO: rename LoincService to something like LabService to be more accurate
@Service
@RequiredArgsConstructor
@Slf4j
public class LoincService {

  private final LoincFhirClient loincFhirClient;
  private final LoincStagingRepository loincStagingRepository;
  private final LabRepository labRepository;
  private final ConditionRepository conditionRepository;
  private final ConditionService conditionService;
  private final SpecimenService specimenService;
  private final FhirContext context = FhirContext.forR4();
  private IParser parser = context.newJsonParser();
  private static final int PAGE_SIZE = 20;

  public List<Lab> getLabsByConditionCodes(Collection<String> codes) {
    List<Condition> conditions = conditionRepository.findAllByCodeIn(codes);
    List<Lab> foundLabs = new ArrayList<>();
    List<String> acceptedScaleDisplays = List.of("Nom", "Qn", "Ord");
    for (var condition : conditions) {
      Set<Lab> testOrderLabs =
          condition.getLabs().stream()
              .filter(lab -> lab.getOrderOrObservation().equals("Both"))
              .filter(lab -> acceptedScaleDisplays.contains(lab.getScaleDisplay()))
              .filter(lab -> !lab.getSystemCode().isEmpty())
              .collect(Collectors.toSet());

      testOrderLabs.forEach(
          lab -> {
            if (!foundLabs.contains(lab) && specimenService.hasAnySpecimen(lab.getSystemCode())) {
              foundLabs.add(lab);
            }
          });
    }
    foundLabs.sort(Comparator.comparing(Lab::getDisplay));
    return foundLabs;
  }

  // TODO: standardize how we authenticate REST endpoints
  @AuthorizationConfiguration.RequireGlobalAdminUser
  @Async
  // todo mark as transactional / account for a sync that fails halfway - how do we want to recover
  // from that?
  public void syncLabs() {
    log.info("Lab sync started");
    Instant startTime = Instant.now();
    PageRequest pageRequest = PageRequest.of(0, PAGE_SIZE);
    // todo rename `futures` to be clearer - what is it a future of
    List<CompletableFuture<Response>> futures = new ArrayList<>();
    List<Lab> labs = new ArrayList<>();
    // todo update db to skip failed loincs next time?
    List<LoincStaging> failedLoincs = new ArrayList<>();
    List<LoincStaging> successLoincs = new ArrayList<>();
    Page<LoincStaging> loincPage = loincStagingRepository.findAll(pageRequest);
    // todo distinguish when a lab is actually brand new to the database
    int labsAmount = 0;

    while (loincPage.hasNext()) {
      List<LoincStaging> loincs = loincPage.getContent();
      log.info("Found {} Labs", loincs.size());
      // TODO: use a Map to map loinc -> future instead of relying on parallel indices. ex, a
      // hashmap like Map<LoincStaging, CompletableFuture<Response>>
      loincs.forEach(
          loinc ->
              futures.add(
                  CompletableFuture.supplyAsync(
                      () -> loincFhirClient.getCodeSystemLookup(loinc.getCode()))));
      log.info("Futures created");
      CompletableFuture<Void> allFutures =
          CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
      allFutures.join();
      log.info("Futures completed");
      for (int i = 0; i < futures.size(); i++) {
        // TODO: create an object / map / pair so we don't have to rely on index matching
        Response response = futures.get(i).getNow(null);
        LoincStaging loinc = loincs.get(i);
        // TODO: DanS: we should probably consider accounting for service disruptions and short
        // circuiting these syncs when appropriate.
        if (response.status() != HttpStatus.SC_OK) {
          // todo account for 404s vs 5xx errors
          failedLoincs.add(loinc);
          log.error(
              "Received a {} status code from the LOINC API response for: {}",
              response.status(),
              loinc.getCode());
          continue;
        }
        Optional<Parameters> parameters = parseResponseToParameters(response);
        if (parameters.isEmpty()) {
          // todo: what does this mean (@dan p)
          failedLoincs.add(loinc);
          continue;
        }
        Optional<Lab> lab = parametersToLab(loinc, parameters.get());
        if (lab.isEmpty()) {
          // is this the only time that we should mark a loinc as "to-skip"?
          // or all failedLoincs?
          failedLoincs.add(loinc);
          continue;
        }
        labs.add(lab.get());
        successLoincs.add(loinc);
      }
      log.info("LOINC API response parsed to {} labs", labs.size());
      labs = reduceLabs(labs, successLoincs);
      log.info("Labs reduced to {} labs", labs.size());
      // todo bulk operation on saveAll (this function is saving them sequentially)
      // todo once bulk saveAll in place, move this db operation out of the loop?
      labRepository.saveAll(labs);
      log.info("Data written to lab table.");
      log.info("Completed page: {} of {}", loincPage.getNumber(), loincPage.getTotalPages());
      labsAmount += labs.size();
      futures.clear();
      labs.clear();
      successLoincs.clear();
      pageRequest = pageRequest.next();
      // TODO: DanS: We do currently save duplicate loincs (many to many relationship with
      // condition)
      //  it would be ideal if we can update the data model / findAll query to reduce duplicates
      // where possible
      loincPage = loincStagingRepository.findAll(pageRequest);
    }
    // todo does it make sense to have the insert into this table be smarter, so we dont have to
    // empty it
    clearLoincStaging();
    conditionService.syncHasLabs();
    Instant stopTime = Instant.now();
    Duration elapsedTime = Duration.between(startTime, stopTime);
    log.info(
        "Lab sync completed {} labs in {} minutes with {} failed LOINCs",
        labsAmount,
        elapsedTime.toMinutes(),
        failedLoincs.size());
  }

  private Optional<Parameters> parseResponseToParameters(Response response) {

    String bodyString;
    try {
      bodyString = IOUtils.toString(response.body().asInputStream(), StandardCharsets.UTF_8);
    } catch (IOException e) {
      log.error("Failed to parse LOINC API response to string", e);
      return Optional.empty();
    }

    Parameters parameters;
    try {
      parameters = (Parameters) this.parser.parseResource(bodyString);
    } catch (ConfigurationException | DataFormatException e) {
      log.error("Failed to parse response from LOINC FHIR API to a Parameters resource.", e);
      return Optional.empty();
    }
    return Optional.of(parameters);
  }

  // todo write a unit test
  private Optional<Lab> parametersToLab(LoincStaging loinc, Parameters parameters) {
    List<Parameters.ParametersParameterComponent> parameter = parameters.getParameter();

    String display = "";
    Optional<Parameters.ParametersParameterComponent> displayParam =
        parameter.stream()
            .filter(component -> Objects.equals(component.getName(), "display"))
            .findFirst();
    if (displayParam.isPresent()) {
      display = displayParam.get().getValue().toString();
    }

    // todo are any of these required to build a valid fhir bundle? are all of these defaults
    // correct / safe
    String description = null;
    String longCommonName = "";
    String scaleCode = "";
    String scaleDisplay = "";
    String systemCode = "";
    String systemDisplay = "";
    String answerList = "";
    String orderOrObservation = null;
    boolean panel = false;
    boolean isLab = false;

    List<Parameters.ParametersParameterComponent> properties =
        parameter.stream()
            .filter(component -> Objects.equals(component.getName(), "property"))
            .toList();
    for (Parameters.ParametersParameterComponent property : properties) {
      String firstValue = property.getPart().get(0).getValue().toString();
      Type lastValue = property.getPart().get(1).getValue();

      switch (firstValue) {
        case "category":
          {
            Coding coding = (Coding) lastValue;
            if (coding.getCode().equals("LP29693-6")) {
              isLab = true;
            }
            break;
          }
        case "DefinitionDescription":
          {
            description = lastValue.toString();
            break;
          }
        case "LONG_COMMON_NAME":
          {
            longCommonName = lastValue.toString();
            break;
          }
        case "SCALE_TYP":
          {
            Coding coding = (Coding) lastValue;
            scaleCode = coding.getCode();
            scaleDisplay = coding.getDisplay();
            break;
          }
        case "system-core":
          {
            Coding coding = (Coding) lastValue;
            systemCode = coding.getCode();
            systemDisplay = coding.getDisplay();
            break;
          }
        case "answer-list":
          {
            answerList = lastValue.toString();
            break;
          }
        case "ORDER_OBS":
          {
            orderOrObservation = lastValue.toString();
            break;
          }
        case "PanelType":
          {
            if (lastValue.toString().equals("Panel")) {
              panel = true;
            }
            break;
          }
      }
    }

    if (!isLab) {
      return Optional.empty();
    }

    return Optional.of(
        new Lab(
            loinc.getCode(),
            display,
            description,
            longCommonName,
            scaleCode,
            scaleDisplay,
            systemCode,
            systemDisplay,
            answerList,
            orderOrObservation,
            panel));
  }

  // todo write a unit test
  private List<Lab> reduceLabs(List<Lab> labs, List<LoincStaging> loincs) {
    List<String> codes = new ArrayList<>();
    List<Lab> labsToSave = new ArrayList<>();

    for (int i = 0; i < labs.size(); i++) {

      String code = labs.get(i).getCode();
      if (codes.contains(code)) {
        continue;
      }
      codes.add(code);

      Lab lab = labs.get(i);
      Optional<Lab> foundLab = labRepository.findByCode(lab.getCode());
      if (foundLab.isPresent()) {
        lab = foundLab.get();
      }

      for (int j = 0; j < labs.size(); j++) {
        if (code.equals(labs.get(j).getCode())) {
          Condition conditionToAdd = loincs.get(j).getCondition();
          if (!lab.getConditions().contains(conditionToAdd)) {
            lab.addCondition(conditionToAdd);
          }
        }
      }
      labsToSave.add(lab);
    }
    return labsToSave;
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public String clearLoincStaging() {
    loincStagingRepository.deleteAllLoincStaging();
    String clearLoincStagingMsg = "Cleared loinc staging table";
    log.info(clearLoincStagingMsg);
    return clearLoincStagingMsg;
  }
}
