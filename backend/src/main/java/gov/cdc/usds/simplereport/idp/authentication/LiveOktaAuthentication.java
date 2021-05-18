package gov.cdc.usds.simplereport.idp.authentication;

import com.okta.sdk.authc.credentials.TokenClientCredentials;
import com.okta.sdk.client.Client;
import com.okta.sdk.client.Clients;
import com.okta.sdk.resource.ResourceException;
import com.okta.sdk.resource.user.PasswordCredential;
import com.okta.sdk.resource.user.RecoveryQuestionCredential;
import com.okta.sdk.resource.user.User;
import com.okta.sdk.resource.user.UserCredentials;
import com.okta.spring.boot.sdk.config.OktaClientProperties;
import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.json.JSONObject;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

/**
 * Created by emmastephenson on 4/28/21
 *
 * <p>Handles all Okta-related authenticaton.
 */
@Profile("!" + BeanProfiles.NO_OKTA_AUTH)
@Service
public class LiveOktaAuthentication implements OktaAuthentication {
  private static final Logger LOG = LoggerFactory.getLogger(LiveOktaAuthentication.class);

  private Client _client;
  private String _apiToken;
  private String _orgUrl;

  public LiveOktaAuthentication(OktaClientProperties oktaClientProperties) {
    LOG.info("WIP: liveOktaAuthentication initialized");
    _client =
        Clients.builder()
            .setOrgUrl(oktaClientProperties.getOrgUrl())
            .setClientCredentials(new TokenClientCredentials(oktaClientProperties.getToken()))
            .build();
    _apiToken = oktaClientProperties.getToken();
    _orgUrl = oktaClientProperties.getOrgUrl();
  }

  /**
   * Converts an activation token into a state token by sending a REST request to the Okta API. (The
   * Okta Authentication SDK does not yet support translating an activation token to a state token.
   * If that changes, update this method to use the SDK.) If successful, it moves the Okta state
   * machine into a RESET_PASSWORD state.
   * https://developer.okta.com/docs/reference/api/authn/#response-example-for-activation-token-success-user-without-password
   *
   * @param activationToken the token passed from Okta when creating a new user.
   * @param crossForwardedHeader the IP address of the user requesting a new account.
   * @param userAgent the user agent of the user requesting a new account.
   * @return The state token affiliated with this request by Okta.
   * @throws Exception if the state token is not returned by Okta.
   */
  public JSONObject activateUser(
      String activationToken, String crossForwardedHeader, String userAgent)
      throws InvalidActivationLinkException {
    LOG.info("activating user");
    JSONObject requestBody = new JSONObject();
    requestBody.put("token", activationToken);
    String authorizationToken = "SSWS " + _apiToken;
    RestTemplate restTemplate =
        new RestTemplateBuilder(
                rt ->
                    rt.getInterceptors()
                        .add(
                            (request, body, execution) -> {
                              HttpHeaders headers = request.getHeaders();
                              headers.setContentType(MediaType.APPLICATION_JSON);
                              headers.setAccept(List.of(MediaType.APPLICATION_JSON));
                              headers.add(HttpHeaders.USER_AGENT, userAgent);
                              headers.add("X-Forwarded-For", crossForwardedHeader);
                              headers.add("Authorization", authorizationToken);
                              return execution.execute(request, body);
                            }))
            .build();
    String response = restTemplate.postForObject(_orgUrl, requestBody, String.class);
    JSONObject responseJson = new JSONObject(response);
    LOG.info("activating user response: " + response);
    if (responseJson.has("stateToken") && responseJson.has("userId")) {
      return responseJson;
    } else {
      throw new InvalidActivationLinkException();
    }
  }

  /**
   * Using the Okta Management SDK, sets a user's password for the first time.
   *
   * @param userId the user id of the user making the request.
   * @param password the user-provided password to set.
   * @throws OktaAuthenticationFailureException if the password doesn't meet Okta requirements or
   *     the user is not in a RESET_PASSWORD state.
   */
  public void setPassword(String userId, char[] password)
      throws OktaAuthenticationFailureException {
    try {
      LOG.info("setting password for user");
      User user = _client.getUser(userId);
      UserCredentials creds = user.getCredentials();
      PasswordCredential passwordCred =
          _client.instantiate(PasswordCredential.class).setValue(password);
      creds.setPassword(passwordCred);
      user.setCredentials(creds);
      user.update();
      LOG.info("set password successful");
    } catch (ResourceException e) {
      LOG.info("resource exception thrown");
      throw new OktaAuthenticationFailureException("Error setting user's password", e);
    }
  }

  /**
   * Using the Okta Management SDK, set's a user's recovery questions.
   *
   * @param userId the user id of the user making the request.
   * @param question the user-selected question to answer.
   * @param answer the user-input answer to the selected question.
   * @throws OktaAuthenticationFailureException if the recovery question/answer doesn't meet Okta
   *     requirements.
   */
  public void setRecoveryQuestion(String userId, String question, String answer)
      throws OktaAuthenticationFailureException {
    try {
      User user = _client.getUser(userId);
      UserCredentials creds = user.getCredentials();
      RecoveryQuestionCredential recoveryCred =
          _client
              .instantiate(RecoveryQuestionCredential.class)
              .setQuestion(question)
              .setAnswer(answer);
      creds.setRecoveryQuestion(recoveryCred);
      user.setCredentials(creds);
      user.update();
    } catch (ResourceException e) {
      throw new OktaAuthenticationFailureException("Error setting recovery questions", e);
    }
  }
}
