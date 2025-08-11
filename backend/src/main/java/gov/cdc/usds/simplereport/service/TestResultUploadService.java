package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.utils.AsyncLoggingUtils.withMDC;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.errors.DependencyFailureException;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.ResultUploadError;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.UploadDiseaseDetails;
import gov.cdc.usds.simplereport.db.model.auxiliary.CovidSubmissionSummary;
import gov.cdc.usds.simplereport.db.model.auxiliary.FHIRBundleRecord;
import gov.cdc.usds.simplereport.db.model.auxiliary.Pipeline;
import gov.cdc.usds.simplereport.db.model.auxiliary.ResultUploadErrorSource;
import gov.cdc.usds.simplereport.db.model.auxiliary.UniversalSubmissionSummary;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.ResultUploadErrorRepository;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.db.repository.UploadDiseaseDetailsRepository;
import gov.cdc.usds.simplereport.service.errors.InvalidBulkTestResultUploadException;
import gov.cdc.usds.simplereport.service.errors.InvalidRSAPrivateKeyException;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.service.model.reportstream.TokenResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import gov.cdc.usds.simplereport.utils.BulkUploadResultsToFhir;
import gov.cdc.usds.simplereport.utils.TokenAuthentication;
import gov.cdc.usds.simplereport.validators.FileValidator;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestResultUploadService {
  private final TestResultUploadRepository _repo;
  private final ResultUploadErrorRepository errorRepository;
  private final UploadDiseaseDetailsRepository diseaseDetailsRepository;
  private final DataHubClient _client;
  private final OrganizationService _orgService;
  private final ResultsUploaderCachingService resultsUploaderCachingService;
  private final TokenAuthentication _tokenAuth;
  private final FileValidator<TestResultRow> testResultFileValidator;
  private final DiseaseService diseaseService;
  private final BulkUploadResultsToFhir fhirConverter;

  @Value("${data-hub.url}")
  private String dataHubUrl;

  @Value("${data-hub.csv-upload-api-client}")
  private String simpleReportCsvUploadClientName;

  @Value("${data-hub.signing-key}")
  private String signingKey;

  @Value("${data-hub.jwt-scope}")
  private String scope;

  @Value("${simple-report.processing-mode-code:P}")
  private String processingModeCodeValue;

  private static final int FIVE_MINUTES_MS = 300 * 1000;
  public static final String PROCESSING_MODE_CODE_COLUMN_NAME = "processing_mode_code";
  private static final String ORDER_TEST_DATE_COLUMN_NAME = "order_test_date";
  private static final String SPECIMEN_COLLECTION_DATE_COLUMN_NAME = "specimen_collection_date";
  private static final String TESTING_LAB_SPECIMEN_RECEIVED_DATE_COLUMN_NAME =
      "testing_lab_specimen_received_date";
  private static final String TEST_RESULT_DATE_COLUMN_NAME = "test_result_date";
  private static final String DATE_RESULT_RELEASED_COLUMN_NAME = "date_result_released";

  public static final String SPECIMEN_TYPE_COLUMN_NAME = "specimen_type";

  private static final String ALPHABET_REGEX = "^[a-zA-Z\\s]+$";

  public String createDataHubSenderToken(String privateKey) throws InvalidRSAPrivateKeyException {
    Date inFiveMinutes = new Date(System.currentTimeMillis() + FIVE_MINUTES_MS);

    return _tokenAuth.createRSAJWT(
        simpleReportCsvUploadClientName, dataHubUrl, inFiveMinutes, privateKey);
  }

  private static final ObjectMapper mapper =
      new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

  @AuthorizationConfiguration.RequirePermissionCSVUpload
  public List<TestResultUpload> processResultCSV(InputStream csvStream) throws Exception {
    List<TestResultUpload> uploadSummary = new ArrayList<>();
    var submissionId = UUID.randomUUID();
    Organization org = _orgService.getCurrentOrganization();

    try {
      byte[] content = csvStream.readAllBytes();

      Optional<TestResultUpload> dataValidationErrors =
          performDataValidations(content, org, submissionId);

      if (dataValidationErrors.isPresent()) {
        uploadSummary.add(dataValidationErrors.get());
        return uploadSummary;
      }

      if (content.length > 0) {
        CompletableFuture<UniversalSubmissionSummary> universalSubmission =
            submitResultsToUniversalPipeline(new ByteArrayInputStream(content), org, submissionId);

        processUniversalPipelineResponse(universalSubmission).ifPresent(uploadSummary::add);
      }
    } catch (IOException e) {
      log.error("Error reading test result upload CSV", e);
      throw new CsvProcessingException("Unable to read csv");
    }

    return uploadSummary;
  }

  private Optional<TestResultUpload> performDataValidations(
      byte[] content, Organization org, UUID submissionId) {

    List<FeedbackMessage> errors =
        testResultFileValidator.validate(new ByteArrayInputStream(content));

    if (!errors.isEmpty()) {
      TestResultUpload validationErrorResult = new TestResultUpload(UploadStatus.FAILURE);
      validationErrorResult.setErrors(errors.toArray(FeedbackMessage[]::new));
      errorRepository.saveAll(
          errors.stream().map(error -> new ResultUploadError(org, error, submissionId)).toList());
      return Optional.of(validationErrorResult);
    }

    return Optional.empty();
  }

  public Page<TestResultUpload> getUploadSubmissions(
      Date startDate, Date endDate, int pageNumber, int pageSize) {
    Organization org = _orgService.getCurrentOrganization();
    PageRequest pageRequest =
        PageRequest.of(pageNumber, pageSize, Sort.by("createdAt").descending());

    return _repo.findAll(org, startDate, endDate, pageRequest);
  }

  public UploadResponse getUploadSubmission(UUID id)
      throws InvalidBulkTestResultUploadException, InvalidRSAPrivateKeyException {
    Organization org = _orgService.getCurrentOrganization();

    TestResultUpload result =
        _repo
            .findByInternalIdAndOrganization(id, org)
            .orElseThrow(InvalidBulkTestResultUploadException::new);

    return _client.getSubmission(result.getReportId(), getRSAuthToken().getAccessToken());
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

  private CompletableFuture<UniversalSubmissionSummary> submitResultsToUniversalPipeline(
      ByteArrayInputStream content, Organization org, UUID submissionId)
      throws CsvProcessingException {
    // send to report stream
    return CompletableFuture.supplyAsync(
        withMDC(
            () -> {
              long start = System.currentTimeMillis();
              // convert csv to fhir and serialize to json
              FHIRBundleRecord fhirBundleWithMeta =
                  fhirConverter.convertToFhirBundles(content, org.getInternalId());
              UploadResponse response;
              try {
                response = uploadBundleAsFhir(fhirBundleWithMeta.serializedBundle());
              } catch (JsonProcessingException e) {
                throw new CsvProcessingException("Unable to parse Report Stream response.");
              }
              log.info(
                  "FHIR submitted in " + (System.currentTimeMillis() - start) + " milliseconds");

              return new UniversalSubmissionSummary(
                  submissionId, org, response, fhirBundleWithMeta.metadata());
            }));
  }

  private Optional<TestResultUpload> processUniversalPipelineResponse(
      CompletableFuture<UniversalSubmissionSummary> futureSubmissionSummary)
      throws CsvProcessingException, ExecutionException, InterruptedException {
    try {
      UniversalSubmissionSummary submissionSummary = futureSubmissionSummary.get();
      if (submissionSummary != null && submissionSummary.submissionResponse() != null) {
        return saveSubmissionToDb(
            submissionSummary.submissionResponse(),
            submissionSummary.org(),
            submissionSummary.submissionId(),
            Pipeline.UNIVERSAL,
            submissionSummary.reportedDiseases());
      }
    } catch (CsvProcessingException | ExecutionException | InterruptedException e) {
      log.error("Error processing FHIR in bulk result upload", e);
      Thread.currentThread().interrupt();
      throw e;
    }

    return Optional.empty();
  }

  private CompletableFuture<CovidSubmissionSummary> submitResultsToCovidPipeline(
      byte[] covidCsvContent, Organization org, UUID submissionId) {
    return CompletableFuture.supplyAsync(
        withMDC(
            () -> {
              long start = System.currentTimeMillis();
              FutureResult<UploadResponse, Exception> result;
              try {
                result =
                    FutureResult.<UploadResponse, Exception>builder()
                        .value(_client.uploadCSV(covidCsvContent))
                        .build();
              } catch (FeignException e) {
                log.info("RS CSV API Error " + e.status() + " Response: " + e.contentUTF8());
                try {
                  UploadResponse value = mapper.readValue(e.contentUTF8(), UploadResponse.class);
                  result = FutureResult.<UploadResponse, Exception>builder().value(value).build();

                } catch (JsonProcessingException ex) {
                  log.error("Unable to parse Report Stream response.", ex);
                  result =
                      FutureResult.<UploadResponse, Exception>builder()
                          .error(
                              new DependencyFailureException(
                                  "Unable to parse Report Stream response."))
                          .build();
                }
              }
              log.info(
                  "CSV submitted in " + (System.currentTimeMillis() - start) + " milliseconds");

              HashMap<String, Integer> diseaseReported = new HashMap<>();

              if (result.getValue() != null) {
                diseaseReported.put("COVID-19", result.getValue().getReportItemCount());
              }

              return new CovidSubmissionSummary(
                  submissionId, org, result.getValue(), result.getError(), diseaseReported);
            }));
  }

  private Optional<TestResultUpload> processCovidPipelineResponse(
      CompletableFuture<CovidSubmissionSummary> futureSubmissionSummary)
      throws DependencyFailureException,
          CsvProcessingException,
          ExecutionException,
          InterruptedException {
    try {
      CovidSubmissionSummary submissionSummary = futureSubmissionSummary.get();
      if (submissionSummary.processingException() instanceof DependencyFailureException) {
        throw (DependencyFailureException) submissionSummary.processingException();
      }

      if (submissionSummary.submissionResponse() != null) {
        return saveSubmissionToDb(
            submissionSummary.submissionResponse(),
            submissionSummary.org(),
            submissionSummary.submissionId(),
            Pipeline.COVID,
            submissionSummary.reportedDiseases());
      }
    } catch (CsvProcessingException | ExecutionException | InterruptedException e) {
      log.error("Error processing csv in bulk result upload", e);
      Thread.currentThread().interrupt();
      throw e;
    }

    return Optional.empty();
  }

  private UploadResponse parseFeignException(FeignException e) throws JsonProcessingException {
    try {
      return mapper.readValue(e.contentUTF8(), UploadResponse.class);
    } catch (JsonProcessingException ex) {
      log.error("Unable to parse Report Stream response.", ex);
      throw ex;
    }
  }

  private Optional<TestResultUpload> saveSubmissionToDb(
      UploadResponse response,
      Organization org,
      UUID submissionId,
      Pipeline pipeline,
      HashMap<String, Integer> diseasesReported) {
    if (response != null) {

      var status = UploadResponse.parseStatus(response.getOverallStatus());

      TestResultUpload uploadRecord =
          _repo.save(
              TestResultUpload.builder()
                  .reportId(response.getId())
                  .submissionId(submissionId)
                  .status(status)
                  .recordsCount(response.getRecordsCount())
                  .organization(org)
                  .destination(pipeline)
                  .errors(response.getErrors())
                  .warnings(response.getWarnings())
                  .build());

      List<UploadDiseaseDetails> diseaseDetails = new ArrayList<>();

      diseasesReported.forEach(
          (reportedDiseaseName, count) -> {
            SupportedDisease reportedDisease = diseaseService.getDiseaseByName(reportedDiseaseName);
            diseaseDetails.add(new UploadDiseaseDetails(reportedDisease, uploadRecord, count));
          });
      diseaseDetailsRepository.saveAll(diseaseDetails);

      if (response.getErrors() != null && response.getErrors().length > 0) {
        for (var error : response.getErrors()) {
          error.setSource(ResultUploadErrorSource.REPORT_STREAM);
        }

        TestResultUpload finalResult = uploadRecord;
        errorRepository.saveAll(
            Arrays.stream(response.getErrors())
                .map(
                    feedbackMessage ->
                        new ResultUploadError(finalResult, org, feedbackMessage, submissionId))
                .toList());
      }

      return Optional.of(uploadRecord);
    }
    return Optional.empty();
  }

  @Getter
  @Builder
  public static class FutureResult<V, E> {
    private V value;
    private E error;
  }

  private UploadResponse uploadBundleAsFhir(List<String> serializedFhirBundles)
      throws JsonProcessingException {
    // build the ndjson request body
    var ndJson = new StringBuilder();
    for (String bundle : serializedFhirBundles) {
      ndJson.append(bundle).append(System.lineSeparator());
    }

    UploadResponse response;
    try {
      response = _client.uploadFhir(ndJson.toString().trim(), getRSAuthToken().getAccessToken());
    } catch (FeignException e) {
      log.info("RS Fhir API Error " + e.status() + " Response: " + e.contentUTF8());
      response = parseFeignException(e);
    }
    return response;
  }
}
