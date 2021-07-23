package gov.cdc.usds.simplereport.service.sms;

import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import java.net.URI;
import javax.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
public class TwilioWrapper implements SmsProviderWrapper {
  private static final Logger LOG = LoggerFactory.getLogger(TwilioWrapper.class);

  @Value("${simple-report.twilio-callback-url:https://simplereport.gov/api/pxp/callback}")
  private static String twilioCallbackUrl;

  @PostConstruct
  void init() {
    LOG.info("Twilio is enabled!");
  }

  @Override
  public String send(PhoneNumber to, PhoneNumber from, String message) {
    Message msg =
        Message.creator(to, from, message)
            .setStatusCallback(URI.create(twilioCallbackUrl))
            .create();
    return msg.getSid();
  }
}
