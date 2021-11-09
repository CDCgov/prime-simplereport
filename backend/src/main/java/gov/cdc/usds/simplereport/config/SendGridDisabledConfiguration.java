package gov.cdc.usds.simplereport.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Email;
import gov.cdc.usds.simplereport.service.email.EmailProvider;
import java.io.IOException;
import java.util.Collection;
import java.util.stream.Collectors;
import javax.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;

@ConditionalOnMissingBean(EmailProvider.class)
@Configuration
@Slf4j
public class SendGridDisabledConfiguration {

  @ConditionalOnMissingBean(EmailProvider.class)
  @Component
  class NoOpEmailProvider implements EmailProvider {

    @PostConstruct
    void init() {
      log.info("NoOpEmailProvider is enabled!");
    }

    @Override
    public String send(Mail mail) throws IOException {
      return null;
    }
  }

  @ConditionalOnProperty(
      prefix = "spring.mail",
      name = {"port", "host"})
  @Order(Ordered.HIGHEST_PRECEDENCE)
  @Component
  @RequiredArgsConstructor
  class LocalEmailProvider implements EmailProvider {

    final JavaMailSender mailSender;

    @PostConstruct
    void init() {
      log.info("LocalEmailProvider is enabled!");
    }

    @Override
    public String send(Mail mail) throws IOException {

      String[] recipientEmails =
          mail.getPersonalization().stream()
              .map(
                  personalization ->
                      personalization.getTos().stream()
                          .map(Email::getEmail)
                          .collect(Collectors.toList()))
              .flatMap(Collection::stream)
              .collect(Collectors.toList())
              .toArray(String[]::new);

      SimpleMailMessage message = new SimpleMailMessage();
      message.setFrom(mail.getFrom().getEmail());
      message.setTo(recipientEmails);
      message.setSubject(mail.getSubject());

      ObjectMapper objectMapper = new ObjectMapper();
      objectMapper.enable(SerializationFeature.INDENT_OUTPUT);

      message.setText(objectMapper.writeValueAsString(mail));
      mailSender.send(message);
      log.debug(message.toString());

      return null;
    }
  }
}
