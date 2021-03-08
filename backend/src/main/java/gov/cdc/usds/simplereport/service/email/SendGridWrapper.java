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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@ConditionalOnProperty(name = "sendgrid.enabled", havingValue = "true")
@Primary
@Component
public class SendGridWrapper implements EmailProviderWrapper {
  @Value("${sendgrid.api-key:N/A}")
  private String sendGridApiKey;

  private static final Logger LOG = LoggerFactory.getLogger(SendGridWrapper.class);

  @PostConstruct
  void init() {
    LOG.info("SendGrid is enabled!");
  }

  @Override
  public String send(Mail mail) throws IOException {
    SendGrid sg = new SendGrid(sendGridApiKey);
    Request request = new Request();
    try {
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
    } catch (IOException ex) {
      throw ex;
    }
  }
}
