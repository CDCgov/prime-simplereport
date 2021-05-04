package gov.cdc.usds.simplereport.idp.authentication;

import com.okta.authn.sdk.AuthenticationException;
import com.okta.authn.sdk.client.AuthenticationClient;
import com.okta.authn.sdk.client.AuthenticationClients;
import com.okta.authn.sdk.resource.AuthenticationResponse;
import com.okta.spring.boot.sdk.config.OktaClientProperties;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import java.util.List;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
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
  private AuthenticationClient _client;
  private String _api_token;
  private String _org_url;

  public LiveOktaAuthentication(
      OktaClientProperties oktaClientProperties,
      @Value("${okta.oauth2.client-id}") String oktaOAuth2ClientId) {
    _client = AuthenticationClients.builder().setOrgUrl(oktaClientProperties.getOrgUrl()).build();
    _api_token = oktaClientProperties.getToken();
    _org_url = oktaClientProperties.getOrgUrl();
  }

  /**
   * Converts an activation token into a state token by sending a REST request to the Okta API. (The
   * Okta Authentication SDK does not yet support translating an activation token to a state token.
   * If that changes, update this method to use the SDK.) If successful, it moves the Okta state
   * machine into a RESET_PASSWORD state.
   * https://developer.okta.com/docs/reference/api/authn/#response-example-for-activation-token-success-user-without-password
   *
   * @param activationToken: the token passed from Okta when creating a new user.
   * @param requestingIpAddress the IP address of the user requesting a new account.
   * @param userAgent the user agent of the user requesting a new account.
   * @return The state token affiliated with this request by Okta.
   * @throws Exception if the state token is not returned by Okta.
   */
  public String getStateTokenFromActivationToken(
      String activationToken, String requestingIpAddress, String userAgent) throws Exception {
    JSONObject requestBody = new JSONObject();
    requestBody.put("token", activationToken);
    String authorizationToken = "SSWS " + _api_token;
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
                              headers.add("X-Forwarded-For", requestingIpAddress);
                              headers.add("Authorization", authorizationToken);
                              return execution.execute(request, body);
                            }))
            .build();
    String response = "";
    response = restTemplate.postForObject(_org_url, requestBody, String.class);
    JSONObject responseJson = new JSONObject(response);
    if (responseJson.has("stateToken")) {
      return responseJson.getString("stateToken");
    } else {
      throw new Exception("Activation token invalid.");
    }
  }

  /**
   * Using the Okta Authentication SDK, sets a user's password for the first time.
   *
   * @param stateToken the state token associated with the request.
   * @param password the user-provided password to set.
   * @throws AuthenticationException if the state token is invalid or the state is not set to
   *     RESET_PASSWORD.
   * @throws CredentialException if the password does not meet Okta requirements.
   * @return the updated state token.
   */
  public String setPassword(String stateToken, char[] password) throws AuthenticationException {
    AuthenticationResponse response =
        _client.resetPassword(password, stateToken, new OktaStateHandler());
    return response.getStateToken();
  }

  public void setRecoveryQuestions(String question, String answer) {
    // changeRecoveryQuestion is a method of API user, not AuthenticationClient like
    // resetting the password.
    // it requires the user id, password, and question/answer
    // the user/password information can probably be extracted from setPassword and
    // passed here, though that likely needs to happen in the REST handler (since it might
    // involve session ids)
    // we can track the state token on session ids, but I'm not sure if that alone will be
    // enough information - is there a way to also store the user somehow? Might be able to set the user directly as a session attribute?
  }
}
