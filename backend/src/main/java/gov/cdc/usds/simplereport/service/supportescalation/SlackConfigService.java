package gov.cdc.usds.simplereport.service.supportescalation;

import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Service
@Slf4j
public class SlackConfigService {
  private final String escalationMessage = "A new support escalation has been received!";

  private String url = "https://hooks.slack.com/services/";
  private String token;

  private final HttpEntity<String> entity;
  private final RestTemplate restTemplate;

  public SlackConfigService(@Value("${slack.hook.token}") String token) {
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
    String response = "";
    try {
      String postUrl = url + token;
      response = restTemplate.postForObject(postUrl, entity, String.class);
      if (response.contains("ok")) return true;
      throw new RestClientException("Slack escalation didn't return ok response");
    } catch (RestClientException e) {
      log.error("Slack returned unexpected response: " + response);
      return false;
    }
  }
}
