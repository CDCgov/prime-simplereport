package gov.cdc.usds.simplereport.api.heathcheck;

import com.okta.sdk.resource.client.ApiException;
import gov.cdc.usds.simplereport.db.repository.FeatureFlagRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
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
  private final OktaRepository _oktaRepo;
  public static final String ACTIVE_LITERAL = "ACTIVE";

  @Override
  public Health health() {
    try {
      _ffRepo.findAll();
      String oktaStatus = _oktaRepo.getApplicationStatusForHealthCheck();

      if (!ACTIVE_LITERAL.equals(oktaStatus)) {
        log.info("Okta status didn't return ACTIVE, instead returned " + oktaStatus);
        return Health.down().build();
      }
      return Health.up().build();
    } catch (IllegalArgumentException e) {
      // reach into the ff repository returned a bad value
      return Health.down().build();
    } catch (JDBCConnectionException e) {
      // db connection issue
      return Health.down().build();
    } catch (ApiException e) {
      // Okta API call errored
      log.info(e.getMessage());
      return Health.down().build();
    }
  }
}
