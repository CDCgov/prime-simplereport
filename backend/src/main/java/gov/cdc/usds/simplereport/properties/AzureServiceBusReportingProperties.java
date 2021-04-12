package gov.cdc.usds.simplereport.properties;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "simple-report.azure-service-bus-reporting")
@ConditionalOnProperty("simple-report.azure-service-bus.connection-string")
public final class AzureServiceBusReportingProperties {
  private final String connectionString;
  private final String queueName;

  @ConstructorBinding
  public AzureServiceBusReportingProperties(String connectionString, String queueName) {
    this.connectionString = connectionString;
    this.queueName = queueName;
  }

  public String getConnectionString() {
    return connectionString;
  }

  public String getQueueName() {
    return queueName;
  }
}
