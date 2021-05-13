package gov.cdc.usds.simplereport.api.model.useraccountcreation;

import javax.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Getter;

@Getter
public class EnrollMfaRequest {
  @Size(max = RequestConstants.STANDARD_REQUEST_STRING_LIMIT)
  @JsonProperty
  private String userInput;
}
