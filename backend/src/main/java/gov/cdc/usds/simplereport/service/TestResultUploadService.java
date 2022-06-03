package gov.cdc.usds.simplereport.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import feign.FeignException;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.service.model.reportstream.ReportStreamStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import java.io.IOException;
import java.io.InputStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TestResultUploadService {
  private final TestResultUploadRepository _repo;
  private final DataHubClient _client;
  private final OrganizationService _orgService;

  private static final ObjectMapper mapper =
      new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

  @AuthorizationConfiguration.RequirePermissionCSVUpload
  public TestResultUpload processResultCSV(InputStream csvStream)
      throws IllegalGraphqlArgumentException {

    TestResultUpload result = new TestResultUpload(UploadStatus.FAILURE);

    Organization org = _orgService.getCurrentOrganization();

    byte[] content;
    try {
      content = csvStream.readAllBytes();
    } catch (IOException e) {
      log.error("Error reading test result upload CSV", e);
      throw new CsvProcessingException("Unable to read csv");
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

      var status = parseStatus(response.getOverallStatus());
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
      var body = e.contentUTF8();
      return mapper.readValue(e.contentUTF8(), UploadResponse.class);
    } catch (JsonProcessingException ex) {
      log.error("Unable to parse Report Stream response.", ex);
      return null;
    }
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
}
