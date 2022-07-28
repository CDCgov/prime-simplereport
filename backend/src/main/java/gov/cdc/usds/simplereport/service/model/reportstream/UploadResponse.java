package gov.cdc.usds.simplereport.service.model.reportstream;

import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import java.util.Date;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UploadResponse {
  private UUID id;
  private ReportStreamStatus overallStatus;
  private Date timestamp;
  private int reportItemCount;
  private FeedbackMessage[] errors;
  private FeedbackMessage[] warnings;

  public static UploadStatus parseStatus(ReportStreamStatus status) {
    switch (status) {
      case DELIVERED:
        return UploadStatus.SUCCESS;
      case RECEIVED:
      case WAITING_TO_DELIVER:
      case PARTIALLY_DELIVERED:
        return UploadStatus.PENDING;
      case ERROR:
      case NOT_DELIVERING:
      default:
        return UploadStatus.FAILURE;
    }
  }

  public UUID getReportId() {
    return this.id;
  }

  public UploadStatus getStatus() {
    return parseStatus(this.overallStatus);
  }

  public Date getCreatedAt() {
    return this.timestamp;
  }

  public int getRecordsCount() {
    return this.reportItemCount;
  }
}
