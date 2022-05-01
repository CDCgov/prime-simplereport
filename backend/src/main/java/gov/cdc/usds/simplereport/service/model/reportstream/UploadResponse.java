package gov.cdc.usds.simplereport.service.model.reportstream;

import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import java.util.Date;
import java.util.UUID;

public class UploadResponse {
  public UUID id;
  public String submissionId;
  public UploadStatus overallStatus;
  public Date timestamp;
  public Date plannedCompletionAt;
  public Date actualCompletionAt;
  public String sender;
  public int reportItemCount;
  public int errorCount;
  public int warningCount;
  public int httpStatus;
  public String[] destinations;
  public FeedbackMessage[] errors;
  public FeedbackMessage[] warnings;
  public String topic;
  public String externalName;
  public int destinationCount;
}
