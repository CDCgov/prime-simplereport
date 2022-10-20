package gov.cdc.usds.simplereport.service;

import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus.FAILURE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
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
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.service.errors.InvalidBulkTestResultUploadException;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.service.model.reportstream.ReportStreamStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.TokenResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.utils.TokenAuthentication;
import gov.cdc.usds.simplereport.validators.TestResultFileValidator;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
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
  @Mock private DataHubClient dataHubMock;
  @Mock private TestResultUploadRepository repoMock;
  @Mock private OrganizationService orgServiceMock;
  @Mock private TokenAuthentication tokenAuthMock;
  @Mock private TestResultFileValidator csvFileValidatorMock;
  @InjectMocks private TestResultUploadService sut;

  @BeforeEach()
  public void init() {
    initSampleData();
  }

  @Test
  @DirtiesContext
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void integrationTest_returnsSuccessfulResult() throws IOException {
    var responseFile =
        TestResultUploadServiceTest.class
            .getClassLoader()
            .getResourceAsStream("responses/datahub-response.json");
    assert responseFile != null;
    var mockResponse = IOUtils.toString(responseFile, StandardCharsets.UTF_8);
    stubFor(
        WireMock.post(WireMock.urlEqualTo("/api/reports?processing=async"))
            .willReturn(
                WireMock.aResponse()
                    .withStatus(HttpStatus.OK)
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody(mockResponse)));
    InputStream input = loadCsv("test-results-upload-valid.csv");

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
  @SliceTestConfiguration.WithSimpleReportStandardUser
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
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void feignBadRequest_returnsErrorMessage() throws IOException {
    try (var x = loadCsv("responses/datahub-error-response.json")) {
      stubFor(
          WireMock.post(WireMock.urlEqualTo("/api/reports?processing=async"))
              .willReturn(
                  WireMock.aResponse()
                      .withStatus(HttpStatus.BAD_REQUEST)
                      .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                      .withBody(x.readAllBytes())));
    }
    InputStream input = loadCsv("test-results-upload-valid.csv");

    var response = this._service.processResultCSV(input);

    assertEquals(6, response.getErrors().length);
    assertEquals(FAILURE, response.getStatus());
  }

  @Test
  @DirtiesContext
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void feignGeneralError_returnsFailureStatus() throws IOException {

    stubFor(
        WireMock.post(WireMock.urlEqualTo("/api/reports?processing=async"))
            .willReturn(
                WireMock.aResponse()
                    .withStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody("you messed up")));

    InputStream input = loadCsv("test-results-upload-valid.csv");

    var response = this._service.processResultCSV(input);

    assertNull(response.getErrors());
    assertEquals(FAILURE, response.getStatus());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportEntryOnlyUser
  void unauthorizedUser_NotAuthorizedResponse() throws IOException {
    try (InputStream input = loadCsv("test-upload-test-results.csv")) {
      assertThrows(AccessDeniedException.class, () -> this._service.processResultCSV(input));
    }
  }

  @Test
  void mockResponse_returnsPending() throws IOException {
    var response = new UploadResponse();
    response.setId(UUID.randomUUID());
    response.setOverallStatus(ReportStreamStatus.RECEIVED);
    response.setReportItemCount(5);
    response.setErrors(new FeedbackMessage[] {});
    response.setWarnings(new FeedbackMessage[] {});

    InputStream input = mock(InputStream.class);
    when(input.readAllBytes()).thenReturn(new byte[] {45});

    when(csvFileValidatorMock.validate(any())).thenReturn(Collections.emptyList());
    when(dataHubMock.uploadCSV(any())).thenReturn(response);

    var output = sut.processResultCSV(input);
    assertNotNull(output.getReportId());
    assertEquals(UploadStatus.PENDING, output.getStatus());
  }

  private InputStream loadCsv(String csvFile) {
    return TestResultUploadService.class.getClassLoader().getResourceAsStream(csvFile);
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_getUploadSubmission_throwsOnInvalid() {
    var uuid = UUID.randomUUID();

    assertThrows(InvalidBulkTestResultUploadException.class, () -> sut.getUploadSubmission(uuid));
  }

  @Test
  @DirtiesContext
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_getUploadSubmission_rsClientOk() {
    UUID reportId = UUID.randomUUID();

    // GIVEN
    when(csvFileValidatorMock.validate(any())).thenReturn(Collections.emptyList());
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
    var uploadResponse = new UploadResponse();
    uploadResponse.setId(testResultUpload.getReportId());
    uploadResponse.setOverallStatus(ReportStreamStatus.WAITING_TO_DELIVER);
    uploadResponse.setTimestamp(testResultUpload.getCreatedAt());
    uploadResponse.setReportItemCount(testResultUpload.getRecordsCount());
    uploadResponse.setErrors(testResultUpload.getErrors());
    uploadResponse.setWarnings(testResultUpload.getWarnings());

    when(dataHubMock.getSubmission(any(UUID.class), anyString())).thenReturn(uploadResponse);

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

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_getUploadSubmission_fileInvalidData() {
    // GIVEN
    InputStream invalidInput = new ByteArrayInputStream("invalid".getBytes());
    when(csvFileValidatorMock.validate(any()))
        .thenReturn(List.of(new FeedbackMessage("error", "my lovely error message")));
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.createValidOrg());

    // WHEN
    TestResultUpload result = sut.processResultCSV(invalidInput);

    // THEN
    assertThat(result.getStatus()).isEqualTo(FAILURE);
    assertThat(result.getErrors()).hasSize(1);
    assertThat(result.getErrors()[0].getMessage()).isEqualTo("my lovely error message");
  }
}
