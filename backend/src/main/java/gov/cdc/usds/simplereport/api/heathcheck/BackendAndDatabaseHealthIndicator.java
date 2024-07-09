package gov.cdc.usds.simplereport.api.heathcheck;

import gov.cdc.usds.simplereport.db.repository.FeatureFlagRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.JDBCConnectionException;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component("backend-and-db-smoke-test")
@Slf4j
@RequiredArgsConstructor
public class BackendAndDatabaseHealthIndicator implements HealthIndicator {
  private final FeatureFlagRepository _ffRepo;

  @Override
  public Health health() {
    try {
      _ffRepo.findAll();
      return Health.up().build();

      // reach into the ff repository returned a bad value or db connection issue respectively
    } catch (IllegalArgumentException | JDBCConnectionException e) {
      return Health.down().build();
    }
  }
}
