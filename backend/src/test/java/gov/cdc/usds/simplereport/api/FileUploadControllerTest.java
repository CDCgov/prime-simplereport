package gov.cdc.usds.simplereport.api;

import static gov.cdc.usds.simplereport.api.uploads.FileUploadController.TEXT_CSV_CONTENT_TYPE;
import static gov.cdc.usds.simplereport.config.WebConfiguration.PATIENT_UPLOAD;
import static gov.cdc.usds.simplereport.config.WebConfiguration.RESULT_UPLOAD;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.uploads.PatientBulkUploadResponse;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.Pipeline;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.service.PatientBulkUploadService;
import gov.cdc.usds.simplereport.service.TestResultUploadService;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.UUID;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

class FileUploadControllerTest extends BaseFullStackTest {

  @Autowired private MockMvc mockMvc;
  @MockBean private PatientBulkUploadService patientBulkUploadService;
  @MockBean private TestResultUploadService testResultUploadService;
  @MockBean private FeatureFlagsConfig _featureFlagsConfig;

  @Test
  void patientsUploadTest_happy() throws Exception {
    PatientBulkUploadResponse success = new PatientBulkUploadResponse();
    success.setStatus(UploadStatus.SUCCESS);

    when(patientBulkUploadService.processPersonCSV(any(InputStream.class), any()))
        .thenReturn(success);

    MockMultipartFile file =
        new MockMultipartFile(
            "file", "patients.csv", TEXT_CSV_CONTENT_TYPE, "csvContent".getBytes());

    mockMvc
        .perform(multipart(PATIENT_UPLOAD).file(file).param("rawFacilityId", ""))
        .andExpect(status().isOk())
        .andExpect(content().string("{\"errors\":null,\"status\":\"SUCCESS\"}"));
  }

  @Test
  void patientsUploadTest_IllegalArgumentException() throws Exception {
    when(patientBulkUploadService.processPersonCSV(any(InputStream.class), any()))
        .thenThrow(new IllegalArgumentException("Invalid csv"));

    MockMultipartFile file =
        new MockMultipartFile(
            "file", "patients.csv", TEXT_CSV_CONTENT_TYPE, "csvContent".getBytes());

    mockMvc
        .perform(multipart(PATIENT_UPLOAD).file(file).param("rawFacilityId", ""))
        .andExpect(status().isBadRequest())
        .andExpect(
            result -> assertTrue(result.getResolvedException() instanceof CsvProcessingException))
        .andExpect(
            result ->
                assertEquals(
                    "Unable to complete patient CSV upload due to an invalid input.",
                    result.getResolvedException().getMessage()));
  }

  @Test
  void patientsUploadTest_NonCsvFileException() throws Exception {
    when(patientBulkUploadService.processPersonCSV(any(InputStream.class), any()))
        .thenThrow(new IllegalArgumentException("Invalid csv"));

    MockMultipartFile file =
        new MockMultipartFile(
            "file", "patients.csv", MediaType.TEXT_PLAIN_VALUE, "csvContent".getBytes());

    mockMvc
        .perform(multipart(PATIENT_UPLOAD).file(file).param("rawFacilityId", ""))
        .andExpect(status().isBadRequest())
        .andExpect(
            result -> assertTrue(result.getResolvedException() instanceof CsvProcessingException))
        .andExpect(
            result ->
                assertEquals(
                    "Only CSV files are supported", result.getResolvedException().getMessage()));
  }

  @Test
  void patientsUploadTest_IOException() throws Exception {
    MockMultipartFile mock = mock(MockMultipartFile.class);
    when(mock.getBytes()).thenReturn("content".getBytes());
    when(mock.getOriginalFilename()).thenReturn("patients.csv");
    when(mock.getName()).thenReturn("file");
    when(mock.getSize()).thenReturn(7L);
    when(mock.getContentType()).thenReturn(TEXT_CSV_CONTENT_TYPE);

    when(mock.getInputStream()).thenThrow(new IOException());

    mockMvc
        .perform(multipart(PATIENT_UPLOAD).file(mock).param("rawFacilityId", ""))
        .andExpect(status().isBadRequest())
        .andExpect(
            result -> assertTrue(result.getResolvedException() instanceof CsvProcessingException))
        .andExpect(
            result ->
                assertEquals(
                    "Unable to complete patient CSV upload",
                    result.getResolvedException().getMessage()));
  }

  @Test
  void patientsUploadTest_acceptsUUIDForFacilityId() throws Exception {
    PatientBulkUploadResponse success = new PatientBulkUploadResponse();
    success.setStatus(UploadStatus.SUCCESS);

    when(patientBulkUploadService.processPersonCSV(any(InputStream.class), any(UUID.class)))
        .thenReturn(success);

    MockMultipartFile file =
        new MockMultipartFile(
            "file", "patients.csv", TEXT_CSV_CONTENT_TYPE, "csvContent".getBytes());

    UUID testUUID = UUID.randomUUID();
    mockMvc
        .perform(multipart(PATIENT_UPLOAD).file(file).param("rawFacilityId", testUUID.toString()))
        .andExpect(status().isOk())
        .andExpect(content().string("{\"errors\":null,\"status\":\"SUCCESS\"}"));
  }

  @Test
  void patientsUploadTest_rejectsInvalidUUIDForFacilityId() throws Exception {
    MockMultipartFile file =
        new MockMultipartFile(
            "file", "patients.csv", TEXT_CSV_CONTENT_TYPE, "csvContent".getBytes());

    mockMvc
        .perform(multipart(PATIENT_UPLOAD).file(file).param("rawFacilityId", "12"))
        .andExpect(status().isBadRequest())
        .andExpect(
            result -> assertTrue(result.getResolvedException() instanceof BadRequestException))
        .andExpect(
            result ->
                assertEquals("Invalid facility id", result.getResolvedException().getMessage()));
  }

  @Test
  void resultsUploadTest() throws Exception {
    UUID reportId = UUID.randomUUID();

    Organization organization = new Organization("best org", "lab", "best-org-123", true);
    TestResultUpload testResultUpload =
        new TestResultUpload(
            reportId,
            UUID.randomUUID(),
            UploadStatus.SUCCESS,
            5,
            organization,
            null,
            null,
            Pipeline.UNIVERSAL,
            null,
            null);
    when(testResultUploadService.processResultCSV(any(InputStream.class)))
        .thenReturn(List.of(testResultUpload));

    MockMultipartFile file =
        new MockMultipartFile(
            "file", "results.csv", TEXT_CSV_CONTENT_TYPE, "csvContent".getBytes());

    mockMvc
        .perform(multipart(RESULT_UPLOAD).file(file))
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.[0].reportId", Matchers.is(reportId.toString())))
        .andExpect(jsonPath("$.[0].status", Matchers.is("SUCCESS")))
        .andExpect(jsonPath("$.[0].recordsCount", Matchers.is(5)))
        .andReturn();
  }

  @Test
  void resultsUploadTest_IOException() throws Exception {
    MockMultipartFile mock = mock(MockMultipartFile.class);
    when(mock.getBytes()).thenReturn("content".getBytes());
    when(mock.getOriginalFilename()).thenReturn("results.csv");
    when(mock.getName()).thenReturn("file");
    when(mock.getSize()).thenReturn(7L);
    when(mock.getContentType()).thenReturn(TEXT_CSV_CONTENT_TYPE);

    when(mock.getInputStream()).thenThrow(new IOException());

    mockMvc
        .perform(multipart(RESULT_UPLOAD).file(mock))
        .andExpect(status().isBadRequest())
        .andExpect(
            result -> assertTrue(result.getResolvedException() instanceof CsvProcessingException))
        .andExpect(
            result ->
                assertEquals(
                    "Unable to process test result CSV upload",
                    result.getResolvedException().getMessage()));
  }

  @Test
  void resultsUploadTest_NonCsvFileException() throws Exception {
    MockMultipartFile mock = mock(MockMultipartFile.class);
    when(mock.getBytes()).thenReturn("content".getBytes());
    when(mock.getOriginalFilename()).thenReturn("results.csv");
    when(mock.getName()).thenReturn("file");
    when(mock.getSize()).thenReturn(7L);
    when(mock.getContentType()).thenReturn(MediaType.TEXT_PLAIN_VALUE);

    when(mock.getInputStream()).thenThrow(new IOException());

    mockMvc
        .perform(multipart(RESULT_UPLOAD).file(mock))
        .andExpect(status().isBadRequest())
        .andExpect(
            result -> assertTrue(result.getResolvedException() instanceof CsvProcessingException))
        .andExpect(
            result ->
                assertEquals(
                    "Only CSV files are supported", result.getResolvedException().getMessage()));
  }

  @Test
  void resultsUploadTest_FeatureDisabled() throws Exception {
    when(_featureFlagsConfig.isBulkUploadDisabled()).thenReturn(true);
    MockMultipartFile file =
        new MockMultipartFile(
            "file", "results.csv", TEXT_CSV_CONTENT_TYPE, "csvContent".getBytes());

    mockMvc
        .perform(multipart(RESULT_UPLOAD).file(file))
        .andExpect(status().isInternalServerError())
        .andExpect(result -> assertNotNull(result.getResolvedException()))
        .andExpect(
            result ->
                assertEquals(
                    "Bulk upload feature is temporarily disabled.",
                    result.getResolvedException().getMessage()))
        .andReturn();
  }
}
