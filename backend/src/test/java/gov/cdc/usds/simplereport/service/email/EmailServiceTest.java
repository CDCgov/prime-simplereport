package gov.cdc.usds.simplereport.service.email;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Attachments;
import com.sendgrid.helpers.mail.objects.Personalization;
import gov.cdc.usds.simplereport.api.model.TemplateVariablesProvider;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.thymeleaf.spring6.SpringTemplateEngine;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest extends BaseServiceTest<EmailService> {
  @Qualifier("simpleReportTemplateEngine")
  @Autowired
  SpringTemplateEngine _templateEngine;

  private static final SendGridProperties FAKE_PROPERTIES =
      SendGridProperties.builder()
          .enabled(true)
          .apiKey(null)
          .fromEmail("me@example.com")
          .fromDisplayName("My Display Name")
          .accountRequestRecipient(List.of())
          .waitlistRecipient(List.of())
          .outreachMailingListRecipient(List.of("support-test@simplereport.gov"))
          .dynamicTemplates(Map.of())
          .build();

  @Mock EmailProvider mockSendGrid;
  @Captor ArgumentCaptor<Mail> mail;

  private EmailService _service;

  @BeforeEach
  void initService() {
    _service = new EmailService(mockSendGrid, FAKE_PROPERTIES, _templateEngine);
  }

  public static class FooBarTemplate implements TemplateVariablesProvider {
    private final String foo;
    private final String bar;

    public FooBarTemplate(final String foo, final String bar) {
      this.foo = foo;
      this.bar = bar;
    }

    @Override
    public String getTemplateName() {
      return "test-template";
    }

    @Override
    public Map<String, Object> toTemplateVariables() {
      return new HashMap<>() {
        {
          put("foo", foo);
          put("bar", bar);
        }
      };
    }
  }

  @Test
  void sendEmail() throws IOException {

    // GIVEN
    String toEmail = "test@foo.com";
    String subject = "Testing the email service";
    FooBarTemplate fbTemplate = new FooBarTemplate("var 1", "var 2");

    // WHEN
    _service.send(toEmail, subject, fbTemplate);

    // THEN
    verify(mockSendGrid, times(1)).send(mail.capture());
    assertEquals(mail.getValue().getPersonalization().get(0).getTos().get(0).getEmail(), toEmail);
    assertEquals(mail.getValue().getSubject(), subject);
    assertThat(mail.getValue().getContent().get(0).getValue())
        .contains("<b>Foo:</b> var 1", "<b>Bar:</b> var 2");
    assertNull(mail.getValue().getAttachments());
  }

  @Test
  void sendMultiRecipientEmail() throws IOException {
    // GIVEN
    List<String> tos =
        List.of(
            "test@foo.com",
            "another@foo.com",
            "apple@foo.com",
            "banana@foo.com",
            "onemore@foo.com");
    String subject = "Testing the email service";
    FooBarTemplate fbTemplate = new FooBarTemplate("var 1", "var 2");

    // WHEN
    _service.send(tos, subject, fbTemplate);

    // THEN
    verify(mockSendGrid, times(1)).send(mail.capture());
    for (int i = 0; i < tos.size(); i++) {
      assertEquals(
          mail.getValue().getPersonalization().get(0).getTos().get(i).getEmail(), tos.get(i));
    }
    assertEquals(mail.getValue().getSubject(), subject);
    assertThat(mail.getValue().getContent().get(0).getValue())
        .contains("<b>Foo:</b> var 1", "<b>Bar:</b> var 2");
    assertNull(mail.getValue().getAttachments());
  }

  @Test
  void sendEmailWithAttachment() throws IOException {
    // GIVEN
    String toEmail = "test@foo.com";
    String subject = "Testing the email service with attachment";
    String templateName = "test-template"; // template will be filled with empty variables
    String pdfResourceName = "test-document.pdf"; // small pdf, 376 bytes when base64 encoded

    // WHEN
    _service.send(toEmail, subject, templateName, pdfResourceName);

    // THEN
    verify(mockSendGrid, times(1)).send(mail.capture());
    assertEquals(mail.getValue().getPersonalization().get(0).getTos().get(0).getEmail(), toEmail);
    assertEquals(mail.getValue().getSubject(), subject);
    assertThat(mail.getValue().getContent().get(0).getValue())
        .doesNotContain("<b>Foo:</b> var 1", "<b>Bar:</b> var 2")
        .contains("<b>Foo:</b>", "<b>Bar:</b>");
    assertEquals(1, mail.getValue().getAttachments().size());
    assertEquals(376, mail.getValue().getAttachments().get(0).getContent().length());
    assertEquals("application/pdf", mail.getValue().getAttachments().get(0).getType());
    assertEquals(pdfResourceName, mail.getValue().getAttachments().get(0).getFilename());
  }

  @Test
  void sendWithDynamicTemplate_multipleEmails_ok() throws IOException {
    // GIVEN
    List<String> toEmails = List.of("test@foo.com", "foo@bar.org");
    Map<String, Object> dynamicTemplateData =
        Map.of(
            "facility_name", "test_facility",
            "expiration_duration", "2 days",
            "test_result_url", "http://localhost");
    // WHEN
    _service.sendWithDynamicTemplate(
        toEmails, EmailProviderTemplate.SIMPLE_REPORT_TEST_RESULT, dynamicTemplateData);

    // THEN
    verify(mockSendGrid, times(2)).send(mail.capture());
    List<Mail> sentMail = mail.getAllValues();

    // First email
    Personalization personalization0 = sentMail.get(0).getPersonalization().get(0);

    assertThat(sentMail.get(0).getFrom().getEmail()).isEqualTo("me@example.com");
    assertThat(sentMail.get(0).getFrom().getName()).isEqualTo("My Display Name");
    assertEquals("test@foo.com", personalization0.getTos().get(0).getEmail());

    // Second email
    Personalization personalization1 = sentMail.get(1).getPersonalization().get(0);

    assertThat(sentMail.get(1).getFrom().getEmail()).isEqualTo("me@example.com");
    assertThat(sentMail.get(1).getFrom().getName()).isEqualTo("My Display Name");
    assertEquals("foo@bar.org", personalization1.getTos().get(0).getEmail());
  }

  @Test
  void sendWithDynamicTemplateTestResult() throws IOException {
    // GIVEN
    String toEmail = "test@foo.com";
    Map<String, Object> dynamicTemplateData =
        Map.of(
            "facility_name", "test_facility",
            "expiration_duration", "2 days",
            "test_result_url", "http://localhost");
    // WHEN
    _service.sendWithDynamicTemplate(
        List.of(toEmail), EmailProviderTemplate.SIMPLE_REPORT_TEST_RESULT, dynamicTemplateData);

    // THEN
    verify(mockSendGrid, times(1)).send(mail.capture());
    Mail sentMail = mail.getValue();
    Personalization personalization = sentMail.getPersonalization().get(0);

    assertThat(sentMail.getFrom().getEmail()).isEqualTo("me@example.com");
    assertThat(sentMail.getFrom().getName()).isEqualTo("My Display Name");
    assertEquals(personalization.getTos().get(0).getEmail(), toEmail);
    assertThat(personalization.getDynamicTemplateData()).isEqualTo(dynamicTemplateData);
  }

  @Test
  void sendWithDynamicTemplatePatientUploadSuccess() throws IOException {
    // GIVEN
    String toEmail = "admin@org.com";
    Map<String, Object> dynamicTemplateData = Map.of("patients_url", "http://localhost");

    // WHEN
    _service.sendWithDynamicTemplate(
        List.of(toEmail), EmailProviderTemplate.SIMPLE_REPORT_PATIENT_UPLOAD, dynamicTemplateData);

    // THEN
    verify(mockSendGrid, times(1)).send(mail.capture());
    Mail sentMail = mail.getValue();
    Personalization personalization = sentMail.getPersonalization().get(0);

    assertThat(sentMail.getFrom().getEmail()).isEqualTo("me@example.com");
    assertEquals(personalization.getTos().get(0).getEmail(), toEmail);
    assertThat(personalization.getDynamicTemplateData()).isEqualTo(dynamicTemplateData);
  }

  @Test
  void sendWithDynamicTemplatePatientUploadError() throws IOException {
    // GIVEN
    String toEmail = "admin@org.com";
    Map<String, Object> dynamicTemplateData = Map.of("simplereport_url", "http://localhost");

    // WHEN
    _service.sendWithDynamicTemplate(
        List.of(toEmail),
        EmailProviderTemplate.SIMPLE_REPORT_PATIENT_UPLOAD_ERROR,
        dynamicTemplateData);

    // THEN
    verify(mockSendGrid, times(1)).send(mail.capture());
    Mail sentMail = mail.getValue();
    Personalization personalization = sentMail.getPersonalization().get(0);

    assertThat(sentMail.getFrom().getEmail()).isEqualTo("me@example.com");
    assertEquals(personalization.getTos().get(0).getEmail(), toEmail);
    assertThat(personalization.getDynamicTemplateData()).isEqualTo(dynamicTemplateData);
  }

  @Test
  void sendWithCSVAttachment_success() throws IOException {
    // GIVEN
    List<String> emails = List.of("test-1@example.com", "test-2@example.com");

    // WHEN
    _service.sendWithCSVAttachment(emails, "NJ", "facilities");

    // THEN
    verify(mockSendGrid, times(1)).send(mail.capture());
    Mail sentMail = mail.getValue();
    String emailSubject = sentMail.getSubject();
    String emailBody = sentMail.getContent().get(0).getValue();
    Attachments attachment = sentMail.getAttachments().get(0);
    String filename = attachment.getFilename();
    String type = attachment.getType();
    byte[] bytes = Base64.getDecoder().decode(attachment.getContent());
    String attachmentString = new String(bytes, StandardCharsets.UTF_8);
    Personalization personalization = sentMail.getPersonalization().get(0);

    assertThat(sentMail.getFrom().getEmail()).isEqualTo("me@example.com");
    assertEquals("support-test@simplereport.gov", personalization.getTos().get(0).getEmail());
    assertThat(emailSubject).isEqualTo("Org admin email CSVs for outreach - facilities in NJ");
    assertThat(emailBody).isEqualTo("Org admin email CSVs for outreach - facilities in NJ");
    assertThat(filename).contains("-facilities_NJ-org_admin_emails.csv");
    assertThat(type).isEqualTo("text/csv");
    assertThat(attachmentString).isEqualTo("email\ntest-1@example.com\ntest-2@example.com\n");
  }
}
