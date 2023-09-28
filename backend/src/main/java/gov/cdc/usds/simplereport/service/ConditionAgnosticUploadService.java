package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.utils.AsyncLoggingUtils.withMDC;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.filerow.ConditionAgnosticResultRow;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.ResultUploadError;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.ConditionAgnosticUploadErrorRepository;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import gov.cdc.usds.simplereport.utils.ConditionAgnosticBulkUploadToFhir;
import gov.cdc.usds.simplereport.validators.FileValidator;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ConditionAgnosticUploadService {
  private final ConditionAgnosticBulkUploadToFhir fhirConverter;
  private final ConditionAgnosticUploadErrorRepository errorRepository;
  private final OrganizationService _orgService;

  // this is misnamed now and should be reworked to extract the test-result specific code away from
  // the condition agnostic code
  private final TestResultUploadService uploadService;
  private final FileValidator<ConditionAgnosticResultRow> testResultFileValidator;

  private final DataHubClient _client;
  private static final ObjectMapper mapper =
      new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

  @AuthorizationConfiguration.RequirePermissionCSVUpload
  public TestResultUpload processConditionAgnosticResultCSV(InputStream csvStream) {
    TestResultUpload validationErrorResult = new TestResultUpload(UploadStatus.FAILURE);
    var submissionId = UUID.randomUUID();

    byte[] content;
    try {
      content = csvStream.readAllBytes();
    } catch (IOException e) {
      log.error("Error reading test result upload CSV", e);
      throw new CsvProcessingException("Unable to read csv");
    }

    List<FeedbackMessage> errors =
        testResultFileValidator.validate(new ByteArrayInputStream(content));
    if (!errors.isEmpty()) {
      validationErrorResult.setErrors(errors.toArray(FeedbackMessage[]::new));

      //              QUESTION: Should we be using the existing ResultUploadError table or make a
      // new one? If we're using the
      // existing one, is there a global org that we can associate errors with since these condition
      // agnostic results
      // wouldn't necessarily be bound to an org?

      Organization org = _orgService.getCurrentOrganization();
      errorRepository.saveAll(
          errors.stream().map(error -> new ResultUploadError(org, error, submissionId)).toList());

      return validationErrorResult;
    }

    Organization org = _orgService.getCurrentOrganization();
    TestResultUpload fhirResult = null;
    Future<UploadResponse> fhirResponse;

    if (content.length > 0) {

      fhirResponse = submitResultsAsFhir(new ByteArrayInputStream(content), org);

      try {
        if (fhirResponse != null && fhirResponse.get() != null) {
          // QUESTION: do we need to save these submissions? If so, how?
          saveSubmissionToDb(fhirResponse.get(), submissionId);
        }
      } catch (CsvProcessingException | ExecutionException | InterruptedException e) {
        log.error("Error processing FHIR in bulk result upload", e);
        Thread.currentThread().interrupt();
      }
    }
    // QUESTION: if we're not saving to the db, what should we be returning as our processing
    // response for the API endpoint?
    return fhirResult;
  }

  private Future<UploadResponse> submitResultsAsFhir(
      ByteArrayInputStream content, Organization org) {
    // send to report stream
    return CompletableFuture.supplyAsync(
        withMDC(
            () -> {
              long start = System.currentTimeMillis();
              // convert csv to fhir and serialize to json
              var serializedFhirBundles = fhirConverter.convertToFhirBundles(content, org);

              // build the ndjson request body
              var ndJson = new StringBuilder();
              for (String bundle : serializedFhirBundles) {
                ndJson.append(bundle).append(System.lineSeparator());
              }

              UploadResponse response;
              try {
                response =
                    _client.uploadFhir(
                        ndJson.toString().trim(), uploadService.getRSAuthToken().getAccessToken());
              } catch (FeignException e) {
                log.info("RS Fhir API Error " + e.status() + " Response: " + e.contentUTF8());
                response = parseFeignException(e);
              }
              log.info(
                  "FHIR submitted in " + (System.currentTimeMillis() - start) + " milliseconds");

              return response;
            }));
  }

  private void saveSubmissionToDb(UploadResponse response, UUID submissionId) {
    log.info("should I be implemented?", response, submissionId);
  }

  //  could we just make the upload service version public in a separate config obj?
  private UploadResponse parseFeignException(FeignException e) {
    try {
      return mapper.readValue(e.contentUTF8(), UploadResponse.class);
    } catch (JsonProcessingException ex) {
      log.error("Unable to parse Report Stream response.", ex);
      return null;
    }
  }
}
