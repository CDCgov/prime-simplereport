package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.uploads.PatientBulkUploadResponse;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.io.IOException;
import java.io.InputStream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SliceTestConfiguration.WithSimpleReportStandardAllFacilitiesUser
class PatientBulkUploadServiceTest extends BaseServiceTest<PatientBulkUploadService> {

  @MockitoBean private PatientBulkUploadServiceAsync mockAsyncService;
  @MockitoBean private PersonService mockPersonService;
  @MockitoBean protected AddressValidationService addressValidationService;

  @BeforeEach
  void setupData() {
    initSampleData();
    when(addressValidationService.getValidatedAddress(any(), any(), any(), any(), any()))
        .thenReturn(new StreetAddress("123 Main Street", null, "Washington", "DC", "20008", null));
  }

  @Test
  void validCsv_returnsSuccessToUser() {
    // GIVEN
    InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");

    // WHEN
    PatientBulkUploadResponse response = this._service.processPersonCSV(inputStream, null);

    // THEN
    assertThat(response.getStatus()).isEqualTo(UploadStatus.SUCCESS);
    verify(mockAsyncService, times(1)).savePatients(any(), any());
  }

  @Test
  void exceptionDuringSave_doesNotPopulateToUser() {
    // GIVEN
    InputStream inputStream = loadCsv("patientBulkUpload/valid.csv");
    doThrow(new IllegalStateException("database unavailable"))
        .when(mockPersonService)
        .addPatientsAndPhoneNumbers(any(), any());

    // WHEN
    PatientBulkUploadResponse response = this._service.processPersonCSV(inputStream, null);

    // THEN
    assertThat(response.getStatus()).isEqualTo(UploadStatus.SUCCESS);
  }

  @Test
  void missingHeaders_returnsError() {
    // GIVEN
    InputStream inputStream = loadCsv("patientBulkUpload/missingHeaders.csv");

    // WHEN
    PatientBulkUploadResponse response = this._service.processPersonCSV(inputStream, null);

    // THEN
    assertThat(response.getStatus()).isEqualTo(UploadStatus.FAILURE);
    assertThat(response.getErrors()).isNotEmpty();
    verify(mockAsyncService, times(0)).savePatients(any(), any());
  }

  @Test
  void invalidData_returnsError() {
    // GIVEN
    InputStream inputStream = loadCsv("patientBulkUpload/missingRequiredFields.csv");

    // WHEN
    PatientBulkUploadResponse response = this._service.processPersonCSV(inputStream, null);

    // THEN
    assertThat(response.getStatus()).isEqualTo(UploadStatus.FAILURE);
    assertThat(response.getErrors()).isNotEmpty();
    verify(mockAsyncService, times(0)).savePatients(any(), any());
  }

  @Test
  void readingInputStream_throwsExceptionWithoutPii() throws IOException {
    // GIVEN
    InputStream inputStream = mock(InputStream.class);
    IOException thrownException = new IOException("the message with PII");

    // WHEN
    when(inputStream.readAllBytes()).thenThrow(thrownException);

    // THEN
    CsvProcessingException caught =
        assertThrows(
            CsvProcessingException.class,
            () -> {
              this._service.processPersonCSV(inputStream, null);
            });
    assertNotEquals("the message with PII", caught.getMessage());
    assertEquals("Unable to read csv", caught.getMessage());
    assertEquals("readAllBytes", caught.getStackTrace()[0].getMethodName());
    assertEquals("InputStream.java", caught.getStackTrace()[0].getFileName());
    assertEquals(346, caught.getStackTrace()[0].getLineNumber());
    verify(mockAsyncService, times(0)).savePatients(any(), any());
  }

  private InputStream loadCsv(String csvFile) {
    return PatientBulkUploadServiceTest.class.getClassLoader().getResourceAsStream(csvFile);
  }
}
