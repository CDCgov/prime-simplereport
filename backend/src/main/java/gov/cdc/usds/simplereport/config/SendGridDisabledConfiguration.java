package gov.cdc.usds.simplereport.config;

import java.io.IOException;

import com.sendgrid.helpers.mail.Mail;
import gov.cdc.usds.simplereport.service.email.EmailProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Configuration
public class SendGridDisabledConfiguration {
  @ConditionalOnMissingBean
  EmailProvider defaultToBypassSendGrid() {
    return new SendGridDisabledConfiguration.DisabledSendgrid();
  }

  @Component
  class DisabledSendgrid implements EmailProvider {
    @Override
    public String send(Mail mail) throws IOException {
      return null;
    }
  }
}
