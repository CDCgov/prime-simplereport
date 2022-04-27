package gov.cdc.usds.simplereport.service.model.reportstream;

import java.util.Date;

public class UploadResponse {
  public String id;
  public String submissionId;
  public String overallStatus; // enum?
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
