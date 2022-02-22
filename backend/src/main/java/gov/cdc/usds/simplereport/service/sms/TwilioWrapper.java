package gov.cdc.usds.simplereport.service.sms;

import com.twilio.rest.api.v2010.account.Message;
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

  @Value("${twilio.messaging-service-sid}")
  private String messagingServiceSid;

  @PostConstruct
  void init() {
    log.info("Twilio is enabled!");
    Service service = Service.fetcher(messagingServiceSid).fetch();
    log.info("SmsService will send from service {} ", service.getFriendlyName());
  }

  @Override
  public String send(PhoneNumber to, String message) {
    // We're sending using a messaging service rather than a from number:
    // https://www.twilio.com/docs/messaging/services#send-a-message-with-a-messaging-service
    Message msg =
        Message.creator(to, messagingServiceSid, message)
            .setStatusCallback(URI.create(twilioCallbackUrl))
            .create();
    return msg.getSid();
  }
}
