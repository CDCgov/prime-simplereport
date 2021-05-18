package gov.cdc.usds.simplereport.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "simple-report.dynamics")
public class DynamicsProperties {
  private final boolean enabled;
  private final String clientId;
  private final String clientSecret;
  private final String tenantId;
  private final String resourceUrl;

  @ConstructorBinding
  public DynamicsProperties(
      final boolean enabled,
      final String clientId,
      final String clientSecret,
      final String tenantId,
      final String resourceUrl) {
    this.enabled = enabled;
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.tenantId = tenantId;
    this.resourceUrl = resourceUrl;
  }

  public boolean getEnabled() {
    return enabled;
  }

  public String getClientId() {
    return clientId;
  }

  public String getClientSecret() {
    return clientSecret;
  }

  public String getTenantId() {
    return tenantId;
  }

  public String getResourceUrl() {
    return resourceUrl;
  }
}
