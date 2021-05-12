package gov.cdc.usds.simplereport.api.model.useraccountcreation;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserAccountCreationRequest {
  private String activationToken;
  private String password;
}
