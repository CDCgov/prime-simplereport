package gov.cdc.usds.simplereport.api.model.useraccountcreation;

import com.fasterxml.jackson.annotation.JsonProperty;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import lombok.Getter;

@Getter
public class SetPasswordRequest {
  @Size(max = RequestConstants.LARGE_REQUEST_STRING_LIMIT)
  @NotNull
  @JsonProperty
  private String password;
}
