package gov.cdc.usds.simplereport.db.model.auxiliary;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import java.util.HashMap;
import java.util.UUID;

public record CovidSubmissionSummary(
    UUID submissionId,
    Organization org,
    UploadResponse submissionResponse,
    Exception processingException,
    HashMap<String, Integer> reportedDiseases)
    implements SubmissionSummary {

  public Exception getProcessingException() {
    return processingException;
  }
}
