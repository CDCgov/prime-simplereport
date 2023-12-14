package gov.cdc.usds.simplereport.api.heathcheck;

import gov.cdc.usds.simplereport.db.repository.FeatureFlagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.JDBCConnectionException;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component("prod-smoke-test")
@Slf4j
@RequiredArgsConstructor
public class BackendAndDatabaseHealthIndicator implements HealthIndicator {
  private final FeatureFlagRepository _ffRepo;

  @Override
  public Health health() {
    try {
      _ffRepo.findAll();
      return Health.up().build();
    } catch (JDBCConnectionException e) {
      return Health.down().build();
    }
  }
}
