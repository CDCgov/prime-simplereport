package gov.cdc.usds.simplereport.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.errors.DependencyFailureException;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.SpecimenTypeRepository;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.service.errors.InvalidBulkTestResultUploadException;
import gov.cdc.usds.simplereport.service.errors.InvalidRSAPrivateKeyException;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.service.model.reportstream.ReportStreamStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.TokenResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import gov.cdc.usds.simplereport.utils.BulkUploadResultsToFhir;
import gov.cdc.usds.simplereport.utils.TokenAuthentication;
import gov.cdc.usds.simplereport.validators.FileValidator;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.stream.Collectors;
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
  private final SpecimenTypeRepository specimenTypeRepository;
  private final DataHubClient _client;
  private final OrganizationService _orgService;
  private final TokenAuthentication _tokenAuth;
  private final FileValidator<TestResultRow> testResultFileValidator;
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

  @Value("${data-hub.fhir-enabled:false}")
  private boolean fhirEnabled;

  private static final int FIVE_MINUTES_MS = 300 * 1000;
  public static final String PROCESSING_MODE_CODE_COLUMN_NAME = "processing_mode_code";
  public static final String SPECIMEN_TYPE_COLUMN_NAME = "specimen_type";

  public String createDataHubSenderToken(String privateKey) throws InvalidRSAPrivateKeyException {
    Date inFiveMinutes = new Date(System.currentTimeMillis() + FIVE_MINUTES_MS);

    return _tokenAuth.createRSAJWT(
        simpleReportCsvUploadClientName, dataHubUrl, inFiveMinutes, privateKey);
  }

  private static final ObjectMapper mapper =
      new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

  private Map<String, String> buildSpecimenNameToSNOMEDMap() {
    return specimenTypeRepository.findAll().stream()
        .collect(Collectors.toMap(SpecimenType::getName, SpecimenType::getTypeCode));
  }

  @AuthorizationConfiguration.RequirePermissionCSVUpload
  public TestResultUpload processResultCSV(InputStream csvStream) {

    TestResultUpload validationErrorResult = new TestResultUpload(UploadStatus.FAILURE);

    Organization org = _orgService.getCurrentOrganization();

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
      return validationErrorResult;
    }

    if (!"P".equals(processingModeCodeValue)) {
      content = attachProcessingModeCode(content);
    }

    content = translateSpecimenNameToSNOMED(content, buildSpecimenNameToSNOMEDMap());

    TestResultUpload csvResult = null;
    Future<UploadResponse> csvResponse;
    Future<UploadResponse> fhirResponse = null;
    if (content.length > 0) {
      csvResponse = submitResultsAsCsv(content);
      if (fhirEnabled) {
        fhirResponse = submitResultsAsFhir(new ByteArrayInputStream(content), org);
      }

      try {
        if (csvResponse.get() == null) {
          throw new DependencyFailureException("Unable to parse Report Stream response.");
        }
        csvResult = saveSubmissionToDb(csvResponse.get(), org);
        if (fhirResponse != null) {
          saveSubmissionToDb(fhirResponse.get(), org);
        }
      } catch (ExecutionException | InterruptedException e) {
        log.error("Error Processing Bulk Result Upload.", e);
        Thread.currentThread().interrupt();
      }
    }
    return csvResult;
  }

  private byte[] translateSpecimenNameToSNOMED(byte[] content, Map<String, String> snomedMap) {
    String[] rows = new String(content, StandardCharsets.UTF_8).split("\n");
    String headers = rows[0];

    int specimenTypeIndex =
        Arrays.stream(headers.split(",")).toList().indexOf(SPECIMEN_TYPE_COLUMN_NAME);

    for (int i = 1; i < rows.length; i++) {
      var row = rows[i].split(",");
      var specimenTypeName = Arrays.stream(row).toList().get(specimenTypeIndex);

      row[specimenTypeIndex] = snomedMap.get(specimenTypeName);

      rows[i] = String.join(",", row);
    }

    return String.join("\n", rows).getBytes();
  }

  private byte[] attachProcessingModeCode(byte[] content) {
    String[] row = new String(content, StandardCharsets.UTF_8).split("\n");
    String headers = row[0];
    if (!headers.contains(PROCESSING_MODE_CODE_COLUMN_NAME)) {
      row[0] = headers + "," + PROCESSING_MODE_CODE_COLUMN_NAME;
      for (int i = 1; i < row.length; i++) {
        row[i] = row[i] + "," + processingModeCodeValue;
      }
      content = Arrays.stream(row).collect(Collectors.joining("\n")).getBytes();
    }
    return content;
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
    Map<String, String> queryParams = new LinkedHashMap<>();
    queryParams.put("scope", scope);
    queryParams.put("grant_type", "client_credentials");
    queryParams.put(
        "client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
    queryParams.put("client_assertion", createDataHubSenderToken(signingKey));

    return _client.fetchAccessToken(queryParams);
  }

  private Future<UploadResponse> submitResultsAsFhir(
      ByteArrayInputStream content, Organization org) {
    // send to report stream
    return CompletableFuture.supplyAsync(
        () -> {
          long start = System.currentTimeMillis();
          // convert csv to fhir and serialize to json
          var serializedFhirBundles =
              fhirConverter.convertToFhirBundles(content, org.getInternalId());

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
          log.info("FHIR submitted in " + (System.currentTimeMillis() - start) + " milliseconds");
          return response;
        });
  }

  private Future<UploadResponse> submitResultsAsCsv(byte[] content) {
    return CompletableFuture.supplyAsync(
        () -> {
          long start = System.currentTimeMillis();
          UploadResponse response;
          try {
            response = _client.uploadCSV(content);
          } catch (FeignException e) {
            log.info("RS CSV API Error " + e.status() + " Response: " + e.contentUTF8());
            response = parseFeignException(e);
          }
          log.info("CSV submitted in " + (System.currentTimeMillis() - start) + " milliseconds");
          return response;
        });
  }

  private UploadResponse parseFeignException(FeignException e) {
    try {
      return mapper.readValue(e.contentUTF8(), UploadResponse.class);
    } catch (JsonProcessingException ex) {
      log.error("Unable to parse Report Stream response.", ex);
      return null;
    }
  }

  private TestResultUpload saveSubmissionToDb(UploadResponse response, Organization org) {
    TestResultUpload result = null;
    if (response != null) {
      var status = UploadResponse.parseStatus(response.getOverallStatus());

      result =
          new TestResultUpload(
              response.getId(),
              status,
              response.getReportItemCount(),
              org,
              response.getWarnings(),
              response.getErrors());

      if (response.getOverallStatus() != ReportStreamStatus.ERROR) {
        result = _repo.save(result);
      }
    }
    return result;
  }

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public TestResultUpload processHIVResultCSV(InputStream csvStream) {
    FeedbackMessage[] empty = {};
    return new TestResultUpload(UUID.randomUUID(), UploadStatus.PENDING, 0, null, empty, empty);
  }
}
