package gov.cdc.usds.simplereport.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Configuration;

import gov.cdc.usds.simplereport.service.sms.DisabledSmsWrapper;
import gov.cdc.usds.simplereport.service.sms.SmsProviderWrapper;

@Configuration
public class TwilioDisabledConfiguration {
  @ConditionalOnMissingBean
  SmsProviderWrapper defaultToBypassTwilio() {
    return new DisabledSmsWrapper();
  }
}
