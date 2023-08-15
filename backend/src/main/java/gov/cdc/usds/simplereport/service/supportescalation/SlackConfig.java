package gov.cdc.usds.simplereport.service.supportescalation;

import gov.cdc.usds.simplereport.api.model.errors.SlackEscalationException;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Configuration
@Slf4j
public class SlackConfig {
  private final String escalationMessage = "A new support escalation has been received!";

  private String url = "https://hooks.slack.com/services/";
  private String token;

  private final HttpEntity<String> entity;
  private final RestTemplate restTemplate;

  public SlackConfig(@Value("${slack.hook.token}") String token) {
    String requestText = "{\"text\":\" " + escalationMessage + " \"}";

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));

    this.entity = new HttpEntity<>(requestText, headers);
    this.restTemplate = new RestTemplate();
    this.token = token;
  }

  public boolean makeEscalationRequest() {
    log.info("making escalation request");
    try {
      String postUrl = url + token;
      String response = restTemplate.postForObject(postUrl, entity, String.class);

      // Slack will respond with "ok" if the command was successful.
      if (response.contains("ok")) return true;
      log.error("Slack returned unexpected: " + response);
      throw new SlackEscalationException();
    } catch (RestClientException | SlackEscalationException e) {
      return false;
    }
  }
}
