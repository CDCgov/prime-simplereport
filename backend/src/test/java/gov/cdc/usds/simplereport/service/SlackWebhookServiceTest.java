package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.service.supportescalation.SlackConfigService;
import gov.cdc.usds.simplereport.service.supportescalation.SlackWebhookService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;

class SlackWebhookServiceTest extends BaseServiceTest<SlackWebhookService> {

  @Autowired private SlackWebhookService service;

  @Autowired @MockBean private SlackConfigService config;

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void sendSlackEscalationMessage_success() {
    // GIVEN
    when(config.makeEscalationRequest()).thenReturn(true);

    // WHEN
    boolean escalationWasOk = service.sendSlackEscalationMessage();

    // THEN
    verify(config, times(1)).makeEscalationRequest();
    assertThat(escalationWasOk).isTrue();
  }
}
