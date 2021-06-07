package gov.cdc.usds.simplereport.idp.authentication;

import com.okta.sdk.authc.credentials.TokenClientCredentials;
import com.okta.sdk.client.Client;
import com.okta.sdk.client.Clients;
import com.okta.sdk.resource.ResourceException;
import com.okta.sdk.resource.user.PasswordCredential;
import com.okta.sdk.resource.user.RecoveryQuestionCredential;
import com.okta.sdk.resource.user.User;
import com.okta.sdk.resource.user.UserCredentials;
import com.okta.sdk.resource.user.factor.ActivateFactorRequest;
import com.okta.sdk.resource.user.factor.CallUserFactor;
import com.okta.sdk.resource.user.factor.EmailUserFactor;
import com.okta.sdk.resource.user.factor.FactorProvider;
import com.okta.sdk.resource.user.factor.FactorType;
import com.okta.sdk.resource.user.factor.SmsUserFactor;
import com.okta.sdk.resource.user.factor.UserFactor;
import com.okta.spring.boot.sdk.config.OktaClientProperties;
import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * Created by emmastephenson on 4/28/21
 *
 * <p>Handles all Okta-related authenticaton.
 *
 * <p>NOTE: If you alter this file, please run LiveOktaAuthenticationTest. (It's currently
 * disabled.)
 */
@Profile("!" + BeanProfiles.NO_OKTA_AUTH)
@Service
public class LiveOktaAuthentication implements OktaAuthentication {
  private static final Logger LOG = LoggerFactory.getLogger(LiveOktaAuthentication.class);

  private static final String USER_API_ENDPOINT = "/api/v1/users/";

  private Client _client;
  private String _apiToken;
  private String _orgUrl;
  private RestTemplate _restTemplate;

  @Autowired
  public LiveOktaAuthentication(OktaClientProperties oktaClientProperties) {
    initialize(oktaClientProperties.getOrgUrl(), oktaClientProperties.getToken());
  }

  public LiveOktaAuthentication(String orgUrl, String token) {
    initialize(orgUrl, token);
  }

  private void initialize(String orgUrl, String token) {
    _client =
        Clients.builder()
            .setOrgUrl(orgUrl)
            .setClientCredentials(new TokenClientCredentials(token))
            .build();
    _apiToken = token;
    _orgUrl = orgUrl;
    _restTemplate = new RestTemplate();
    LOG.info("LiveOktaAuthentication initialization successful");
  }

  /**
   * Converts an activation token into a user id by sending a REST request to the Okta API. (The
   * Okta Authentication SDK does not yet support activating an activation token. If that changes,
   * update this method to use the SDK.) If successful, it moves the Okta state machine into a
   * RESET_PASSWORD state.
   * https://developer.okta.com/docs/reference/api/authn/#request-example-for-activation-token
   * https://developer.okta.com/docs/reference/api/authn/#response-example-for-activation-token-success-user-without-password
   *
   * @param activationToken the token passed from Okta when creating a new user.
   * @param crossForwardedHeader the IP address of the user requesting a new account, along with any
   *     other IP addresses in the request chain (typically Azure).
   * @param userAgent the user agent of the user requesting a new account.
   * @return The user id returned by Okta.
   * @throws OktaAuthenticationFailureException if the state token is not returned by Okta.
   */
  public String activateUser(String activationToken, String crossForwardedHeader, String userAgent)
      throws InvalidActivationLinkException {
    JSONObject requestBody = new JSONObject();
    requestBody.put("token", activationToken);
    String authorizationToken = "SSWS " + _apiToken;
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    headers.add(HttpHeaders.USER_AGENT, userAgent);
    headers.add("X-Forwarded-For", crossForwardedHeader);
    headers.add("Authorization", authorizationToken);
    HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), headers);
    String postUrl = _orgUrl + "/api/v1/authn";
    try {
      String response = _restTemplate.postForObject(postUrl, entity, String.class);
      JSONObject responseJson = new JSONObject(response);
      return responseJson.getJSONObject("_embedded").getJSONObject("user").getString("id");
    } catch (RestClientException | NullPointerException e) {
      throw new InvalidActivationLinkException("User could not be activated", e);
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
      User user = _client.getUser(userId);
      UserCredentials creds = user.getCredentials();
      PasswordCredential passwordCred =
          _client.instantiate(PasswordCredential.class).setValue(password);
      creds.setPassword(passwordCred);
      user.setCredentials(creds);
      user.update();
    } catch (ResourceException e) {
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

  /**
   * Using the Okta management SDK, enroll a user in SMS MFA. If successful, this enrollment
   * triggers a text to the user's phone with an activation passcode.
   *
   * @param userId the user id of the user making the request.
   * @param phoneNumber the user-provided phone number to enroll.
   * @return factorId the Okta-generated id for the phone number factor.
   * @throws OktaAuthenticationFailureException if the phone number is invalid or Okta cannot enroll
   *     it as an MFA option.
   */
  public String enrollSmsMfa(String userId, String phoneNumber)
      throws OktaAuthenticationFailureException {
    try {
      SmsUserFactor smsFactor = _client.instantiate(SmsUserFactor.class);
      smsFactor.getProfile().setPhoneNumber(phoneNumber);
      User user = _client.getUser(userId);
      user.enrollFactor(smsFactor);
      return smsFactor.getId();
    } catch (ResourceException e) {
      throw new OktaAuthenticationFailureException("Error setting SMS MFA", e);
    }
  }

  /**
   * Using the Okta management SDK, enroll a user in voice call MFA. If successful, this enrollment
   * triggers a phone call to the user with an activation passcode.
   *
   * @param userId the user id of the user making the enrollment request.
   * @param phoneNumber the user-provided phone number to enroll.
   * @return factorId the Okta-generated id for the voice call factor.
   * @throws OktaAuthenticationFailureException if the phone number is invalid or Okta cannot enroll
   *     it as an MFA option.
   */
  public String enrollVoiceCallMfa(String userId, String phoneNumber)
      throws OktaAuthenticationFailureException {
    try {
      CallUserFactor callFactor = _client.instantiate(CallUserFactor.class);
      callFactor.getProfile().setPhoneNumber(phoneNumber);
      User user = _client.getUser(userId);
      user.enrollFactor(callFactor);
      return callFactor.getId();
    } catch (ResourceException e) {
      throw new OktaAuthenticationFailureException("Error setting voice call MFA", e);
    }
  }

  /**
   * Using the Okta Management SDK, enroll a user in email MFA. If successful, this enrollment
   * triggers an activation email to the user with an OTP.
   *
   * @param userId the user id of the user making the enrollment request.
   * @param email the user-provided email address to enroll. (note: should we do any validation that
   *     this email === the enrolled email?)
   * @throws OktaAuthenticationFailureException if the email is invalid or Okta cannot enroll it as
   *     an MFA option.
   */
  public String enrollEmailMfa(String userId, String email)
      throws OktaAuthenticationFailureException {
    try {
      LOG.info("enrolling email MFA");
      EmailUserFactor emailFactor = _client.instantiate(EmailUserFactor.class);
      emailFactor.getProfile().setEmail(email);
      User user = _client.getUser(userId);
      user.enrollFactor(emailFactor);
      return emailFactor.getId();
    } catch (ResourceException e) {
      LOG.info("An exception was thrown while setting email MFA", e);
      throw new OktaAuthenticationFailureException("Error setting email MFA", e);
    }
  }

  /**
   * Using the Okta management SDK, enroll a user in an authentication app for MFA. If successful,
   * this method returns the factor id and a qr code. The qr code will be passed to the user for
   * them to finish setting enrolling in-app.
   *
   * <p>https://developer.okta.com/docs/reference/api/factors/#response-example-12
   *
   * @param userId the user id of the user making the enrollment request.
   * @param appType the appType of the app being enrolled (for now, one of Okta Verify or Google
   *     Authenticator.)
   * @throws OktaAuthenticationFailureException if the app type is not recognized, Okta fails to
   *     enroll the MFA option, or the result from Okta does not contain a QR code.
   */
  public JSONObject enrollAuthenticatorAppMfa(String userId, String appType)
      throws OktaAuthenticationFailureException {
        LOG.info("enrolling auth app");
    UserFactor factor = _client.instantiate(UserFactor.class);
    factor.setFactorType(FactorType.TOKEN_SOFTWARE_TOTP);
    switch (appType.toLowerCase()) {
      case "google":
        factor.setProvider(FactorProvider.GOOGLE);
        break;
      case "okta":
        factor.setProvider(FactorProvider.OKTA);
        break;
      default:
        throw new OktaAuthenticationFailureException("App type not recognized.");
    }
    try {
      User user = _client.getUser(userId);
      user.enrollFactor(factor);
      JSONObject embeddedJson = new JSONObject(factor.getEmbedded());
      String qrCode =
          embeddedJson
              .getJSONObject("activation")
              .getJSONObject("_links")
              .getJSONObject("qrcode")
              .getString("href");
      JSONObject factorResponse = new JSONObject();
      factorResponse.put("qrcode", qrCode);
      factorResponse.put("factorId", factor.getId());
      return factorResponse;
    } catch (NullPointerException | ResourceException | IllegalArgumentException e) {
      LOG.info("An exception was thrown while fetching auth app qrcode", e);
      throw new OktaAuthenticationFailureException("Authentication app could not be enrolled", e);
    }
  }

  /**
   * Using the Okta API, enrolls a security key, returning an activation object that contains
   * registration information for the frontend.
   *
   * <p>https://developer.okta.com/docs/reference/api/factors/#enroll-webauthn-request-example
   *
   * @param userId the user id of the user enrolling their security key.
   * @return a JSON representation of the activation object.
   * @throws OktaAuthenticationFailureException if the user id is not recognized or the factor
   *     cannot be enrolled.
   */
  public JSONObject enrollSecurityKey(String userId) throws OktaAuthenticationFailureException {
    LOG.info("enrolling security key");
    JSONObject requestBody = new JSONObject();
    requestBody.put("factorType", "webauthn");
    requestBody.put("provider", "FIDO");
    HttpEntity<String> entity = new HttpEntity<>(requestBody.toString(), createHeaders());
    String enrollWebAuthnUrl = _orgUrl + USER_API_ENDPOINT + userId + "/factors";
    try {
      String postResponse = _restTemplate.postForObject(enrollWebAuthnUrl, entity, String.class);
      JSONObject responseJson = new JSONObject(postResponse);
      JSONObject response = new JSONObject();
      response.put(
          "activation", responseJson.getJSONObject("_embedded").getJSONObject("activation"));
      response.put("factorId", responseJson.getString("id"));
      return response;
    } catch (RestClientException | NullPointerException | ResourceException e) {
      LOG.info("an exception was thrown while enrolling security key", e);
      throw new OktaAuthenticationFailureException("Security key could not be enrolled", e);
    }
  }

  /**
   * Activates a security key using the provided frontend-generated credentials.
   *
   * @param userId the user id of the user activating their security key.
   * @param factorId the factor id returned from security key enrollment
   * @param attestation the base64-encoded attestation from the WebAuthn JavaScript call
   * @param clientData the base64-encoded client data from the WebAuthn JavaScript call
   */
  public void activateSecurityKey(
      String userId, String factorId, String attestation, String clientData)
      throws OktaAuthenticationFailureException {
        LOG.info("activating security key");
    try {
      LOG.info("security key data:" + userId + " " + factorId + " " + attestation + " " + clientData);
      User user = _client.getUser(userId);
      UserFactor factor = user.getFactor(factorId);
      ActivateFactorRequest activationRequest = _client.instantiate(ActivateFactorRequest.class);
      activationRequest.setAttestation(attestation);
      activationRequest.setClientData(clientData);
      factor.activate(activationRequest);
    } catch (NullPointerException | ResourceException e) {
      LOG.info("an exception was thrown while activating the security key", e);
      throw new OktaAuthenticationFailureException("Security key could not be activated", e);
    }
  }

  /**
   * Using the Okta Management SDK, activate MFA enrollment with a user-provided passcode. This
   * method should be used for sms, call, and authentication app MFA options.
   *
   * <p>https://developer.okta.com/docs/reference/api/factors/#activate-sms-factor
   *
   * @param userId the user id of the user activating their MFA.
   * @param factorId the factor id of the factor being activated.
   * @param passcode the user-provided passcode to use for activation. This will have been sent to
   *     the user via SMS, voice call, etc.
   */
  public void verifyActivationPasscode(String userId, String factorId, String passcode)
      throws OktaAuthenticationFailureException {
    LOG.info("verifying activation passcode");
    try {
      User user = _client.getUser(userId);
      UserFactor factor = user.getFactor(factorId);
      LOG.info("verification: got user and factor");
      LOG.info("factorType: " + factor.getFactorType());
      ActivateFactorRequest activateFactor = _client.instantiate(ActivateFactorRequest.class);
      activateFactor.setPassCode(passcode);
      factor.activate(activateFactor);
    } catch (ResourceException | NullPointerException | IllegalArgumentException e) {
      LOG.info("passcode could not be verified. The following exception was thrown: ", e);
      throw new OktaAuthenticationFailureException(
          "Activation passcode could not be verifed; MFA activation failed.", e);
    }
  }

  /**
   * Triggers Okta to resend an activation passcode. Should only be used for SMS, call, and email
   * MFA options.
   *
   * <p>Note: this is not the same method that is used to send a challenge to the user; this is only
   * for when the user is in a kind of activation limbo (they've enrolled but the factor has not
   * been activated yet). There isn't a method in the SDK to re-request an activation passcode, so
   * this is done directly via the API.
   *
   * <p>https://developer.okta.com/docs/reference/api/factors/#resend-sms-as-part-of-enrollment
   *
   * @param userId the user id of the user requesting a resend.
   * @param factorId the factor id that we need to re-request a code from.
   * @throws OktaAuthenticationFailureException if the user or factor cannot be found.
   * @throws IllegalStateException if the resend request comes too soon (Okta enforces a minimum 30
   *     second pause between activation code requests.)
   */
  public void resendActivationPasscode(String userId, String factorId)
      throws OktaAuthenticationFailureException {
    HttpEntity<String> headers = new HttpEntity<>(createHeaders());
    String getFactorUrl = _orgUrl + USER_API_ENDPOINT + userId + "/factors/" + factorId;
    JSONObject getFactorResponse;
    try {
      ResponseEntity<String> response =
          _restTemplate.exchange(getFactorUrl, HttpMethod.GET, headers, String.class);
      getFactorResponse = new JSONObject(response.getBody());
    } catch (RestClientException | ResourceException e) {
      throw new OktaAuthenticationFailureException(
          "An exception was thrown while fetching the user's factor.", e);
    }

    JSONObject factorInformation =
        new JSONObject(getFactorResponse, "provider", "factorType", "profile");

    HttpEntity<String> requestBody =
        new HttpEntity<>(factorInformation.toString(), createHeaders());
    String resendUrl = _orgUrl + USER_API_ENDPOINT + userId + "/factors/" + factorId + "/resend";
    try {
      ResponseEntity<String> response =
          _restTemplate.exchange(resendUrl, HttpMethod.POST, requestBody, String.class);
      if (response.getStatusCode() != HttpStatus.OK) {
        throw new OktaAuthenticationFailureException(
            "The requested activation factor could not be resent; Okta returned an error."
                + response);
      }
    } catch (HttpClientErrorException e) {
      if (e.getStatusCode() == HttpStatus.TOO_MANY_REQUESTS) {
        throw new IllegalStateException(
            "An SMS message was recently sent. Please wait 30 seconds before trying again.", e);
      }
    } catch (RestClientException | ResourceException | NullPointerException e) {
      throw new OktaAuthenticationFailureException(
          "The requested activation factor could not be resent.", e);
    }
  }

  private HttpHeaders createHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    headers.add("Authorization", "SSWS " + _apiToken);
    return headers;
  }
}
