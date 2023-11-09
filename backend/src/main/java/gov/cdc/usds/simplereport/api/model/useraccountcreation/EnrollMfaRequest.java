package gov.cdc.usds.simplereport.api.model.useraccountcreation;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;

@Getter
public class EnrollMfaRequest {
  @Size(max = RequestConstants.STANDARD_REQUEST_STRING_LIMIT)
  @JsonProperty
  @NotNull
  private String userInput;
}
