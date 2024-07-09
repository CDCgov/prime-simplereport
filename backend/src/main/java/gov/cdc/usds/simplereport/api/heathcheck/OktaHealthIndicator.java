package gov.cdc.usds.simplereport.api.heathcheck;

import com.okta.sdk.resource.client.ApiException;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class OktaHealthIndicator implements HealthIndicator {
  private final OktaRepository _oktaRepo;
  public static final String ACTIVE_LITERAL = "ACTIVE";

  @Override
  public Health health() {
    Health.Builder oktaDegradedWarning = Health.status("OKTA_DEGRADED");
    try {
      String oktaStatus = _oktaRepo.getApplicationStatusForHealthCheck();
      if (!ACTIVE_LITERAL.equals(oktaStatus)) {
        log.info("Okta status didn't return ACTIVE, instead returned " + oktaStatus);
        return oktaDegradedWarning.build();
      }
    } catch (NullPointerException e) {
      log.info("Call to Okta repository status returned null");
      return oktaDegradedWarning.build();
    } catch (ApiException e) {
      // Okta API call errored
      log.info("Okta status call raised an exception: " + e.getMessage());
      return oktaDegradedWarning.build();
    }

    return Health.up().build();
  }
}
