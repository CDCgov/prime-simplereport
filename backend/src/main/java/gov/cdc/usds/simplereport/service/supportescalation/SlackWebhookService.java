package gov.cdc.usds.simplereport.service.supportescalation;

import gov.cdc.usds.simplereport.api.model.errors.SlackEscalationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SlackWebhookService {

  private SlackConfig slackConfig;

  public SlackWebhookService(SlackConfig slackConfig) {
    this.slackConfig = slackConfig;
  }

  public boolean sendSlackEscalationMessage() throws SlackEscalationException {
    boolean escalationSucceeded = slackConfig.makeEscalationRequest();
    return escalationSucceeded;
  }
}
