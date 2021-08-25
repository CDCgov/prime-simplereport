package gov.cdc.usds.simplereport.api.model.accountrequest;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class IdentityVerificationAnswersResponse {

  public IdentityVerificationAnswersResponse(boolean passed) {
    this.passed = passed;
  }

  private boolean passed;
  // email address of account requester
  private String email;
  // link to start the account creation process
  private String activationToken;
}
