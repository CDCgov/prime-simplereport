package gov.cdc.usds.simplereport.service.model.reportstream;

import java.util.Date;

public class TokenResponse {
  public String sub;
  public String access_token;
  public String token_type;
  public Number expires_in;
  public Date expires_at_seconds;
  public String scope;
}
