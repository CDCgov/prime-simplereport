package gov.cdc.usds.simplereport.service.sms;

import com.twilio.type.PhoneNumber;
import org.springframework.stereotype.Component;

@Component
public class DisabledSmsWrapper implements SmsProviderWrapper {
  @Override
  public String send(PhoneNumber to, PhoneNumber from, String message) {
    return null;
  }
}
