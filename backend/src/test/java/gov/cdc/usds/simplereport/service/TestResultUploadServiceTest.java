package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.errors.InvalidBulkTestResultUploadException;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.service.model.reportstream.ReportStreamStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.TokenResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.utils.TokenAuthentication;
import java.io.InputStream;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
public class TestResultUploadServiceTest extends BaseServiceTest<TestResultUploadService> {

  @MockBean DataHubClient dataHubClient;
  @MockBean TestResultUploadRepository repo;
  @MockBean OrganizationService orgSvc;
  @MockBean TokenAuthentication tokenAuth;
  @Autowired private TestDataFactory factory;
  @Captor private ArgumentCaptor<UUID> reportIdCaptor;
  @Captor private ArgumentCaptor<String> accessTokenCaptor;

  private TestResultUploadService sut;

  @BeforeEach
  public void init() {
    sut = new TestResultUploadService(repo, dataHubClient, orgSvc, tokenAuth);
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

  @Test
  public void uploadService_getUploadSubmission_throwsOnInvalid() {
    assertThrows(
        InvalidBulkTestResultUploadException.class,
        () -> sut.getUploadSubmission(UUID.randomUUID()));
  }

  @Test
  public void uploadService_getUploadSubmission_rsClientOk() {
    UUID reportId = UUID.randomUUID();

    // GIVEN
    var testResultUpload =
        factory.createTestResultUpload(
            reportId, UploadStatus.PENDING, orgSvc.getCurrentOrganization());

    when(tokenAuth.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    var dbResponse = Optional.of(testResultUpload);
    when(repo.findByInternalIdAndOrganization(any(), any())).thenReturn(dbResponse);
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");
    when(dataHubClient.fetchAccessToken(anyMap())).thenReturn(tokenResponse);

    // WHEN
    sut.getUploadSubmission(testResultUpload.getInternalId());

    // THEN
    verify(dataHubClient).getSubmission(reportIdCaptor.capture(), accessTokenCaptor.capture());
    assertEquals(reportId, reportIdCaptor.getValue());
    assertEquals("fake-rs-access-token", accessTokenCaptor.getValue());
  }
}
