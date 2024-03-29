package gov.cdc.usds.simplereport.api.model.useraccountcreation;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class UserAccountCreationRequest {
  @Size(max = RequestConstants.LARGE_REQUEST_STRING_LIMIT)
  @NotNull
  private String activationToken;

  @Size(max = RequestConstants.STANDARD_REQUEST_STRING_LIMIT)
  @NotNull
  private String password;
}
