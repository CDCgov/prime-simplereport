package gov.cdc.usds.simplereport.service;

import feign.FeignException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
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

  @AuthorizationConfiguration.RequirePermissionCSVUpload
  public TestResultUpload processResultCSV(InputStream csvStream)
      throws IllegalGraphqlArgumentException {

    TestResultUpload result = new TestResultUpload(UploadStatus.FAILURE);

    Organization org = _orgService.getCurrentOrganization();

    byte[] content;
    try {
      content = csvStream.readAllBytes();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }

    UploadResponse response = null;
    if (content.length > 0) {
      try {
        response = _client.uploadCSV(content);
      } catch (FeignException.BadRequest e) {
        result.setErrors(new FeedbackMessage[] {new FeedbackMessage("api", "Bad Request")});
      } catch (FeignException fe) {
        result.setErrors(new FeedbackMessage[] {new FeedbackMessage("api", "Server Error")});
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
}
