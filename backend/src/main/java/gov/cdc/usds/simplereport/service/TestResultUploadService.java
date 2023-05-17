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
  private final ResultsUploaderDeviceValidationService resultsUploaderDeviceValidationService;
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

  private static final String ALPHABET_REGEX = "^[a-zA-Z\\s]+$";

  /*
  private static final Map<String, String> specimenSNOMEDMap = new HashMap<>();

  static {
    specimenSNOMEDMap.put("Swab of internal nose", "445297001");
    specimenSNOMEDMap.put("Nasal Swab", "445297001");
    specimenSNOMEDMap.put("Nasal", "445297001");
    specimenSNOMEDMap.put("Varied", "445297001");
    specimenSNOMEDMap.put("Nasopharyngeal swab", "258500001");
    specimenSNOMEDMap.put("Mid-turbinate nasal swab", "871810001");
    specimenSNOMEDMap.put("Anterior nares swab", "697989009");
    specimenSNOMEDMap.put("Anterior nasal swab", "697989009");
    specimenSNOMEDMap.put("Nasopharyngeal aspirate", "258411007");
    specimenSNOMEDMap.put("Nasopharyngeal washings", "258467004");
    specimenSNOMEDMap.put("Nasopharyngeal wash", "258467004");
    specimenSNOMEDMap.put("Nasal aspirate", "429931000124105");
    specimenSNOMEDMap.put("Nasal aspirate specimen", "429931000124105");
    specimenSNOMEDMap.put("Throat swab", "258529004");
    specimenSNOMEDMap.put("Oropharyngeal swab", "258529004");
    specimenSNOMEDMap.put("Oral swab", "418932006");
    specimenSNOMEDMap.put("Sputum specimen", "119334006");
    specimenSNOMEDMap.put("Sputum", "119334006");
    specimenSNOMEDMap.put("Saliva specimen", "258560004");
    specimenSNOMEDMap.put("Saliva", "258560004");
    specimenSNOMEDMap.put("Serum specimen", "119364003");
    specimenSNOMEDMap.put("Serum", "119364003");
    specimenSNOMEDMap.put("Plasma specimen", "119361006");
    specimenSNOMEDMap.put("Plasma", "119361006");
    specimenSNOMEDMap.put("Whole blood sample", "258580003");
    specimenSNOMEDMap.put("Whole blood", "258580003");
    specimenSNOMEDMap.put("Venous blood specimen", "122555007");
    specimenSNOMEDMap.put("Venous whole blood", "122555007");
    specimenSNOMEDMap.put("Blood specimen", "119297000");
    specimenSNOMEDMap.put("Capillary blood specimen", "122554006");
    specimenSNOMEDMap.put("fingerstick whole blood", "122554006");
    specimenSNOMEDMap.put("Dried blood spot specimen", "440500007");
    specimenSNOMEDMap.put("Dried blood spot", "440500007");
    specimenSNOMEDMap.put("fingerstick blood dried blood spot", "440500007");
    specimenSNOMEDMap.put("Nasopharyngeal and oropharyngeal swab", "433801000124107");
    specimenSNOMEDMap.put("Nasal and throat swab combination", "433801000124107");
    specimenSNOMEDMap.put("Nasal and throat swab", "433801000124107");
    specimenSNOMEDMap.put("Lower respiratory fluid sample", "309171007");
    specimenSNOMEDMap.put("lower respiratory tract aspirates", "309171007");
    specimenSNOMEDMap.put("Bronchoalveolar lavage fluid sample", "258607008");
    specimenSNOMEDMap.put("Bronchoalveolar lavage fluid", "258607008");
    specimenSNOMEDMap.put("Bronchoalveolar lavage", "258607008");
  }

   */

  public String createDataHubSenderToken(String privateKey) throws InvalidRSAPrivateKeyException {
    Date inFiveMinutes = new Date(System.currentTimeMillis() + FIVE_MINUTES_MS);

    return _tokenAuth.createRSAJWT(
        simpleReportCsvUploadClientName, dataHubUrl, inFiveMinutes, privateKey);
  }

  private static final ObjectMapper mapper =
      new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

  /*
  private Map<String, String> buildSpecimenNameToSNOMEDMap() {
    var dbSpecimens =
        specimenTypeRepository.findAll().stream()
            .collect(Collectors.toMap(SpecimenType::getName, SpecimenType::getTypeCode));

    // Combine specimen name -> SNOMED maps from the database and those hardcoded in the service,
    // favoring the DB result on conflicts
    return Stream.of(dbSpecimens, specimenSNOMEDMap)
        .flatMap(map -> map.entrySet().stream())
        .collect(
            Collectors.toMap(
                o -> o.getKey().toLowerCase(), Map.Entry::getValue, (db, mem) -> db, HashMap::new));
  }
   */

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

    content =
        translateSpecimenNameToSNOMED(
            content, resultsUploaderDeviceValidationService.getSpecimenTypeNameToSNOMEDMap());

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
      var row = rows[i].split(",", -1);
      var specimenTypeName = Arrays.stream(row).toList().get(specimenTypeIndex).toLowerCase();

      if (!specimenTypeName.matches(ALPHABET_REGEX)) {
        continue;
      }

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
