package gov.cdc.usds.simplereport.db.model.auxiliary;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.S3UploadResponse;
import java.util.HashMap;
import java.util.UUID;

public record AimsSubmissionSummary(
    UUID submissionId,
    Organization org,
    S3UploadResponse submissionResponse,
    HashMap<String, Integer> reportedDiseases)
    implements SubmissionSummary {}
