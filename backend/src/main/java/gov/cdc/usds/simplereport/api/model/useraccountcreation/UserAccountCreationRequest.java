package gov.cdc.usds.simplereport.api.model.useraccountcreation;

import javax.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserAccountCreationRequest {
  @Size(max = 512)
  private String activationToken;

  @Size(max = 256)
  private String password;
}
