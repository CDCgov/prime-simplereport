package gov.cdc.usds.simplereport.service;

import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.github.tomakehurst.wiremock.client.WireMock;
import com.okta.commons.http.MediaType;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.errors.InvalidBulkTestResultUploadException;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.service.model.reportstream.ReportStreamStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.TokenResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.utils.TokenAuthentication;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.contract.spec.internal.HttpStatus;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@EnableConfigurationProperties
@ExtendWith(SpringExtension.class)
@AutoConfigureWireMock(port = 9561)
class TestResultUploadServiceTest extends BaseServiceTest<TestResultUploadService> {
  @Autowired private TestDataFactory factory;
  @Captor private ArgumentCaptor<UUID> reportIdCaptor;
  @Captor private ArgumentCaptor<String> accessTokenCaptor;

  @BeforeEach()
  public void init() {
    initSampleData();
  }

  @Test
  @DirtiesContext
  @SliceTestConfiguration.WithSimpleReportCsvUploadPilotUser
  void integrationTest_returnsSuccessfulResult() throws IOException {
    var responseFile =
        TestResultUploadServiceTest.class
            .getClassLoader()
            .getResourceAsStream("responses/datahub-response.json");
    assert responseFile != null;
    var mockResponse = IOUtils.toString(responseFile, StandardCharsets.UTF_8);
    stubFor(
        WireMock.post(WireMock.urlEqualTo("/api/reports"))
            .willReturn(
                WireMock.aResponse()
                    .withStatus(HttpStatus.OK)
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody(mockResponse)));
    InputStream input = loadCsv("test-upload-test-results.csv");

    var output = this._service.processResultCSV(input);
    assertEquals(UploadStatus.PENDING, output.getStatus());
    assertEquals(14, output.getRecordsCount());
    assertNotNull(output.getOrganization());

    var warningMessage = Arrays.stream(output.getWarnings()).findFirst().get();
    assertNotNull(warningMessage.getMessage());
    assertNotNull(warningMessage.getScope());
    assertEquals(0, output.getErrors().length);

    assertNotNull(output.getCreatedAt());
    assertNotNull(output.getUpdatedAt());
    assertNotNull(output.getInternalId());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportCsvUploadPilotUser
  void ioException_CaughtAndThrowsCsvException() throws IOException {

    var input = mock(InputStream.class);
    when(input.readAllBytes()).thenThrow(IOException.class);

    assertThrows(
        CsvProcessingException.class,
        () -> {
          this._service.processResultCSV(input);
        });
  }

  @Test
  @DirtiesContext
  @SliceTestConfiguration.WithSimpleReportCsvUploadPilotUser
  void feignBadRequest_returnsErrorMessage() throws IOException {

    stubFor(
        WireMock.post(WireMock.urlEqualTo("/api/reports"))
            .willReturn(
                WireMock.aResponse()
                    .withStatus(HttpStatus.BAD_REQUEST)
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody("you messed up")));
    InputStream input = mock(InputStream.class);
    when(input.readAllBytes()).thenReturn(new byte[] {45});

    var response = this._service.processResultCSV(input);

    assertEquals(1, response.getErrors().length);
    var errorMessage = Arrays.stream(response.getErrors()).findFirst().get();

    assertEquals("Bad Request", errorMessage.getMessage());
  }

  @Test
  @DirtiesContext
  @SliceTestConfiguration.WithSimpleReportCsvUploadPilotUser
  void feignGeneralError_returnsGenericErrorMessage() throws IOException {

    stubFor(
        WireMock.post(WireMock.urlEqualTo("/api/reports"))
            .willReturn(
                WireMock.aResponse()
                    .withStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody("you messed up")));
    InputStream input = mock(InputStream.class);
    when(input.readAllBytes()).thenReturn(new byte[] {45});

    var response = this._service.processResultCSV(input);

    assertEquals(1, response.getErrors().length);
    var errorMessage = Arrays.stream(response.getErrors()).findFirst().get();

    assertEquals("Server Error", errorMessage.getMessage());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void unauthorizedUser_NotAuthorizedResponse() throws IOException {
    try (InputStream input = loadCsv("test-upload-test-results.csv")) {
      assertThrows(AccessDeniedException.class, () -> this._service.processResultCSV(input));
    }
  }

  @Test
  void mockResponse_returnsPending() throws IOException {
    var response =
        UploadResponse.builder()
            .id(UUID.randomUUID())
            .overallStatus(ReportStreamStatus.RECEIVED)
            .reportItemCount(5)
            .errors(new FeedbackMessage[] {})
            .warnings(new FeedbackMessage[] {})
            .build();

    InputStream input = mock(InputStream.class);
    when(input.readAllBytes()).thenReturn(new byte[] {45});

    var dataHubMock = mock(DataHubClient.class);
    var repoMock = mock(TestResultUploadRepository.class);
    var orgServiceMock = mock(OrganizationService.class);
    var tokenAuthMock = mock(TokenAuthentication.class);

    when(dataHubMock.uploadCSV(any())).thenReturn(response);

    var sut = new TestResultUploadService(repoMock, dataHubMock, orgServiceMock, tokenAuthMock);

    var output = sut.processResultCSV(input);
    assertNotNull(output.getReportId());
    assertEquals(UploadStatus.PENDING, output.getStatus());
  }

  private InputStream loadCsv(String csvFile) {
    return TestResultUploadService.class.getClassLoader().getResourceAsStream(csvFile);
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportCsvUploadPilotUser
  void uploadService_getUploadSubmission_throwsOnInvalid() {
    var dataHubMock = mock(DataHubClient.class);
    var repoMock = mock(TestResultUploadRepository.class);
    var orgServiceMock = mock(OrganizationService.class);
    var tokenAuthMock = mock(TokenAuthentication.class);

    var sut = new TestResultUploadService(repoMock, dataHubMock, orgServiceMock, tokenAuthMock);

    var uuid = UUID.randomUUID();

    assertThrows(InvalidBulkTestResultUploadException.class, () -> sut.getUploadSubmission(uuid));
  }

  @Test
  @DirtiesContext
  @SliceTestConfiguration.WithSimpleReportCsvUploadPilotUser
  void uploadService_getUploadSubmission_rsClientOk() {
    var dataHubMock = mock(DataHubClient.class);
    var repoMock = mock(TestResultUploadRepository.class);
    var orgServiceMock = mock(OrganizationService.class);
    var tokenAuthMock = mock(TokenAuthentication.class);

    var sut = new TestResultUploadService(repoMock, dataHubMock, orgServiceMock, tokenAuthMock);

    UUID reportId = UUID.randomUUID();

    // GIVEN
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.createValidOrg());
    var testResultUpload =
        factory.createTestResultUpload(
            reportId, UploadStatus.PENDING, orgServiceMock.getCurrentOrganization());

    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    var dbResponse = Optional.of(testResultUpload);
    when(repoMock.findByInternalIdAndOrganization(any(), any())).thenReturn(dbResponse);
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");
    when(dataHubMock.fetchAccessToken(anyMap())).thenReturn(tokenResponse);

    // WHEN
    UploadResponse result = sut.getUploadSubmission(testResultUpload.getInternalId());

    // THEN
    verify(dataHubMock).getSubmission(reportIdCaptor.capture(), accessTokenCaptor.capture());
    assertEquals(reportId, reportIdCaptor.getValue());
    assertEquals("fake-rs-access-token", accessTokenCaptor.getValue());

    assertEquals(testResultUpload.getReportId(), result.getReportId());
    assertEquals(testResultUpload.getStatus(), result.getStatus());
    assertEquals(testResultUpload.getCreatedAt(), result.getCreatedAt());
    assertEquals(testResultUpload.getRecordsCount(), result.getRecordsCount());
  }
}
