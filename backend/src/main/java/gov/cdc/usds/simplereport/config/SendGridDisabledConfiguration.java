package gov.cdc.usds.simplereport.config;

import com.sendgrid.helpers.mail.Mail;
import gov.cdc.usds.simplereport.service.email.EmailProviderWrapper;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Configuration
public class SendGridDisabledConfiguration {
  @ConditionalOnMissingBean
  EmailProviderWrapper defaultToBypassSendGrid() {
    return new DisabledEmailWrapper();
  }
}

@Component
class DisabledEmailWrapper implements EmailProviderWrapper {
  @Override
  public String send(Mail mail) {
    return null;
  }
}
