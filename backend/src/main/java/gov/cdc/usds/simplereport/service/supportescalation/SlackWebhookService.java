package gov.cdc.usds.simplereport.service.supportescalation;

import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class SlackWebhookService {

  private SlackConfigService slackConfigService;

  public boolean sendSlackEscalationMessage() {
    return slackConfigService.makeEscalationRequest();
  }
}
