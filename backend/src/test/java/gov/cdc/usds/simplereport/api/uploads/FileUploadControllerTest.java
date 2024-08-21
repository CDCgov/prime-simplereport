package gov.cdc.usds.simplereport.api.uploads;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.service.TestResultUploadService;
import java.io.IOException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.multipart.MultipartFile;

@ExtendWith(SpringExtension.class)
class FileUploadControllerTest {

  @Mock private TestResultUploadService testResultUploadService;
  @Mock private FeatureFlagsConfig featureFlagsConfig;
  @InjectMocks private FileUploadController fileUploadController;

  // Test temporarily pulled out until we solve issue:
  // https://github.com/CDCgov/prime-simplereport/issues/7240

  @Test
  void handleResultsUpload_handlesIoException() throws IOException {
    var file = mock(MultipartFile.class);
    when(featureFlagsConfig.isHivEnabled()).thenReturn(true);
    when(file.getContentType()).thenReturn("text/csv");
    when(file.getInputStream()).thenThrow(IOException.class);

    assertThrows(
        CsvProcessingException.class, () -> fileUploadController.handleResultsUpload(file));
  }
}
