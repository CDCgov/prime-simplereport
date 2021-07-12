package gov.cdc.usds.simplereport.service.idverification;

import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationRequest;

public interface ExperianService {

  /** Retrieves questions from Experian, given user data. */
  public String getQuestions(IdentityVerificationRequest userData);
}
