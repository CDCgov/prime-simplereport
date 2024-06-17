package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.EQUIPMENT_MODEL_NAME;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.GENDERS_OF_SEXUAL_PARTNERS;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.ORDERING_FACILITY_CITY;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.ORDERING_FACILITY_NAME;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.ORDERING_FACILITY_PHONE_NUMBER;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.ORDERING_FACILITY_STATE;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.ORDERING_FACILITY_STREET;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.ORDERING_FACILITY_STREET2;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.ORDERING_FACILITY_ZIP_CODE;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.SYPHILIS_HISTORY;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.TESTING_LAB_CITY;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.TESTING_LAB_NAME;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.TESTING_LAB_PHONE_NUMBER;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.TESTING_LAB_STATE;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.TESTING_LAB_STREET;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.TESTING_LAB_STREET2;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.TESTING_LAB_ZIP_CODE;
import static gov.cdc.usds.simplereport.api.model.filerow.TestResultRow.TEST_PERFORMED_CODE;
import static gov.cdc.usds.simplereport.utils.AsyncLoggingUtils.withMDC;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.convertToZonedDateTime;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.dataformat.csv.CsvGenerator;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import feign.FeignException;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.errors.DependencyFailureException;
import gov.cdc.usds.simplereport.api.model.errors.EmptyCsvException;
import gov.cdc.usds.simplereport.api.model.filerow.ConditionAgnosticResultRow;
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
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
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
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
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
  private final FileValidator<ConditionAgnosticResultRow> conditionAgnosticResultFileValidator;
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
  public List<TestResultUpload> processResultCSV(InputStream csvStream) {
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
        CompletableFuture<CovidSubmissionSummary> covidSubmission =
            submitResultsToCovidPipeline(content, org, submissionId);
        CompletableFuture<UniversalSubmissionSummary> universalSubmission =
            submitResultsToUniversalPipeline(new ByteArrayInputStream(content), org, submissionId);

        processCovidPipelineResponse(covidSubmission).ifPresent(uploadSummary::add);
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

  private byte[] transformCsvContent(byte[] content) {
    List<Map<String, String>> updatedRows = new ArrayList<>();
    final MappingIterator<Map<String, String>> valueIterator =
        getIteratorForCsv(new ByteArrayInputStream(content));
    while (valueIterator.hasNext()) {
      final Map<String, String> row;
      try {
        row = getNextRow(valueIterator);
      } catch (CsvProcessingException ex) {
        // anything that would land here should have been caught and handled by the file validator
        log.error("Unable to parse csv.", ex);
        continue;
      }

      if (isCovidResult(row)) {
        updatedRows.add(transformCsvRow(row));
      }
    }

    if (updatedRows.isEmpty()) {
      return new byte[0];
    }

    var headers = updatedRows.stream().flatMap(row -> row.keySet().stream()).distinct().toList();
    var csvMapper =
        new CsvMapper()
            .enable(CsvGenerator.Feature.ALWAYS_QUOTE_STRINGS)
            .writerFor(List.class)
            .with(
                CsvSchema.builder()
                    .setUseHeader(true)
                    .addColumns(headers, CsvSchema.ColumnType.STRING)
                    .build());
    String csvContent;
    try {
      csvContent = csvMapper.writeValueAsString(updatedRows);
    } catch (JsonProcessingException e) {
      throw new CsvProcessingException("Error writing transformed csv rows");
    }

    return csvContent.getBytes(StandardCharsets.UTF_8);
  }

  private boolean isCovidResult(Map<String, String> row) {
    String equipmentModelName = row.get(EQUIPMENT_MODEL_NAME);
    String testPerformedCode = row.get(TEST_PERFORMED_CODE);
    return resultsUploaderCachingService
        .getCovidEquipmentModelAndTestPerformedCodeSet()
        .contains(ResultsUploaderCachingService.getKey(equipmentModelName, testPerformedCode));
  }

  private Map<String, String> transformCsvRow(Map<String, String> row) {

    if (!"P".equals(processingModeCodeValue)
        && !row.containsKey(PROCESSING_MODE_CODE_COLUMN_NAME)) {
      row.put(PROCESSING_MODE_CODE_COLUMN_NAME, processingModeCodeValue);
    }

    var updatedSpecimenType =
        modifyRowSpecimenNameToSNOMED(row.get(SPECIMEN_TYPE_COLUMN_NAME).toLowerCase());

    var providerAddress =
        new StreetAddress(
            row.get("ordering_provider_street"),
            row.get("ordering_provider_street2"),
            row.get("ordering_provider_city"),
            row.get("ordering_provider_state"),
            row.get("ordering_provider_zip_code"),
            null);

    var testResultDate =
        convertToZonedDateTime(
            row.get(TEST_RESULT_DATE_COLUMN_NAME), resultsUploaderCachingService, providerAddress);

    var orderTestDate =
        convertToZonedDateTime(
            row.get(ORDER_TEST_DATE_COLUMN_NAME), resultsUploaderCachingService, providerAddress);

    var specimenCollectionDate =
        StringUtils.isNotBlank(row.get(SPECIMEN_COLLECTION_DATE_COLUMN_NAME))
            ? convertToZonedDateTime(
                row.get(SPECIMEN_COLLECTION_DATE_COLUMN_NAME),
                resultsUploaderCachingService,
                providerAddress)
            : orderTestDate;

    var testingLabSpecimenReceivedDate =
        StringUtils.isNotBlank(row.get(TESTING_LAB_SPECIMEN_RECEIVED_DATE_COLUMN_NAME))
            ? convertToZonedDateTime(
                row.get(TESTING_LAB_SPECIMEN_RECEIVED_DATE_COLUMN_NAME),
                resultsUploaderCachingService,
                providerAddress)
            : orderTestDate;

    var dateResultReleased =
        StringUtils.isNotBlank(row.get(DATE_RESULT_RELEASED_COLUMN_NAME))
            ? convertToZonedDateTime(
                row.get(DATE_RESULT_RELEASED_COLUMN_NAME),
                resultsUploaderCachingService,
                providerAddress)
            : testResultDate;

    addOrderingFacilityValues(row);

    row.put(SPECIMEN_TYPE_COLUMN_NAME, updatedSpecimenType);
    row.put(TEST_RESULT_DATE_COLUMN_NAME, testResultDate.toOffsetDateTime().toString());
    row.put(ORDER_TEST_DATE_COLUMN_NAME, orderTestDate.toOffsetDateTime().toString());
    row.put(
        SPECIMEN_COLLECTION_DATE_COLUMN_NAME, specimenCollectionDate.toOffsetDateTime().toString());
    row.put(
        TESTING_LAB_SPECIMEN_RECEIVED_DATE_COLUMN_NAME,
        testingLabSpecimenReceivedDate.toOffsetDateTime().toString());
    row.put(DATE_RESULT_RELEASED_COLUMN_NAME, dateResultReleased.toOffsetDateTime().toString());

    row.remove(GENDERS_OF_SEXUAL_PARTNERS);
    row.remove(SYPHILIS_HISTORY);

    return row;
  }

  private String modifyRowSpecimenNameToSNOMED(String specimenTypeName) {
    var snomedMap = resultsUploaderCachingService.getSpecimenTypeNameToSNOMEDMap();
    if (specimenTypeName.matches(ALPHABET_REGEX)) {
      return snomedMap.get(specimenTypeName);
    }
    return specimenTypeName;
  }

  private void addOrderingFacilityValues(Map<String, String> row) {
    setColumnValueForRowOrSetDefault(row, ORDERING_FACILITY_NAME, TESTING_LAB_NAME);
    setColumnValueForRowOrSetDefault(row, ORDERING_FACILITY_STREET, TESTING_LAB_STREET);
    setColumnValueForRowOrSetDefault(row, ORDERING_FACILITY_STREET2, TESTING_LAB_STREET2);
    setColumnValueForRowOrSetDefault(row, ORDERING_FACILITY_CITY, TESTING_LAB_CITY);
    setColumnValueForRowOrSetDefault(row, ORDERING_FACILITY_STATE, TESTING_LAB_STATE);
    setColumnValueForRowOrSetDefault(row, ORDERING_FACILITY_ZIP_CODE, TESTING_LAB_ZIP_CODE);
    setColumnValueForRowOrSetDefault(row, ORDERING_FACILITY_PHONE_NUMBER, TESTING_LAB_PHONE_NUMBER);
  }

  private void setColumnValueForRowOrSetDefault(
      Map<String, String> row, String desiredColumnName, String defaultColumnName) {
    String desiredColValue = row.get(desiredColumnName);
    row.put(
        desiredColumnName,
        StringUtils.isNotBlank(desiredColValue) ? desiredColValue : row.get(defaultColumnName));
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
              UploadResponse response = uploadBundleAsFhir(fhirBundleWithMeta.serializedBundle());
              log.info(
                  "FHIR submitted in " + (System.currentTimeMillis() - start) + " milliseconds");

              return new UniversalSubmissionSummary(
                  submissionId, org, response, fhirBundleWithMeta.metadata());
            }));
  }

  private Optional<TestResultUpload> processUniversalPipelineResponse(
      CompletableFuture<UniversalSubmissionSummary> futureSubmissionSummary) {
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
    }

    return Optional.empty();
  }

  private CompletableFuture<CovidSubmissionSummary> submitResultsToCovidPipeline(
      byte[] content, Organization org, UUID submissionId) {
    return CompletableFuture.supplyAsync(
        withMDC(
            () -> {
              long start = System.currentTimeMillis();
              FutureResult<UploadResponse, Exception> result;
              var csvContent = transformCsvContent(content);
              if (csvContent.length == 0) {
                return new CovidSubmissionSummary(
                    submissionId, org, null, new EmptyCsvException(), null);
              }
              try {
                result =
                    FutureResult.<UploadResponse, Exception>builder()
                        .value(_client.uploadCSV(csvContent))
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
      throws DependencyFailureException {
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
    }

    return Optional.empty();
  }

  private UploadResponse parseFeignException(FeignException e) {
    try {
      return mapper.readValue(e.contentUTF8(), UploadResponse.class);
    } catch (JsonProcessingException ex) {
      log.error("Unable to parse Report Stream response.", ex);
      return null;
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

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public TestResultUpload processHIVResultCSV(InputStream csvStream) {
    FeedbackMessage[] empty = {};
    return TestResultUpload.builder()
        .submissionId(UUID.randomUUID())
        .reportId(null)
        .status(UploadStatus.PENDING)
        .recordsCount(0)
        .warnings(empty)
        .errors(empty)
        .organization(null)
        .destination(Pipeline.UNIVERSAL)
        .build();
  }

  @Getter
  @Builder
  public static class FutureResult<V, E> {
    private V value;
    private E error;
  }

  @AuthorizationConfiguration.RequirePermissionCSVUpload
  public TestResultUpload processConditionAgnosticResultCSV(InputStream csvStream) {
    var submissionId = UUID.randomUUID();
    Organization org = _orgService.getCurrentOrganization();
    byte[] content;
    try {
      content = csvStream.readAllBytes();
    } catch (IOException e) {
      log.error("Error reading test result upload CSV", e);
      throw new CsvProcessingException("Unable to read csv");
    }

    List<FeedbackMessage> errors =
        conditionAgnosticResultFileValidator.validate(new ByteArrayInputStream(content));
    if (!errors.isEmpty()) {
      TestResultUpload validationErrorResult = new TestResultUpload(UploadStatus.FAILURE);
      validationErrorResult.setErrors(errors.toArray(FeedbackMessage[]::new));
      errorRepository.saveAll(
          errors.stream().map(error -> new ResultUploadError(org, error, submissionId)).toList());

      return validationErrorResult;
    }

    Future<UploadResponse> fhirResponse;
    TestResultUpload fhirResult = null;
    if (content.length > 0) {
      fhirResponse = submitConditionAgnosticAsFhir(new ByteArrayInputStream(content));
      try {
        if (fhirResponse.get() != null) {
          fhirResult = mapFhirResponseToUploadResponse(fhirResponse.get(), org, submissionId);
        }
      } catch (CsvProcessingException | ExecutionException | InterruptedException e) {
        log.error("Error processing FHIR in bulk result upload", e);
        Thread.currentThread().interrupt();
      }
    }

    return fhirResult;
  }

  private Future<UploadResponse> submitConditionAgnosticAsFhir(ByteArrayInputStream content) {
    // send to report stream
    return CompletableFuture.supplyAsync(
        withMDC(
            () -> {
              long start = System.currentTimeMillis();
              // convert csv to fhir and serialize to json
              List<String> serializedFhirBundles =
                  fhirConverter.convertToConditionAgnosticFhirBundles(content);
              UploadResponse response = uploadBundleAsFhir(serializedFhirBundles);
              log.info(
                  "FHIR submitted in " + (System.currentTimeMillis() - start) + " milliseconds");
              return response;
            }));
  }

  private UploadResponse uploadBundleAsFhir(List<String> serializedFhirBundles) {
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

  private TestResultUpload mapFhirResponseToUploadResponse(
      UploadResponse response, Organization org, UUID submissionId) {
    TestResultUpload result = null;
    if (response != null) {
      var status = UploadResponse.parseStatus(response.getOverallStatus());
      result =
          new TestResultUpload(
              response.getId(),
              submissionId,
              status,
              response.getReportItemCount(),
              org,
              response.getWarnings(),
              response.getErrors(),
              Pipeline.UNIVERSAL,
              null);

      if (response.getErrors() != null && response.getErrors().length > 0) {
        for (var error : response.getErrors()) {
          error.setSource(ResultUploadErrorSource.REPORT_STREAM);
        }

        TestResultUpload finalResult = result;
        errorRepository.saveAll(
            Arrays.stream(response.getErrors())
                .map(
                    feedbackMessage ->
                        new ResultUploadError(finalResult, org, feedbackMessage, submissionId))
                .toList());
      }
    }
    return result;
  }
}
