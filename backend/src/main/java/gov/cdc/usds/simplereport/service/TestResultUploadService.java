package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.utils.AsyncLoggingUtils.withMDC;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.formatToHL7FileDateString;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.ResultUploadError;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.UploadDiseaseDetails;
import gov.cdc.usds.simplereport.db.model.auxiliary.AimsSubmissionSummary;
import gov.cdc.usds.simplereport.db.model.auxiliary.FHIRBundleRecord;
import gov.cdc.usds.simplereport.db.model.auxiliary.Pipeline;
import gov.cdc.usds.simplereport.db.model.auxiliary.ResultUploadErrorSource;
import gov.cdc.usds.simplereport.db.model.auxiliary.SubmissionSummary;
import gov.cdc.usds.simplereport.db.model.auxiliary.UniversalSubmissionSummary;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.ResultUploadErrorRepository;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.db.repository.UploadDiseaseDetailsRepository;
import gov.cdc.usds.simplereport.service.errors.InvalidBulkTestResultUploadException;
import gov.cdc.usds.simplereport.service.errors.InvalidRSAPrivateKeyException;
import gov.cdc.usds.simplereport.service.model.GenericResponse;
import gov.cdc.usds.simplereport.service.model.S3UploadResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.service.model.reportstream.TokenResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import gov.cdc.usds.simplereport.utils.BulkUploadResultsToFhir;
import gov.cdc.usds.simplereport.utils.BulkUploadResultsToHL7;
import gov.cdc.usds.simplereport.utils.DateGenerator;
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
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestResultUploadService {
  private final TestResultUploadRepository _repo;
  private final ResultUploadErrorRepository errorRepository;
  private final UploadDiseaseDetailsRepository diseaseDetailsRepository;
  private final DataHubClient _client;
  private final OrganizationService _orgService;
  private final TokenAuthentication _tokenAuth;
  private final FileValidator<TestResultRow> testResultFileValidator;
  private final DiseaseService diseaseService;
  private final BulkUploadResultsToFhir fhirConverter;
  private final BulkUploadResultsToHL7 hl7Converter;
  private final FeatureFlagsConfig featureFlagsConfig;
  private final DateGenerator dateGenerator;

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

  @Value("${aims.access-key-id}")
  private String aimsAccessKeyId;

  @Value("${aims.secret-access-key}")
  private String aimsSecretAccessKey;

  @Value("${aims.s3-bucket-name}")
  private String aimsS3BucketName;

  @Value("${aims.user-id}")
  private String aimsUserId;

  @Value("${aims.encryption-key}")
  private String aimsEncryptionKey;

  private static final int SUCCESS_CODE = 200;
  private static final int FIVE_MINUTES_MS = 300 * 1000;

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
        if (featureFlagsConfig.isAimsReportingEnabled()) {
          CompletableFuture<AimsSubmissionSummary> aimsSubmission =
              submitResultsToAIMS(new ByteArrayInputStream(content), org, submissionId);

          processUniversalPipelineResponse(aimsSubmission).ifPresent(uploadSummary::add);
        } else {
          CompletableFuture<UniversalSubmissionSummary> universalSubmission =
              submitResultsToUniversalPipeline(
                  new ByteArrayInputStream(content), org, submissionId);

          processUniversalPipelineResponse(universalSubmission).ifPresent(uploadSummary::add);
        }
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
              log.info("FHIR submitted in {} milliseconds", System.currentTimeMillis() - start);

              return new UniversalSubmissionSummary(
                  submissionId, org, response, fhirBundleWithMeta.metadata());
            }));
  }

  private CompletableFuture<AimsSubmissionSummary> submitResultsToAIMS(
      ByteArrayInputStream content, Organization org, UUID submissionId)
      throws CsvProcessingException {
    return CompletableFuture.supplyAsync(
        withMDC(
            () -> {
              long start = System.currentTimeMillis();

              S3Client s3 =
                  S3Client.builder()
                      .region(Region.US_EAST_1)
                      .credentialsProvider(
                          StaticCredentialsProvider.create(
                              AwsBasicCredentials.create(aimsAccessKeyId, aimsSecretAccessKey)))
                      .build();

              S3UploadResponse s3Response;
              String filename =
                  String.format(
                      "InterPartner~DatapultELRPivot~Simple-Report~AIMSPlatform~Test~Test~%s~STOP~%s.hl7",
                      formatToHL7FileDateString(dateGenerator.newDate()), submissionId);
              String objectKey = aimsUserId + "/SendTo/" + filename;

              try (s3) {
                var hl7Batch = hl7Converter.convertToHL7BatchMessage(content);

                PutObjectResponse putResponse =
                    s3.putObject(
                        PutObjectRequest.builder()
                            .bucket(aimsS3BucketName)
                            .key(objectKey)
                            .contentType("text/plain")
                            .build(),
                        RequestBody.fromString(hl7Batch.message()));

                long elapsed = System.currentTimeMillis() - start;
                log.info("Uploaded HL7 file {} in {} ms", objectKey, elapsed);

                int statusCode = putResponse.sdkHttpResponse().statusCode();
                boolean isSuccessful = statusCode == SUCCESS_CODE;

                if (isSuccessful) {
                  s3Response = new S3UploadResponse(objectKey, hl7Batch.recordsCount(), true);
                } else {
                  s3Response =
                      new S3UploadResponse(
                          objectKey,
                          hl7Batch.recordsCount(),
                          putResponse
                              .sdkHttpResponse()
                              .statusText()
                              .orElse(
                                  String.format(
                                      "Status Code %d: Failed to upload %s",
                                      statusCode, objectKey)));
                }

                return new AimsSubmissionSummary(
                    submissionId, org, s3Response, hl7Batch.metadata());
              } catch (CsvProcessingException e) {
                log.error("Failed to upload HL7 batch to S3", e);
                s3Response = new S3UploadResponse(objectKey, 0, e.getMessage());
                return new AimsSubmissionSummary(submissionId, org, s3Response, new HashMap<>());
              }
            }));
  }

  private Optional<TestResultUpload> processUniversalPipelineResponse(
      CompletableFuture<? extends SubmissionSummary> futureSubmissionSummary)
      throws CsvProcessingException, ExecutionException, InterruptedException {
    try {
      SubmissionSummary submissionSummary = futureSubmissionSummary.get();
      if (submissionSummary != null && submissionSummary.submissionResponse() != null) {
        return saveSubmissionToDb(
            submissionSummary.submissionResponse(),
            submissionSummary.org(),
            submissionSummary.submissionId(),
            Pipeline.UNIVERSAL,
            submissionSummary.reportedDiseases());
      }
    } catch (CsvProcessingException | ExecutionException | InterruptedException e) {
      log.error("Error processing submission in bulk result upload", e);
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
      GenericResponse response,
      Organization org,
      UUID submissionId,
      Pipeline pipeline,
      HashMap<String, Integer> diseasesReported) {
    if (response != null) {

      var status = response.getStatus();

      TestResultUpload uploadRecord =
          _repo.save(
              TestResultUpload.builder()
                  .reportId(response.getReportId())
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
      log.info("RS Fhir API Error {} Response: {}", e.status(), e.contentUTF8());
      response = parseFeignException(e);
    }
    return response;
  }
}
