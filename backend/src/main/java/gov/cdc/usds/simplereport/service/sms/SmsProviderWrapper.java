package gov.cdc.usds.simplereport.service.sms;

import com.twilio.type.PhoneNumber;

public interface SmsProviderWrapper {
  String send(PhoneNumber to, PhoneNumber from, String message);
}
