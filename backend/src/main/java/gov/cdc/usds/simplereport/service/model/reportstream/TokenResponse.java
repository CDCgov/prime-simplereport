package gov.cdc.usds.simplereport.service.model.reportstream;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.Date;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TokenResponse {
  private String sub;

  @JsonProperty("access_token")
  private String accessToken;

  @JsonProperty("token_type")
  private String tokenType;

  @JsonProperty("expires_in")
  private Number expiresIn;

  @JsonProperty("expires_at_seconds")
  private Date expiresAtSeconds;

  private String scope;
}
