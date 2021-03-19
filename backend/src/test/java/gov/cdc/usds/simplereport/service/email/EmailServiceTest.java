package gov.cdc.usds.simplereport.service.email;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import com.sendgrid.helpers.mail.Mail;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import java.io.IOException;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

  private static final SendGridProperties FAKE_PROPERTIES =
      new SendGridProperties(true, null, "me@example.com", List.of(), List.of());

  @Mock EmailProvider mockSendGrid;
  @Captor ArgumentCaptor<Mail> mail;

  private EmailService _service;

  @BeforeEach
  void initService() {
    _service = new EmailService(mockSendGrid, FAKE_PROPERTIES);
  }

  @Test
  void sendEmail() throws IOException {

    // GIVEN
    String toEmail = "test@foo.com";
    String subject = "Testing the email service";
    String message = "Here's a message for ya";

    // WHEN
    _service.send(toEmail, subject, message);

    // THEN
    verify(mockSendGrid, times(1)).send(mail.capture());
    assertEquals(mail.getValue().getPersonalization().get(0).getTos().get(0).getEmail(), toEmail);
    assertEquals(mail.getValue().getSubject(), subject);
    assertEquals(mail.getValue().getContent().get(0).getValue(), message);
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
    String message = "Here's a message for ya";

    // WHEN
    _service.send(tos, subject, message);

    // THEN
    verify(mockSendGrid, times(1)).send(mail.capture());
    for (int i = 0; i < tos.size(); i++) {
      assertEquals(
          mail.getValue().getPersonalization().get(0).getTos().get(i).getEmail(), tos.get(i));
    }
    assertEquals(mail.getValue().getSubject(), subject);
    assertEquals(mail.getValue().getContent().get(0).getValue(), message);
  }
}
