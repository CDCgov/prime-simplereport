package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.service.model.reportstream.ReportStreamStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import java.io.InputStream;
import java.util.Date;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class TestResultUploadServiceTest {

  @MockBean DataHubClient dataHubClient;
  @MockBean TestResultUploadRepository repo;
  @MockBean OrganizationService orgSvc;
  private TestResultUploadService sut;

  @BeforeEach
  void init() {
    sut = new TestResultUploadService(repo, dataHubClient, orgSvc);
  }

  @Test
  void uploadService_processCSV_returnsExpectedResponse() {
    InputStream input = loadCsv("test-upload-test-results.csv");

    var uploadResponse =
        UploadResponse.builder()
            .id(UUID.randomUUID())
            .submissionId("1")
            .overallStatus(ReportStreamStatus.WAITING_TO_DELIVER)
            .timestamp(new Date())
            .plannedCompletionAt(new Date())
            .actualCompletionAt(new Date())
            .sender("unit test")
            .reportItemCount(1)
            .errorCount(0)
            .warningCount(4)
            .httpStatus(200)
            .errors(new FeedbackMessage[] {})
            .warnings(new FeedbackMessage[] {})
            .topic("cats")
            .externalName("phil")
            .destinationCount(1)
            .build();

    when(dataHubClient.uploadCSV(any())).thenReturn(uploadResponse);
    when(repo.save(any())).thenReturn(mock(TestResultUpload.class));

    var response = sut.processResultCSV(input);
    assertEquals(UploadStatus.PENDING, response.getStatus());
    assertEquals(0, uploadResponse.getErrorCount());
    assertEquals("1", uploadResponse.getSubmissionId());
  }

  private InputStream loadCsv(String csvFile) {
    return TestResultUploadService.class.getClassLoader().getResourceAsStream(csvFile);
  }
}
