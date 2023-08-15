package gov.cdc.usds.simplereport.service.supportescalation;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SlackWebhookService {

  private SlackConfig slackConfig;

  public SlackWebhookService(SlackConfig slackConfig) {
    this.slackConfig = slackConfig;
  }

  public boolean sendSlackEscalationMessage() {
    boolean escalationSucceeded = slackConfig.makeEscalationRequest();
    return escalationSucceeded;
  }
}
