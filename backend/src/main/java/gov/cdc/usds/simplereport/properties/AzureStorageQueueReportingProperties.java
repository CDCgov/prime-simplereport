package gov.cdc.usds.simplereport.properties;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "simple-report.azure-reporting-queue")
@ConditionalOnProperty("simple-report.azure-reporting-queue.sas-token")
public final class AzureStorageQueueReportingProperties {
  private final String accountName;
  private final String sasToken;
  private final String queueName;

  @ConstructorBinding
  public AzureStorageQueueReportingProperties(
      String accountName, String sasToken, String queueName) {
    this.accountName = accountName;
    this.sasToken = sasToken;
    this.queueName = queueName;
  }

  public String getAccountName() {
    return accountName;
  }

  public String getQueueUrl() {
    return "https://" + getAccountName() + ".queue.core.windows.net";
  }

  public String getSasToken() {
    return sasToken;
  }

  public String getQueueName() {
    return queueName;
  }
}
