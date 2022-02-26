package gov.cdc.usds.simplereport.config;

import com.twilio.type.PhoneNumber;
import gov.cdc.usds.simplereport.service.sms.SmsProviderWrapper;
import java.util.UUID;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Configuration
public class TwilioDisabledConfiguration {
  @ConditionalOnMissingBean
  SmsProviderWrapper defaultToBypassTwilio() {
    return new DisabledSmsWrapper();
  }
}

@Component
class DisabledSmsWrapper implements SmsProviderWrapper {
  private static String DISABLED_MESSAGE_PREFIX = "twilio-is-disabled";

  @Override
  public String send(PhoneNumber to, String message) {
    return String.format("%s-%s", DISABLED_MESSAGE_PREFIX, UUID.randomUUID().toString());
  }
}
