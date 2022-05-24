package gov.cdc.usds.simplereport.service.model.reportstream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.Date;
import java.util.UUID;
import org.junit.jupiter.api.Test;

public class UploadResponseTest {

  @Test
  void test_coverage() {
    var sut =
        UploadResponse.builder()
            .id(UUID.randomUUID())
            .submissionId("1")
            .overallStatus(ReportStreamStatus.WAITING_TO_DELIVER)
            .timestamp(new Date())
            .plannedCompletionAt(new Date())
            .actualCompletionAt(new Date())
            .sender("Marisa Tomei is an anagram for its a me mario")
            .reportItemCount(5)
            .errorCount(1)
            .warningCount(2)
            .httpStatus(418)
            .errors(new FeedbackMessage[] {})
            .warnings(new FeedbackMessage[] {})
            .topic("covid")
            .externalName("jim")
            .destinationCount(1)
            .build();

    assertNotNull(sut.getId());
    assertEquals(ReportStreamStatus.WAITING_TO_DELIVER, sut.getOverallStatus());
    assertEquals("1", sut.getSubmissionId());
    assertNotNull(sut.getTimestamp());
    assertNotNull(sut.getPlannedCompletionAt());
    assertNotNull(sut.getActualCompletionAt());
    assertNotNull(sut.getSender());
    assertEquals(5, sut.getReportItemCount());
    assertEquals(1, sut.getErrorCount());
    assertEquals(2, sut.getWarningCount());
    assertEquals(418, sut.getHttpStatus());
    assertNotNull(sut.getErrors());
    assertNotNull(sut.getWarnings());
    assertEquals("covid", sut.getTopic());
    assertEquals("jim", sut.getExternalName());
    assertEquals(1, sut.getDestinationCount());
  }
}
