package gov.cdc.usds.simplereport.service.idverification;

import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationAnswersRequest;
import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationAnswersResponse;
import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationQuestionsRequest;
import gov.cdc.usds.simplereport.api.model.accountrequest.IdentityVerificationQuestionsResponse;

public interface ExperianService {

  /** Retrieves questions from Experian, given user data. */
  IdentityVerificationQuestionsResponse getQuestions(IdentityVerificationQuestionsRequest userData);

  IdentityVerificationAnswersResponse submitAnswers(IdentityVerificationAnswersRequest answerRequest);
}
