package gov.cdc.usds.simplereport.service.crm;

import com.microsoft.aad.adal4j.AuthenticationContext;
import com.microsoft.aad.adal4j.AuthenticationResult;
import com.microsoft.aad.adal4j.ClientCredential;
import gov.cdc.usds.simplereport.properties.DynamicsProperties;
import java.net.MalformedURLException;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.Semaphore;
import javax.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@ConditionalOnProperty(name = "simple-report.dynamics.enabled", havingValue = "true")
@Primary
@Component
public class DynamicsCrmProvider implements CrmProvider {
  private static final Logger LOG = LoggerFactory.getLogger(DynamicsCrmProvider.class);

  private static final Semaphore SEMAPHORE = new Semaphore(1);

  private static final String LOGIN_AUTHORITY = "https://login.microsoftonline.com/";
  private static final long REFRESH_BEFORE_MS = 15 * 1000;

  private final DynamicsProperties _dynamicsProperties;
  private AuthenticationResult credentials;

  public DynamicsCrmProvider(final DynamicsProperties dynamicsProperties) {
    _dynamicsProperties = dynamicsProperties;
  }

  @PostConstruct
  void init() {
    LOG.info("Dynamics is enabled!");
  }

  private String getToken() {
    try {
      SEMAPHORE.acquire();

      if (credentials != null) {
        long now = new Date().getTime();
        long expiresAt = credentials.getExpiresOnDate().getTime();

        long remainingValidMs = expiresAt - now;

        if (remainingValidMs > REFRESH_BEFORE_MS) {
          LOG.info("using existing credentials");
          return credentials.getAccessToken();
        }
      }

      LOG.info("getting new credentials");

      ExecutorService service = Executors.newFixedThreadPool(1);

      try {
        AuthenticationContext context =
            new AuthenticationContext(
                LOGIN_AUTHORITY + _dynamicsProperties.getTenantId(), true, service);
        Future<AuthenticationResult> future =
            context.acquireToken(
                _dynamicsProperties.getResourceUrl(),
                new ClientCredential(
                    _dynamicsProperties.getClientId(), _dynamicsProperties.getClientSecret()),
                null);

        credentials = future.get();
        return credentials.getAccessToken();
      } catch (MalformedURLException | InterruptedException | ExecutionException e) {
        LOG.warn("Unable to get credentials: {}", e.toString());
        return null;
      }
    } catch (InterruptedException e) {
      LOG.warn("Semaphore interrupted");
      return null;
    } finally {
      SEMAPHORE.release();
    }
  }

  @Override
  public void submitAccountRequestData(final Map<String, Object> data) {
    LOG.info(Thread.currentThread().getName());

    final String accessToken = getToken();

    try {
      Thread.sleep(5000);
    } catch (InterruptedException e) {
      LOG.warn("interrupted sleep");
    }

    LOG.info("SHOULD CALL DYNAMICS");
    LOG.info(_dynamicsProperties.getClientId());
  }
}
