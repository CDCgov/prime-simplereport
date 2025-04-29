package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Specimen;
import gov.cdc.usds.simplereport.db.model.SpecimenBodySite;
import gov.cdc.usds.simplereport.db.repository.LabRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenBodySiteRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenRepository;
import java.io.UncheckedIOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
@SuppressWarnings({"checkstyle:TodoComment"})
public class SpecimenService {
  private final SpecimenRepository specimenRepository;
  private final SpecimenBodySiteRepository specimenBodySiteRepository;

  @Value("${umls.api-key}")
  private String umlsApiKey;

  private final LabRepository labRepository;

  public List<Specimen> getSpecimens(String loinc) {
    return specimenRepository.findByLoincSystemCode(loinc);
  }

  public List<SpecimenBodySite> getSpecimenBodySiteBySpecimenSnomed(String specimenSnomedCode) {
    return specimenBodySiteRepository.findBySnomedSpecimenCode(specimenSnomedCode);
  }

  public boolean hasAnySpecimen(String loinc) {
    return specimenRepository.existsByLoincSystemCode(loinc);
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  @Async
  // TODO: Test LOINC to SNOMED conversion with mock HTTP responses
  // TODO: Test syncSpecimens fails gracefully when HttpClient cannot be created
  // TODO: Test syncSpecimens fails gracefully when no system codes are found or system unable to
  // read codes
  // TODO: Test concurrent HTTP request handling with simulated delays
  // TODO: Test error handling when UMLS API returns error responses
  // TODO: Test behavior when UMLS API returns empty or malformed responses
  public void syncSpecimens() {
    Optional<HttpClient> optionalClient = getHttpClient();
    if (optionalClient.isEmpty()) {
      log.error("Specimen sync failed: unable to create HttpClient.");
      return;
    }
    HttpClient client = optionalClient.get();
    log.info("HttpClient created.");

    Optional<List<List<String>>> optionalLoincSystemCodes = labRepository.findDistinctSystemCodes();
    if (optionalLoincSystemCodes.isEmpty()) {
      log.error("Specimen sync failed: unable to read LOINC system codes from the lab table.");
      return;
    }
    List<List<String>> loincSystemCodes = optionalLoincSystemCodes.get();
    log.info("LOINC System codes read from lab table.");

    List<CompletableFuture<HttpResponse<String>>> loincToSnomedResponses = new ArrayList<>();
    loincSystemCodes.forEach(
        code ->
            loincToSnomedResponses.add(
                client.sendAsync(
                    getLoinctoSnomedRequest(code.get(0)), HttpResponse.BodyHandlers.ofString())));
    log.info("Async batch of LOINC to SNOMED conversions sent.");
    CompletableFuture.allOf(
            loincToSnomedResponses.toArray(new CompletableFuture[loincSystemCodes.size()]))
        .join();
    log.info("Async batch of LOINC to SNOMED conversions completed.");

    HttpResponse<String> response;
    Map<String, List<Specimen>> specimensByLoincSystemCode = new HashMap<>();
    for (int i = 0; i < loincSystemCodes.size(); i++) {
      response = loincToSnomedResponses.get(i).getNow(null);
      log.info(response.body());
      String loincSystemCode = loincSystemCodes.get(i).get(0);
      String loincSystemDisplay = loincSystemCodes.get(i).get(1);
      specimensByLoincSystemCode.put(
          loincSystemCode,
          parseCodeDisplayPairsFromUmlsResponse(response, loincSystemCode, loincSystemDisplay));
    }

    Map<String, CompletableFuture<HttpResponse<String>>> loincSnomedResponses =
        sendInitialSnomedRelationsRequests(specimensByLoincSystemCode, client);
    processAndSaveInitialSnomedRelations(specimensByLoincSystemCode, loincSnomedResponses);
  }

  private Optional<HttpClient> getHttpClient() {
    try {
      return Optional.ofNullable(
          HttpClient.newBuilder().version(HttpClient.Version.HTTP_1_1).build());
    } catch (UncheckedIOException e) {
      log.error("Unable to create http client", e);
      return Optional.empty();
    }
  }

  // TODO: Test getLoinctoSnomedRequest creates correct URL and request
  private HttpRequest getLoinctoSnomedRequest(String loinc) {
    String uriString =
        String.format(
            "https://uts-ws.nlm.nih.gov/rest/crosswalk/current/source/LNC/%s?apiKey=%s&targetSource=SNOMEDCT_US",
            loinc, umlsApiKey);
    URI uri = URI.create(uriString);
    return HttpRequest.newBuilder().uri(uri).GET().build();
  }

  // TODO: Test getSnomedRelationsRequest creates correct URL and request
  private HttpRequest getSnomedRelationsRequest(String snomed) {
    /* TODO:
    Not sure the 'additionalRelationLabel' provides any changes to the results from the API.  We may just want to remove it
    */
    String uriString =
        String.format(
            "https://uts-ws.nlm.nih.gov/rest/content/current/source/SNOMEDCT_US/%s/relations?apiKey=%s&pageSize=500&additionalRelationLabel=specimen_source_topography_of",
            snomed, umlsApiKey);
    URI uri = URI.create(uriString);
    return HttpRequest.newBuilder().uri(uri).GET().build();
  }

  // TODO: Test parseCodeDisplayPairsFromUmlsResponse correctly parses API response
  private List<Specimen> parseCodeDisplayPairsFromUmlsResponse(
      HttpResponse<String> response, String loincSystemCode, String loincSystemDisplay) {
    JSONObject body = new JSONObject(response.body());
    JSONArray results = (JSONArray) body.get("result");
    List<Specimen> codes = new ArrayList<>();
    for (int i = 0; i < results.length(); i++) {
      JSONObject result = (JSONObject) results.get(i);
      codes.add(
          new Specimen(
              loincSystemCode,
              loincSystemDisplay,
              result.get("ui").toString(),
              result.get("name").toString()));
    }
    return codes;
  }

  // TODO: Test processing of SNOMED relations with mock HTTP responses
  // TODO: Test sendInitialSnomedRelationsRequests correctly processes all SNOMED codes
  private Map<String, CompletableFuture<HttpResponse<String>>> sendInitialSnomedRelationsRequests(
      Map<String, List<Specimen>> specimensByLoincSystemCode, HttpClient client) {
    List<CompletableFuture<HttpResponse<String>>> futures = new ArrayList<>();
    Map<String, CompletableFuture<HttpResponse<String>>> loincSnomedResponses = new HashMap<>();
    for (String loincSystemCode : specimensByLoincSystemCode.keySet()) {
      for (Specimen specimen : specimensByLoincSystemCode.get(loincSystemCode)) {
        CompletableFuture<HttpResponse<String>> future =
            client.sendAsync(
                getSnomedRelationsRequest(specimen.getSnomedCode()),
                HttpResponse.BodyHandlers.ofString());
        futures.add(future);
        loincSnomedResponses.put(
            "initialRelationRequest-loinc:"
                + loincSystemCode
                + "-snomed:"
                + specimen.getSnomedCode(),
            future);
      }
    }
    log.info("Snomed initial relation requests sent.");
    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
    log.info("Snomed initial relation requests completed.");
    return loincSnomedResponses;
  }

  // TODO: Test processInitialSnomedRelations correctly identifies specimens
  // TODO: Test handling of different relation types in processInitialSnomedRelations
  private void processAndSaveInitialSnomedRelations(
      Map<String, List<Specimen>> specimensByLoincSystemCode,
      Map<String, CompletableFuture<HttpResponse<String>>> loincSnomedResponses) {
    Map<String, Specimen> deduplicatedLoincSnomedToSpecimen = new HashMap<>();
    Map<String, SpecimenBodySite> deduplicatedSpecimenCodeSiteCodeToSpecimenBodySite =
        new HashMap<>();

    // In specimensByLoincSystemCode, each loincSystemCode has a list of specimens due to the
    // many-to-many relationship
    // of loincSystemCode to snomedCode for specimens
    for (String loincSystemCode : specimensByLoincSystemCode.keySet()) {
      for (Specimen specimen : specimensByLoincSystemCode.get(loincSystemCode)) {
        CompletableFuture<HttpResponse<String>> responseFuture =
            loincSnomedResponses.get(
                "initialRelationRequest-loinc:"
                    + loincSystemCode
                    + "-snomed:"
                    + specimen.getSnomedCode());
        HttpResponse<String> response = responseFuture.getNow(null);
        JSONObject body = new JSONObject(response.body());
        JSONArray results = (JSONArray) body.get("result");

        // Looping through all relationships (of all types) for the snomed specimen
        for (int i = 0; i < results.length(); i++) {
          // sometimes there are duplicates within results itself, see this endpoint using snomed
          // 65216001
          // https://uts-ws.nlm.nih.gov/rest/content/current/source/SNOMEDCT_US/65216001/relations?apiKey=%s&pageSize=500&additionalRelationLabel=specimen_source_topography_of
          // and compare the objects where "ui": "R126619655" and "ui": "R123156468"
          // due to this, we have to deduplicate our loincSystemCode-snomedCode combinations
          JSONObject result = (JSONObject) results.get(i);
          boolean saveSnomed = false;
          String relationLabel = result.get("additionalRelationLabel").toString();
          // Ensure the snomed specimen is an actual specimen
          // TODO: Could possibly use an ancestor hierarchy query for the Specimen Concept
          //    to ensure the snomed specimen concept is a descedant
          if (specimen.getSnomedDisplay().contains("Specimen")
              || specimen.getSnomedDisplay().contains("specimen")) {
            // Here we are including also all the children specimens of the
            //  snomed specimen concept in question
            if (StringUtils.equals(relationLabel, "inverse_isa")) {
              saveSnomed = true;
              deduplicatedLoincSnomedToSpecimen.put(
                  specimen.getLoincSystemCode() + specimen.getSnomedCode(), specimen);
              // TODO: we could potentiall make another call here or later
              //  to get the details of the 'children' specimens to gather
              //  the body site for them as well - for now will skip this
            }

            // if there is an associated body site, store that now as well
            if (StringUtils.equals(relationLabel, "has_specimen_source_topography")) {
              String[] relatedIdParts = result.get("relatedId").toString().split("/");
              deduplicatedSpecimenCodeSiteCodeToSpecimenBodySite.put(
                  specimen.getSnomedCode() + relatedIdParts[relatedIdParts.length - 1],
                  SpecimenBodySite.builder()
                      .snomedSpecimenCode(specimen.getSnomedCode())
                      .snomedSpecimenDisplay(specimen.getSnomedDisplay())
                      .snomedSiteCode(relatedIdParts[relatedIdParts.length - 1])
                      .snomedSiteDisplay(result.get("relatedIdName").toString())
                      .build());
            }
            // otherwise if the concept isn't a specimen but is a body site
            // due to the crosswalk finding a body site instead of a specimen in snomed
            // then grab the specimens that relate to the body site and store those
          } else if (StringUtils.equals(relationLabel, "specimen_source_topography_of")
              || StringUtils.equals(relationLabel, "specimen_substance_of")) {
            saveSnomed = true;

            // this also provides us the ability to get the body site and specimens
            // and store them in the bodysite table as well
            if (StringUtils.equals(relationLabel, "specimen_source_topography_of")) {
              String[] relatedIdParts = result.get("relatedId").toString().split("/");
              deduplicatedSpecimenCodeSiteCodeToSpecimenBodySite.put(
                  relatedIdParts[relatedIdParts.length - 1] + specimen.getSnomedCode(),
                  SpecimenBodySite.builder()
                      .snomedSpecimenCode(relatedIdParts[relatedIdParts.length - 1])
                      .snomedSpecimenDisplay(result.get("relatedIdName").toString())
                      .snomedSiteCode(specimen.getSnomedCode())
                      .snomedSiteDisplay(specimen.getSnomedDisplay())
                      .build());
            }
          }
          if (saveSnomed) {
            String[] relatedIdParts = result.get("relatedId").toString().split("/");
            deduplicatedLoincSnomedToSpecimen.put(
                specimen.getLoincSystemCode() + relatedIdParts[relatedIdParts.length - 1],
                new Specimen(
                    specimen.getLoincSystemCode(),
                    specimen.getLoincSystemDisplay(),
                    relatedIdParts[relatedIdParts.length - 1],
                    result.get("relatedIdName").toString()));
          }
        }
      }
    }
    log.info("Saving specimens to the specimen table.");
    saveNewSpecimens(new ArrayList<>(deduplicatedLoincSnomedToSpecimen.values()));
    log.info("Specimens saved.");
    saveNewSpecimenBodySites(
        new ArrayList<>(deduplicatedSpecimenCodeSiteCodeToSpecimenBodySite.values()));
    log.info("Specimen Body Sites saved.");
  }

  // TODO: Test saveSpecimens skips existing specimens
  // TODO: Test saveSpecimens correctly saves new specimens
  private void saveNewSpecimens(List<Specimen> specimens) {
    List<Specimen> newSpecimensToSave =
        specimens.stream()
            .filter(
                specimen ->
                    specimenRepository.findByLoincSystemCodeAndSnomedCode(
                            specimen.getLoincSystemCode(), specimen.getSnomedCode())
                        == null)
            .toList();

    specimenRepository.saveAll(newSpecimensToSave);
  }

  // TODO: Test saveSpecimenBodySites saves new bodySites
  // TODO: Test saveSpecimenBodySites skips existing specimens
  @SuppressWarnings({"checkstyle:illegalcatch"})
  private void saveNewSpecimenBodySites(List<SpecimenBodySite> bodySites) {
    // TODO: We may want to move this duplicate check into the process
    //  of populating the list of bodySites
    List<SpecimenBodySite> newBodySitesToSave =
        bodySites.stream()
            .filter(
                specimenBodySite ->
                    specimenBodySiteRepository.findBySnomedSpecimenCodeAndSnomedSiteCode(
                            specimenBodySite.getSnomedSpecimenCode(),
                            specimenBodySite.getSnomedSiteCode())
                        == null)
            .toList();

    specimenBodySiteRepository.saveAll(newBodySitesToSave);
  }
}
