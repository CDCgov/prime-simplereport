package gov.cdc.usds.simplereport.service.email;

import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Attachments;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import com.sendgrid.helpers.mail.objects.Personalization;
import gov.cdc.usds.simplereport.api.model.TemplateVariablesProvider;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import java.io.IOException;
import java.io.InputStream;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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

  private String sendWithProvider(
      final List<String> toEmail,
      final String subject,
      final String body,
      final Attachments attachments)
      throws IOException {
    Mail mail = new Mail();
    mail.setFrom(
        new Email(sendGridProperties.getFromEmail(), sendGridProperties.getFromDisplayName()));
    mail.setSubject(subject);
    Personalization personalization = new Personalization();
    toEmail.stream().map(Email::new).forEach(personalization::addTo);
    mail.addPersonalization(personalization);
    mail.addContent(new Content("text/html", body));
    if (attachments != null) {
      mail.addAttachments(attachments);
    }
    return emailProvider.send(mail);
  }

  private String sendWithProvider(
      final List<String> toEmail, final String subject, final String body) throws IOException {
    return sendWithProvider(toEmail, subject, body, null);
  }

  private String getContentFromTemplate(
      final String templateName, final Map<String, Object> templateVariables) {
    final Context context = new Context();
    context.setVariables(templateVariables);

    return templateEngine.process(templateName, context);
  }

  private String getContentFromTemplate(final String templateName) {
    return getContentFromTemplate(templateName, new HashMap<>());
  }

  private String getContentFromTemplate(final TemplateVariablesProvider templateData) {
    return getContentFromTemplate(
        templateData.getTemplateName(), templateData.toTemplateVariables());
  }

  private Attachments getAttachmentsFromResource(final String attachmentResourceName)
      throws IOException {
    final String resourcePath = "attachments/" + attachmentResourceName;
    try (final InputStream content =
        getClass().getClassLoader().getResourceAsStream(resourcePath)) {
      if (content == null) {
        return null;
      }

      return new Attachments.Builder(attachmentResourceName, content)
          .withType("application/pdf")
          .build();
    }
  }

  public String send(
      final List<String> toEmail,
      final String subject,
      final TemplateVariablesProvider templateData)
      throws IOException {
    return sendWithProvider(toEmail, subject, getContentFromTemplate(templateData));
  }

  public String send(
      final String toEmail, final String subject, final TemplateVariablesProvider templateData)
      throws IOException {
    return send(List.of(toEmail), subject, templateData);
  }

  public String send(final String toEmail, final String subject, final String templateName)
      throws IOException {
    return sendWithProvider(List.of(toEmail), subject, getContentFromTemplate(templateName));
  }

  public String send(
      final String toEmail,
      final String subject,
      final String templateName,
      final String attachmentResourceName)
      throws IOException {
    final Attachments attachments = getAttachmentsFromResource(attachmentResourceName);
    return sendWithProvider(
        List.of(toEmail), subject, getContentFromTemplate(templateName), attachments);
  }

  public String sendWithProviderTemplate(
      final String toEmail, final EmailProviderTemplate providerTemplate) throws IOException {
    Mail mail = new Mail();
    mail.setFrom(
        new Email(sendGridProperties.getFromEmail(), sendGridProperties.getFromDisplayName()));

    // Use SendGrid Dynamic Template (subject and body configured in SendGrid web app)
    mail.setTemplateId(sendGridProperties.getDynamicTemplateGuid(providerTemplate));

    Personalization personalization = new Personalization();
    personalization.addTo(new Email(toEmail));
    mail.addPersonalization(personalization);

    return emailProvider.send(mail);
  }
}
