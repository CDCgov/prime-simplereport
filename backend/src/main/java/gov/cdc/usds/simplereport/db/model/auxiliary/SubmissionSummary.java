package gov.cdc.usds.simplereport.db.model.auxiliary;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.GenericResponse;
import java.util.HashMap;
import java.util.UUID;

public interface SubmissionSummary {
  UUID submissionId();

  Organization org();

  GenericResponse submissionResponse();

  HashMap<String, Integer> reportedDiseases();
}
