package gov.cdc.usds.simplereport.api.heathcheck;

import com.okta.sdk.resource.api.GroupApi;
import com.okta.sdk.resource.client.ApiException;
import gov.cdc.usds.simplereport.db.repository.FeatureFlagRepository;
import gov.cdc.usds.simplereport.idp.repository.LiveOktaRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.JDBCConnectionException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.stereotype.Component;

@Component("backend-and-db-smoke-test")
@Slf4j
@RequiredArgsConstructor
public class BackendAndDatabaseHealthIndicator implements HealthIndicator {
    private final FeatureFlagRepository _ffRepo;
    private final OktaRepository _oktaRepo;

    @Override
    public Health health() {
        try {
            _ffRepo.findAll();
            _oktaRepo.getConnectTimeoutForHealthCheck();

            return Health.up().build();
        } catch (JDBCConnectionException e) {
            return Health.down().build();
            // Okta API call errored
        } catch (ApiException e) {
            log.info(e.getMessage());
            return Health.down().build();
        }
    }
}
