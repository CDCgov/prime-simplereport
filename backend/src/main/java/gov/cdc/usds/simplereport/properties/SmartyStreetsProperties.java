package gov.cdc.usds.simplereport.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "smarty-streets")
public final class SmartyStreetsProperties {

  private final String id;
  private final String token;

  public SmartyStreetsProperties(String id, String token) {
    this.id = id;
    this.token = token;
  }

  public String getId() {
    return id;
  }

  public String getToken() {
    return token;
  }
}
