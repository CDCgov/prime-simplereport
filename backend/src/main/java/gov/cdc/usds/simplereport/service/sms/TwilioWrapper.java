package gov.cdc.usds.simplereport.service.sms;

import com.twilio.exception.ApiException;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.rest.api.v2010.account.MessageCreator;
import com.twilio.rest.messaging.v1.Service;
import com.twilio.type.PhoneNumber;
import java.net.URI;
import javax.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * This wrapper might feel silly, but it allows for IOC and easy mocking of an otherwise-static and
 * untouchable thing, so that we can get good coverage of the SmsService
 */
@ConditionalOnProperty(name = "twilio.enabled", havingValue = "true")
@Primary
@Component
@Slf4j
public class TwilioWrapper implements SmsProviderWrapper {
  @Value("${simple-report.twilio-callback-url:https://simplereport.gov/api/pxp/callback}")
  private String twilioCallbackUrl;

  @Value("${twilio.from-number}")
  private String fallbackFromNumber;

  @Value("${twilio.messaging-service-sid}")
  private String messagingServiceSid;

  private boolean sendFromService = true;

  @PostConstruct
  void init() {
    log.info("Twilio is enabled!");
    try {
      Service service = Service.fetcher(messagingServiceSid).fetch();
      log.debug("SmsService will send from service {} ", service.getFriendlyName());
    }
    // figure out what kind of exception is thrown if the message sid doesn't exist and default to
    // the fromNumber send
    catch (ApiException e) {
      sendFromService = false;
      log.debug(
          "Twilio messaging service not found. SmsService will send from {} ", fallbackFromNumber);
    }
  }

  @Override
  public String send(PhoneNumber to, String message) {
    // We're sending using a messaging service rather than a from number:
    // https://www.twilio.com/docs/messaging/services#send-a-message-with-a-messaging-service
    if (sendFromService) {
      return send(Message.creator(to, messagingServiceSid, message));
    } else {
      return send(Message.creator(to, fallbackFromNumber, message));
    }
  }

  private String send(MessageCreator creator) {
    Message msg = creator.setStatusCallback(URI.create(twilioCallbackUrl)).create();
    return msg.getSid();
  }
}
