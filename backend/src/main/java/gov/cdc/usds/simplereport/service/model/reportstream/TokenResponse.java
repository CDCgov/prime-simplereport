package gov.cdc.usds.simplereport.service.model.reportstream;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TokenResponse {
  @JsonProperty("access_token")
  private String accessToken;
}
