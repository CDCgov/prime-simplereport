package gov.cdc.usds.simplereport.api.healthcheck;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.heathcheck.OktaHealthIndicator;
import gov.cdc.usds.simplereport.db.repository.BaseRepositoryTest;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.mock.mockito.SpyBean;

@RequiredArgsConstructor
@EnableConfigurationProperties
class OktaHealthIndicatorTest extends BaseRepositoryTest {

  @SpyBean private DemoOktaRepository mockOktaRepo;

  @Autowired private OktaHealthIndicator indicator;

  @Test
  void health_SUCCEEDSWhenOktaRepoReturnsActive() {
    when(mockOktaRepo.getApplicationStatusForHealthCheck()).thenReturn("ACTIVE");
    assertThat(indicator.health()).isEqualTo(Health.up().build());
  }

  @Test
  void health_failsWhenOktaRepoDoesntReturnActive() {
    when(mockOktaRepo.getApplicationStatusForHealthCheck()).thenReturn("INACTIVE");
    Health.Builder oktaDegradedWarning = Health.status("OKTA_DEGRADED");

    assertThat(indicator.health()).isEqualTo(oktaDegradedWarning.build());
  }
}
