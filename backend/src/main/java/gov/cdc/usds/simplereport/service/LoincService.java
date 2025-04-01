package gov.cdc.usds.simplereport.service;

import ca.uhn.fhir.context.ConfigurationException;
import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.DataFormatException;
import ca.uhn.fhir.parser.IParser;
import feign.Response;
import gov.cdc.usds.simplereport.db.model.Lab;
import gov.cdc.usds.simplereport.db.model.LoincStaging;
import gov.cdc.usds.simplereport.db.repository.LabRepository;
import gov.cdc.usds.simplereport.db.repository.LoincStagingRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.hl7.fhir.r4.model.Parameters;
import org.hl7.fhir.r4.model.Coding;
import org.hl7.fhir.r4.model.Type;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class LoincService {

  private final LoincFhirClient loincFhirClient;
  private final LoincStagingRepository loincStagingRepository;
  private final LabRepository labRepository;
  private final FhirContext context = FhirContext.forR4();
  private IParser parser = context.newJsonParser();

  public List<Lab>  syncLabs() {
    log.info("Sync Labs");
    PageRequest pageRequest = PageRequest.of(0, 100);
    Page<LoincStaging> loincPage = loincStagingRepository.findAll(pageRequest);
    List<LoincStaging> loincs = loincPage.getContent();
    List<CompletableFuture<Response>> futures = new ArrayList<>();
    List<Lab> labs = new ArrayList<>();
    log.info("Found {} Labs", loincs.size());
    loincs.forEach(loinc -> futures.add(CompletableFuture.supplyAsync(()->loincFhirClient.getCodeSystemLookup(loinc.getCode()))));
    log.info("Futures created", futures.size());
    CompletableFuture<Void> allFutures = CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]));
    allFutures.join();

      try{
        for (int i = 0; i < futures.size(); i++) {
          Response response = futures.get(i).get();
          LoincStaging loinc = loincs.get(i);
          log.info("Processing LOINC API response for: {}", loinc.getCode());
          if (response.status() == 200) {
            Parameters parameters = parseResponseToParameters(response);
            Optional<Lab> lab = parametersToLab(loinc, parameters);
            lab.ifPresent(labs::add);
          }
        }
      }
      catch (Exception e){
        throw new RuntimeException(e);
    }
    log.info("All Futures done");

    labRepository.saveAll(labs);
    return labs;
  }

  private Parameters parseResponseToParameters(Response response) {

    String bodyString;
    try {
      bodyString = IOUtils.toString(response.body().asInputStream(), StandardCharsets.UTF_8);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }

    Parameters parameters;
    try {
      parameters = (Parameters) this.parser.parseResource(bodyString);
    } catch (ConfigurationException | DataFormatException exception) {
      log.error("Failed to parse response from LOINC FHIR API to a Parameters resource.");
      throw exception;
    }
    return parameters;
  }

  private Optional<Lab> parametersToLab(LoincStaging loinc, Parameters parameters) {
    List<Parameters.ParametersParameterComponent> parameter = parameters.getParameter();
    
    String display = "";
    Optional<Parameters.ParametersParameterComponent> displayParam = parameter.stream().filter(component -> Objects.equals(component.getName(), "display")).findFirst();
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

    List<Parameters.ParametersParameterComponent> properties= parameter.stream().filter(component -> Objects.equals(component.getName(), "property")).toList();
    for (Parameters.ParametersParameterComponent property : properties) {
      String firstValue = property.getPart().get(0).getValue().toString();
      Type lastValue = property.getPart().get(1).getValue();

      switch (firstValue) {
        case "category": {
          Coding coding = (Coding) lastValue;
          if (coding.getCode().equals("LP29693-6")){
            isLab = true;
          }
          break;
        }
        case "DefinitionDescription": {
          description = lastValue.toString();
          break;
        }
        case "LONG_COMMON_NAME":{
          longCommonName = lastValue.toString();
          break;
        }
        case "SCALE_TYP": {
          Coding coding = (Coding) lastValue;
          scaleCode = coding.getCode();
          scaleDisplay = coding.getDisplay();
          break;
        }
        case "system-core": {
          Coding coding = (Coding) lastValue;
          systemCode = coding.getCode();
          systemDisplay = coding.getDisplay();
          break;
        }
        case "answer-list": {
          answerList = lastValue.toString();
          break;
        }
        case "ORDER_OBS": {
          orderOrObservation = lastValue.toString();
          break;
        }
        case "PanelType": {
          if (lastValue.toString().equals("Panel")) {
            panel = true;
          }
          break;
        }
      }
    }

    if (!isLab){
      return Optional.empty();
    }

    return Optional.of(new Lab(loinc.getCode(), display, description, longCommonName, scaleCode, scaleDisplay, systemCode, systemDisplay, answerList, orderOrObservation, panel));
  }

}
