package gov.cdc.usds.simplereport.config.simplereport;

import java.util.List;
import java.util.TimeZone;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "simple-report.data-hub")
public final class DataHubConfig {

    /** whether or not the uploader is enabled. */
    private final boolean uploadEnabled;
    /** the POST endpoint to which we will upload data */
    private final String uploadUrl;
    /** the maximum number of records to upload at once */
    private final int maxCsvRows;
    /** the data hub API key */
    private final String apiKey;
    /** the slack webhook URL for sending notifications about the upload */
    private final String secretSlackNotifyWebhookUrl;
    /**
     * A list of <a href=
     * "https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/scheduling/support/CronExpression.html">cron
     * expressions</a> to use to schedule the uploader job (most likely a
     * single-element list in all cases, but flexibility available if we want it).
     */
    private List<String> uploadSchedule;
    /** The time zone for the cron expressions in the schedule (default: GMT) */
    private TimeZone uploadTimezone;

    @ConstructorBinding
    public DataHubConfig(boolean uploadEnabled, String uploadUrl, int maxCsvRows, String apiKey,
            String secretSlackNotifyWebhookUrl, List<String> uploadSchedule, String uploadTimezone) {
        this.uploadEnabled = uploadEnabled;
        this.uploadUrl = uploadUrl;
        this.maxCsvRows = maxCsvRows;
        this.apiKey = apiKey;
        this.secretSlackNotifyWebhookUrl = secretSlackNotifyWebhookUrl;
        this.uploadSchedule = uploadSchedule;
        this.uploadTimezone = TimeZone.getTimeZone(null != uploadTimezone ? uploadTimezone : "GMT");
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

    public List<String> getUploadSchedule() {
        return uploadSchedule;
    }

    public TimeZone getUploadTimezone() {
        return uploadTimezone;
    }
}
