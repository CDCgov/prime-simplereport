package gov.cdc.usds.simplereport.properties;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "simple-report.twilio")
public final class TwilioProperties {

  private final String messageServiceSid;

  @ConstructorBinding
  public TwilioProperties(String messageServiceSid) {
    this.messageServiceSid = messageServiceSid;
  }

  public String getMessageServiceSid() {
    return messageServiceSid;
  }
}
