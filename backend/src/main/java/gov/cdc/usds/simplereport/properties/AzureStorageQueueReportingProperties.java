package gov.cdc.usds.simplereport.properties;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "simple-report.az-reporting-queue")
@ConditionalOnProperty("simple-report.az-reporting-queue.connection-string")
public final class AzureStorageQueueReportingProperties {
  public String getConnectionString() {
    return connectionString;
  }

  private final String connectionString;

  @ConstructorBinding
  public AzureStorageQueueReportingProperties(String connectionString) {
    this.connectionString = connectionString;
  }
}
