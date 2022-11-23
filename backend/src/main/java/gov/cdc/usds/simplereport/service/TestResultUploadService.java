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
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.service.errors.InvalidBulkTestResultUploadException;
import gov.cdc.usds.simplereport.service.errors.InvalidRSAPrivateKeyException;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.service.model.reportstream.ReportStreamStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.TokenResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import gov.cdc.usds.simplereport.utils.TokenAuthentication;
import gov.cdc.usds.simplereport.validators.FileValidator;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Date;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
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
  private final DataHubClient _client;
  private final OrganizationService _orgService;
  private final TokenAuthentication _tokenAuth;
  private final FileValidator<TestResultRow> testResultFileValidator;

  @Value("${data-hub.url}")
  private String dataHubUrl;

  @Value("${data-hub.csv-upload-api-client}")
  private String simpleReportCsvUploadClientName;

  @Value("${data-hub.signing-key}")
  private String signingKey;

  @Value("${data-hub.jwt-scope}")
  private String scope;

  private static final int FIVE_MINUTES_MS = 300 * 1000;

  public String createDataHubSenderToken(String privateKey) throws InvalidRSAPrivateKeyException {
    Date inFiveMinutes = new Date(System.currentTimeMillis() + FIVE_MINUTES_MS);

    return _tokenAuth.createRSAJWT(
        simpleReportCsvUploadClientName, dataHubUrl, inFiveMinutes, privateKey);
  }

  private static final ObjectMapper mapper =
      new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

  @AuthorizationConfiguration.RequirePermissionCSVUpload
  public TestResultUpload processResultCSV(InputStream csvStream) {

    TestResultUpload result = new TestResultUpload(UploadStatus.FAILURE);

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
      result.setErrors(errors.toArray(FeedbackMessage[]::new));
      return result;
    }

    UploadResponse response = null;
    if (content.length > 0) {
      try {
        response = _client.uploadCSV(content);
      } catch (FeignException e) {
        log.warn("Bulk test result upload unsuccessful", e);
        response = parseFeignException(e);
      }
    }

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
        _repo.save(result);
      }
    }
    return result;
  }

  private UploadResponse parseFeignException(FeignException e) {
    try {
      return mapper.readValue(e.contentUTF8(), UploadResponse.class);
    } catch (JsonProcessingException ex) {
      log.error("Unable to parse Report Stream response.", ex);
      throw new DependencyFailureException("Unable to parse Report Stream response.");
    }
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

    Map<String, String> queryParams = new LinkedHashMap<>();
    queryParams.put("scope", scope);
    queryParams.put("grant_type", "client_credentials");
    queryParams.put(
        "client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
    queryParams.put("client_assertion", createDataHubSenderToken(signingKey));

    TokenResponse r = _client.fetchAccessToken(queryParams);

    return _client.getSubmission(result.getReportId(), r.getAccessToken());
  }
}
