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
import gov.cdc.usds.simplereport.db.repository.LabRepository;
import gov.cdc.usds.simplereport.db.repository.LoincStagingRepository;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;
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

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings({"checkstyle:TodoComment"})
public class LoincService {
  // TODO: rename LoincService to something like LabService to be more accurate

  private final LoincFhirClient loincFhirClient;
  private final LoincStagingRepository loincStagingRepository;
  private final LabRepository labRepository;
  private final FhirContext context = FhirContext.forR4();
  private IParser parser = context.newJsonParser();
  private static final int PAGE_SIZE = 20;

  // TODO: standardize how we authenticate REST endpoints
  @AuthorizationConfiguration.RequireGlobalAdminUser
  @Async
  // TODO mark as transactional / account for a sync that fails halfway - how do we want to
  // recover
  // from that?
  public void syncLabs() {
    log.info("Lab sync started");
    Instant startTime = Instant.now();
    PageRequest pageRequest = PageRequest.of(0, PAGE_SIZE);
    Set<Lab> labsToSync = new HashSet<>();
    // TODO update db to skip failed loincs next time?
    List<String> failedLoincs = new ArrayList<>();
    Page<String> loincCodePage;
    int newLabs = 0;

    do {
      loincCodePage = loincStagingRepository.findDistinctCodes(pageRequest);
      Map<String, CompletableFuture<Response>> codeToLoincLookupFutureMap = new HashMap<>();
      List<String> loincCodes = loincCodePage.getContent();
      log.info(
          "Found {} staged loinc codes on page {}",
          loincCodes.size(),
          loincCodePage.getNumber() + 1);

      loincCodes.forEach(
          code -> {
            Optional<Lab> repoLab = labRepository.findByCode(code);
            if (repoLab.isPresent()) {
              labsToSync.add(repoLab.get());
            } else {
              codeToLoincLookupFutureMap.put(
                  code,
                  CompletableFuture.supplyAsync(() -> loincFhirClient.getCodeSystemLookup(code)));
            }
          });
      log.info("Futures created");
      CompletableFuture<Void> allFutures =
          CompletableFuture.allOf(
              codeToLoincLookupFutureMap.values().toArray(new CompletableFuture[0]));
      allFutures.join();
      log.info("Futures completed");

      for (String code : codeToLoincLookupFutureMap.keySet()) {
        Response response = codeToLoincLookupFutureMap.get(code).getNow(null);
        // TODO: DanS: we should probably consider accounting for service disruptions and short
        // circuiting these syncs when appropriate.
        if (response.status() != HttpStatus.SC_OK) {
          // TODO account for 404s vs 5xx errors
          failedLoincs.add(code);
          log.error(
              "Received a {} status code from the LOINC API response for: {}",
              response.status(),
              code);
          continue;
        }
        Optional<Parameters> parameters = parseResponseToParameters(response);
        if (parameters.isEmpty()) {
          // TODO: what does this mean (@dan p)
          failedLoincs.add(code);
          continue;
        }
        Optional<Lab> lab = parametersToLab(code, parameters.get());
        if (lab.isEmpty()) {
          // is this the only time that we should mark a loinc as "to-skip"?
          // or all failedLoincs?
          log.info("Staged loinc {} is not a valid lab", code);
          failedLoincs.add(code);
          continue;
        }

        labsToSync.add(lab.get());
        newLabs++;
      }

      log.info(
          "Completed page: {} of {}", loincCodePage.getNumber() + 1, loincCodePage.getTotalPages());
      pageRequest = pageRequest.next();
    } while (loincCodePage.hasNext());

    for (Lab lab : labsToSync) {
      List<LoincStaging> loincStagings = loincStagingRepository.findByCode(lab.getCode());
      for (LoincStaging loincStaging : loincStagings) {
        Condition conditionToAdd = loincStaging.getCondition();
        lab.addCondition(conditionToAdd);
      }
    }

    labRepository.saveAll(labsToSync);
    log.info("Data written to lab table.");

    // TODO does it make sense to have the insert into this table be smarter, so we dont have to
    // empty it
    clearLoincStaging();
    Instant stopTime = Instant.now();
    Duration elapsedTime = Duration.between(startTime, stopTime);
    log.info(
        "Lab sync completed {} labs with {} new labs in {} minutes with {} failed LOINCs",
        labsToSync.size(),
        newLabs,
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

  // TODO write a unit test
  private Optional<Lab> parametersToLab(String loincCode, Parameters parameters) {
    List<Parameters.ParametersParameterComponent> parameter = parameters.getParameter();

    String display = "";
    Optional<Parameters.ParametersParameterComponent> displayParam =
        parameter.stream()
            .filter(component -> Objects.equals(component.getName(), "display"))
            .findFirst();
    if (displayParam.isPresent()) {
      display = displayParam.get().getValue().toString();
    }

    // TODO are any of these required to build a valid fhir bundle? are all of these defaults
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
            loincCode,
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

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public String clearLoincStaging() {
    loincStagingRepository.deleteAll();
    String clearLoincStagingMsg = "Cleared loinc staging table";
    log.info(clearLoincStagingMsg);
    return clearLoincStagingMsg;
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public void clearLabs() {
    labRepository.deleteAll();
    log.info("All labs deleted.");
  }
}
