package gov.cdc.usds.simplereport.service.crm;

import com.microsoft.aad.adal4j.AuthenticationContext;
import com.microsoft.aad.adal4j.AuthenticationResult;
import com.microsoft.aad.adal4j.ClientCredential;
import gov.cdc.usds.simplereport.properties.DynamicsProperties;
import gov.cdc.usds.simplereport.service.model.crm.AccountRequestDynamicsData;
import java.net.MalformedURLException;
import java.util.Collections;
import java.util.Date;
import java.util.Map;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.Semaphore;
import javax.annotation.PostConstruct;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@ConditionalOnProperty(name = "simple-report.dynamics.enabled", havingValue = "true")
@Primary
@Component
public class DynamicsCrmProvider implements CrmProvider {
  private static final Logger LOG = LoggerFactory.getLogger(DynamicsCrmProvider.class);

  private static final Semaphore SEMAPHORE = new Semaphore(1);

  private static final String LOGIN_AUTHORITY = "https://login.microsoftonline.com/";
  private static final String INTAKES_PATH = "/api/data/v9.2/bah_testingsiteintakes";
  private static final long REFRESH_BEFORE_MS = 60 * 1000L;

  private final DynamicsProperties _dynamicsProperties;
  private AuthenticationResult credentials;

  public DynamicsCrmProvider(final DynamicsProperties dynamicsProperties) {
    _dynamicsProperties = dynamicsProperties;
  }

  @PostConstruct
  void init() {
    LOG.info("Dynamics is enabled!");
  }

  private String getAccessTokenFromService() throws InterruptedException {
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
      if (credentials == null) {
        LOG.error("Dynamics AuthenticationResult is null");
        return null;
      }

      return credentials.getAccessToken();
    } catch (MalformedURLException | ExecutionException e) {
      LOG.error("Unable to get credentials: {}", e.toString());
      return null;
    }
  }

  private String getAccessToken() {
    try {
      SEMAPHORE.acquire();

      if (credentials != null && credentials.getExpiresOnDate() != null) {
        long now = new Date().getTime();
        long expiresAt = credentials.getExpiresOnDate().getTime();

        long remainingValidMs = expiresAt - now;

        if (remainingValidMs > REFRESH_BEFORE_MS) {
          return credentials.getAccessToken();
        }
      }

      return getAccessTokenFromService();
    } catch (InterruptedException e) {
      LOG.error("Interrupted: {}", e.toString());
      Thread.currentThread().interrupt();
      return null;
    } finally {
      SEMAPHORE.release();
    }
  }

  @Override
  public void submitAccountRequestData(final AccountRequestDynamicsData dynamicsData) {
    final String accessToken = getAccessToken();
    if (accessToken == null) {
      LOG.error("Could not get access token for dynamics");
      return;
    }

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setAccept(Collections.singletonList(MediaType.APPLICATION_JSON));
    headers.setBearerAuth(accessToken);
    headers.add("OData-Version", "4.0");
    headers.add("OData-MaxVersion", "4.0");

    HttpEntity<Map<String, Object>> entity = new HttpEntity<>(dynamicsData.getDataMap(), headers);
    String requestUrl = _dynamicsProperties.getResourceUrl() + INTAKES_PATH;

    RestTemplate restTemplate = new RestTemplate();
    try {
      ResponseEntity<JSONObject> response =
          restTemplate.exchange(requestUrl, HttpMethod.POST, entity, JSONObject.class);

      if (response.getStatusCode() != HttpStatus.NO_CONTENT) {
        LOG.error("Dynamics request failed with code: {} (expected 204)", response.getStatusCode());
      }
    } catch (RestClientException e) {
      LOG.error("Dynamics request failed, check request body: {}", e.toString());
      throw e;
    }
  }
}
