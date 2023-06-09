package gov.cdc.usds.simplereport.service;

import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus.FAILURE;
import static org.assertj.core.api.Assertions.assertThat;
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
import feign.FeignException;
import feign.Request;
import feign.RequestTemplate;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.errors.DependencyFailureException;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.ResultUploadErrorRepository;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.service.errors.InvalidBulkTestResultUploadException;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.service.model.reportstream.ReportStreamStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.TokenResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.utils.BulkUploadResultsToFhir;
import gov.cdc.usds.simplereport.utils.TokenAuthentication;
import gov.cdc.usds.simplereport.validators.FileValidator;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;

@EnableConfigurationProperties
@ExtendWith(SpringExtension.class)
@AutoConfigureWireMock(port = 9561)
class TestResultUploadServiceTest extends BaseServiceTest<TestResultUploadService> {
  @Autowired private TestDataFactory factory;
  @Captor private ArgumentCaptor<UUID> reportIdCaptor;
  @Captor private ArgumentCaptor<String> accessTokenCaptor;
  @Mock private DataHubClient dataHubMock;
  @Mock private TestResultUploadRepository repoMock;
  @Mock private ResultUploadErrorRepository errorRepoMock;
  @Mock private OrganizationService orgServiceMock;
  @Mock private ResultsUploaderDeviceValidationService resultsUploaderDeviceValidationServiceMock;
  @Mock private TokenAuthentication tokenAuthMock;
  @Mock private FileValidator<TestResultRow> csvFileValidatorMock;
  @Mock private BulkUploadResultsToFhir bulkUploadFhirConverterMock;
  @InjectMocks private TestResultUploadService sut;

  @BeforeEach()
  public void init() {
    initSampleData();
    ReflectionTestUtils.setField(sut, "processingModeCodeValue", "P");
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
                    .withStatus(HttpStatus.OK.value())
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody(mockResponse)));
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    when(repoMock.save(any())).thenReturn(null);

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
                      .withStatus(HttpStatus.BAD_REQUEST.value())
                      .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                      .withBody(x.readAllBytes())));
    }
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");

    var response = this._service.processResultCSV(input);

    assertEquals(6, response.getErrors().length);
    assertEquals(FAILURE, response.getStatus());
  }

  @Test
  @DirtiesContext
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void feignGeneralError_returnsFailureStatus() {

    stubFor(
        WireMock.post(WireMock.urlEqualTo("/api/reports?processing=async"))
            .willReturn(
                WireMock.aResponse()
                    .withStatus(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody("you messed up")));

    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");

    assertThrows(DependencyFailureException.class, () -> this._service.processResultCSV(input));
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

    // todo rewrite this test to be valid - we're just testing our mocks now
    var result =
        new TestResultUpload(
            response.getReportId(),
            UploadStatus.PENDING,
            response.getReportItemCount(),
            orgServiceMock.getCurrentOrganization(),
            response.getWarnings(),
            response.getErrors());

    InputStream input = mock(InputStream.class);
    when(input.readAllBytes()).thenReturn(new byte[] {45});

    when(csvFileValidatorMock.validate(any())).thenReturn(Collections.emptyList());
    when(dataHubMock.uploadCSV(any())).thenReturn(response);
    when(repoMock.save(any())).thenReturn(result);

    var output = sut.processResultCSV(input);
    assertNotNull(output.getReportId());
    assertEquals(UploadStatus.PENDING, output.getStatus());
  }

  @Test
  void mockResponse_returnsGatewayTimeout() throws IOException {
    InputStream input = mock(InputStream.class);
    when(input.readAllBytes()).thenReturn(new byte[] {45});

    String responseBody =
        "<HTML><HEAD>\n"
            + "<TITLE>Gateway Timeout - In read </TITLE>\n"
            + "</HEAD><BODY>\n"
            + "<H1>Gateway Timeout</H1>\n"
            + "The proxy server did not receive a timely response from the upstream server.<P>\n"
            + "Reference&#32;&#35;1&#46;136bdc17&#46;1666816860&#46;528d7d3c\n"
            + "</BODY></HTML>";

    Request req =
        Request.create(Request.HttpMethod.POST, "", new HashMap<>(), null, new RequestTemplate());
    FeignException reportStreamResponse =
        new FeignException.GatewayTimeout(responseBody, req, null, new HashMap<>());
    when(csvFileValidatorMock.validate(any())).thenReturn(Collections.emptyList());
    when(dataHubMock.uploadCSV(any())).thenThrow(reportStreamResponse);

    assertThrows(DependencyFailureException.class, () -> sut.processResultCSV(input));
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
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
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
        .thenReturn(List.of(FeedbackMessage.builder().message("my lovely error message").build()));
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());

    // WHEN
    TestResultUpload result = sut.processResultCSV(invalidInput);

    // THEN
    assertThat(result.getStatus()).isEqualTo(FAILURE);
    assertThat(result.getErrors()).hasSize(1);
    assertThat(result.getErrors()[0].getMessage()).isEqualTo("my lovely error message");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_getUploadSubmission_processingModeCode_NotSet() {
    // GIVEN
    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    var response = new UploadResponse();
    response.setId(UUID.randomUUID());
    response.setOverallStatus(ReportStreamStatus.RECEIVED);
    response.setReportItemCount(5);
    response.setErrors(new FeedbackMessage[] {});
    response.setWarnings(new FeedbackMessage[] {});
    when(dataHubMock.uploadCSV(any())).thenReturn(response);

    // WHEN
    sut.processResultCSV(input);

    // THEN
    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    String[] rows = new String(fileContentCaptor.getValue(), StandardCharsets.UTF_8).split("\n");
    assertThat(rows[0]).doesNotContain(",processing_mode_code");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_getUploadSubmission_processingModeCode_T() {
    // GIVEN
    ReflectionTestUtils.setField(sut, "processingModeCodeValue", "T");
    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    var response = new UploadResponse();
    response.setId(UUID.randomUUID());
    response.setOverallStatus(ReportStreamStatus.RECEIVED);
    response.setReportItemCount(5);
    response.setErrors(new FeedbackMessage[] {});
    response.setWarnings(new FeedbackMessage[] {});
    when(dataHubMock.uploadCSV(any())).thenReturn(response);

    // WHEN
    sut.processResultCSV(input);

    // THEN
    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    String[] rows = new String(fileContentCaptor.getValue(), StandardCharsets.UTF_8).split("\n");
    assertThat(rows[0]).endsWith(",processing_mode_code");
    assertThat(rows[1]).endsWith(",T");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_getUploadSubmission_processingModeCode_doesntOverrideFileValue() {
    // GIVEN
    ReflectionTestUtils.setField(sut, "processingModeCodeValue", "T");
    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    var response = new UploadResponse();
    response.setId(UUID.randomUUID());
    response.setOverallStatus(ReportStreamStatus.RECEIVED);
    response.setReportItemCount(5);
    response.setErrors(new FeedbackMessage[] {});
    response.setWarnings(new FeedbackMessage[] {});
    when(dataHubMock.uploadCSV(any())).thenReturn(response);

    InputStream input =
        loadCsv("testResultUpload/test-results-upload-valid-with-processingModeCode-D.csv");

    // WHEN
    sut.processResultCSV(input);

    // THEN
    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    String[] rows = new String(fileContentCaptor.getValue(), StandardCharsets.UTF_8).split("\n");
    assertThat(rows[0]).endsWith(",processing_mode_code");
    assertThat(rows[1]).endsWith(",D");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processCsv_translatesSpecimenNameToSNOMED() {
    // GIVEN
    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    var response = new UploadResponse();
    response.setId(UUID.randomUUID());
    response.setOverallStatus(ReportStreamStatus.RECEIVED);
    response.setReportItemCount(5);
    response.setErrors(new FeedbackMessage[] {});
    response.setWarnings(new FeedbackMessage[] {});
    when(dataHubMock.uploadCSV(any())).thenReturn(response);
    when(resultsUploaderDeviceValidationServiceMock.getSpecimenTypeNameToSNOMEDMap())
        .thenReturn(Map.of("nasal swab", "000111222"));

    // WHEN
    sut.processResultCSV(input);

    // THEN
    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    String[] rows = new String(fileContentCaptor.getValue(), StandardCharsets.UTF_8).split("\n");
    assertThat(rows).hasSize(2);
    var headerCount = Arrays.stream(rows[0].split(",")).toList().size();
    var row = rows[1];

    assertThat(row.split(",")).hasSize(headerCount);
    assertThat(rows[1]).contains("000111222");
  }

  @Test
  void uploadService_FhirEnabled_UploadSentTwice() {
    // given
    ReflectionTestUtils.setField(sut, "fhirEnabled", true);

    var response = new UploadResponse();
    response.setId(UUID.randomUUID());
    response.setOverallStatus(ReportStreamStatus.RECEIVED);
    response.setReportItemCount(5);
    response.setErrors(new FeedbackMessage[] {});
    response.setWarnings(new FeedbackMessage[] {});
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(dataHubMock.uploadCSV(any())).thenReturn(response);
    when(dataHubMock.uploadFhir(any(), any())).thenReturn(response);
    when(dataHubMock.fetchAccessToken(anyMap())).thenReturn(tokenResponse);

    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(List.of("a", "b", "c"));
    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());

    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    ArgumentCaptor<String> stringCaptor = ArgumentCaptor.forClass(String.class);

    // when
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    sut.processResultCSV(input);

    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    verify(dataHubMock).uploadFhir(stringCaptor.capture(), stringCaptor.capture());
  }

  @Test
  void uploadService_FhirEnabled_FhirFailure_ReportsCSVResult() {
    // given
    ReflectionTestUtils.setField(sut, "fhirEnabled", true);

    var org = factory.saveValidOrganization();
    var csvReportId = UUID.randomUUID();
    var csvResponse = new UploadResponse();
    csvResponse.setId(csvReportId);
    csvResponse.setOverallStatus(ReportStreamStatus.RECEIVED);
    csvResponse.setReportItemCount(5);
    csvResponse.setErrors(new FeedbackMessage[] {});
    csvResponse.setWarnings(new FeedbackMessage[] {});
    var fhirResponse = new UploadResponse();
    fhirResponse.setId(UUID.randomUUID());
    fhirResponse.setOverallStatus(ReportStreamStatus.ERROR);
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");
    var csvResult =
        new TestResultUpload(
            csvReportId,
            UploadStatus.PENDING,
            5,
            org,
            csvResponse.getWarnings(),
            csvResponse.getErrors());

    when(dataHubMock.uploadCSV(any())).thenReturn(csvResponse);
    when(dataHubMock.uploadFhir(any(), any())).thenReturn(fhirResponse);
    when(dataHubMock.fetchAccessToken(anyMap())).thenReturn(tokenResponse);
    when(repoMock.save(any())).thenReturn(csvResult);

    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(List.of("a", "b", "c"));
    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(org);

    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    ArgumentCaptor<String> stringCaptor = ArgumentCaptor.forClass(String.class);

    // when
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    var output = sut.processResultCSV(input);

    // then
    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    verify(dataHubMock).uploadFhir(stringCaptor.capture(), stringCaptor.capture());

    assertEquals(UploadStatus.PENDING, output.getStatus());
    assertEquals(output.getReportId(), csvReportId);
  }

  @Test
  void uploadService_FhirEnabled_FhirException_ReportsCSVResult() {
    // given
    ReflectionTestUtils.setField(sut, "fhirEnabled", true);

    var org = factory.saveValidOrganization();
    var csvReportId = UUID.randomUUID();
    var successfulCsvResponse = new UploadResponse();
    successfulCsvResponse.setId(csvReportId);
    successfulCsvResponse.setOverallStatus(ReportStreamStatus.RECEIVED);
    successfulCsvResponse.setReportItemCount(5);
    successfulCsvResponse.setErrors(new FeedbackMessage[] {});
    successfulCsvResponse.setWarnings(new FeedbackMessage[] {});

    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");
    var csvResult =
        new TestResultUpload(
            csvReportId,
            UploadStatus.PENDING,
            5,
            org,
            successfulCsvResponse.getWarnings(),
            successfulCsvResponse.getErrors());

    Request req =
        Request.create(Request.HttpMethod.POST, "", new HashMap<>(), null, new RequestTemplate());
    String responseBody =
        "<HTML><HEAD>\n"
            + "<TITLE>Gateway Timeout - In read </TITLE>\n"
            + "</HEAD><BODY>\n"
            + "<H1>Gateway Timeout</H1>\n"
            + "The proxy server did not receive a timely response from the upstream server.<P>\n"
            + "Reference&#32;&#35;1&#46;136bdc17&#46;1666816860&#46;528d7d3c\n"
            + "</BODY></HTML>";

    FeignException reportStreamException =
        new FeignException.GatewayTimeout(responseBody, req, null, new HashMap<>());

    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(List.of("a", "b", "c"));
    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(dataHubMock.fetchAccessToken(anyMap())).thenReturn(tokenResponse);
    when(dataHubMock.uploadCSV(any())).thenReturn(successfulCsvResponse);
    when(dataHubMock.uploadFhir(any(), any())).thenThrow(reportStreamException);
    when(repoMock.save(any())).thenReturn(csvResult);
    when(orgServiceMock.getCurrentOrganization()).thenReturn(org);

    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    ArgumentCaptor<String> stringCaptor = ArgumentCaptor.forClass(String.class);

    // when
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    var output = sut.processResultCSV(input);

    // then
    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    verify(dataHubMock).uploadFhir(stringCaptor.capture(), stringCaptor.capture());

    verify(repoMock, Mockito.times(1)).save(any());
    assertEquals(UploadStatus.PENDING, output.getStatus());
    assertEquals(output.getReportId(), csvReportId);
  }
}
