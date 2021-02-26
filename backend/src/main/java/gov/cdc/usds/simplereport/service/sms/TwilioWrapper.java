package gov.cdc.usds.simplereport.service.sms;

import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * This wrapper might feel silly, but it allows for IOC and easy mocking
 * of an otherwise-static and untouchable thing, so that we can get good 
 * coverage * of the SmsService
 */
@ConditionalOnProperty(name="twilio.enabled", havingValue="true")
@Component
public class TwilioWrapper implements SmsProviderWrapper {
  @Override
  public String send(PhoneNumber to, PhoneNumber from, String message) {
    Message msg = Message.creator(to, from, message).create();
    return msg.getSid();
  }
}
