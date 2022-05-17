package gov.cdc.usds.simplereport.service.model.reportstream;

import java.util.Date;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UploadResponse {
  private UUID id;
  private String submissionId;
  private ReportStreamStatus overallStatus;
  private Date timestamp;
  private Date plannedCompletionAt;
  private Date actualCompletionAt;
  private String sender;
  private int reportItemCount;
  private int errorCount;
  private int warningCount;
  private int httpStatus;
  private FeedbackMessage[] errors;
  private FeedbackMessage[] warnings;
  private String topic;
  private String externalName;
  private int destinationCount;

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
