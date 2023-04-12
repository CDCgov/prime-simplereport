package gov.cdc.usds.simplereport.api.uploads;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.service.PatientBulkUploadService;
import gov.cdc.usds.simplereport.service.TestResultUploadService;
import java.io.IOException;
import java.io.InputStream;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(SpringExtension.class)
class FileUploadControllerTest {

  @Mock private PatientBulkUploadService patientBulkUploadService;
  @Mock private TestResultUploadService testResultUploadService;
  @Mock private FeatureFlagsConfig featureFlagsConfig;
  @InjectMocks private FileUploadController fileUploadController;

  @Test
  void handleHIVResultsUpload_successful() throws IOException {
    var file = mock(MultipartFile.class);
    var stream = mock(InputStream.class);
    when(featureFlagsConfig.isHivEnabled()).thenReturn(true);
    when(file.getContentType()).thenReturn("text/csv");
    when(file.getInputStream()).thenReturn(stream);

    fileUploadController.handleHIVResultsUpload(file);

    verify(testResultUploadService, times(1)).processUniversalResultCSV(stream);
  }

  @Test
  void handleHIVResultsUpload_handlesIoException() throws IOException {
    var file = mock(MultipartFile.class);
    when(featureFlagsConfig.isHivEnabled()).thenReturn(true);
    when(file.getContentType()).thenReturn("text/csv");
    when(file.getInputStream()).thenThrow(IOException.class);

    fileUploadController.handleHIVResultsUpload(file);
    assertThrows(
        CsvProcessingException.class, () -> fileUploadController.handleHIVResultsUpload(file));
  }

  @Test
  void handleHIVResultsUpload_throwsUnsupportedOperationException_whenHivIsDisabled() {
    when(featureFlagsConfig.isHivEnabled()).thenReturn(false);
    assertThrows(
        UnsupportedOperationException.class,
        () -> fileUploadController.handleHIVResultsUpload(null));
  }
}
