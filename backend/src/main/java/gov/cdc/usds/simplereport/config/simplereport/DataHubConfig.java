package gov.cdc.usds.simplereport.config.simplereport;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "simple-report.data-hub")
@ConstructorBinding
public final class DataHubConfig {

    private final boolean uploadEnabled;
    private final String uploadUrl;
    private final int maxCsvRows;
    private final String apiKey;
    private final String secretSlackNotifyWebhookUrl;

    public DataHubConfig(boolean uploadEnabled, String uploadUrl, int maxCsvRows, String serviceUuid, String apiKey,
                         String secretSlackNotifyWebhookUrl) {
        this.uploadEnabled = uploadEnabled;
        this.uploadUrl = uploadUrl;
        this.maxCsvRows = maxCsvRows;
        this.apiKey = apiKey;
        this.secretSlackNotifyWebhookUrl = secretSlackNotifyWebhookUrl;
    }

    // to change go into application-dev.yaml and/or application-test.yaml and change uploadEnabled
    public boolean getUploadEnabled() { return uploadEnabled; }

    public String getUploadUrl() {
        return uploadUrl;
    }

    public int getMaxCsvRows() {
        return maxCsvRows;
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getSlackNotifyWebhookUrl() {
        return secretSlackNotifyWebhookUrl;
    }
}
