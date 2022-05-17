package gov.cdc.usds.simplereport.service.model.reportstream;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;
import lombok.Getter;

@Getter
public class TokenResponse {
  public String sub;

  @JsonProperty("access_token")
  public String accessToken;

  @JsonProperty("token_type")
  public String tokenType;

  @JsonProperty("expires_in")
  public Number expiresIn;

  @JsonProperty("expires_at_seconds")
  public Date expiresAtSeconds;

  public String scope;
}
