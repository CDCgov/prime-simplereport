package gov.cdc.usds.simplereport.service.supportescalation;

import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(value = "simple-report.support-escalation.enabled", havingValue = "true")
@AllArgsConstructor
@Slf4j
public class SlackWebhookService implements SupportEscalationService {
  private SlackConfigService slackConfigService;

  @AuthorizationConfiguration.RequireGlobalAdminUser
  public boolean sendEscalationMessage() {
    return slackConfigService.makeEscalationRequest();
  }
}
