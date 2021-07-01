package gov.cdc.usds.simplereport.service.idVerification;

import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationRequest;

public interface ExperianService {

  /** Fetches an access token from Experian. */
  public String fetchToken() throws IllegalArgumentException;

  /** Retrieves questions from Experian, given user data. */
  public void getQuestions(IdentityVerificationRequest userData);
}
