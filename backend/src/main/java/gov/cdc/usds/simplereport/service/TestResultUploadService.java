package gov.cdc.usds.simplereport.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.InvalidBulkTestResultUploadException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.service.errors.InvalidRSAPrivateKeyException;
import gov.cdc.usds.simplereport.service.model.reportstream.ReportStreamStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.TokenResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import java.io.IOException;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class TestResultUploadService {
  private final TestResultUploadRepository _repo;
  private final DataHubClient _client;
  private final OrganizationService _orgService;
  private final ObjectMapper _mapper;
  private final TokenAuthenticationService _tokenService;

  @Value("${data-hub.url}")
  private String dataHubUrl;

  @Value("${data-hub.organization}")
  private String organization;

  @AuthorizationConfiguration.RequirePermissionCSVUpload
  public TestResultUpload processResultCSV(InputStream csvStream, UUID facilityId)
      throws IllegalGraphqlArgumentException {

    TestResultUpload result = new TestResultUpload(UploadStatus.FAILURE);

    Organization org = _orgService.getCurrentOrganization();
    Facility facility =
        _orgService.getFacilityInCurrentOrg(facilityId); // todo maybe get rid of facility?

    byte[] content;
    try {
      content = csvStream.readAllBytes();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }

    UploadResponse response = null;
    if (content.length > 0) {
      response = _client.uploadCSV(content);
    }
    String warnings = null, errors = null;

    if (response != null) {
      try {
        warnings = _mapper.writeValueAsString(response.getWarnings());
        errors = _mapper.writeValueAsString(response.getErrors());
      } catch (JsonProcessingException e) {
        throw new RuntimeException(e);
      }
      var status = parseStatus(response.getOverallStatus());
      result =
          new TestResultUpload(
              response.getId(),
              status,
              response.getReportItemCount(),
              org,
              facility,
              warnings,
              errors);

      _repo.save(result);
    }

    return result;
  }

  private UploadStatus parseStatus(ReportStreamStatus status) {
    switch (status) {
      case DELIVERED:
        return UploadStatus.SUCCESS;
      case RECEIVED:
      case WAITING_TO_DELIVER:
      case PARTIALLY_DELIVERED:
        return UploadStatus.PENDING;
      case ERROR:
      case NOT_DELIVERING:
      default:
        return UploadStatus.FAILURE;
    }
  }

  public TestResultUpload getUploadSubmission(UUID id)
      throws InvalidBulkTestResultUploadException, InvalidRSAPrivateKeyException {
    Organization org = _orgService.getCurrentOrganization();

    TestResultUpload result =
        _repo
            .findByInternalIdAndOrganization(id, org)
            .orElseThrow(InvalidBulkTestResultUploadException::new);

    var token = _tokenService.createDataHubSenderToken();

    String reportingScope = organization + ".default.report";

    Map<String, String> queryParams = new LinkedHashMap<>();
    queryParams.put("scope", reportingScope);
    queryParams.put("grant_type", "client_credentials");
    queryParams.put(
        "client_assertion_type", "urn:ietf:params:oauth:client-assertion-type:jwt-bearer");
    queryParams.put("client_assertion", token);
    TokenResponse r = _client.fetchAccessToken(queryParams);
    UploadResponse response =
        _client.getSubmission(result.getReportId().toString(), r.access_token);

    return new TestResultUpload(
        response.getId(),
        this.parseStatus(response.getOverallStatus()),
        response.getReportItemCount(),
        org,
        null,
        new JSONArray(response.getWarnings()).toString(),
        new JSONArray(response.getErrors()).toString());
  }
}
