package gov.cdc.usds.simplereport.api.uploads;

import gov.cdc.usds.simplereport.db.model.auxiliary.UploadStatus;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@NoArgsConstructor
@Getter
@Setter
public class PatientBulkUploadResponse {

  private FeedbackMessage[] errors;
  private UploadStatus status;
}
