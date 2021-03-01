package gov.cdc.usds.simplereport.config.simplereport;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "simple-report.address-validation")
public final class SmartyStreetsConfig {

  private final String smartyAuthId;
  private final String smartyAuthToken;

  @ConstructorBinding
  public SmartyStreetsConfig(String smartyAuthId, String smartyAuthToken) {
    this.smartyAuthId = smartyAuthId;
    this.smartyAuthToken = smartyAuthToken;
  }

  public String getSmartyAuthId() {
    return smartyAuthId;
  }

  public String getSmartyAuthToken() {
    return smartyAuthToken;
  }
}
