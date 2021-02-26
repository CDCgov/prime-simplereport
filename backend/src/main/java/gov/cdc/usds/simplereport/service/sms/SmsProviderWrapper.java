package gov.cdc.usds.simplereport.service.sms;

import org.springframework.stereotype.Component;
import com.twilio.type.PhoneNumber;

@Component
public interface SmsProviderWrapper {
  public String send(PhoneNumber to, PhoneNumber from, String message);
}
