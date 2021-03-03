package gov.cdc.usds.simplereport.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "smarty-streets")
public final class SmartyStreetsConfig {

  private final String authId;
  private final String authToken;

  @ConstructorBinding
  public SmartyStreetsConfig(String authId, String authToken) {
    this.authId = authId;
    this.authToken = authToken;
  }

  public String getAuthId() {
    return authId;
  }

  public String getAuthToken() {
    return authToken;
  }
}
