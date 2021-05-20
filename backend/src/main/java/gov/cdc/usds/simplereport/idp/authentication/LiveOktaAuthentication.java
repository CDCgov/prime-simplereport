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
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;

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
   * Converts an activation token into a user id by sending a REST request to the Okta API. (The
   * Okta Authentication SDK does not yet support activating an activation token. If that changes, update this method to use the SDK.) 
   * If successful, it moves the Okta state machine into a RESET_PASSWORD state.
   * https://developer.okta.com/docs/reference/api/authn/#response-example-for-activation-token-success-user-without-password
   *
   * @param activationToken the token passed from Okta when creating a new user.
   * @param crossForwardedHeader the IP address of the user requesting a new account.
   * @param userAgent the user agent of the user requesting a new account.
   * @return The user id returned by Okta.
   * @throws OktaAuthenticationFailureException if the state token is not returned by Okta.
   *     <p>https://developer.okta.com/docs/reference/api/authn/#request-example-for-activation-token
   */

  /**
    * {
  "stateToken": "005Oj4_rx1yAYP2MFNobMXlM2wJ3QEyzgifBd_T6Go",
  "expiresAt": "2017-03-29T21:35:47.000Z",
  "status": "PASSWORD_RESET",
  "recoveryType": "ACCOUNT_ACTIVATION",
  "_embedded": {
    "user": {
      "id": "00ub0oNGTSWTBKOLGLNR",
      "passwordChanged": "2015-09-08T20:14:45.000Z",
      "profile": {
        "login": "dade.murphy@example.com",
        "firstName": "Dade",
        "lastName": "Murphy",
        "locale": "en_US",
        "timeZone": "America/Los_Angeles"
      }
    },
    "policy": {
      "expiration": {
        "passwordExpireDays": 5
      },
      "complexity": {
        "minLength": 8,
        "minLowerCase": 1,
        "minUpperCase": 1,
        "minNumber": 1,
        "minSymbol": 0
      }
    }
  },
  "_links": {
    "next": {
      "name": "resetPassword",
      "href": "https://${yourOktaDomain}/api/v1/authn/credentials/reset_password",
      "hints": {
        "allow": [
          "POST"
        ]
      }
    },
    "cancel": {
      "href": "https://${yourOktaDomain}/api/v1/authn/cancel",
      "hints": {
        "allow": [
          "POST"
        ]
      }
    }
  }
}

HTTP/1.1 401 Unauthorized
Content-Type: application/json

{
  "errorCode": "E0000004",
  "errorSummary": "Authentication failed",
  "errorLink": "E0000004",
  "errorId": "oae2fYYJmkuTg-NyozqBkb3sw",
  "errorCauses": []
}


curl -v -X POST \
-H "Accept: application/json" \
-H "Content-Type: application/json" \
-H "Authorization: SSWS ${api_token}" \
-H "User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36" \
-H "X-Forwarded-For: 23.235.46.133" \
-d '{
  "token": "o7AFoTGE9xjQiHQK6dAa"
}' "https://${yourOktaDomain}/api/v1/authn"

    */
  public String activateUser(String activationToken, String crossForwardedHeader, String userAgent)
      throws InvalidActivationLinkException {
    System.out.println("activating user (printed)");
    LOG.info("activating user");
    JSONObject requestBody = new JSONObject();
    requestBody.put("token", activationToken);
    String authorizationToken = "SSWS " + _apiToken;

  /**
   *  HttpHeaders headers = new HttpHeaders();
 headers.setContentType(MediaType.TEXT_PLAIN);
 HttpEntity<String> entity = new HttpEntity<String>(helloWorld, headers);
 URI location = template.postForLocation("https://example.com", entity);
 
   */

    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    headers.add(HttpHeaders.USER_AGENT, userAgent);
    headers.add("X-Forwarded-For", crossForwardedHeader);
    headers.add("Authorization", authorizationToken);
    HttpEntity<String> entity = new HttpEntity<String>(requestBody.toString(), headers);
    RestTemplate restTemplate = new RestTemplate();
    LOG.info("HEADERS:" + entity.getHeaders());
    LOG.info("BODY: " + entity.getBody());

    // RestTemplate restTemplate =
    //     new RestTemplateBuilder(
    //             rt ->
    //                 rt.getInterceptors()
    //                     .add(
    //                         (request, body, execution) -> {
    //                           HttpHeaders headers = request.getHeaders();
    //                           headers.setContentType(MediaType.APPLICATION_JSON);
    //                           headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    //                           headers.add(HttpHeaders.USER_AGENT, userAgent);
    //                           headers.add("X-Forwarded-For", crossForwardedHeader);
    //                           headers.add("Authorization", authorizationToken);
    //                           return execution.execute(request, body);
    //                         }))
    //         .build();
    String postUrl = _orgUrl + "/api/v1/authn";

    try {
      String response = restTemplate.postForObject(postUrl, entity, String.class);
      LOG.info("activating user response: " + response);
      JSONObject responseJson = new JSONObject(response);
      return responseJson.getJSONObject("_embedded").getJSONObject("user").getString("id");
    } catch (Exception e) {
      throw new OktaAuthenticationFailureException("activation failed", e);
    }
    // LOG.info("activating user response: " + response);
    // JSONObject responseJson = new JSONObject(response);
    // try {
    //   return responseJson.getJSONObject("_embedded").getJSONObject("user").getString("id");
    // } catch (NullPointerException e) {
    //   throw new InvalidActivationLinkException();
    // }
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
      LOG.info("setting password for user: " + userId);
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
