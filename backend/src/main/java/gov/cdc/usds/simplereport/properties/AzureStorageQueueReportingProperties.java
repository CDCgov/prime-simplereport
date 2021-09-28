package gov.cdc.usds.simplereport.properties;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@Slf4j
@ConfigurationProperties(prefix = "simple-report.azure-reporting-queue")
public final class AzureStorageQueueReportingProperties {
  private final String connectionString;
  private final String enabled;
  private final String name;

  @ConstructorBinding
  public AzureStorageQueueReportingProperties(
      String connectionString, String enabled, String name) {
    this.enabled = enabled;
    this.connectionString = connectionString;
    this.name = name;
  }

  public String getConnectionString() {
    return connectionString;
  }

  public String getEnabled() {
    return enabled;
  }

  public String getName() {
    return name;
  }
}
