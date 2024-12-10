package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;

import gov.cdc.usds.simplereport.service.supportescalation.SupportEscalationService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import org.junit.jupiter.api.Test;

@SliceTestConfiguration.WithSimpleReportOrgAdminUser
public class NoOpSupportEscalationServiceTest extends BaseServiceTest<SupportEscalationService> {

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void noOpSupportEscalationSuccess() {
    boolean escalationWasOk = _service.sendEscalationMessage();
    assertThat(escalationWasOk).isTrue();
  }
}
