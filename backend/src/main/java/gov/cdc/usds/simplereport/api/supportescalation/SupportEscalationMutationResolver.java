package gov.cdc.usds.simplereport.api.supportescalation;

import gov.cdc.usds.simplereport.api.model.errors.GenericGraphqlException;
import gov.cdc.usds.simplereport.service.supportescalation.SlackWebhookService;
import java.io.IOException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class SupportEscalationMutationResolver {
  private final SlackWebhookService slackClient;

  @MutationMapping
  public boolean sendSupportEscalation() throws GenericGraphqlException {

    try {
      boolean escalationSuccessful = slackClient.sendSlackEscalationMessage();
      if (escalationSuccessful) {
        return true;
      }
      throw new IOException("Escalation didn't return success");
    } catch (IOException e) {
      log.error("Slack escalation failed");
      throw new GenericGraphqlException();
    }
  }
}
