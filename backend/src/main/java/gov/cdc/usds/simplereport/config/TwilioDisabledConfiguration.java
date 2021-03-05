package gov.cdc.usds.simplereport.config;

import com.twilio.type.PhoneNumber;
import gov.cdc.usds.simplereport.service.sms.SmsProviderWrapper;
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
  @Override
  public String send(PhoneNumber to, PhoneNumber from, String message) {
    return null;
  }
}
