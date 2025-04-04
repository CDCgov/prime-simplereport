package gov.cdc.usds.simplereport.service;



import gov.cdc.usds.simplereport.db.model.Specimen;
import gov.cdc.usds.simplereport.db.repository.LabRepository;
import gov.cdc.usds.simplereport.db.repository.SpecimenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.UncheckedIOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;
import java.util.concurrent.CompletableFuture;


@Service
@RequiredArgsConstructor
@Slf4j
public class SpecimenService {
    private final SpecimenRepository specimenRepository;
    @Value("${umls.api-key}")
    private String umlsApiKey;

    private final LabRepository labRepository;

    public String syncSpecimens() {
     Optional<HttpClient> optionalClient = getHttpClient();
     if (optionalClient.isEmpty()) {
         return "Specimen sync failed: unable to create HttpClient.";
     }
     HttpClient client = optionalClient.get();
     log.info("HttpClient created.");

     Optional<List<List<String>>> optionalSystemCodes = labRepository.findDistinctSystemCodes();
     if (optionalSystemCodes.isEmpty()) {
         return "Specimen sync failed: unable to read LOINC system codes from the lab table.";
     }
     List<List<String>> systemCodes = optionalSystemCodes.get();
     log.info("LOINC System codes read from lab table.");

     List<CompletableFuture<HttpResponse<String>>> loincToSnomedResponses = new ArrayList<>();
     systemCodes.forEach( code -> loincToSnomedResponses.add(client.sendAsync(getLoinctoSnomedRequest(code.get(0)), HttpResponse.BodyHandlers.ofString())));
     log.info("Async batch of LOINC to SNOMED conversions sent.");
     CompletableFuture.allOf(loincToSnomedResponses.toArray(new CompletableFuture[systemCodes.size()])).join();
     log.info("Async batch of LOINC to SNOMED conversions completed.");

     HttpResponse<String> response;
     Map<String, List<Map<String, Object>>> snomedsByLoinc = new HashMap<>();
     for (int i = 0; i < systemCodes.size(); i++) {
         response = loincToSnomedResponses.get(i).getNow(null);
         log.info(response.body());
         String loincSystemCode = systemCodes.get(i).get(0);
         String loincSystemDisplay = systemCodes.get(i).get(1);
         snomedsByLoinc.put(loincSystemCode, parseCodeDisplayPairsFromUmlsResponse(response, loincSystemCode, loincSystemDisplay));
     }

     sendInitialSnomedRelationsRequests(snomedsByLoinc, client);
     List<Map<String, String>> specimens = processInitialSnomedRelations(snomedsByLoinc);
     log.info("Saving specimens to the specimen table.");
     saveSpecimens(specimens);
     log.info("Specimens saved.");
    return "Specimen sync completed successfully";
    }

    private Optional<HttpClient> getHttpClient(){
        try{
            return Optional.ofNullable(HttpClient.newBuilder()
                    .version(HttpClient.Version.HTTP_1_1)
                    .build());
        } catch (UncheckedIOException e){
            log.error("Unable to create http client", e);
            return Optional.empty();
        }

    }

    private HttpRequest getLoinctoSnomedRequest(String loinc) {
        String uriString = String.format("https://uts-ws.nlm.nih.gov/rest/crosswalk/current/source/LNC/%s?apiKey=%s&targetSource=SNOMEDCT_US", loinc, umlsApiKey);
        URI uri = URI.create(uriString);
        return HttpRequest.newBuilder().uri(uri).GET().build();
    }

    private HttpRequest getSnomedRelationsRequest(String snomed) {
        String uriString = String.format("https://uts-ws.nlm.nih.gov/rest/content/current/source/SNOMEDCT_US/%s/relations?apiKey=%s&pageSize=500&additionalRelationLabel=specimen_source_topography_of", snomed, umlsApiKey);
        URI uri = URI.create(uriString);
        return HttpRequest.newBuilder().uri(uri).GET().build();
    }

    private List<Map<String, Object>> parseCodeDisplayPairsFromUmlsResponse(HttpResponse<String> response, String loincSystemCode, String loincSystemDisplay){
        JSONObject body = new JSONObject(response.body());
        JSONArray results = (JSONArray) body.get("result");
        List<Map<String, Object>> codes = new ArrayList<>();
        for (int i = 0; i < results.length(); i++) {
            Map<String, Object> code = new HashMap<>();
            JSONObject result = (JSONObject) results.get(i);
            code.put("loincSystemCode", loincSystemCode);
            code.put("loincSystemDisplay", loincSystemDisplay);
            code.put("snomedCode", result.get("ui").toString());
            code.put("snomedDisplay", result.get("name").toString());
            codes.add(code);
        }
        return codes;
    }

    private void sendInitialSnomedRelationsRequests(Map<String, List<Map<String, Object>>> snomedsByLoinc, HttpClient client) {
        List<CompletableFuture<HttpResponse<String>>> futures = new ArrayList<>();
        for (String loinc : snomedsByLoinc.keySet()) {
            for (Map<String, Object> snomed : snomedsByLoinc.get(loinc)) {
                CompletableFuture<HttpResponse<String>> future =  client.sendAsync(getSnomedRelationsRequest(snomed.get("snomedCode").toString()), HttpResponse.BodyHandlers.ofString());
                futures.add(future);
                snomed.put("initialRelationRequest", future);
            }
        }
        log.info("Snomed initial relation requests sent.");
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
        log.info("Snomed initial relation requests completed.");
    }

    private List<Map<String, String>>  processInitialSnomedRelations(Map<String, List<Map<String, Object>>> snomedsByLoinc) {
        List<Map<String, String>> specimens = new ArrayList<>();
        for (String loinc : snomedsByLoinc.keySet()) {
            for (Map<String, Object> snomed : snomedsByLoinc.get(loinc)) {
                CompletableFuture<HttpResponse<String>> responseFuture = (CompletableFuture<HttpResponse<String>>) snomed.get("initialRelationRequest");
                HttpResponse<String> response = responseFuture.getNow(null);
                JSONObject body = new JSONObject(response.body());
                JSONArray results = (JSONArray) body.get("result");

                String loincSystemCode = snomed.get("loincSystemCode").toString();
                String loincSystemDisplay = snomed.get("loincSystemDisplay").toString();
                String snomedCode = snomed.get("snomedCode").toString();
                String snomedDisplay = snomed.get("snomedDisplay").toString();

                for (int i = 0; i < results.length(); i++) {
                    JSONObject result = (JSONObject) results.get(i);
                    boolean saveSnomed = false;
                    String relationLable = result.get("additionalRelationLabel").toString();
                    if (snomedDisplay.contains("Specimen") | snomedDisplay.contains("specimen")) {
                        if (relationLable.equals("inverse_isa")) {
                            saveSnomed = true;
                            Map<String, String> specimen = new HashMap<>();
                            specimen.put("loincSystemCode", loincSystemCode);
                            specimen.put("loincSystemDisplay", loincSystemDisplay);
                            specimen.put("snomedCode", snomedCode);
                            specimen.put("snomedDisplay", snomedDisplay);
                            specimens.add(specimen);

                        }
                    }
                    else if (relationLable.equals("specimen_source_topography_of") | relationLable.equals("specimen_substance_of")){
                        saveSnomed = true;
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
        return specimens;
    }

    private void saveSpecimens(List<Map<String, String>> rawSpecimens) {
        //List<Specimen> specimens = new ArrayList<>();
        for (Map<String, String> rawSpecimen : rawSpecimens) {
            Specimen foundSpecimen = specimenRepository.findBySnomedCode(rawSpecimen.get("snomedCode"));
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
                        rawSpecimen.get("snomedDisplay")
                    )
            );
        }
        //specimenRepository.saveAll(specimens);
    }
}
