package gov.cdc.usds.simplereport.service.supportescalation;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class SlackWebhookService {

  private SlackConfigService slackConfigService;

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public boolean sendSlackEscalationMessage() {
    return slackConfigService.makeEscalationRequest();
  }
}
