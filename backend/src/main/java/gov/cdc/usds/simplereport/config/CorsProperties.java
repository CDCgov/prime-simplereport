package gov.cdc.usds.simplereport.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "simple-report.cors")
public class CorsProperties {

  private final List<String> allowedOrigins;
  private final List<String> allowedMethods;

  public CorsProperties(List<String> allowedOrigins, List<String> allowedMethods) {
    this.allowedOrigins = allowedOrigins;
    this.allowedMethods = allowedMethods;
  }

  public List<String> getAllowedOrigins() {
    return allowedOrigins;
  }

  public List<String> getAllowedMethods() {
    return allowedMethods;
  }
}
