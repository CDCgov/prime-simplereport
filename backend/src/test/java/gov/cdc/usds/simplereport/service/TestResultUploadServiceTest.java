package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus.FAILURE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import feign.FeignException;
import feign.Request;
import feign.RequestTemplate;
import gov.cdc.usds.simplereport.api.model.errors.AimsUploadException;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.FHIRBundleRecord;
import gov.cdc.usds.simplereport.db.model.auxiliary.HL7BatchMessage;
import gov.cdc.usds.simplereport.db.model.auxiliary.Pipeline;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.db.repository.ResultUploadErrorRepository;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.db.repository.UploadDiseaseDetailsRepository;
import gov.cdc.usds.simplereport.service.errors.InvalidBulkTestResultUploadException;
import gov.cdc.usds.simplereport.service.model.S3UploadResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.service.model.reportstream.ReportStreamStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.TokenResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.utils.BulkUploadResultsToFhir;
import gov.cdc.usds.simplereport.utils.BulkUploadResultsToHL7;
import gov.cdc.usds.simplereport.utils.TokenAuthentication;
import gov.cdc.usds.simplereport.validators.FileValidator;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
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
  @Mock private ResultsUploaderCachingService resultsUploaderCachingServiceMock;
  @Mock private TokenAuthentication tokenAuthMock;
  @Mock private FileValidator<TestResultRow> csvFileValidatorMock;
  @Mock private BulkUploadResultsToFhir bulkUploadFhirConverterMock;
  @Mock private BulkUploadResultsToHL7 bulkUploadHl7ConverterMock;
  @Mock private FeatureFlagsConfig featureFlagsConfig;
  @Mock private AimsReportingService aimsReportingServiceMock;
  // counter to what intellij is telling me these last two mocks are used / necessary
  @Mock private ResultUploadErrorRepository errorRepoMock;
  @Mock private UploadDiseaseDetailsRepository uploadDiseaseDetailsRepository;
  @InjectMocks private TestResultUploadService sut;

  @BeforeEach()
  public void init() {
    initSampleData();
    when(featureFlagsConfig.isAimsReportingEnabled()).thenReturn(false);
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
  @SliceTestConfiguration.WithSimpleReportEntryOnlyUser
  void unauthorizedUser_NotAuthorizedResponse() throws IOException {
    try (InputStream input = loadCsv("test-upload-test-results.csv")) {
      assertThrows(AccessDeniedException.class, () -> this._service.processResultCSV(input));
    }
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
    Organization org = factory.saveValidOrganization();
    when(orgServiceMock.getCurrentOrganization()).thenReturn(org);
    var testResultUpload = factory.createTestResultUpload(reportId, UploadStatus.PENDING, org);

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
    assertEquals(1, result.size());
    assertThat(result.get(0).getStatus()).isEqualTo(FAILURE);
    assertThat(result.get(0).getErrors()).hasSize(1);
    assertThat(result.get(0).getErrors()[0].getMessage()).isEqualTo("my lovely error message");
  }

  @Test
  void uploadService_processCsv_ToCovidAndUniversalPipelines_Success() throws Exception {
    // given
    UploadResponse successfulResponse = buildSuccessfulUploadResponse();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    when(dataHubMock.uploadFhir(any(), any())).thenReturn(successfulResponse);
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);

    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));
    when(repoMock.save(any())).thenReturn(mock(TestResultUpload.class));

    ArgumentCaptor<String> stringCaptor = ArgumentCaptor.forClass(String.class);

    // when
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    var output = sut.processResultCSV(input);

    assertEquals(1, output.size());
    verify(dataHubMock).uploadFhir(stringCaptor.capture(), stringCaptor.capture());
  }

  @Test
  void uploadService_processCsv_ParseableUniversalPipelineFailure_ReturnsResult() throws Exception {
    // given
    var org = factory.saveValidOrganization();
    var csvReportId = UUID.randomUUID();
    var universalPipelineUploadError = new UploadResponse();
    universalPipelineUploadError.setId(UUID.randomUUID());
    universalPipelineUploadError.setOverallStatus(ReportStreamStatus.ERROR);
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    var universalPipelineDbSaveResponse =
        new TestResultUpload(
            csvReportId,
            UUID.randomUUID(),
            UploadStatus.FAILURE,
            5,
            org,
            universalPipelineUploadError.getWarnings(),
            universalPipelineUploadError.getErrors(),
            Pipeline.UNIVERSAL,
            null,
            false);

    when(dataHubMock.uploadFhir(any(), any())).thenReturn(universalPipelineUploadError);
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(repoMock.save(any())).thenReturn(universalPipelineDbSaveResponse);

    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(org);
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));

    ArgumentCaptor<String> stringCaptor = ArgumentCaptor.forClass(String.class);

    // when
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    List<TestResultUpload> output = sut.processResultCSV(input);

    // then
    assertEquals(1, output.size());
    TestResultUpload covidResult =
        output.stream()
            .filter(result -> result.getDestination().equals(Pipeline.COVID))
            .findFirst()
            .orElse(null);
    TestResultUpload universalResult =
        output.stream()
            .filter(result -> result.getDestination().equals(Pipeline.UNIVERSAL))
            .findFirst()
            .get();
    assertNull(covidResult);
    assertEquals(UploadStatus.FAILURE, universalResult.getStatus());
    verify(dataHubMock).uploadFhir(stringCaptor.capture(), stringCaptor.capture());
  }

  @Test
  void uploadService_processCsv_ParseableCovidPipelineFailure_ReturnsResult() throws Exception {
    // given
    var org = factory.saveValidOrganization();
    var csvReportId = UUID.randomUUID();
    var universalPipelineUploadError = new UploadResponse();
    universalPipelineUploadError.setId(UUID.randomUUID());
    universalPipelineUploadError.setOverallStatus(ReportStreamStatus.RECEIVED);
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");

    var universalPipelineDbSaveResponse =
        new TestResultUpload(
            csvReportId,
            UUID.randomUUID(),
            UploadStatus.PENDING,
            5,
            org,
            universalPipelineUploadError.getWarnings(),
            universalPipelineUploadError.getErrors(),
            Pipeline.UNIVERSAL,
            null,
            null);

    when(dataHubMock.uploadFhir(any(), any())).thenReturn(universalPipelineUploadError);
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(repoMock.save(any())).thenReturn(universalPipelineDbSaveResponse);

    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(org);
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));

    ArgumentCaptor<String> stringCaptor = ArgumentCaptor.forClass(String.class);

    // when
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    List<TestResultUpload> output = sut.processResultCSV(input);

    // then
    assertEquals(1, output.size());
    TestResultUpload covidResult =
        output.stream()
            .filter(result -> result.getDestination().equals(Pipeline.COVID))
            .findFirst()
            .orElse(null);
    TestResultUpload universalResult =
        output.stream()
            .filter(result -> result.getDestination().equals(Pipeline.UNIVERSAL))
            .findFirst()
            .get();
    assertNull(covidResult);
    assertEquals(UploadStatus.PENDING, universalResult.getStatus());
    verify(dataHubMock).uploadFhir(stringCaptor.capture(), stringCaptor.capture());
  }

  @Test
  void uploadService_processCsv_UnparseableUniversalPipelineFailure_ThrowsExecutionException() {
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
            null,
            false);

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
    when(dataHubMock.uploadFhir(any(), any())).thenThrow(reportStreamException);
    when(repoMock.save(any())).thenReturn(csvResult);
    when(orgServiceMock.getCurrentOrganization()).thenReturn(org);
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));

    ArgumentCaptor<String> stringCaptor = ArgumentCaptor.forClass(String.class);

    // when
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    assertThrows(ExecutionException.class, () -> sut.processResultCSV(input));

    // then
    // not actually doing anything with the capture, should we be using something else?
    verify(dataHubMock).uploadFhir(stringCaptor.capture(), stringCaptor.capture());
    verify(repoMock, Mockito.times(0)).save(any());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processCsv_only_submit_fhir_when_flu_only_csv() throws Exception {
    // GIVEN
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-flu-only.csv");
    UploadResponse successfulResponse = buildSuccessfulUploadResponse();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());
    when(dataHubMock.uploadFhir(anyString(), anyString())).thenReturn(successfulResponse);
    when(resultsUploaderCachingServiceMock.getSpecimenTypeNameToSNOMEDMap())
        .thenReturn(Map.of("nasal swab", "000111222"));
    when(resultsUploaderCachingServiceMock.getCovidEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of(ResultsUploaderCachingService.getKey("ID NOW", "94534-5")));
    when(repoMock.save(any())).thenReturn(mock(TestResultUpload.class));

    // WHEN
    var output = sut.processResultCSV(input);

    // THEN
    assertEquals(1, output.size());
    verify(dataHubMock, never()).uploadCSV(any());
    verify(dataHubMock, times(1)).uploadFhir(anyString(), anyString());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processCsv_aimsEnabled_invokesHl7Conversion_andSavesResults()
      throws Exception {
    // GIVEN
    when(featureFlagsConfig.isAimsReportingEnabled()).thenReturn(true);

    when(csvFileValidatorMock.validate(any())).thenReturn(Collections.emptyList());
    Organization org = factory.saveValidOrganization();
    when(orgServiceMock.getCurrentOrganization()).thenReturn(org);

    // Set up FHIR path success
    UploadResponse successfulResponse = buildSuccessfulUploadResponse();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("bundle"), new HashMap<>()));
    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(dataHubMock.uploadFhir(anyString(), anyString())).thenReturn(successfulResponse);

    // Set up HL7 path success
    S3UploadResponse successfulAimsResponse = buildSuccessfulS3UploadResponse();
    when(bulkUploadHl7ConverterMock.convertToHL7BatchMessage(any()))
        .thenReturn(new HL7BatchMessage("TEST_BATCH_MESSAGE", 1, new HashMap<>()));
    when(aimsReportingServiceMock.sendBatchMessageToAims(any(), any(), anyInt()))
        .thenReturn(successfulAimsResponse);

    // Capture DB saves
    ArgumentCaptor<TestResultUpload> truCaptor = ArgumentCaptor.forClass(TestResultUpload.class);
    when(repoMock.save(any())).thenReturn(mock(TestResultUpload.class));

    // WHEN
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    List<TestResultUpload> result = sut.processResultCSV(input);

    // THEN
    assertEquals(2, result.size());
    verify(bulkUploadHl7ConverterMock, times(1)).convertToHL7BatchMessage(any());
    verify(bulkUploadFhirConverterMock, times(1)).convertToFhirBundles(any(), any());
    verify(dataHubMock, times(1)).uploadFhir(anyString(), anyString());
    verify(dataHubMock, never()).uploadCSV(any());

    verify(aimsReportingServiceMock, times(1)).sendBatchMessageToAims(any(), any(), anyInt());

    verify(repoMock, times(2)).save(truCaptor.capture());
    var savedPipelines =
        truCaptor.getAllValues().stream().map(TestResultUpload::getDestination).toList();
    assertThat(savedPipelines).contains(Pipeline.UNIVERSAL).contains(Pipeline.AIMS);
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processCsv_aimsDisabled_doesNotInvokeHl7Conversion() throws Exception {
    // GIVEN
    when(featureFlagsConfig.isAimsReportingEnabled()).thenReturn(false);
    when(csvFileValidatorMock.validate(any())).thenReturn(Collections.emptyList());
    when(orgServiceMock.getCurrentOrganization()).thenReturn(factory.saveValidOrganization());

    UploadResponse successfulResponse = buildSuccessfulUploadResponse();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a"), new HashMap<>()));
    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(dataHubMock.uploadFhir(anyString(), anyString())).thenReturn(successfulResponse);
    when(repoMock.save(any())).thenReturn(mock(TestResultUpload.class));

    // WHEN
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    List<TestResultUpload> result = sut.processResultCSV(input);

    // THEN
    assertEquals(1, result.size());
    verify(bulkUploadHl7ConverterMock, never()).convertToHL7BatchMessage(any());
    verify(bulkUploadFhirConverterMock, times(1)).convertToFhirBundles(any(), any());
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processCsv_aimsEnabled_sendToAimsFailure_returnsSavedResult()
      throws Exception {
    // GIVEN
    when(featureFlagsConfig.isAimsReportingEnabled()).thenReturn(true);

    when(csvFileValidatorMock.validate(any())).thenReturn(Collections.emptyList());
    Organization testOrg = factory.saveValidOrganization();
    when(orgServiceMock.getCurrentOrganization()).thenReturn(testOrg);

    // Set up FHIR path success
    UploadResponse successfulResponse = buildSuccessfulUploadResponse();
    var tokenResponse = new TokenResponse();
    tokenResponse.setAccessToken("fake-rs-access-token");
    when(dataHubMock.fetchAccessToken(anyString())).thenReturn(tokenResponse);
    when(bulkUploadFhirConverterMock.convertToFhirBundles(any(), any()))
        .thenReturn(new FHIRBundleRecord(List.of("a", "b", "c"), new HashMap<>()));
    when(tokenAuthMock.createRSAJWT(anyString(), anyString(), any(Date.class), anyString()))
        .thenReturn("fake-rs-sender-token");
    when(dataHubMock.uploadFhir(anyString(), anyString())).thenReturn(successfulResponse);

    // Set up HL7 conversion success
    when(bulkUploadHl7ConverterMock.convertToHL7BatchMessage(any()))
        .thenReturn(new HL7BatchMessage("TEST_BATCH_MESSAGE", 1, new HashMap<>()));

    // Encounter error while sending to AIMS
    when(aimsReportingServiceMock.sendBatchMessageToAims(any(), any(), anyInt()))
        .thenThrow(new AimsUploadException("Uploading to AIMS failed"));

    // Capture DB saves
    ArgumentCaptor<TestResultUpload> truCaptor = ArgumentCaptor.forClass(TestResultUpload.class);
    when(repoMock.save(any())).thenReturn(mock(TestResultUpload.class));

    // WHEN
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    List<TestResultUpload> result = sut.processResultCSV(input);

    // THEN
    assertEquals(2, result.size()); // Both AIMS and Universal pipeline results
    verify(bulkUploadHl7ConverterMock, times(1)).convertToHL7BatchMessage(any());
    verify(bulkUploadFhirConverterMock, times(1)).convertToFhirBundles(any(), any());

    // ensure we did not attempt to call ReportStream CSV path
    verify(dataHubMock, never()).uploadCSV(any());
    verify(dataHubMock, times(1)).uploadFhir(anyString(), anyString());

    verify(repoMock, times(2)).save(truCaptor.capture());
    var savedPipelines =
        truCaptor.getAllValues().stream().map(TestResultUpload::getDestination).toList();
    assertThat(savedPipelines).contains(Pipeline.UNIVERSAL).contains(Pipeline.AIMS);
  }

  private InputStream loadCsv(String csvFile) {
    return TestResultUploadService.class.getClassLoader().getResourceAsStream(csvFile);
  }

  @NotNull
  private static UploadResponse buildSuccessfulUploadResponse() {
    var response = new UploadResponse();
    response.setId(UUID.randomUUID());
    response.setOverallStatus(ReportStreamStatus.RECEIVED);
    response.setReportItemCount(5);
    response.setErrors(new FeedbackMessage[] {});
    response.setWarnings(new FeedbackMessage[] {});
    return response;
  }

  @NotNull
  private static S3UploadResponse buildSuccessfulS3UploadResponse() {
    return new S3UploadResponse(UUID.randomUUID(), 3, null);
  }
}
