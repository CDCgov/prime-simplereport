package gov.cdc.usds.simplereport.service.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.util.Date;
import java.util.UUID;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class S3UploadResponse implements GenericResponse {
  private UUID id;
  private Date timestamp;
  private int reportItemCount;
  private boolean success;
  private String errorMessage;

  private UUID generateId(String objectKey, Date timestamp) {
    return UUID.nameUUIDFromBytes((objectKey + timestamp.getTime()).getBytes());
  }

  public S3UploadResponse(String objectKey, int reportItemCount, boolean success) {
    this.timestamp = new Date();
    this.reportItemCount = reportItemCount;
    this.id = generateId(objectKey, this.timestamp);
    this.success = success;
  }

  public S3UploadResponse(String objectKey, int reportItemCount, String errorMessage) {
    this.timestamp = new Date();
    this.reportItemCount = reportItemCount;
    this.id = generateId(objectKey, this.timestamp);
    this.success = false;
    this.errorMessage = errorMessage;
  }

  @Override
  public UUID getReportId() {
    return this.id;
  }

  @Override
  public UploadStatus getStatus() {
    return success ? UploadStatus.SUCCESS : UploadStatus.FAILURE;
  }

  @Override
  public Date getCreatedAt() {
    return this.timestamp;
  }

  @Override
  public int getRecordsCount() {
    return this.reportItemCount;
  }

  @Override
  public FeedbackMessage[] getErrors() {
    if (!success && errorMessage != null) {
      FeedbackMessage error = new FeedbackMessage();
      error.setMessage(errorMessage);
      return new FeedbackMessage[] {error};
    }
    return new FeedbackMessage[0];
  }

  @Override
  // TODO: Derive some level of warnings from S3 calls
  public FeedbackMessage[] getWarnings() {
    return new FeedbackMessage[0];
  }
}
