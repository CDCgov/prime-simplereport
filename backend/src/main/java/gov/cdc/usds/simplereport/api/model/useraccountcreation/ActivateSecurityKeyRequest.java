package gov.cdc.usds.simplereport.api.model.useraccountcreation;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ActivateSecurityKeyRequest {
  @Size(max = RequestConstants.LARGE_REQUEST_STRING_LIMIT)
  @NotNull
  private String attestation;

  @Size(max = RequestConstants.LARGE_REQUEST_STRING_LIMIT)
  @NotNull
  private String clientData;
}
