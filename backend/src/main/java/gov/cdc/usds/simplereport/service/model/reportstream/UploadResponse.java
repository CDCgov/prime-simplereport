package gov.cdc.usds.simplereport.service.model.reportstream;

import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UploadResponse {
  private UUID id;
  private ReportStreamStatus overallStatus;
  private int reportItemCount;
  private FeedbackMessage[] errors;
  private FeedbackMessage[] warnings;

  public UploadResponse() {}
}
