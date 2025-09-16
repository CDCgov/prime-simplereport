package gov.cdc.usds.simplereport.service.model;

import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.util.Date;
import java.util.UUID;

// TODO: This may better suited as an abstract class
public interface GenericResponse {
  UUID getReportId();

  UploadStatus getStatus();

  Date getCreatedAt();

  int getRecordsCount();

  FeedbackMessage[] getErrors();

  FeedbackMessage[] getWarnings();
}
