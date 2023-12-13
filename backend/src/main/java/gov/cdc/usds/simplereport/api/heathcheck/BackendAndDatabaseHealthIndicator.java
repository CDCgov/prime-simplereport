package gov.cdc.usds.simplereport.api.heathcheck;

import gov.cdc.usds.simplereport.db.repository.FeatureFlagRepository;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.JDBCConnectionException;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component("prod-smoke-test")
@Slf4j
@RequiredArgsConstructor
public class BackendAndDatabaseHealthIndicator implements HealthIndicator {
  @Getter(AccessLevel.NONE)
  @Setter(AccessLevel.NONE)
  private final FeatureFlagRepository _repo;

  @Override
  public Health health() {
    try {
      _repo.findAll();
      return Health.up().build();
    } catch (JDBCConnectionException e) {
      return Health.down().build();
    }
  }
}
