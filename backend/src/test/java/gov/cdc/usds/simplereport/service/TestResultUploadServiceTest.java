package gov.cdc.usds.simplereport.service;

import static com.github.tomakehurst.wiremock.client.WireMock.stubFor;
import static gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus.FAILURE;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.MappingIterator;
import com.github.tomakehurst.wiremock.client.WireMock;
import com.okta.commons.http.MediaType;
import feign.FeignException;
import feign.Request;
import feign.RequestTemplate;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.errors.DependencyFailureException;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.FHIRBundleRecord;
import gov.cdc.usds.simplereport.db.model.auxiliary.Pipeline;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.ResultUploadErrorRepository;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.db.repository.UploadDiseaseDetailsRepository;
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
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ExecutionException;
import org.jetbrains.annotations.NotNull;
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
  @Mock private UploadDiseaseDetailsRepository uploadDiseaseDetailsRepository;
  @Mock private OrganizationService orgServiceMock;
  @Mock private ResultsUploaderCachingService resultsUploaderCachingServiceMock;
  @Mock private TokenAuthentication tokenAuthMock;
  @Mock private FileValidator<TestResultRow> csvFileValidatorMock;
  @Mock private BulkUploadResultsToFhir bulkUploadFhirConverterMock;
  @Mock private DiseaseService diseaseService;
  @InjectMocks private TestResultUploadService sut;

  @BeforeEach()
  public void init() {
    initSampleData();
    ReflectionTestUtils.setField(sut, "processingModeCodeValue", "P");
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
  void feignGeneralError_returnsFailureStatus() {

    stubFor(
        WireMock.post(WireMock.urlEqualTo("/api/reports?processing=async"))
            .willReturn(
                WireMock.aResponse()
                    .withStatus(HttpStatus.INTERNAL_SERVER_ERROR.value())
                    .withHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                    .withBody("you messed up")));

    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");

    // catches Feign exception in covid pipeline and then throws JsonProcessingException ex which
    // then throws a DependencyFailureException
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
  void mockResponse_returnsPending() throws Exception {
    UploadResponse response = buildUploadResponse();

    // todo rewrite this test to be valid - we're just testing our mocks now
    var result =
        new TestResultUpload(
            response.getReportId(),
            UUID.randomUUID(),
            UploadStatus.PENDING,
            response.getReportItemCount(),
            orgServiceMock.getCurrentOrganization(),
            response.getWarnings(),
            response.getErrors(),
            Pipeline.COVID,
            null);

    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));

    when(csvFileValidatorMock.validate(any())).thenReturn(Collections.emptyList());
    when(dataHubMock.uploadCSV(any())).thenReturn(response);
    when(repoMock.save(any())).thenReturn(result);

    var output = sut.processResultCSV(input);
    assertNotNull(output.get(0).getReportId());
    assertEquals(UploadStatus.PENDING, output.get(0).getStatus());
  }

  @Test
  void mockResponse_returnsGatewayTimeout() {
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");

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
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));

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
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
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
  void uploadService_getUploadSubmission_fileInvalidData() throws Exception {
    // GIVEN
    InputStream invalidInput = new ByteArrayInputStream("invalid".getBytes());
    when(csvFileValidatorMock.validate(any()))
        .thenReturn(List.of(FeedbackMessage.builder().message("my lovely error message").build()));
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());

    // WHEN
    List<TestResultUpload> result = sut.processResultCSV(invalidInput);

    // THEN
    assertThat(result.get(0).getStatus()).isEqualTo(FAILURE);
    assertThat(result.get(0).getErrors()).hasSize(1);
    assertThat(result.get(0).getErrors()[0].getMessage()).isEqualTo("my lovely error message");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_getUploadSubmission_processingModeCode_NotSet() throws Exception {
    // GIVEN
    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    UploadResponse response = buildUploadResponse();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(dataHubMock.uploadCSV(any())).thenReturn(response);
    when(repoMock.save(any())).thenReturn(mock(TestResultUpload.class));
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));

    // WHEN
    sut.processResultCSV(input);

    // THEN
    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    String[] rows = new String(fileContentCaptor.getValue(), StandardCharsets.UTF_8).split("\n");
    assertThat(rows[0]).doesNotContain(",processing_mode_code");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_getUploadSubmission_processingModeCode_T() throws Exception {
    // GIVEN
    ReflectionTestUtils.setField(sut, "processingModeCodeValue", "T");
    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    UploadResponse response = buildUploadResponse();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(dataHubMock.uploadCSV(any())).thenReturn(response);
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));
    when(repoMock.save(any())).thenReturn(mock(TestResultUpload.class));

    // WHEN
    sut.processResultCSV(input);

    // THEN
    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    String[] rows = new String(fileContentCaptor.getValue(), StandardCharsets.UTF_8).split("\n");
    assertThat(rows[0]).endsWith(",\"processing_mode_code\"");
    assertThat(rows[1]).endsWith(",\"T\"");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_getUploadSubmission_processingModeCode_doesntOverrideFileValue()
      throws Exception {
    // GIVEN
    ReflectionTestUtils.setField(sut, "processingModeCodeValue", "T");
    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    UploadResponse response = buildUploadResponse();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(dataHubMock.uploadCSV(any())).thenReturn(response);
    when(repoMock.save(any())).thenReturn(mock(TestResultUpload.class));
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));

    InputStream input =
        loadCsv("testResultUpload/test-results-upload-valid-with-processingModeCode-D.csv");

    // WHEN
    sut.processResultCSV(input);

    // THEN
    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    String[] rows = new String(fileContentCaptor.getValue(), StandardCharsets.UTF_8).split("\n");
    assertThat(rows[0]).endsWith(",\"processing_mode_code\"");
    assertThat(rows[1]).endsWith(",\"D\"");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processCsv_translatesSpecimenNameToSNOMED() throws Exception {
    // GIVEN
    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    UploadResponse response = buildUploadResponse();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(dataHubMock.uploadCSV(any())).thenReturn(response);
    when(repoMock.save(any())).thenReturn(mock(TestResultUpload.class));
    when(resultsUploaderCachingServiceMock.getSpecimenTypeNameToSNOMEDMap())
        .thenReturn(Map.of("nasal swab", "000111222"));
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));

    // WHEN
    sut.processResultCSV(input);

    // THEN
    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    String[] rows = new String(fileContentCaptor.getValue(), StandardCharsets.UTF_8).split("\n");
    assertThat(rows).hasSize(2);
    var headerCount = Arrays.stream(rows[0].split(",")).toList().size();
    var row = rows[1];

    // if the last column is optional and empty/null this fails when it shouldn't
    assertThat(row.split(",")).hasSize(headerCount);
    assertThat(rows[1]).contains("000111222");
  }

  @Test
  void uploadService_UploadSentTwice() throws Exception {
    // given
    UploadResponse response = buildUploadResponse();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(dataHubMock.uploadCSV(any())).thenReturn(response);
    when(dataHubMock.uploadFhir(any(), any())).thenReturn(response);
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);

    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));
    when(repoMock.save(any())).thenReturn(mock(TestResultUpload.class));

    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    ArgumentCaptor<String> stringCaptor = ArgumentCaptor.forClass(String.class);

    // when
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    sut.processResultCSV(input);

    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    verify(dataHubMock).uploadFhir(stringCaptor.capture(), stringCaptor.capture());
  }

  @Test
  void uploadService_FhirFailure_ReportsCSVResult() throws Exception {
    // given
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
            UUID.randomUUID(),
            UploadStatus.PENDING,
            5,
            org,
            csvResponse.getWarnings(),
            csvResponse.getErrors(),
            Pipeline.UNIVERSAL,
            null);

    when(dataHubMock.uploadCSV(any())).thenReturn(csvResponse);
    when(dataHubMock.uploadFhir(any(), any())).thenReturn(fhirResponse);
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(repoMock.save(any())).thenReturn(csvResult);

    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(org);
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));

    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    ArgumentCaptor<String> stringCaptor = ArgumentCaptor.forClass(String.class);

    // when
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    var output = sut.processResultCSV(input);

    // then
    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    verify(dataHubMock).uploadFhir(stringCaptor.capture(), stringCaptor.capture());

    assertEquals(UploadStatus.PENDING, output.get(0).getStatus());
    assertEquals(output.get(0).getReportId(), csvReportId);
  }

  @Test
  void uploadService_FhirException_ReportsCSVResult() throws Exception {
    // given
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
            UUID.randomUUID(),
            UploadStatus.PENDING,
            5,
            org,
            successfulCsvResponse.getWarnings(),
            successfulCsvResponse.getErrors(),
            Pipeline.UNIVERSAL,
            null);

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
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(dataHubMock.uploadCSV(any())).thenReturn(successfulCsvResponse);
    when(dataHubMock.uploadFhir(any(), any())).thenThrow(reportStreamException);
    // this is creating a csvResult that comes back when the covid pipeline processing saves to the
    // DB, but
    // the csvResult incorrectly says it's "pending" and from the "Pipeline.UNIVERSAL" due to the
    // csvResult mock
    when(repoMock.save(any())).thenReturn(csvResult);
    when(orgServiceMock.getCurrentOrganization()).thenReturn(org);
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));

    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    ArgumentCaptor<String> stringCaptor = ArgumentCaptor.forClass(String.class);

    // when
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    assertThrows(ExecutionException.class, () -> sut.processResultCSV(input));

    // then
    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    verify(dataHubMock).uploadFhir(stringCaptor.capture(), stringCaptor.capture());
    verify(repoMock, Mockito.times(1)).save(any());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processCsv_handlesEscapedCommas_inPatientAndAOEValues() throws Exception {
    // GIVEN
    InputStream input =
        loadCsv("testResultUpload/test-results-upload-valid-with-escaped-commas.csv");
    setup_testResultsUpload_withEscapedCommas();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);

    // WHEN
    sut.processResultCSV(input);

    // THEN
    TestResultRow row = getRowFromUpload(dataHubMock);

    assertThat(row.getPatientId().getValue()).isEqualTo("1234");
    assertThat(row.getPatientLastName().getValue()).isEqualTo("Doe");
    assertThat(row.getPatientFirstName().getValue()).isEqualTo("Jane");
    assertThat(row.getPatientMiddleName().getValue()).isEmpty();
    assertThat(row.getPatientStreet().getValue()).isEqualTo("123 Main St");
    assertThat(row.getPatientStreet2().getValue()).isEmpty();
    assertThat(row.getPatientCity().getValue()).isEqualTo("Birmingham");
    assertThat(row.getPatientState().getValue()).isEqualTo("AL");
    assertThat(row.getPatientZipCode().getValue()).isEqualTo("35226");
    assertThat(row.getPatientCounty().getValue()).isEqualTo("Jefferson");
    assertThat(row.getPatientPhoneNumber().getValue()).isEqualTo("205-999-2800");
    assertThat(row.getPatientDob().getValue()).isEqualTo("1/20/1962");
    assertThat(row.getPatientGender().getValue()).isEqualTo("F");
    assertThat(row.getPatientRace().getValue()).isEqualTo("White");
    assertThat(row.getPatientEthnicity().getValue()).isEqualTo("Not Hispanic or Latino");
    assertThat(row.getPatientPreferredLanguage().getValue()).isEmpty();
    assertThat(row.getPatientEmail().getValue()).isEmpty();

    assertThat(row.getPregnant().getValue()).isEqualTo("N");
    assertThat(row.getEmployedInHealthcare().getValue()).isEqualTo("N");
    assertThat(row.getSymptomaticForDisease().getValue()).isEqualTo("N");
    assertThat(row.getIllnessOnsetDate().getValue()).isEmpty();
    assertThat(row.getResidentCongregateSetting().getValue()).isEqualTo("N");
    assertThat(row.getResidenceType().getValue()).isEmpty();
    assertThat(row.getHospitalized().getValue()).isEqualTo("N");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processCsv_handlesEscapedCommas_inTestResultValues() throws Exception {
    // GIVEN
    InputStream input =
        loadCsv("testResultUpload/test-results-upload-valid-with-escaped-commas.csv");
    setup_testResultsUpload_withEscapedCommas();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);

    // WHEN
    sut.processResultCSV(input);

    // THEN
    TestResultRow row = getRowFromUpload(dataHubMock);

    assertThat(row.getAccessionNumber().getValue()).isEqualTo("123");
    assertThat(row.getEquipmentModelName().getValue()).isEqualTo("ID NOW");
    assertThat(row.getTestPerformedCode().getValue()).isEqualTo("94534-5");
    assertThat(row.getTestResult().getValue()).isEqualTo("Detected");
    assertThat(row.getOrderTestDate().getValue()).isEqualTo("2021-12-20T04:00-08:00");
    assertThat(row.getSpecimenCollectionDate().getValue()).isEqualTo("2021-12-21T14:00-05:00");
    assertThat(row.getTestingLabSpecimenReceivedDate().getValue())
        .isEqualTo("2021-12-22T14:00-05:00");
    assertThat(row.getTestResultDate().getValue()).isEqualTo("2021-12-23T14:00-08:00");
    assertThat(row.getDateResultReleased().getValue()).isEqualTo("2021-12-24T14:00-05:00");
    assertThat(row.getSpecimenType().getValue()).isEqualTo("000111222");
    assertThat(row.getComment().getValue()).isEqualTo("Test Comment");
    assertThat(row.getTestResultStatus().getValue()).isEqualTo("F");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processCsv_handlesEscapedCommas_inOrderingProviderAndFacilityValues()
      throws Exception {
    // GIVEN
    InputStream input =
        loadCsv("testResultUpload/test-results-upload-valid-with-escaped-commas.csv");
    setup_testResultsUpload_withEscapedCommas();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);

    // WHEN
    sut.processResultCSV(input);

    // THEN
    TestResultRow row = getRowFromUpload(dataHubMock);

    assertThat(row.getOrderingProviderId().getValue()).isEqualTo("1013012657");
    assertThat(row.getOrderingProviderLastName().getValue()).isEqualTo("Smith MD");
    assertThat(row.getOrderingProviderFirstName().getValue()).isEqualTo("John");
    assertThat(row.getOrderingProviderMiddleName().getValue()).isEmpty();
    assertThat(row.getOrderingProviderStreet().getValue()).isEqualTo("400 Main Street");
    assertThat(row.getOrderingProviderStreet2().getValue()).isEmpty();
    assertThat(row.getOrderingProviderCity().getValue()).isEqualTo("Birmingham");
    assertThat(row.getOrderingProviderState().getValue()).isEqualTo("AL");
    assertThat(row.getOrderingProviderZipCode().getValue()).isEqualTo("35228");
    assertThat(row.getOrderingProviderPhoneNumber().getValue()).isEqualTo("205-888-2000");

    assertThat(row.getOrderingFacilityName().getValue()).isEqualTo("My Urgent Care");
    assertThat(row.getOrderingFacilityStreet().getValue()).isEqualTo("400 Main Street");
    assertThat(row.getOrderingFacilityStreet2().getValue()).isEqualTo("Suite 100");
    assertThat(row.getOrderingFacilityCity().getValue()).isEqualTo("Birmingham");
    assertThat(row.getOrderingFacilityState().getValue()).isEqualTo("AL");
    assertThat(row.getOrderingFacilityZipCode().getValue()).isEqualTo("35228");
    assertThat(row.getOrderingFacilityPhoneNumber().getValue()).isEqualTo("205-888-2000");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processCsv_handlesEscapedCommas_inTestingLabValues() throws Exception {
    // GIVEN
    InputStream input =
        loadCsv("testResultUpload/test-results-upload-valid-with-escaped-commas.csv");
    setup_testResultsUpload_withEscapedCommas();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);

    // WHEN
    sut.processResultCSV(input);

    // THEN
    TestResultRow row = getRowFromUpload(dataHubMock);

    assertThat(row.getTestingLabClia().getValue()).isEqualTo("01D1058442");
    assertThat(row.getTestingLabName().getValue()).isEqualTo("My Testing Lab, Downtown Office");
    assertThat(row.getTestingLabStreet().getValue()).isEqualTo("300 North Street");
    assertThat(row.getTestingLabStreet2().getValue()).isEmpty();
    assertThat(row.getTestingLabCity().getValue()).isEqualTo("Birmingham");
    assertThat(row.getTestingLabState().getValue()).isEqualTo("AL");
    assertThat(row.getTestingLabZipCode().getValue()).isEqualTo("35228");
    assertThat(row.getTestingLabPhoneNumber().getValue()).isEqualTo("205-888-2000");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processCsv_handlesDefaultDateTimeZone_withValidOrderingProviderAddress()
      throws Exception {
    // GIVEN
    ZoneId zoneId = ZoneId.of("US/Pacific");
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-default-dates.csv");
    UploadResponse response = buildUploadResponse();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(dataHubMock.uploadCSV(any())).thenReturn(response);
    when(resultsUploaderCachingServiceMock.getSpecimenTypeNameToSNOMEDMap())
        .thenReturn(Map.of("nasal swab", "000111222"));
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));
    StreetAddress providerAddress =
        new StreetAddress("400 Main Street", "", "Hayward", "CA", "94540", null);
    when(resultsUploaderCachingServiceMock.getZoneIdByAddress(providerAddress)).thenReturn(zoneId);
    when(repoMock.save(any())).thenReturn(mock(TestResultUpload.class));

    // WHEN
    sut.processResultCSV(input);

    // THEN
    TestResultRow row = getRowFromUpload(dataHubMock);
    String expectedTestResultDateTime =
        ZonedDateTime.of(2021, 12, 23, 12, 0, 0, 0, zoneId).toOffsetDateTime().toString();
    String expectedOrderTestDateTime =
        ZonedDateTime.of(2021, 12, 20, 12, 0, 0, 0, zoneId).toOffsetDateTime().toString();
    assertThat(row.getTestResultDate().getValue()).isEqualTo(expectedTestResultDateTime);
    assertThat(row.getOrderTestDate().getValue()).isEqualTo(expectedOrderTestDateTime);
    assertThat(row.getSpecimenCollectionDate().getValue()).isEqualTo(expectedOrderTestDateTime);
    assertThat(row.getTestingLabSpecimenReceivedDate().getValue())
        .isEqualTo(expectedOrderTestDateTime);
    assertThat(row.getDateResultReleased().getValue()).isEqualTo(expectedTestResultDateTime);
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processCsv_defaultsToEasternTimeZone_withInvalidOrderingProviderAddress()
      throws Exception {
    // GIVEN
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-default-dates.csv");
    UploadResponse response = buildUploadResponse();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(dataHubMock.uploadCSV(any())).thenReturn(response);
    when(resultsUploaderCachingServiceMock.getSpecimenTypeNameToSNOMEDMap())
        .thenReturn(Map.of("nasal swab", "000111222"));
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));
    StreetAddress providerAddress =
        new StreetAddress("400 Main Street", "", "Hayward", "CA", "94540", null);
    when(resultsUploaderCachingServiceMock.getZoneIdByAddress(providerAddress)).thenReturn(null);
    when(repoMock.save(any())).thenReturn(mock(TestResultUpload.class));

    // WHEN
    sut.processResultCSV(input);

    // THEN
    TestResultRow row = getRowFromUpload(dataHubMock);
    String expectedTestResultDateTime =
        ZonedDateTime.of(2021, 12, 23, 12, 0, 0, 0, ZoneId.of("US/Eastern"))
            .toOffsetDateTime()
            .toString();
    String expectedOrderTestDateTime =
        ZonedDateTime.of(2021, 12, 20, 12, 0, 0, 0, ZoneId.of("US/Eastern"))
            .toOffsetDateTime()
            .toString();
    assertThat(row.getTestResultDate().getValue()).isEqualTo(expectedTestResultDateTime);
    assertThat(row.getOrderTestDate().getValue()).isEqualTo(expectedOrderTestDateTime);
    assertThat(row.getSpecimenCollectionDate().getValue()).isEqualTo(expectedOrderTestDateTime);
    assertThat(row.getTestingLabSpecimenReceivedDate().getValue())
        .isEqualTo(expectedOrderTestDateTime);
    assertThat(row.getDateResultReleased().getValue()).isEqualTo(expectedTestResultDateTime);
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processResultCSV_defaultsToTestingLabAddress_whenNoOrderingFacilityAddress()
      throws Exception {
    // GIVEN
    InputStream input =
        loadCsv("testResultUpload/test-results-upload-valid-no-ordering-facility.csv");
    setup_testResultsUpload_withEscapedCommas();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);

    // WHEN
    sut.processResultCSV(input);

    // THEN
    TestResultRow row = getRowFromUpload(dataHubMock);

    assertThat(row.getOrderingFacilityName().getValue())
        .isEqualTo("My Testing Lab, Downtown Office");
    assertThat(row.getOrderingFacilityStreet().getValue()).isEqualTo("300 North Street");
    assertThat(row.getOrderingFacilityStreet2().getValue()).isEqualTo("Suite 5001");
    assertThat(row.getOrderingFacilityCity().getValue()).isEqualTo("Birmingham");
    assertThat(row.getOrderingFacilityState().getValue()).isEqualTo("AL");
    assertThat(row.getOrderingFacilityZipCode().getValue()).isEqualTo("35228");
    assertThat(row.getOrderingFacilityPhoneNumber().getValue()).isEqualTo("205-888-2000");
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processCsv_transforms_match_expected_csv() throws Exception {
    // GIVEN
    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    InputStream input =
        loadCsv("testResultUpload/test-results-upload-valid-with-escaped-commas.csv");
    UploadResponse response = buildUploadResponse();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(dataHubMock.uploadCSV(any())).thenReturn(response);
    when(resultsUploaderCachingServiceMock.getSpecimenTypeNameToSNOMEDMap())
        .thenReturn(Map.of("nasal swab", "000111222"));
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));
    when(repoMock.save(any())).thenReturn(mock(TestResultUpload.class));

    // WHEN
    sut.processResultCSV(input);

    // THEN
    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    var actualString = new String(fileContentCaptor.getValue(), StandardCharsets.UTF_8);

    var expectedStream =
        loadCsv(
            "testResultUpload/test-results-upload-valid-with-escaped-commas-expected-transform.csv");
    var expectedString = new String(expectedStream.readAllBytes());
    assertThat(actualString).isEqualTo(expectedString);
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processCsv_filter_out_non_covid_csv() throws Exception {
    // GIVEN
    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-with-flu-results.csv");
    UploadResponse response = buildUploadResponse();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(dataHubMock.uploadCSV(any())).thenReturn(response);
    when(resultsUploaderCachingServiceMock.getSpecimenTypeNameToSNOMEDMap())
        .thenReturn(Map.of("nasal swab", "000111222"));
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));
    when(repoMock.save(any())).thenReturn(mock(TestResultUpload.class));

    // WHEN
    sut.processResultCSV(input);

    // THEN
    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    var actualString = new String(fileContentCaptor.getValue(), StandardCharsets.UTF_8);

    var expectedStream =
        loadCsv(
            "testResultUpload/test-results-upload-valid-with-escaped-commas-expected-transform.csv");
    var expectedString = new String(expectedStream.readAllBytes());
    assertThat(actualString).isEqualTo(expectedString);
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processCsv_only_submit_fhir_when_flu_only_csv() throws Exception {
    // GIVEN
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-flu-only.csv");
    UploadResponse response = buildUploadResponse();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(dataHubMock.uploadFhir(anyString(), anyString())).thenReturn(response);
    when(resultsUploaderCachingServiceMock.getSpecimenTypeNameToSNOMEDMap())
        .thenReturn(Map.of("nasal swab", "000111222"));
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));
    when(repoMock.save(any())).thenReturn(mock(TestResultUpload.class));

    // WHEN
    sut.processResultCSV(input);

    // THEN
    verify(dataHubMock, never()).uploadCSV(any());
    verify(dataHubMock, times(1)).uploadFhir(anyString(), anyString());
  }

  @NotNull
  private static UploadResponse buildUploadResponse() {
    var response = new UploadResponse();
    response.setId(UUID.randomUUID());
    response.setOverallStatus(ReportStreamStatus.RECEIVED);
    response.setReportItemCount(5);
    response.setErrors(new FeedbackMessage[] {});
    response.setWarnings(new FeedbackMessage[] {});
    return response;
  }

  void setup_testResultsUpload_withEscapedCommas() {
    UploadResponse response = buildUploadResponse();
    when(dataHubMock.uploadCSV(any())).thenReturn(response);
    when(resultsUploaderCachingServiceMock.getSpecimenTypeNameToSNOMEDMap())
        .thenReturn(Map.of("nasal swab", "000111222"));
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));
    when(repoMock.save(any())).thenReturn(mock(TestResultUpload.class));
  }

  @NotNull
  private static TestResultRow getRowFromUpload(DataHubClient dataHubMock) {
    ArgumentCaptor<byte[]> fileContentCaptor = ArgumentCaptor.forClass(byte[].class);
    verify(dataHubMock).uploadCSV(fileContentCaptor.capture());
    String stringContent = new String(fileContentCaptor.getValue(), StandardCharsets.UTF_8);
    final MappingIterator<Map<String, String>> valueIterator =
        getIteratorForCsv(new ByteArrayInputStream(stringContent.getBytes(StandardCharsets.UTF_8)));
    return new TestResultRow(getNextRow(valueIterator));
  }
}
