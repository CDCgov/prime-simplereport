package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.service.supportescalation.SlackConfigService;
import gov.cdc.usds.simplereport.service.supportescalation.SlackWebhookService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class SlackWebhookServiceTest {

  private SlackWebhookService service;
  private static SlackConfigService config;

  @BeforeEach
  void setup() {
    config = mock(SlackConfigService.class);
    service = new SlackWebhookService(config);
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void sendSlackEscalationMessage_success() {
    // GIVEN
    when(config.makeEscalationRequest()).thenReturn(true);

    // WHEN
    boolean escalationWasOk = service.sendEscalationMessage();

    // THEN
    verify(config, times(1)).makeEscalationRequest();
    assertThat(escalationWasOk).isTrue();
  }
}
