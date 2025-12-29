package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus.FAILURE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.errors.AimsUploadException;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.HL7BatchMessage;
import gov.cdc.usds.simplereport.db.model.auxiliary.Pipeline;
import gov.cdc.usds.simplereport.db.repository.ResultUploadErrorRepository;
import gov.cdc.usds.simplereport.db.repository.TestResultUploadRepository;
import gov.cdc.usds.simplereport.db.repository.UploadDiseaseDetailsRepository;
import gov.cdc.usds.simplereport.service.errors.InvalidBulkTestResultUploadException;
import gov.cdc.usds.simplereport.service.model.S3UploadResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.utils.BulkUploadResultsToFhir;
import gov.cdc.usds.simplereport.utils.BulkUploadResultsToHL7;
import gov.cdc.usds.simplereport.validators.FileValidator;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@EnableConfigurationProperties
@ExtendWith(SpringExtension.class)
@AutoConfigureWireMock(port = 9561)
class TestResultUploadServiceTest extends BaseServiceTest<TestResultUploadService> {
  @Autowired private TestDataFactory factory;
  @Mock private DataHubClient dataHubMock;
  @Mock private TestResultUploadRepository repoMock;
  @Mock private OrganizationService orgServiceMock;
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
  @SliceTestConfiguration.WithSimpleReportStandardUser
  void uploadService_processCsv_aimsEnabled_invokesHl7Conversion_andSavesResults()
      throws Exception {
    // GIVEN
    when(featureFlagsConfig.isAimsReportingEnabled()).thenReturn(true);

    when(csvFileValidatorMock.validate(any())).thenReturn(Collections.emptyList());
    Organization org = factory.saveValidOrganization();
    when(orgServiceMock.getCurrentOrganization()).thenReturn(org);

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
    assertEquals(1, result.size());
    verify(bulkUploadHl7ConverterMock, times(1)).convertToHL7BatchMessage(any());
    verify(bulkUploadFhirConverterMock, never()).convertToFhirBundles(any(), any());
    verify(dataHubMock, never()).uploadFhir(anyString(), anyString());
    verify(dataHubMock, never()).uploadCSV(any());

    verify(aimsReportingServiceMock, times(1)).sendBatchMessageToAims(any(), any(), anyInt());

    verify(repoMock, times(1)).save(truCaptor.capture());
    var savedPipelines =
        truCaptor.getAllValues().stream().map(TestResultUpload::getDestination).toList();
    assertThat(savedPipelines).contains(Pipeline.AIMS);
    assertThat(savedPipelines).doesNotContain(Pipeline.UNIVERSAL, Pipeline.COVID);
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
    assertEquals(1, result.size()); // Both AIMS and Universal pipeline results
    verify(bulkUploadHl7ConverterMock, times(1)).convertToHL7BatchMessage(any());
    verify(bulkUploadFhirConverterMock, never()).convertToFhirBundles(any(), any());

    // ensure we did not attempt to call ReportStream
    verify(dataHubMock, never()).uploadCSV(any());
    verify(dataHubMock, never()).uploadFhir(anyString(), anyString());

    verify(repoMock, times(1)).save(truCaptor.capture());
    var savedPipelines =
        truCaptor.getAllValues().stream().map(TestResultUpload::getDestination).toList();
    assertThat(savedPipelines).contains(Pipeline.AIMS);
    assertThat(savedPipelines).doesNotContain(Pipeline.UNIVERSAL, Pipeline.COVID);
  }

  private InputStream loadCsv(String csvFile) {
    return TestResultUploadService.class.getClassLoader().getResourceAsStream(csvFile);
  }

  @NotNull
  private static S3UploadResponse buildSuccessfulS3UploadResponse() {
    return new S3UploadResponse(UUID.randomUUID(), 3, null);
  }
}
