package gov.cdc.usds.simplereport.service.email;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import java.io.IOException;
import javax.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.sendgrid.SendGridProperties;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@ConditionalOnProperty(name = "simple-report.sendgrid.enabled", havingValue = "true")
@Primary
@Component
public class SendGridEmailProvider implements EmailProvider {
  private static final Logger LOG = LoggerFactory.getLogger(SendGridEmailProvider.class);

  @Autowired private SendGridProperties config;

  @PostConstruct
  void init() {
    LOG.info("SendGrid is enabled!");
  }

  @Override
  public String send(Mail mail) throws IOException {
    SendGrid sg = new SendGrid(config.getApiKey());
    Request request = new Request();
    request.setMethod(Method.POST);
    request.setEndpoint("mail/send");
    request.setBody(mail.build());
    LOG.debug("Initiating SendGrid request...");
    Response response = sg.api(request);
    LOG.debug(
        "Sendgrid response status code is {}, headers are [{}]",
        response.getStatusCode(),
        response.getHeaders());
    LOG.debug("Sendgrid response body is [{}]", response.getBody());
    return response.getBody();
  }
}
