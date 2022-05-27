package gov.cdc.usds.simplereport.service.model.reportstream;

import java.util.UUID;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class UploadResponse {
  private UUID id;
  private ReportStreamStatus overallStatus;
  private int reportItemCount;
  private FeedbackMessage[] errors;
  private FeedbackMessage[] warnings;
}
