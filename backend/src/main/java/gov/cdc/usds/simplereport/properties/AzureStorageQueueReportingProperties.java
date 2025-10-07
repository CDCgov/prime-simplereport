package gov.cdc.usds.simplereport.properties;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@Slf4j
@Getter
@ConstructorBinding
@RequiredArgsConstructor
@ConfigurationProperties(prefix = "simple-report.azure-reporting-queue")
public final class AzureStorageQueueReportingProperties {
  private final String connectionString;
  private final String enabled;
  private final String fhirQueueEnabled;
  private final String name;
  private final String fhirQueueName;
  private final String exceptionWebhookEnabled;
  private final String exceptionWebhookToken;
}
