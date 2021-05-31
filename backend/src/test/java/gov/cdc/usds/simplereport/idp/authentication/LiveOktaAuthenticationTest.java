package gov.cdc.usds.simplereport.idp.authentication;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import gov.cdc.usds.simplereport.api.BaseFullStackTest;
import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.FactorAndQrCode;
import java.time.Instant;
import java.util.List;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

/**
 * WARNING: THIS TEST CREATES A REAL USER IN OKTA!
 *
 * <p>This tests LiveOktaAuthentication by creating a user and sending them through the account
 * creation flow. The user is not associated with an organization, and is deleted at the end of the
 * test. Running this test does add to our Okta quota, so plase run sparingly.
 */
@TestInstance(Lifecycle.PER_CLASS)
@TestMethodOrder(OrderAnnotation.class)
class LiveOktaAuthenticationTest extends BaseFullStackTest {

  private static final String PHONE_NUMBER = "999-999-9999";
  private static final String EMAIL = "test@example.com";
  private static final String PENDING_ACTIVATION = "PENDING_ACTIVATION";
  private static final String ACTIVE = "ACTIVE";

  @Value("${okta.client.org-url}")
  private String _orgUrl;

  @Value("${okta.client.token}")
  private String _token;

  private LiveOktaAuthentication _auth;
  private RestTemplate _restTemplate;
  private String _userId;
  private String _activationToken;
  private String _apiUrl;
  private HttpEntity<String> _entityWithHeaders;

  @BeforeAll
  void initializeUser() {
    _auth = new LiveOktaAuthentication(_orgUrl, _token);
    _restTemplate = new RestTemplate();
    _apiUrl = _orgUrl + "/api/v1/users/";
    _entityWithHeaders = new HttpEntity<>(createHeaders());
    JSONObject createUserResponse = createUser();
    _userId = createUserResponse.getString("id");
    _activationToken = activateUser(_userId);
  }

  @AfterAll
  void removeUser() {
    deactivateUser(_userId);
    deleteUser(_userId);
  }

  // Positive Tests
  @Test
  @Order(1)
  void testActivationSuccessful() throws Exception {
    String userIdResponse =
        _auth.activateUser(
            _activationToken,
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36",
            "23.235.46.133");

    assertThat(userIdResponse).isEqualTo(_userId);

    JSONObject response = getUser(userIdResponse);
    assertThat(response.getString("activated")).isNotNull();
    assertThat(response.getString("status")).isEqualTo("PROVISIONED");
  }

  @Test
  @Order(2)
  void setPasswordSuccessful() throws Exception {
    // Okta doesn't return the plaintext of the user's password in the response, so instead we check
    // if the passwordChanged field is set.

    JSONObject getUserBeforeChangingPassword = getUser(_userId);
    assertThat(getUserBeforeChangingPassword.isNull("passwordChanged")).isTrue();

    String password = "fooBAR123";
    _auth.setPassword(_userId, password.toCharArray());

    JSONObject getUserAfterChangingPassword = getUser(_userId);
    assertThat(getUserAfterChangingPassword.getString("status")).isEqualTo(ACTIVE);
    assertThat(getUserAfterChangingPassword.getString("passwordChanged")).isNotNull();
  }

  @Test
  @Order(3)
  void setRecoveryQuestionSuccessful() throws Exception {
    String question = "Who was your third grade teacher?";
    _auth.setRecoveryQuestion(_userId, question, "Jane Doe");
    JSONObject getUserResponse = getUser(_userId);
    // Similarly to passwords, Okta doesn't return the plaintext of the user's answer.
    assertThat(
            getUserResponse
                .getJSONObject("credentials")
                .getJSONObject("recovery_question")
                .getString("question"))
        .isEqualTo(question);
  }

  @Test
  @Order(4)
  void enrollSmsMfaSuccessful() throws Exception {
    String factorId = _auth.enrollSmsMfa(_userId, PHONE_NUMBER);

    JSONObject smsFactor = getUserFactor(_userId, factorId);
    assertThat(smsFactor.getString("factorType")).isEqualTo("sms");
    assertThat(smsFactor.getString("status")).isEqualTo(PENDING_ACTIVATION);
    assertThat(smsFactor.getJSONObject("profile").getString("phoneNumber"))
        .isEqualTo("+19999999999");

    deleteUserFactor(_userId, factorId);
  }

  @Test
  @Order(5)
  void enrollVoiceCallMfaSuccessful() throws Exception {
    String factorId = _auth.enrollVoiceCallMfa(_userId, PHONE_NUMBER);

    JSONObject callFactor = getUserFactor(_userId, factorId);
    assertThat(callFactor.getString("factorType")).isEqualTo("call");
    assertThat(callFactor.getString("status")).isEqualTo(PENDING_ACTIVATION);
    assertThat(callFactor.getJSONObject("profile").getString("phoneNumber"))
        .isEqualTo("+19999999999");

    deleteUserFactor(_userId, factorId);
  }

  @Test
  @Order(6)
  void enrollEmailMfaSuccessful() throws Exception {
    String factorId = _auth.enrollEmailMfa(_userId, EMAIL);

    JSONObject emailFactor = getUserFactor(_userId, factorId);
    assertThat(emailFactor.getString("factorType")).isEqualTo("email");
    assertThat(emailFactor.getString("status")).isEqualTo(PENDING_ACTIVATION);
    assertThat(emailFactor.getJSONObject("profile").getString("email")).isEqualTo(EMAIL);

    deleteUserFactor(_userId, factorId);
  }

  @Test
  @Order(7)
  void enrollAuthenticatorAppMfaSuccessful_withGoogle() throws Exception {
    FactorAndQrCode factorAndCode = _auth.enrollAuthenticatorAppMfa(_userId, "google");

    JSONObject authFactor = getUserFactor(_userId, factorAndCode.getFactorId());
    assertThat(authFactor.getString("factorType")).isEqualTo("token:software:totp");
    assertThat(authFactor.getString("provider")).isEqualTo("GOOGLE");
    assertThat(authFactor.getString("status")).isEqualTo(PENDING_ACTIVATION);
    assertThat(factorAndCode.getQrCodeLink()).isNotNull();

    deleteUserFactor(_userId, factorAndCode.getFactorId());
  }

  @Test
  @Order(8)
  void enrollAuthenticatorAppMfaSuccessful_withOkta() throws Exception {
    FactorAndQrCode factorAndCode = _auth.enrollAuthenticatorAppMfa(_userId, "okta");

    JSONObject authFactor = getUserFactor(_userId, factorAndCode.getFactorId());
    assertThat(authFactor.getString("factorType")).isEqualTo("token:software:totp");
    assertThat(authFactor.getString("provider")).isEqualTo("OKTA");
    assertThat(authFactor.getString("status")).isEqualTo(PENDING_ACTIVATION);
    assertThat(factorAndCode.getQrCodeLink()).isNotNull();

    deleteUserFactor(_userId, factorAndCode.getFactorId());
  }

  @Test
  @Order(9)
  void verifyActivationPasscodeSuccessful() throws Exception {
    JSONObject googleEnroll = enrollGoogleAuthenticator(_userId);
    assertThat(googleEnroll.getString("status")).isEqualTo(PENDING_ACTIVATION);

    CodeGenerator codeGenerator = new DefaultCodeGenerator();
    String sharedSecret =
        googleEnroll
            .getJSONObject("_embedded")
            .getJSONObject("activation")
            .getString("sharedSecret");
    long timeStep =
        googleEnroll.getJSONObject("_embedded").getJSONObject("activation").getLong("timeStep");
    long millisSinceEpoch = Instant.now().toEpochMilli();
    long counter = millisSinceEpoch / 1000 / timeStep;
    String passcode = codeGenerator.generate(sharedSecret, counter);

    String factorId = googleEnroll.getString("id");
    _auth.verifyActivationPasscode(_userId, factorId, passcode);

    JSONObject factor = getUserFactor(_userId, factorId);
    assertThat(factor.getString("status")).isEqualTo(ACTIVE);

    deleteUserFactor(_userId, factorId);
  }

  @Test
  @Order(10)
  void resendActivationPasscode() throws Exception {
    String factorId = _auth.enrollSmsMfa(_userId, "4045312484");
    JSONObject factorBeforerResend = getUserFactor(_userId, factorId);

    // fail the test if an exception is thrown
    try {
      // Okta requires users to wait 30 seconds before re-requesting an activation code.
      Thread.sleep(31000);
      _auth.resendActivationPasscode(_userId, factorId);
    } catch (OktaAuthenticationFailureException | IllegalStateException e) {
      throw new IllegalStateException("An exception should not be thrown.", e);
    }

    JSONObject factorAfterResend = getUserFactor(_userId, factorId);
    assertThat(factorBeforerResend.getString("lastUpdated"))
        .isNotEqualTo(factorAfterResend.getString("lastUpdated"));

    deleteUserFactor(_userId, factorId);
  }

  // Negative Tests
  @Test
  void testActivationFails_withInvalidToken() {
    Exception exception =
        assertThrows(
            InvalidActivationLinkException.class,
            () -> {
              _auth.activateUser("invalidActivationToken", "", "");
            });
    assertThat(exception).hasMessage("User could not be activated");
  }

  @Test
  void setPasswordFails_withInvalidPassword() {
    char[] password = "short".toCharArray();
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setPassword(_userId, password);
            });
    assertThat(exception).hasMessage("Error setting user's password");
  }

  @Test
  void setRecoveryQuestionFails_withInvalidQuestion() {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setRecoveryQuestion(_userId, "Who was your third grade teacher?", "aa");
            });
    assertThat(exception).hasMessage("Error setting recovery questions");
  }

  @Test
  void enrollSmsMfaFails_withInvalidPhoneNumber() {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.enrollSmsMfa(_userId, "999");
            });
    assertThat(exception).hasMessage("Error setting SMS MFA");
  }

  @Test
  void enrollVoiceCallMfaFails_withInvalidPhoneNumber() {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.enrollVoiceCallMfa(_userId, "999");
            });
    assertThat(exception).hasMessage("Error setting voice call MFA");
  }

  @Test
  void enrollEmailMfaFails_withInvalidEmail() {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.enrollEmailMfa(_userId, "exampleemail");
            });
    assertThat(exception).hasMessage("Error setting email MFA");
  }

  @Test
  void enrollAuthenticatorAppMfaFails_withInvalidAppType() {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.enrollAuthenticatorAppMfa(_userId, "app");
            });
    assertThat(exception).hasMessage("App type not recognized.");
  }

  @Test
  void verifyActivationPasscodeFails_withInvalidPasscode() {
    FactorAndQrCode mfaResponse = _auth.enrollAuthenticatorAppMfa(_userId, "okta");
    String factorId = mfaResponse.getFactorId();
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.verifyActivationPasscode(_userId, factorId, "1234");
            });
    assertThat(exception)
        .hasMessage("Activation passcode could not be verifed; MFA activation failed.");
  }

  @Test
  void resendActivationPasscodeFails_withUnenrolledFactor() {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.resendActivationPasscode(_userId, "unenrolledFactorId");
            });
    assertThat(exception).hasMessage("An exception was thrown while fetching the user's factor.");
  }

  /**
   * Helper method to create a user.
   * https://developer.okta.com/docs/reference/api/users/#request-example
   */
  private JSONObject createUser() {
    JSONObject requestBody = new JSONObject();
    JSONObject profile = new JSONObject();
    profile.put("firstName", "TEST");
    profile.put("lastName", "INTEGRATION");
    profile.put("email", EMAIL);
    profile.put("login", EMAIL);
    profile.put("mobilePhone", PHONE_NUMBER);
    requestBody.put("profile", profile);
    HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), createHeaders());
    String postUrl = _apiUrl + "?activate=false";
    try {
      String response = _restTemplate.postForObject(postUrl, request, String.class);
      return new JSONObject(response);
    } catch (RestClientException e) {
      throw new OktaAuthenticationFailureException(
          "An exception was thrown while creating the user: ", e);
    }
  }

  /**
   * Helper method to activate a user.
   * https://developer.okta.com/docs/reference/api/users/#request-example-23
   */
  private String activateUser(String userId) {
    String postUrl = _apiUrl + userId + "/lifecycle/activate?sendEmail=false";
    try {
      String response = _restTemplate.postForObject(postUrl, _entityWithHeaders, String.class);
      JSONObject responseJson = new JSONObject(response);
      return responseJson.getString("activationToken");
    } catch (RestClientException e) {
      throw new OktaAuthenticationFailureException(
          "An exception was thrown while activating the user: ", e);
    }
  }

  /**
   * Helper method to deactivate a user.
   * https://developer.okta.com/docs/reference/api/users/#deactivate-user-synchronously
   */
  private void deactivateUser(String userId) {
    String postUrl = _apiUrl + userId + "/lifecycle/deactivate?sendEmail=false";
    try {
      ResponseEntity<String> response =
          _restTemplate.postForEntity(postUrl, _entityWithHeaders, String.class);
      if (response.getStatusCode() != HttpStatus.OK) {
        throw new IllegalStateException(
            "User was not deactivated successfully; please investigate in Okta.");
      }
    } catch (RestClientException e) {
      throw new OktaAuthenticationFailureException(
          "An exception was thrown while deactivating the user: ", e);
    }
  }

  /**
   * Helper method to delete a user. User must be deactivated first.
   * https://developer.okta.com/docs/reference/api/users/#request-example-29
   */
  private void deleteUser(String userId) {
    String deleteUrl = _apiUrl + userId + "?sendEmail=false";
    try {
      ResponseEntity<String> response =
          _restTemplate.exchange(deleteUrl, HttpMethod.DELETE, _entityWithHeaders, String.class);
      if (response.getStatusCode() != HttpStatus.NO_CONTENT) {
        throw new IllegalStateException(
            "User was not deleted successfully; please investigate in Okta.");
      }
    } catch (RestClientException e) {
      throw new OktaAuthenticationFailureException(
          "An exception was thrown while deleting the user: ", e);
    }
  }

  /**
   * Helper method to retrieve a user.
   * https://developer.okta.com/docs/reference/api/users/#response-example-10
   */
  private JSONObject getUser(String userId) {
    String getUrl = _apiUrl + userId;
    try {
      ResponseEntity<String> response =
          _restTemplate.exchange(getUrl, HttpMethod.GET, _entityWithHeaders, String.class);
      return new JSONObject(response.getBody());
    } catch (RestClientException e) {
      throw new OktaAuthenticationFailureException(
          "An exception was thrown while fetching the user: ", e);
    }
  }

  /**
   * Helper method to retrieve a user factor.
   * https://developer.okta.com/docs/reference/api/factors/#get-factor
   */
  private JSONObject getUserFactor(String userId, String factorId) {
    String getUrl = _apiUrl + userId + "/factors/" + factorId;
    try {
      ResponseEntity<String> response =
          _restTemplate.exchange(getUrl, HttpMethod.GET, _entityWithHeaders, String.class);
      return new JSONObject(response.getBody());
    } catch (RestClientException e) {
      throw new OktaAuthenticationFailureException(
          "An exception was thrown while fetching the user's factor: ", e);
    }
  }

  /**
   * Helper method to delete a factor for a user.
   * https://developer.okta.com/docs/reference/api/factors/#reset-factor
   */
  private void deleteUserFactor(String userId, String factorId) {
    String deleteUrl = _apiUrl + userId + "/factors/" + factorId;
    try {
      ResponseEntity<String> response =
          _restTemplate.exchange(deleteUrl, HttpMethod.DELETE, _entityWithHeaders, String.class);
      if (response.getStatusCode() != HttpStatus.NO_CONTENT) {
        throw new IllegalStateException(
            "Factor was not deleted successfully; please investigate in Okta.");
      }
    } catch (RestClientException e) {
      throw new OktaAuthenticationFailureException(
          "An exception was thrown while deleting a user factor: ", e);
    }
  }

  /**
   * Helper method to enroll the user in Google Authenticator. Note: There is a method for this in
   * LiveOktaAuthentication, but we need more information than is provided from the SDK response
   * (namely, the shared secret.)
   * https://developer.okta.com/docs/reference/api/factors/#enroll-google-authenticator-factor
   */
  private JSONObject enrollGoogleAuthenticator(String userId) {
    JSONObject requestBody = new JSONObject();
    requestBody.put("factorType", "token:software:totp");
    requestBody.put("provider", "GOOGLE");
    HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), createHeaders());
    String postUrl = _apiUrl + userId + "/factors";
    try {
      String response = _restTemplate.postForObject(postUrl, request, String.class);
      return new JSONObject(response);
    } catch (RestClientException e) {
      throw new OktaAuthenticationFailureException(
          "An exception was thrown while enrolling the user in Google Authenticator: ", e);
    }
  }

  /**
   * Helper method to create the headers Okta is expecting. The authorization token in particular is
   * essential; it's where permission to modify the Okta user set is granted.
   */
  private HttpHeaders createHeaders() {
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    headers.setAccept(List.of(MediaType.APPLICATION_JSON));
    headers.add("Authorization", "SSWS " + _token);
    return headers;
  }
}
