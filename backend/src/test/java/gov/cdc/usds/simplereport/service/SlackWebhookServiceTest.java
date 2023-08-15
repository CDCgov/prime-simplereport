package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.service.supportescalation.SlackConfig;
import gov.cdc.usds.simplereport.service.supportescalation.SlackWebhookService;
import java.io.IOException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.boot.test.mock.mockito.MockBean;

class SlackWebhookServiceTest extends BaseServiceTest<SlackWebhookService> {

  private SlackWebhookService service;

  @MockBean private SlackConfig config;

  @BeforeEach
  void initService() {
    config = Mockito.mock(SlackConfig.class);
    service = new SlackWebhookService(config);
  }

  @Test
  void sendSlackEscalationMessage_success() throws IOException {
    // GIVEN
    when(config.makeEscalationRequest()).thenReturn(true);

    // WHEN
    boolean escalationWasOk = service.sendSlackEscalationMessage();

    // THEN
    verify(config, times(1)).makeEscalationRequest();
    assertThat(escalationWasOk).isTrue();
  }
}
