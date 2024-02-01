package gov.cdc.usds.simplereport.api.uploads;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.db.model.TestResultUpload;
import gov.cdc.usds.simplereport.db.model.auxiliary.Pipeline;
import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.service.TestResultUploadService;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.io.IOException;
import java.io.InputStream;
import java.util.UUID;
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

  @Test
  void handleHIVResultsUpload_successful() throws IOException {
    var file = mock(MultipartFile.class);
    var stream = mock(InputStream.class);
    FeedbackMessage[] empty = {};
    var expected =
        TestResultUpload.builder()
            .reportId(UUID.randomUUID())
            .submissionId(UUID.randomUUID())
            .status(UploadStatus.SUCCESS)
            .recordsCount(0)
            .organization(null)
            .errors(empty)
            .warnings(empty)
            .destination(Pipeline.UNIVERSAL)
            .build();
    when(featureFlagsConfig.isHivBulkUploadEnabled()).thenReturn(true);
    when(file.getContentType()).thenReturn("text/csv");
    when(file.getInputStream()).thenReturn(stream);
    when(testResultUploadService.processHIVResultCSV(stream)).thenReturn(expected);

    var actual = fileUploadController.handleHIVResultsUpload(file);

    assertThat(actual).isEqualTo(expected);
    verify(testResultUploadService, times(1)).processHIVResultCSV(stream);
  }

  @Test
  void handleHIVResultsUpload_handlesIoException() throws IOException {
    var file = mock(MultipartFile.class);
    when(featureFlagsConfig.isHivEnabled()).thenReturn(true);
    when(file.getContentType()).thenReturn("text/csv");
    when(file.getInputStream()).thenThrow(IOException.class);

    assertThrows(
        CsvProcessingException.class, () -> fileUploadController.handleHIVResultsUpload(file));
  }
}
