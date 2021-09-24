package gov.cdc.usds.simplereport.service.email;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import java.io.IOException;
import javax.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@ConditionalOnProperty(name = "simple-report.sendgrid.enabled", havingValue = "true")
@Primary
@Component
@Slf4j
public class SendGridEmailProvider implements EmailProvider {
  @Autowired private SendGridProperties config;

  @PostConstruct
  void init() {
    log.info("SendGrid is enabled!");
  }

  @Override
  public String send(Mail mail) throws IOException {
    SendGrid sg = new SendGrid(config.getApiKey());
    Request request = new Request();
    request.setMethod(Method.POST);
    request.setEndpoint("mail/send");
    request.setBody(mail.build());
    log.debug("Initiating SendGrid request...");
    Response response = sg.api(request);
    log.debug(
        "Sendgrid response status code is {}, headers are [{}]",
        response.getStatusCode(),
        response.getHeaders());
    log.debug("Sendgrid response body is [{}]", response.getBody());
    return response.getBody();
  }
}
