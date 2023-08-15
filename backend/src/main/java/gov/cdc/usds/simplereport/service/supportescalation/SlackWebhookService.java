package gov.cdc.usds.simplereport.service.supportescalation;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
@AllArgsConstructor
public class SlackWebhookService {

  private SlackConfigService slackConfigService;

  public boolean sendSlackEscalationMessage() {
    return slackConfigService.makeEscalationRequest();
  }
}
