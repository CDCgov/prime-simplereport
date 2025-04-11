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
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.apache.http.HttpStatus;
import org.hl7.fhir.r4.model.Coding;
import org.hl7.fhir.r4.model.Parameters;
import org.hl7.fhir.r4.model.Type;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoincService {

  private final LoincFhirClient loincFhirClient;
  private final LoincStagingRepository loincStagingRepository;
  private final LabRepository labRepository;
  private final FhirContext context = FhirContext.forR4();
  private IParser parser = context.newJsonParser();
  private static final int PAGE_SIZE = 20;

  @AuthorizationConfiguration.RequireGlobalAdminUser
  @Async
  public void syncLabs() {
    log.info("Sync Labs");
    PageRequest pageRequest = PageRequest.of(0, PAGE_SIZE);
    List<CompletableFuture<Response>> futures = new ArrayList<>();
    List<Lab> labs = new ArrayList<>();
    List<LoincStaging> failedLoincs = new ArrayList<>();
    List<LoincStaging> successLoincs = new ArrayList<>();
    Page<LoincStaging> loincPage = loincStagingRepository.findAll(pageRequest);

    while (loincPage.hasNext()) {
      List<LoincStaging> loincs = loincPage.getContent();
      log.info("Found {} Labs", loincs.size());
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
        Response response = futures.get(i).getNow(null);
        LoincStaging loinc = loincs.get(i);
        if (response.status() != HttpStatus.SC_OK) {
          failedLoincs.add(loinc);
          log.error(
              "Received a {} status code from the LOINC API response for: {}",
              response.status(),
              loinc.getCode());
          continue;
        }
        Optional<Parameters> parameters = parseResponseToParameters(response);
        if (parameters.isEmpty()) {
          failedLoincs.add(loinc);
          continue;
        }
        Optional<Lab> lab = parametersToLab(loinc, parameters.get());
        if (lab.isEmpty()) {
          failedLoincs.add(loinc);
          continue;
        }
        labs.add(lab.get());
        successLoincs.add(loinc);
      }
      log.info("LOINC API response parsed.");
      labs = reduceLabs(labs, successLoincs);
      log.info("Labs reduced.");
      labRepository.saveAll(labs);
      log.info("Data written to lab table.");
      log.info("Completed page: {}", loincPage.getNumber());
      futures.clear();
      labs.clear();
      successLoincs.clear();
      failedLoincs.clear();
      pageRequest = pageRequest.next();
      loincPage = loincStagingRepository.findAll(pageRequest);
      // Remove the already processed loincs from the table
      loincStagingRepository.deleteAll(loincs);
    }
    log.info("Lab sync completed successfully");
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

  @Autowired private JdbcTemplate jdbcTemplate;

  public void bulkInsertLabs(List<Lab> labs) {
    // SQL query for bulk insert
    String sql =
        "INSERT INTO simple_report.lab "
            + "(internal_id, code, display, description, long_common_name, scale_code, scale_display, system_code, system_display, answer_list, order_or_observation, panel, created_at, updated_at, is_deleted) "
            + "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) "
            + "ON CONFLICT (code) DO NOTHING;";

    // We use batchUpdate to handle the bulk insertion
    jdbcTemplate.batchUpdate(
        sql,
        labs,
        labs.size(),
        (ps, lab) -> {
          ps.setObject(1, UUID.randomUUID());
          ps.setString(2, lab.getCode());
          ps.setString(3, lab.getDisplay());
          ps.setString(4, lab.getDescription());
          ps.setString(5, lab.getLongCommonName());
          ps.setString(6, lab.getScaleCode());
          ps.setString(7, lab.getScaleDisplay());
          ps.setString(8, lab.getSystemCode());
          ps.setString(9, lab.getSystemDisplay());
          ps.setString(10, lab.getAnswerList());
          ps.setString(11, lab.getOrderOrObservation());
          ps.setBoolean(12, lab.getPanel());
          ps.setTimestamp(13, Timestamp.valueOf(LocalDateTime.now()));
          ps.setTimestamp(14, Timestamp.valueOf(LocalDateTime.now()));
          ps.setBoolean(15, false);
        });
  }

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
    return "Cleared loinc staging table";
  }
}
