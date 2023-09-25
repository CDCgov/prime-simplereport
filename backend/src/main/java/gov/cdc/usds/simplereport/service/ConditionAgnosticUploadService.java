package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.utils.AsyncLoggingUtils.withMDC;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.reportstream.TokenResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import gov.cdc.usds.simplereport.utils.ConditionAgnosticBulkUploadToFhir;
import java.io.ByteArrayInputStream;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Future;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ConditionAgnosticUploadService {
  private final ConditionAgnosticBulkUploadToFhir fhirConverter;
  private final DataHubClient _client;
  private static final ObjectMapper mapper =
      new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

  private Future<UploadResponse> submitResultsAsFhir(
      ByteArrayInputStream content, Organization org) {
    // send to report stream
    return CompletableFuture.supplyAsync(
        withMDC(
            () -> {
              long start = System.currentTimeMillis();
              // convert csv to fhir and serialize to json
              var serializedFhirBundles = fhirConverter.convertToFhirBundles(content);

              // build the ndjson request body
              var ndJson = new StringBuilder();
              for (String bundle : serializedFhirBundles) {
                ndJson.append(bundle).append(System.lineSeparator());
              }

              UploadResponse response;
              try {
                response =
                    _client.uploadFhir(ndJson.toString().trim(), getRSAuthToken().getAccessToken());
              } catch (FeignException e) {
                log.info("RS Fhir API Error " + e.status() + " Response: " + e.contentUTF8());
                response = parseFeignException(e);
              }
              log.info(
                  "FHIR submitted in " + (System.currentTimeMillis() - start) + " milliseconds");
              return response;
            }));
  }

  private UploadResponse parseFeignException(FeignException e) {
    try {
      return mapper.readValue(e.contentUTF8(), UploadResponse.class);
    } catch (JsonProcessingException ex) {
      log.error("Unable to parse Report Stream response.", ex);
      return null;
    }
  }

  public TokenResponse getRSAuthToken() {

    String scopeParam = "scope=" + scope;
    String grantTypeParam = "grant_type=client_credentials";
    String clientAssertionTypeParam =
        "client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer";
    String clientAssertionParam = "client_assertion=" + createDataHubSenderToken(signingKey);
    String ampersandDelimChar = "&";

    StringBuilder requestBuilder = new StringBuilder();

    String requestBody =
        requestBuilder
            .append(scopeParam)
            .append(ampersandDelimChar)
            .append(grantTypeParam)
            .append(ampersandDelimChar)
            .append(clientAssertionTypeParam)
            .append(ampersandDelimChar)
            .append(clientAssertionParam)
            .toString();

    return _client.fetchAccessToken(requestBody);
  }
}
