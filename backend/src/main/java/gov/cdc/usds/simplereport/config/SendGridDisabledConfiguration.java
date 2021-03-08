package gov.cdc.usds.simplereport.config;

import com.sendgrid.helpers.mail.Mail;
import gov.cdc.usds.simplereport.service.email.EmailProvider;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SendGridDisabledConfiguration {
  @ConditionalOnMissingBean
  EmailProvider defaultToBypassSendGrid() {
    return (Mail mail) -> null;
  }
}
