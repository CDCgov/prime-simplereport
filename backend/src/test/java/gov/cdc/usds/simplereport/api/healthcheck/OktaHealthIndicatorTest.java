package gov.cdc.usds.simplereport.api.healthcheck;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import com.okta.sdk.resource.client.ApiException;
import gov.cdc.usds.simplereport.api.heathcheck.OktaHealthIndicator;
import gov.cdc.usds.simplereport.db.repository.BaseRepositoryTest;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import lombok.RequiredArgsConstructor;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.mock.mockito.SpyBean;

@RequiredArgsConstructor
@EnableConfigurationProperties
class OktaHealthIndicatorTest extends BaseRepositoryTest {

  @SpyBean private OktaRepository mockOktaRepo;

  @Autowired private OktaHealthIndicator indicator;

  @Test
  void health_SucceedsWhenOktaRepoReturnsActive() {
    when(mockOktaRepo.getApplicationStatusForHealthCheck()).thenReturn("ACTIVE");
    assertThat(indicator.health()).isEqualTo(Health.up().build());
  }

  @Test
  void health_FailsWhenOktaApiThrowsErrors() {
    when(mockOktaRepo.getApplicationStatusForHealthCheck())
        .thenThrow(new ApiException("some api error"));
    Health.Builder oktaDegradedWarning = Health.status("OKTA_DEGRADED");
    assertThat(indicator.health()).isEqualTo(oktaDegradedWarning.build());
  }

  @Test
  void health_FailsWhenOktaApiThrowsNPE() {
    when(mockOktaRepo.getApplicationStatusForHealthCheck()).thenThrow(new NullPointerException());
    Health.Builder oktaDegradedWarning = Health.status("OKTA_DEGRADED");
    assertThat(indicator.health()).isEqualTo(oktaDegradedWarning.build());
  }

  @Test
  void health_failsWhenOktaRepoDoesntReturnActive() {
    when(mockOktaRepo.getApplicationStatusForHealthCheck()).thenReturn("INACTIVE");
    Health.Builder oktaDegradedWarning = Health.status("OKTA_DEGRADED");

    assertThat(indicator.health()).isEqualTo(oktaDegradedWarning.build());
  }
}
