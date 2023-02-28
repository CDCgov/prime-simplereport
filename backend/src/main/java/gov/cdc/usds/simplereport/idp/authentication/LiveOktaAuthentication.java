package gov.cdc.usds.simplereport.idp.authentication;

import com.okta.sdk.authc.credentials.TokenClientCredentials;
import com.okta.sdk.client.Clients;
import com.okta.sdk.error.ResourceException;
import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.FactorAndQrCode;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.UserAccountStatus;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import java.util.List;
import org.json.JSONObject;
import org.openapitools.client.ApiClient;
import org.openapitools.client.api.UserApi;
import org.openapitools.client.api.UserFactorApi;
import org.openapitools.client.model.ActivateFactorRequest;
import org.openapitools.client.model.CallUserFactor;
import org.openapitools.client.model.CallUserFactorProfile;
import org.openapitools.client.model.EmailUserFactor;
import org.openapitools.client.model.EmailUserFactorProfile;
import org.openapitools.client.model.FactorProvider;
import org.openapitools.client.model.FactorStatus;
import org.openapitools.client.model.FactorType;
import org.openapitools.client.model.PasswordCredential;
import org.openapitools.client.model.RecoveryQuestionCredential;
import org.openapitools.client.model.SmsUserFactor;
import org.openapitools.client.model.SmsUserFactorProfile;
import org.openapitools.client.model.UpdateUserRequest;
import org.openapitools.client.model.User;
import org.openapitools.client.model.UserCredentials;
import org.openapitools.client.model.UserFactor;
import org.openapitools.client.model.UserStatus;
import org.springframework.beans.factory.annotation.Value;
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
 * <p>Handles all Okta-related user authenticaton.
 *
 * <p>NOTE: If you alter this file, you may need to re-record the WireMock stubs. See
 * https://github.com/CDCgov/prime-simplereport/issues/1848.
 */
@Profile("!" + BeanProfiles.NO_OKTA_AUTH)
@Service
public class LiveOktaAuthentication implements OktaAuthentication {
  private static final String USER_API_ENDPOINT = "/api/v1/users/";
  private static final String ACTIVATION_KEY = "activation";
  private final String _apiToken;
  private final String _orgUrl;
  private final RestTemplate _restTemplate;
  private final UserApi userApi;
  private final UserFactorApi userFactorApi;

  public LiveOktaAuthentication(
      @Value("${okta.client.org-url}") String orgUrl, @Value("${okta.client.token}") String token) {
    ApiClient client =
        Clients.builder()
            .setOrgUrl(orgUrl)
            .setClientCredentials(new TokenClientCredentials(token))
            .build();
    _apiToken = token;
    _orgUrl = orgUrl;
    _restTemplate = new RestTemplate();
    userApi = new UserApi(client);
    userFactorApi = new UserFactorApi(client);
  }

  /**
   * Fetches the user account status. Does NOT correspond to the user's Okta account status, as we
   * also care about things like factor activation status.
   */
  @Override
  public UserAccountStatus getUserStatus(String activationToken, String userId, String factorId) {
    try {
      if (activationToken != null && !activationToken.isEmpty() && userId == null) {
        return UserAccountStatus.PENDING_ACTIVATION;
      }
      if (userId == null) {
        return UserAccountStatus.UNKNOWN;
      }
      User user = userApi.getUser(userId);
      UserStatus status = user.getStatus();
      if (status == UserStatus.PROVISIONED) {
        return UserAccountStatus.PASSWORD_RESET;
      }
      if (user.getCredentials().getRecoveryQuestion() == null) {
        return UserAccountStatus.SET_SECURITY_QUESTIONS;
      }
      if (factorId == null) {
        return UserAccountStatus.MFA_SELECT;
      }
      UserFactor factor = userFactorApi.getFactor(userId, factorId);

      if (factor.getStatus() == FactorStatus.ACTIVE) {
        return UserAccountStatus.ACTIVE;
      }
      FactorType factorType = factor.getFactorType();
      switch (factorType) {
        case SMS:
          return UserAccountStatus.SMS_PENDING_ACTIVATION;
        case CALL:
          return UserAccountStatus.CALL_PENDING_ACTIVATION;
        case EMAIL:
          return UserAccountStatus.EMAIL_PENDING_ACTIVATION;
        case WEBAUTHN:
          return UserAccountStatus.FIDO_PENDING_ACTIVATION;
        case TOKEN_SOFTWARE_TOTP:
          FactorProvider provider = factor.getProvider();
          if (provider == FactorProvider.GOOGLE) {
            return UserAccountStatus.GOOGLE_PENDING_ACTIVATION;
          } else {
            return UserAccountStatus.OKTA_PENDING_ACTIVATION;
          }
        default:
          return UserAccountStatus.ACTIVE;
      }
    } catch (NullPointerException | ResourceException e) {
      return UserAccountStatus.UNKNOWN;
    }
  }

  /**
   * Uses the Okta API to activate an activation token. (The Okta Authentication SDK does not yet
   * support activating an activation token. If that changes, update this method to use the SDK.) If
   * successful, it moves the Okta state machine into a RESET_PASSWORD state.
   * https://developer.okta.com/docs/reference/api/authn/#request-example-for-activation-token
   * https://developer.okta.com/docs/reference/api/authn/#response-example-for-activation-token-success-user-without-password
   */
  @Override
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

  /** Using the Okta Management SDK, sets a user's password for the first time. */
  @Override
  public void setPassword(String userId, char[] password)
      throws OktaAuthenticationFailureException {
    try {
      User user = userApi.getUser(userId);
      UserCredentials creds = user.getCredentials();
      PasswordCredential passwordCred = new PasswordCredential();
      passwordCred.setValue(new String(password));
      creds.setPassword(passwordCred);
      user.setCredentials(creds);
      var updateUserRequest = new UpdateUserRequest();
      updateUserRequest.setCredentials(creds);
      userApi.updateUser(userId, updateUserRequest, null);
    } catch (ResourceException e) {
      if (e.getStatus() == HttpStatus.BAD_REQUEST.value()
          && e.getMessage().toLowerCase().contains("password requirements")) {
        throw new BadRequestException(e.getCauses().get(0).getSummary(), e);
      }
      throw new OktaAuthenticationFailureException("Error setting user's password", e);
    }
  }

  /** Using the Okta Management SDK, sets a user's recovery questions. */
  @Override
  public void setRecoveryQuestion(String userId, String question, String answer)
      throws OktaAuthenticationFailureException, BadRequestException {
    try {
      User user = userApi.getUser(userId);
      UserCredentials creds = user.getCredentials();
      RecoveryQuestionCredential recoveryCred = new RecoveryQuestionCredential();
      recoveryCred.setQuestion(question);
      recoveryCred.setAnswer(answer);
      creds.setRecoveryQuestion(recoveryCred);
      user.setCredentials(creds);
      var updateUserRequest = new UpdateUserRequest();
      updateUserRequest.setCredentials(creds);
      userApi.updateUser(userId, updateUserRequest, null);
    } catch (ResourceException e) {
      if (e.getStatus() == HttpStatus.BAD_REQUEST.value() && !e.getCauses().isEmpty()) {
        throw new BadRequestException(e.getCauses().get(0).getSummary(), e);
      }
      throw new OktaAuthenticationFailureException("Error setting recovery questions", e);
    }
  }

  /**
   * Using the Okta management SDK, enroll a user in SMS MFA. If successful, this enrollment
   * triggers a text to the user's phone with an activation passcode.
   */
  @Override
  public String enrollSmsMfa(String userId, String phoneNumber)
      throws OktaAuthenticationFailureException, BadRequestException {
    try {
      var profile = new SmsUserFactorProfile().phoneNumber(phoneNumber);
      SmsUserFactor smsFactor = new SmsUserFactor().profile(profile);
      smsFactor.setFactorType(FactorType.SMS);
      return userFactorApi.enrollFactor(userId, smsFactor, null, null, null, null).getId();
    } catch (ResourceException e) {
      if (e.getStatus() == HttpStatus.BAD_REQUEST.value()) {
        throw new BadRequestException(
            "Invalid phone number. Please enter a mobile phone number that can receive text messages.",
            e);
      }
      throw new OktaAuthenticationFailureException("Error setting SMS MFA", e);
    }
  }

  /**
   * Using the Okta management SDK, enroll a user in voice call MFA. If successful, this enrollment
   * triggers a phone call to the user with an activation passcode.
   */
  @Override
  public String enrollVoiceCallMfa(String userId, String phoneNumber)
      throws OktaAuthenticationFailureException, BadRequestException {
    try {
      var profile = new CallUserFactorProfile().phoneNumber(phoneNumber);
      CallUserFactor callFactor = new CallUserFactor().profile(profile);
      callFactor.setFactorType(FactorType.CALL);
      return userFactorApi.enrollFactor(userId, callFactor, null, null, null, null).getId();
    } catch (ResourceException e) {
      if (e.getStatus() == HttpStatus.BAD_REQUEST.value()) {
        throw new BadRequestException("Invalid phone number.", e);
      }
      throw new OktaAuthenticationFailureException("Error setting voice call MFA", e);
    }
  }

  /**
   * Using the Okta Management SDK, enroll a user in email MFA using their attached profile email.
   * If successful, this enrollment triggers an activation email to the user with an TOTP.
   */
  @Override
  public String enrollEmailMfa(String userId) throws OktaAuthenticationFailureException {
    try {
      User user = userApi.getUser(userId);
      String userEmail = user.getProfile().getEmail();
      var profile = new EmailUserFactorProfile().email(userEmail);
      EmailUserFactor emailFactor = new EmailUserFactor().profile(profile);
      emailFactor.setFactorType(FactorType.EMAIL);
      return userFactorApi.enrollFactor(userId, emailFactor, null, null, null, null).getId();
    } catch (ResourceException e) {
      throw new OktaAuthenticationFailureException("Error setting email MFA", e);
    }
  }

  /**
   * Using the Okta management SDK, enroll a user in an authentication app for MFA. If successful,
   * this method returns the factor id and a qr code. The qr code will be passed to the user for
   * them to finish enrolling in-app.
   *
   * <p>https://developer.okta.com/docs/reference/api/factors/#response-example-12
   */
  @Override
  public FactorAndQrCode enrollAuthenticatorAppMfa(String userId, String appType)
      throws OktaAuthenticationFailureException {
    UserFactor factor = new UserFactor();
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
      var enrolledFactor = userFactorApi.enrollFactor(userId, factor, null, null, null, null);
      JSONObject embeddedJson = new JSONObject(enrolledFactor.getEmbedded());
      String qrCode =
          embeddedJson
              .getJSONObject(ACTIVATION_KEY)
              .getJSONObject("_links")
              .getJSONObject("qrcode")
              .getString("href");
      return new FactorAndQrCode(enrolledFactor.getId(), qrCode);
    } catch (NullPointerException | ResourceException | IllegalArgumentException e) {
      throw new OktaAuthenticationFailureException("Authentication app could not be enrolled", e);
    }
  }

  /**
   * Using the Okta API, enrolls a security key, returning an activation object that contains
   * registration information for the frontend.
   *
   * <p>https://developer.okta.com/docs/reference/api/factors/#enroll-webauthn-request-example
   */
  @Override
  public JSONObject enrollSecurityKey(String userId) throws OktaAuthenticationFailureException {
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
          ACTIVATION_KEY, responseJson.getJSONObject("_embedded").getJSONObject(ACTIVATION_KEY));
      response.put("factorId", responseJson.getString("id"));
      return response;
    } catch (RestClientException | NullPointerException | ResourceException e) {
      throw new OktaAuthenticationFailureException("Security key could not be enrolled", e);
    }
  }

  /** Activates a security key using the provided frontend-generated credentials. */
  @Override
  public void activateSecurityKey(
      String userId, String factorId, String attestation, String clientData)
      throws OktaAuthenticationFailureException {
    try {
      ActivateFactorRequest activationRequest = new ActivateFactorRequest();
      activationRequest.setAttestation(attestation);
      activationRequest.setClientData(clientData);
      userFactorApi.activateFactor(userId, factorId, activationRequest);
    } catch (NullPointerException | ResourceException e) {
      throw new OktaAuthenticationFailureException("Security key could not be activated", e);
    }
  }

  /**
   * Using the Okta Management SDK, activate MFA enrollment with a user-provided passcode. This
   * method should be used for sms, call, email and authentication app MFA options.
   *
   * <p>https://developer.okta.com/docs/reference/api/factors/#activate-sms-factor
   */
  @Override
  public void verifyActivationPasscode(String userId, String factorId, String passcode)
      throws OktaAuthenticationFailureException {
    try {
      ActivateFactorRequest activateFactor = new ActivateFactorRequest();
      activateFactor.setPassCode(passcode.strip());
      userFactorApi.activateFactor(userId, factorId, activateFactor);
    } catch (ResourceException e) {
      throw new BadRequestException("Invalid security code.", e);
    } catch (NullPointerException | IllegalArgumentException e) {
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
   */
  @Override
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
        throw new BadRequestException(
            "We're sending over a security code. Please wait 30 seconds before trying again.", e);
      }
    } catch (RestClientException | ResourceException | NullPointerException e) {
      throw new OktaAuthenticationFailureException(
          "The requested activation factor could not be resent.", e);
    }
  }

  /**
   * Helper method to create the required HTTP headers for sending direct requests to the Okta API.
   * (This _apiToken is where our authorization comes from.)
   */
  private HttpHeaders createHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    headers.add("Authorization", "SSWS " + _apiToken);
    return headers;
  }
}
