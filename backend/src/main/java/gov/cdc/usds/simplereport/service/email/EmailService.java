package gov.cdc.usds.simplereport.service.email;

import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
  private static final Logger LOG = LoggerFactory.getLogger(EmailService.class);

  @Autowired private EmailProvider emailProvider;
  @Autowired SendGridProperties sendGridProperties;

  public String send(String toEmail, String subject, String message) throws IOException {
    Email from = new Email(sendGridProperties.getFromEmail());
    Email to = new Email(toEmail);
    Content content = new Content("text/html", message);
    Mail mail = new Mail(from, subject, to, content);

    return emailProvider.send(mail);
  }
}
