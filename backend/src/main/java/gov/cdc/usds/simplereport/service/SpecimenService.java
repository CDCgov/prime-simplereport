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
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

    Optional<List<List<String>>> optionalSystemCodes = labRepository.findDistinctSystemCodes();
    if (optionalSystemCodes.isEmpty()) {
      log.error("Specimen sync failed: unable to read LOINC system codes from the lab table.");
      return;
    }
    List<List<String>> systemCodes = optionalSystemCodes.get();
    log.info("LOINC System codes read from lab table.");

    List<CompletableFuture<HttpResponse<String>>> loincToSnomedResponses = new ArrayList<>();
    systemCodes.forEach(
        code ->
            loincToSnomedResponses.add(
                client.sendAsync(
                    getLoinctoSnomedRequest(code.get(0)), HttpResponse.BodyHandlers.ofString())));
    log.info("Async batch of LOINC to SNOMED conversions sent.");
    CompletableFuture.allOf(
            loincToSnomedResponses.toArray(new CompletableFuture[systemCodes.size()]))
        .join();
    log.info("Async batch of LOINC to SNOMED conversions completed.");

    HttpResponse<String> response;
    Map<String, List<Map<String, Object>>> snomedsByLoinc = new HashMap<>();
    for (int i = 0; i < systemCodes.size(); i++) {
      response = loincToSnomedResponses.get(i).getNow(null);
      log.info(response.body());
      String loincSystemCode = systemCodes.get(i).get(0);
      String loincSystemDisplay = systemCodes.get(i).get(1);
      snomedsByLoinc.put(
          loincSystemCode,
          parseCodeDisplayPairsFromUmlsResponse(response, loincSystemCode, loincSystemDisplay));
    }

    sendInitialSnomedRelationsRequests(snomedsByLoinc, client);
    processAndSaveInitialSnomedRelations(snomedsByLoinc);
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
  private List<Map<String, Object>> parseCodeDisplayPairsFromUmlsResponse(
      HttpResponse<String> response, String loincSystemCode, String loincSystemDisplay) {
    JSONObject body = new JSONObject(response.body());
    JSONArray results = (JSONArray) body.get("result");
    List<Map<String, Object>> codes = new ArrayList<>();
    for (int i = 0; i < results.length(); i++) {
      Map<String, Object> code = new HashMap<>();
      JSONObject result = (JSONObject) results.get(i);
      // TODO: Refactor to use Specimen.java object and return List<Specimen>?
      code.put("loincSystemCode", loincSystemCode);
      code.put("loincSystemDisplay", loincSystemDisplay);
      code.put("snomedCode", result.get("ui").toString());
      code.put("snomedDisplay", result.get("name").toString());
      codes.add(code);
    }
    return codes;
  }

  // TODO: Test processing of SNOMED relations with mock HTTP responses
  // TODO: Test sendInitialSnomedRelationsRequests correctly processes all SNOMED codes
  private void sendInitialSnomedRelationsRequests(
      Map<String, List<Map<String, Object>>> snomedsByLoinc, HttpClient client) {
    List<CompletableFuture<HttpResponse<String>>> futures = new ArrayList<>();
    for (String loinc : snomedsByLoinc.keySet()) {
      for (Map<String, Object> snomed : snomedsByLoinc.get(loinc)) {
        CompletableFuture<HttpResponse<String>> future =
            client.sendAsync(
                getSnomedRelationsRequest(snomed.get("snomedCode").toString()),
                HttpResponse.BodyHandlers.ofString());
        futures.add(future);
        snomed.put("initialRelationRequest", future);
      }
    }
    log.info("Snomed initial relation requests sent.");
    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
    log.info("Snomed initial relation requests completed.");
  }

  // TODO: Test processInitialSnomedRelations correctly identifies specimens
  // TODO: Test handling of different relation types in processInitialSnomedRelations
  private void processAndSaveInitialSnomedRelations(
      Map<String, List<Map<String, Object>>> snomedsByLoinc) {
    List<Map<String, String>> specimens = new ArrayList<>();
    List<SpecimenBodySite> bodySites = new ArrayList<>();

    for (String loinc : snomedsByLoinc.keySet()) {
      for (Map<String, Object> snomed : snomedsByLoinc.get(loinc)) {
        CompletableFuture<HttpResponse<String>> responseFuture =
            (CompletableFuture<HttpResponse<String>>) snomed.get("initialRelationRequest");
        HttpResponse<String> response = responseFuture.getNow(null);
        JSONObject body = new JSONObject(response.body());
        JSONArray results = (JSONArray) body.get("result");

        String loincSystemCode = snomed.get("loincSystemCode").toString();
        String loincSystemDisplay = snomed.get("loincSystemDisplay").toString();
        String snomedCode = snomed.get("snomedCode").toString();
        String snomedDisplay = snomed.get("snomedDisplay").toString();

        // Looping through all relationships (of all types) for the snomed specimen
        for (int i = 0; i < results.length(); i++) {
          JSONObject result = (JSONObject) results.get(i);
          boolean saveSnomed = false;
          String relationLabel = result.get("additionalRelationLabel").toString();
          // Ensure the snomed specimen is an actual specimen
          // TODO: Could possibly use an ancestor hierarchy query for the Specimen Concept
          //    to ensure the snomed specimen concept is a descedant
          if (snomedDisplay.contains("Specimen") || snomedDisplay.contains("specimen")) {
            // Here we are including also all the children specimens of the
            //  snomed specimen concept in question
            if (Objects.equals(relationLabel, "inverse_isa")) {
              saveSnomed = true;
              Map<String, String> specimen = new HashMap<>();
              specimen.put("loincSystemCode", loincSystemCode);
              specimen.put("loincSystemDisplay", loincSystemDisplay);
              specimen.put("snomedCode", snomedCode);
              specimen.put("snomedDisplay", snomedDisplay);
              specimens.add(specimen);
              // TODO: we could potentiall make another call here or later
              //  to get the details of the 'children' specimens to gather
              //  the body site for them as well - for now will skip this
            }

            // if there is an associated body site, store that now as well
            if (Objects.equals(relationLabel, "has_specimen_source_topography")) {
              String[] relatedIdParts = result.get("relatedId").toString().split("/");
              bodySites.add(
                  SpecimenBodySite.builder()
                      .snomedSpecimenCode(snomedCode)
                      .snomedSpecimenDisplay(snomedDisplay)
                      .snomedSiteCode(relatedIdParts[relatedIdParts.length - 1])
                      .snomedSiteDisplay(result.get("relatedIdName").toString())
                      .build());
            }
            // otherwise if the concept isn't a specimen but is a body site
            // due to the crosswalk finding a body site instead of a specimen in snomed
            // then grab the specimens that relate to the body site and store those
          } else if (Objects.equals(relationLabel, "specimen_source_topography_of")
              || Objects.equals(relationLabel, "specimen_substance_of")) {
            saveSnomed = true;

            // this also provides us the ability to get the body site and specimens
            // and store them in the bodysite table as well
            if (Objects.equals(relationLabel, "specimen_source_topography_of")) {
              String[] relatedIdParts = result.get("relatedId").toString().split("/");
              bodySites.add(
                  SpecimenBodySite.builder()
                      .snomedSpecimenCode(relatedIdParts[relatedIdParts.length - 1])
                      .snomedSpecimenDisplay(result.get("relatedIdName").toString())
                      .snomedSiteCode(snomedCode)
                      .snomedSiteDisplay(snomedDisplay)
                      .build());
            }
          }
          if (saveSnomed) {
            Map<String, String> specimen = new HashMap<>();
            String[] relatedIdParts = result.get("relatedId").toString().split("/");
            specimen.put("loincSystemCode", loincSystemCode);
            specimen.put("loincSystemDisplay", loincSystemDisplay);
            specimen.put("snomedCode", relatedIdParts[relatedIdParts.length - 1]);
            specimen.put("snomedDisplay", result.get("relatedIdName").toString());
            specimens.add(specimen);
          }
        }
      }
    }
    log.info("Saving specimens to the specimen table.");
    saveSpecimens(specimens);
    log.info("Specimens saved.");
    saveNewSpecimenBodySites(bodySites);
    log.info("Specimen Body Sites saved.");
  }

  // TODO: Test saveSpecimens skips existing specimens
  // TODO: Test saveSpecimens correctly saves new specimens
  /* TODO:
    Add this code into the db.changelog-master.yaml file to add the proper constraint
    but the code below to search for both the specimen and loinc system has been added:
    - changeSet:
    id: update-specimen-unique-constraint
    author: tlx4@cdc.gov
    changes:
      - tagDatabase:
          tag: update-specimen-unique-constraint
      - dropUniqueConstraint:
          tableName: specimen
          constraintName: specimen_snomed_code_key
      - addUniqueConstraint:
          tableName: specimen
          columnNames: loinc_system_code, snomed_code
          constraintName: uk__loinc_system_code__snomed_code
    rollback:
      - addUniqueConstraint:
          tableName: specimen
          columnNames: snomed_code
          constraintName: specimen_snomed_code_key
      - dropUniqueConstraint:
          tableName: specimen
          constraintName: uk__loinc_system_code__snomed_code
  */
  private void saveSpecimens(List<Map<String, String>> rawSpecimens) {
    // List<Specimen> specimens = new ArrayList<>();
    for (Map<String, String> rawSpecimen : rawSpecimens) {

      Specimen foundSpecimen = null;
      //          specimenRepository.findByLoincSystemAndSnomedCodes(
      //              rawSpecimen.get("loincSystemCode"), rawSpecimen.get("snomedCode"));
      /*
      if (foundSpecimen != null) {
          specimens.add(foundSpecimen);
      }
      specimens.add( new Specimen(
              rawSpecimen.get("loincSystemCode"),
              rawSpecimen.get("loincSystemDisplay"),
              rawSpecimen.get("snomedCode"),
              rawSpecimen.get("snomedDisplay")
          )
      );
      */
      if (foundSpecimen != null) {
        continue;
      }
      specimenRepository.save(
          new Specimen(
              rawSpecimen.get("loincSystemCode"),
              rawSpecimen.get("loincSystemDisplay"),
              rawSpecimen.get("snomedCode"),
              rawSpecimen.get("snomedDisplay")));
    }
    // specimenRepository.saveAll(specimens);
  }

  // TODO: Test saveSpecimenBodySites saves new bodySites
  // TODO: Test saveSpecimenBodySites skips existing specimens
  @SuppressWarnings({"checkstyle:illegalcatch"})
  private void saveNewSpecimenBodySites(List<SpecimenBodySite> bodySites) {

    if (!bodySites.isEmpty()) {
      // TODO: We may want to move this duplicate check into the process
      //  of populating the list of bodySites
      for (SpecimenBodySite specimenBodySite : bodySites) {
        SpecimenBodySite foundBodySite =
            specimenBodySiteRepository.findBySnomedSpecimenCodeAndSnomedSiteCode(
                specimenBodySite.getSnomedSpecimenCode(), specimenBodySite.getSnomedSiteCode());
        if (foundBodySite != null) {
          continue;
        }
        try {
          specimenBodySiteRepository.save(specimenBodySite);
        } catch (Exception exception) {
          log.error(exception.getMessage());
        }
      }
    }
  }
}
