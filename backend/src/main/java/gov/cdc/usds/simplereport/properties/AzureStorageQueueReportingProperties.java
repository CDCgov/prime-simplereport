package gov.cdc.usds.simplereport.properties;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@Slf4j
@ConstructorBinding
@RequiredArgsConstructor
@ConfigurationProperties(prefix = "simple-report.azure-reporting-queue")
public final class AzureStorageQueueReportingProperties {
  private final String connectionString;
  private final String enabled;
  private final String name;
  private final String exceptionCallbackToken;

  public String getConnectionString() {
    return connectionString;
  }

  public String getEnabled() {
    return enabled;
  }

  public String getName() {
    return name;
  }

  public String getExceptionCallbackToken() {
    return exceptionCallbackToken;
  }
}
