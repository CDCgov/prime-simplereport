package gov.cdc.usds.simplereport.properties;

import gov.cdc.usds.simplereport.service.email.EmailProviderTemplate;
import java.util.List;
import java.util.Map;
import lombok.Builder;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Builder
@ConfigurationProperties(prefix = "simple-report.sendgrid")
public final class SendGridProperties {
  private final boolean enabled;
  private final String apiKey;
  private final String fromEmail;
  private final String fromDisplayName;
  private final List<String> accountRequestRecipient;
  private final List<String> waitlistRecipient;
  private final List<String> outreachMailingListRecipient;
  private final Map<EmailProviderTemplate, String> dynamicTemplates;

  public boolean getEnabled() {
    return enabled;
  }

  public String getApiKey() {
    return apiKey;
  }

  public String getFromEmail() {
    return fromEmail;
  }

  public String getFromDisplayName() {
    return fromDisplayName;
  }

  public List<String> getAccountRequestRecipient() {
    return accountRequestRecipient;
  }

  public List<String> getWaitlistRecipient() {
    return waitlistRecipient;
  }

  public List<String> getOutreachMailingListRecipient() {
    return outreachMailingListRecipient;
  }

  public String getDynamicTemplateGuid(final EmailProviderTemplate templateName) {
    return dynamicTemplates.get(templateName);
  }
}
