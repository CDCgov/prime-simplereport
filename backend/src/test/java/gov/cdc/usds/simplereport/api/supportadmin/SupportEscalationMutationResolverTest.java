package gov.cdc.usds.simplereport.api.supportadmin;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.errors.GenericGraphqlException;
import gov.cdc.usds.simplereport.api.supportescalation.SupportEscalationMutationResolver;
import gov.cdc.usds.simplereport.service.BaseServiceTest;
import gov.cdc.usds.simplereport.service.supportescalation.SupportEscalationService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;

@SliceTestConfiguration.WithSimpleReportOrgAdminUser
class SupportEscalationMutationResolverTest extends BaseServiceTest<SupportEscalationService> {
  @Mock SupportEscalationService service;

  @InjectMocks SupportEscalationMutationResolver resolver;

  @Test
  void escalation_success() {
    when(service.sendEscalationMessage()).thenReturn(true);
    boolean escalationCompleted = resolver.sendSupportEscalation();
    assertThat(escalationCompleted).isTrue();
  }

  @Test
  void escalation_throws_if_fails() {
    when(service.sendEscalationMessage()).thenReturn(false);
    assertThrows(GenericGraphqlException.class, () -> resolver.sendSupportEscalation());
  }
}
