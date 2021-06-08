package gov.cdc.usds.simplereport.idp.authentication;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.okta.sdk.resource.user.factor.FactorStatus;
import com.okta.sdk.resource.user.factor.FactorType;
import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import gov.cdc.usds.simplereport.idp.authentication.DemoOktaAuthentication.DemoAuthUser;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DemoOktaAuthenticationTest {

  private DemoOktaAuthentication _auth = new DemoOktaAuthentication();

  private static final String VALID_ACTIVATION_TOKEN = "valid_activation_token";
  private static final String VALID_PHONE_NUMBER = "555-867-5309";
  private static final String STRIPPED_PHONE_NUMBER = "5558675309";

  @BeforeEach
  public void setup() {
    _auth.reset();
  }

  @Test
  void activateUserSuccessful() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    assertThat(_auth.getUser(userId)).isNotNull();
  }

  @Test
  void activateUserFails_withoutActivationToken() throws Exception {
    assertThrows(
        InvalidActivationLinkException.class,
        () -> {
          _auth.activateUser("");
        });
  }

  @Test
  void setPasswordSuccessful() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    String password = "dummyPassword!";
    _auth.setPassword(userId, password.toCharArray());
    assertThat(_auth.getUser(userId).getPassword()).isEqualTo(password);
  }

  @Test
  void cannotSetPassword_unlessActivationIsCalled() throws Exception {
    char[] password = "dummyPassword!".toCharArray();
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setPassword("invalidUserId", password);
            });
    assertThat(exception.getMessage()).isEqualTo("User id not recognized.");
  }

  @Test
  void passwordTooShort() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    char[] password = "short".toCharArray();
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setPassword(userId, password);
            });
    assertThat(exception.getMessage()).isEqualTo("Password is too short.");
  }

  @Test
  void passwordNoSpecialCharacters() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    char[] password = "longPasswordWithoutSpecialCharacters".toCharArray();
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setPassword(userId, password);
            });
    assertThat(exception.getMessage())
        .isEqualTo("Password does not contain any special characters.");
  }

  @Test
  void setRecoveryQuestionSuccessful() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    String question = "Who was your third grade teacher?";
    String answer = "Teacher";
    _auth.setRecoveryQuestion(userId, question, answer);
    assertThat(_auth.getUser(userId).getRecoveryQuestion()).isEqualTo(question);
    assertThat(_auth.getUser(userId).getRecoveryAnswer()).isEqualTo(answer);
  }

  @Test
  void cannotSetRecoveryQuestion_withoutValidActivation() throws Exception {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setRecoveryQuestion(
                  "fakeUserId", "Who was your third grade teacher?", "Teacher");
            });

    assertThat(exception.getMessage()).isEqualTo("User id not recognized.");
  }

  @Test
  void cannotSetRecoveryQuestion_withBlankQuestion() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setRecoveryQuestion(userId, " ", "Teacher");
            });
    assertThat(exception.getMessage()).isEqualTo("Recovery question cannot be empty.");
  }

  @Test
  void cannotSetRecoveryQuestion_withBlankAnswer() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.setRecoveryQuestion(userId, "Who was your third grade teacher?", " ");
            });
    assertThat(exception.getMessage()).isEqualTo("Recovery answer cannot be empty.");
  }

  @Test
  void enrollSmsMfaSuccessful() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    _auth.enrollSmsMfa(userId, VALID_PHONE_NUMBER);
    DemoAuthUser user = _auth.getUser(userId);

    assertThat(user.getMfa().getFactorProfile()).isEqualTo(STRIPPED_PHONE_NUMBER);
    assertThat(user.getMfa().getFactorType()).isEqualTo(FactorType.SMS);
    assertThat(user.getMfa().getFactorId()).isEqualTo(userId + STRIPPED_PHONE_NUMBER);
  }

  @Test
  void enrollSmsMfa_failsWithoutValidActivation() {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.enrollSmsMfa("fakeUserId", VALID_PHONE_NUMBER);
            });

    assertThat(exception.getMessage()).isEqualTo("User id not recognized.");
  }

  @Test
  void enrollSmsMfa_failsForInvalidPhoneNumber() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.enrollSmsMfa(userId, "555");
            });
    assertThat(exception.getMessage()).isEqualTo("Phone number is invalid.");
  }

  @Test
  void enrollVoiceCallMfaSuccessful() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    _auth.enrollVoiceCallMfa(userId, VALID_PHONE_NUMBER);
    DemoAuthUser user = _auth.getUser(userId);

    assertThat(user.getMfa().getFactorProfile()).isEqualTo(STRIPPED_PHONE_NUMBER);
    assertThat(user.getMfa().getFactorType()).isEqualTo(FactorType.CALL);
    assertThat(user.getMfa().getFactorId()).isEqualTo(userId + STRIPPED_PHONE_NUMBER);
  }

  @Test
  void enrollVoiceCallMfa_failsWithoutValidActivation() {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.enrollVoiceCallMfa("fakeUserId", VALID_PHONE_NUMBER);
            });

    assertThat(exception.getMessage()).isEqualTo("User id not recognized.");
  }

  @Test
  void enrollVoiceCallMfa_failsForInvalidPhoneNumber() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.enrollVoiceCallMfa(userId, "555");
            });
    assertThat(exception.getMessage()).isEqualTo("Phone number is invalid.");
  }

  @Test
  void enrollEmailMfaSuccessful() throws OktaAuthenticationFailureException {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    _auth.enrollEmailMfa(userId);
    DemoAuthUser user = _auth.getUser(userId);

    assertThat(user.getMfa().getFactorProfile()).isEqualTo("test@example.com");
    assertThat(user.getMfa().getFactorType()).isEqualTo(FactorType.EMAIL);
    assertThat(user.getMfa().getFactorId()).isEqualTo(userId + "test@example.com");
  }

  @Test
  void enrollEmailMfa_failsWithoutValidActivation() {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.enrollEmailMfa("fakeUserId");
            });

    assertThat(exception.getMessage()).isEqualTo("User id not recognized.");
  }

  @Test
  void enrollAuthenticatorAppMfa_successful() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    JSONObject factorData = _auth.enrollAuthenticatorAppMfa(userId, "Google");
    DemoAuthUser user = _auth.getUser(userId);

    assertThat(factorData.getString("qrcode")).isEqualTo("thisIsAFakeQrCode");

    assertThat(user.getMfa().getFactorProfile()).isEqualTo("thisIsAFakeQrCode");
    assertThat(user.getMfa().getFactorType()).isEqualTo(FactorType.TOKEN_SOFTWARE_TOTP);
    assertThat(user.getMfa().getFactorId()).isEqualTo(factorData.getString("factorId"));
  }

  @Test
  void enrollAuthenticatorAppMfa_successfulWithOktaVerify() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    _auth.enrollAuthenticatorAppMfa(userId, "okta");
    DemoAuthUser user = _auth.getUser(userId);

    assertThat(user.getMfa().getFactorType()).isEqualTo(FactorType.TOKEN_SOFTWARE_TOTP);
    assertThat(user.getMfa().getFactorId()).isEqualTo("authApp: okta " + userId);
  }

  @Test
  void enrollAuthenticatorAppMfa_failsWithoutValidActivation() {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.enrollAuthenticatorAppMfa("fakeUserId", "okta");
            });
    assertThat(exception.getMessage()).isEqualTo("User id not recognized.");
  }

  @Test
  void enrollAuthenticatorAppMfa_failsWithInvalidAppType() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.enrollAuthenticatorAppMfa(userId, "lastPass");
            });
    assertThat(exception.getMessage()).isEqualTo("App type not recognized.");
  }

  @Test
  void enrollSecurityKey_successful() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    JSONObject enrollResponse = _auth.enrollSecurityKey(userId);
    DemoAuthUser user = _auth.getUser(userId);

    assertThat(user.getMfa().getFactorType()).isEqualTo(FactorType.WEBAUTHN);
    assertThat(user.getMfa().getFactorStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);
    assertThat(enrollResponse.getJSONObject("activation").has("challenge")).isTrue();
    assertThat(enrollResponse.has("factorId")).isTrue();
  }

  @Test
  void enrollSecurityKey_failsWithoutActivatedUser() throws Exception {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.enrollSecurityKey("fakeUserId");
            });
    assertThat(exception.getMessage()).isEqualTo("User id not recognized.");
  }

  @Test
  void activateSecurityKey_successful() throws Exception {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    JSONObject enrollResponse = _auth.enrollSecurityKey(userId);
    String factorId = enrollResponse.getString("factorId");
    _auth.activateSecurityKey(
        userId,
        factorId,
        enrollResponse.getJSONObject("activation").getString("challenge"),
        enrollResponse.getJSONObject("activation").getJSONObject("user").getString("id"));

    DemoAuthUser user = _auth.getUser(userId);
    assertThat(user.getMfa().getFactorStatus()).isEqualTo(FactorStatus.ACTIVE);
  }

  @Test
  void activateSecurityKey_failsIfNotEnrolled() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.activateSecurityKey(userId, "factorId", "attestation", "clientData");
            });
    assertThat(exception.getMessage()).isEqualTo("Could not retrieve factor.");
  }

  @Test
  void activateSecurityKey_failsWithInvalidAttestation() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    JSONObject enrollResponse = _auth.enrollSecurityKey(userId);
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.activateSecurityKey(
                  userId, enrollResponse.getString("factorId"), "", "clientData");
            });
    assertThat(exception.getMessage()).isEqualTo("attestation cannot be empty.");
  }

  @Test
  void activateSecurityKey_failsWithInvalidClientData() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    JSONObject enrollResponse = _auth.enrollSecurityKey(userId);
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.activateSecurityKey(
                  userId,
                  enrollResponse.getString("factorId"),
                  enrollResponse.getJSONObject("activation").getString("challenge"),
                  "");
            });
    assertThat(exception.getMessage()).isEqualTo("clientData cannot be empty.");
  }

  @Test
  void verifyActivationPasscode_successfulForSms() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    String factorId = _auth.enrollSmsMfa(userId, VALID_PHONE_NUMBER);
    DemoAuthUser user = _auth.getUser(userId);

    assertThat(user.getMfa().getFactorStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);

    _auth.verifyActivationPasscode(userId, factorId, "123456");
    assertThat(user.getMfa().getFactorStatus()).isEqualTo(FactorStatus.ACTIVE);
  }

  @Test
  void verifyActivationPasscode_successfulForAuthApp() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    JSONObject mfaResponse = _auth.enrollAuthenticatorAppMfa(userId, "google");
    DemoAuthUser user = _auth.getUser(userId);

    assertThat(user.getMfa().getFactorType()).isEqualTo(FactorType.TOKEN_SOFTWARE_TOTP);
    assertThat(user.getMfa().getFactorId()).isEqualTo("authApp: google " + userId);
    assertThat(user.getMfa().getFactorStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);

    _auth.verifyActivationPasscode(userId, mfaResponse.getString("factorId"), "123456");
    assertThat(user.getMfa().getFactorStatus()).isEqualTo(FactorStatus.ACTIVE);
  }

  @Test
  void verifyActivationPasscode_failsWithUnknownFactor() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);

    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.verifyActivationPasscode(userId, "fakeFactorId", "123456");
            });
    assertThat(exception).hasMessage("Could not retrieve factor.");
  }

  @Test
  void verifyActivationPasscode_failsWithInvalidPasscode() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    String factorId = _auth.enrollSmsMfa(userId, VALID_PHONE_NUMBER);

    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.verifyActivationPasscode(userId, factorId, "1234");
            });
    assertThat(exception)
        .hasMessage("Activation passcode could not be verifed; MFA activation failed.");
  }

  @Test
  void resendActivationPasscode_successful() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    String factorId = _auth.enrollSmsMfa(userId, VALID_PHONE_NUMBER);

    try {
      _auth.resendActivationPasscode(userId, factorId);
    } catch (OktaAuthenticationFailureException e) {
      throw new IllegalStateException("Activation passcode was not resent.", e);
    }
    assertThat(_auth.getUser(userId).getMfa().getFactorStatus())
        .isEqualTo(FactorStatus.PENDING_ACTIVATION);
  }

  @Test
  void resendActivationPasscode_failsWithInvalidFactor() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    JSONObject mfaResponse = _auth.enrollAuthenticatorAppMfa(userId, "okta");
    String factorId = mfaResponse.getString("factorId");

    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.resendActivationPasscode(userId, factorId);
            });

    assertThat(exception)
        .hasMessage("The requested activation factor could not be resent; Okta returned an error.");
  }
}
