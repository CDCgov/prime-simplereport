package gov.cdc.usds.simplereport.api.model.useraccountcreation;

import javax.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ActivateSecurityKeyRequest {
  @Size(max = RequestConstants.LARGE_REQUEST_STRING_LIMIT)
  private String attestation;

  @Size(max = RequestConstants.LARGE_REQUEST_STRING_LIMIT)
  private String clientData;
}
