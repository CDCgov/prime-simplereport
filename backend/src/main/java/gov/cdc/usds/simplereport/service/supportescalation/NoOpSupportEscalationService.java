package gov.cdc.usds.simplereport.service.supportescalation;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnMissingBean(name = "slackWebhookService")
@Slf4j
public class NoOpSupportEscalationService implements SupportEscalationService {

  public NoOpSupportEscalationService() {
    log.info("Configured for no-op support escalation");
  }

  @Override
  public boolean sendEscalationMessage() {
    log.info("No op support escalation message successful");
    return true;
  }
}
