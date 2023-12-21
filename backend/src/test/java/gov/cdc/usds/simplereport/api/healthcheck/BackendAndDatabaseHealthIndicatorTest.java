package gov.cdc.usds.simplereport.api.healthcheck;

import static gov.cdc.usds.simplereport.api.heathcheck.BackendAndDatabaseHealthIndicator.ACTIVE_LITERAL;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.heathcheck.BackendAndDatabaseHealthIndicator;
import gov.cdc.usds.simplereport.db.repository.BaseRepositoryTest;
import gov.cdc.usds.simplereport.db.repository.FeatureFlagRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import java.sql.SQLException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.hibernate.exception.JDBCConnectionException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.mock.mockito.SpyBean;

@RequiredArgsConstructor
@EnableConfigurationProperties
class BackendAndDatabaseHealthIndicatorTest extends BaseRepositoryTest {

  @SpyBean private FeatureFlagRepository mockFeatureFlagRepo;
  @SpyBean private OktaRepository mockOktaRepo;

  @Autowired private BackendAndDatabaseHealthIndicator indicator;

  @Test
  void health_succeedsWhenReposDoesntThrow() {
    when(mockFeatureFlagRepo.findAll()).thenReturn(List.of());
    when(mockOktaRepo.getApplicationStatusForHealthCheck()).thenReturn(ACTIVE_LITERAL);

    assertThat(indicator.health()).isEqualTo(Health.up().build());
  }

  @Test
  void health_failsWhenFeatureFlagRepoDoesntThrow() {
    JDBCConnectionException dbConnectionException =
        new JDBCConnectionException(
            "connection issue", new SQLException("some reason", "some state"));
    when(mockFeatureFlagRepo.findAll()).thenThrow(dbConnectionException);
    assertThat(indicator.health()).isEqualTo(Health.down().build());
  }

  @Test
  void health_failsWhenOktaRepoDoesntReturnActive() {
    when(mockOktaRepo.getApplicationStatusForHealthCheck()).thenReturn("INACTIVE");
    assertThat(indicator.health()).isEqualTo(Health.down().build());
  }
}
