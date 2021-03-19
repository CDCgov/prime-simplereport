package gov.cdc.usds.simplereport.service.email;

import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import java.io.IOException;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
  private final EmailProvider emailProvider;
  private final SendGridProperties sendGridProperties;

  public EmailService(EmailProvider emailProvider, SendGridProperties sendGridProperties) {
    this.emailProvider = emailProvider;
    this.sendGridProperties = sendGridProperties;
  }

  public String send(List<String> toEmail, String subject, String message) throws IOException {
    Mail mail = new Mail();
    mail.setFrom(new Email(sendGridProperties.getFromEmail()));
    mail.setSubject(subject);
    Personalization personalization = new Personalization();
    toEmail.stream().map(Email::new).forEach(personalization::addTo);
    mail.addPersonalization(personalization);
    mail.addContent(new Content("text/html", message));
    return emailProvider.send(mail);
  }

  public String send(String toEmail, String subject, String message) throws IOException {
    return send(List.of(toEmail), subject, message);
  }
}
