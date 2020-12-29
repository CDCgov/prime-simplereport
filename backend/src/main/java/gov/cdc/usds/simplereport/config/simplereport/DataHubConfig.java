package gov.cdc.usds.simplereport.config.simplereport;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

import java.time.Instant;
import java.util.Date;

@ConfigurationProperties(prefix = "simple-report.data-hub")
@ConstructorBinding
public final class DataHubConfig {

    private final boolean uploadenabled;
    private final String uploadUrl;
    private final int maxCsvRows;
    private final String serviceUuid;
    private final String apiKey;
    private final String slackNotifyWebhookUrl;

    public Date EARLIEST_DATE = Date.from(Instant.parse("2020-01-01T00:00:00Z"));

    public DataHubConfig(boolean uploadenabled, String uploadurl, int maxcsvrows, String serviceuuid, String apikey,
                         String slacknotifywebhookurl) {
        this.uploadenabled = uploadenabled;
        this.uploadUrl = uploadurl;
        this.maxCsvRows = maxcsvrows;
        this.serviceUuid = serviceuuid;
        this.apiKey = apikey;
        this.slackNotifyWebhookUrl = slacknotifywebhookurl;
    }

    // to change go into application-dev.yaml and/or application-test.yaml and change uploadenabled
    public boolean getUploadEnabled() { return uploadenabled; }

    public String getUploadUrl() {
        return uploadUrl;
    }

    public int getMaxCsvRows() {
        return maxCsvRows;
    }

    public String getServiceUuid() {
        return serviceUuid;
    }

    public String getApiKey() {
        return apiKey;
    }

    public String getSlackNotifyWebhookUrl() {
        return slackNotifyWebhookUrl;
    }
}