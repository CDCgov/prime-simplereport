package gov.cdc.usds.simplereport.service;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.service.model.reportstream.ReportStreamStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import java.io.InputStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
public class TestResultUploadServiceTest {

  @MockBean DataHubClient dataHubClient;
  @MockBean TestResultUploadRepository repo;
  @MockBean OrganizationService orgSvc;
  private TestResultUploadService sut;

  @BeforeEach
  public void init() {
    sut = new TestResultUploadService(repo, dataHubClient, orgSvc);
  }

  @Test
  public void uploadService_processCSV_returnsExpectedResponse() {
    InputStream input = loadCsv("test-upload-test-results.csv");

    var uploadResponse = new UploadResponse();
    uploadResponse.setOverallStatus(ReportStreamStatus.WAITING_TO_DELIVER);
    when(dataHubClient.uploadCSV(any())).thenReturn(uploadResponse);
    when(repo.save(any())).thenReturn(mock(TestResultUpload.class));

    var response = sut.processResultCSV(input);
    assert (response != null && response.getStatus() == UploadStatus.PENDING);
  }

  private InputStream loadCsv(String csvFile) {
    return TestResultUploadService.class.getClassLoader().getResourceAsStream(csvFile);
  }
}
