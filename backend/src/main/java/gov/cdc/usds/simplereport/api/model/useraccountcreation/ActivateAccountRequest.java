package gov.cdc.usds.simplereport.api.model.useraccountcreation;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class ActivateAccountRequest {
  @Size(max = RequestConstants.LARGE_REQUEST_STRING_LIMIT)
  @NotNull
  @JsonProperty
  private String activationToken;
}
