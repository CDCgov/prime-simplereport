package gov.cdc.usds.simplereport.service.model.reportstream;

import java.util.Date;
import java.util.UUID;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UploadResponse {
  private UUID id;
  private ReportStreamStatus overallStatus;
  private Date timestamp;
  private int reportItemCount;
  private FeedbackMessage[] errors;
  private FeedbackMessage[] warnings;

  public UUID getReportId() {
    return this.id;
  }

  public ReportStreamStatus getStatus() {
    return this.overallStatus;
  }

  public Date getCreatedAt() {
    return this.timestamp;
  }

  public int getRecordsCount() {
    return this.reportItemCount;
  }
}
