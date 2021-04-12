package gov.cdc.usds.simplereport.service.email;

import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import gov.cdc.usds.simplereport.api.model.TemplateVariablesProvider;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import java.io.IOException;
import java.util.List;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

@Service
public class EmailService {
  private final EmailProvider emailProvider;
  private final SendGridProperties sendGridProperties;
  private final SpringTemplateEngine templateEngine;

  public EmailService(
      EmailProvider emailProvider,
      SendGridProperties sendGridProperties,
      SpringTemplateEngine templateEngine) {
    this.emailProvider = emailProvider;
    this.sendGridProperties = sendGridProperties;
    this.templateEngine = templateEngine;
  }

  private String getContentFromTemplate(final TemplateVariablesProvider templateData) {
    final Context context = new Context();
    context.setVariables(templateData.toTemplateVariables());

    return templateEngine.process(templateData.getTemplateName(), context);
  }

  public String send(
      List<String> toEmail, String subject, final TemplateVariablesProvider templateData)
      throws IOException {
    Mail mail = new Mail();
    mail.setFrom(new Email(sendGridProperties.getFromEmail()));
    mail.setSubject(subject);
    Personalization personalization = new Personalization();
    toEmail.stream().map(Email::new).forEach(personalization::addTo);
    mail.addPersonalization(personalization);
    mail.addContent(new Content("text/html", getContentFromTemplate(templateData)));
    return emailProvider.send(mail);
  }

  public String send(String toEmail, String subject, final TemplateVariablesProvider templateData)
      throws IOException {
    return send(List.of(toEmail), subject, templateData);
  }
}
