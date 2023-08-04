package gov.cdc.usds.simplereport.idp.authentication;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.FactorAndQrCode;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.UserAccountStatus;
import gov.cdc.usds.simplereport.idp.authentication.DemoOktaAuthentication.DemoAuthUser;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openapitools.client.model.FactorStatus;
import org.openapitools.client.model.FactorType;

class DemoOktaAuthenticationTest {

  private final DemoOktaAuthentication _auth = new DemoOktaAuthentication();

  private static final String VALID_ACTIVATION_TOKEN = "valid_activation_token";
  private static final String VALID_PHONE_NUMBER = "555-867-5309";
  private static final String STRIPPED_PHONE_NUMBER = "5558675309";

  @BeforeEach
  public void setup() {
    _auth.reset();
  }

  @Test
  void activateUserSuccessful() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    assertThat(_auth.getUser(userId)).isNotNull();
  }

  @Test
  void activateUserFails_withoutActivationToken() {
    assertThrows(
        InvalidActivationLinkException.class,
        () -> {
          _auth.activateUser("");
        });
  }

  @Test
  void setPasswordSuccessful() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    String password = "dummyPassword!";
    _auth.setPassword(userId, password.toCharArray());
    assertThat(_auth.getUser(userId).getPassword()).isEqualTo(password);
  }

  @Test
  void cannotSetPassword_unlessActivationIsCalled() {
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
  void passwordTooShort() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    char[] password = "short".toCharArray();
    Exception exception =
        assertThrows(
            BadRequestException.class,
            () -> {
              _auth.setPassword(userId, password);
            });
    assertThat(exception.getMessage()).isEqualTo("Password is too short.");
  }

  @Test
  void passwordNoSpecialCharacters() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    char[] password = "longPasswordWithoutSpecialCharacters".toCharArray();
    Exception exception =
        assertThrows(
            BadRequestException.class,
            () -> {
              _auth.setPassword(userId, password);
            });
    assertThat(exception.getMessage())
        .isEqualTo("Password does not contain any special characters.");
  }

  @Test
  void setRecoveryQuestionSuccessful() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    String question = "Who was your third grade teacher?";
    String answer = "Teacher";
    _auth.setRecoveryQuestion(userId, question, answer);
    assertThat(_auth.getUser(userId).getRecoveryQuestion()).isEqualTo(question);
    assertThat(_auth.getUser(userId).getRecoveryAnswer()).isEqualTo(answer);
  }

  @Test
  void cannotSetRecoveryQuestion_withoutValidActivation() {
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
  void cannotSetRecoveryQuestion_withBlankQuestion() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    Exception exception =
        assertThrows(
            BadRequestException.class,
            () -> {
              _auth.setRecoveryQuestion(userId, " ", "Teacher");
            });
    assertThat(exception.getMessage()).isEqualTo("Recovery question cannot be empty.");
  }

  @Test
  void cannotSetRecoveryQuestion_withBlankAnswer() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    Exception exception =
        assertThrows(
            BadRequestException.class,
            () -> {
              _auth.setRecoveryQuestion(userId, "Who was your third grade teacher?", " ");
            });
    assertThat(exception.getMessage()).isEqualTo("Recovery answer cannot be empty.");
  }

  @Test
  void enrollSmsMfaSuccessful() {
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
            BadRequestException.class,
            () -> {
              _auth.enrollSmsMfa(userId, "555");
            });
    assertThat(exception.getMessage()).isEqualTo("Phone number is invalid.");
  }

  @Test
  void enrollVoiceCallMfaSuccessful() {
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
            BadRequestException.class,
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
  void enrollAuthenticatorAppMfa_successful() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    FactorAndQrCode factorData = _auth.enrollAuthenticatorAppMfa(userId, "Google");
    DemoAuthUser user = _auth.getUser(userId);

    assertThat(factorData.getQrcode()).isEqualTo("thisIsAFakeQrCode");

    assertThat(user.getMfa().getFactorProfile()).isEqualTo("thisIsAFakeQrCode");
    assertThat(user.getMfa().getFactorType()).isEqualTo(FactorType.TOKEN_SOFTWARE_TOTP);
    assertThat(user.getMfa().getFactorId()).isEqualTo(factorData.getFactorId());
  }

  @Test
  void enrollAuthenticatorAppMfa_successfulWithOktaVerify() {
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
  void enrollSecurityKey_successful() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    var enrollResponse = _auth.enrollSecurityKey(userId);
    DemoAuthUser user = _auth.getUser(userId);

    assertThat(user.getMfa().getFactorType()).isEqualTo(FactorType.WEBAUTHN);
    assertThat(user.getMfa().getFactorStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);
    assertThat(enrollResponse.getActivation()).containsKey("challenge");
    assertThat(enrollResponse.getFactorId()).isNotEmpty();
  }

  @Test
  void enrollSecurityKey_failsWithoutActivatedUser() {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.enrollSecurityKey("fakeUserId");
            });
    assertThat(exception.getMessage()).isEqualTo("User id not recognized.");
  }

  @Test
  void activateSecurityKey_successful() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    var enrollResponse = _auth.enrollSecurityKey(userId);
    String factorId = enrollResponse.getFactorId();
    _auth.activateSecurityKey(
        userId,
        factorId,
        enrollResponse.getActivation().get("challenge").toString(),
        ((Map) enrollResponse.getActivation().get("user")).get("id").toString());

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
    var enrollResponse = _auth.enrollSecurityKey(userId);
    String factorId = enrollResponse.getFactorId();
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.activateSecurityKey(userId, factorId, "", "clientData");
            });
    assertThat(exception.getMessage()).isEqualTo("attestation cannot be empty.");
  }

  @Test
  void activateSecurityKey_failsWithInvalidClientData() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    var enrollResponse = _auth.enrollSecurityKey(userId);
    String factorId = enrollResponse.getFactorId();
    String challenge = enrollResponse.getActivation().get("challenge").toString();
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.activateSecurityKey(userId, factorId, challenge, "");
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
    FactorAndQrCode mfaResponse = _auth.enrollAuthenticatorAppMfa(userId, "google");
    DemoAuthUser user = _auth.getUser(userId);

    assertThat(user.getMfa().getFactorType()).isEqualTo(FactorType.TOKEN_SOFTWARE_TOTP);
    assertThat(user.getMfa().getFactorId()).isEqualTo("authApp: google " + userId);
    assertThat(user.getMfa().getFactorStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);

    _auth.verifyActivationPasscode(userId, mfaResponse.getFactorId(), "123456");
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
            BadRequestException.class,
            () -> {
              _auth.verifyActivationPasscode(userId, factorId, "1234");
            });
    assertThat(exception).hasMessage("Activation passcode does not match our records.");
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
    FactorAndQrCode mfaResponse = _auth.enrollAuthenticatorAppMfa(userId, "okta");
    String factorId = mfaResponse.getFactorId();

    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> {
              _auth.resendActivationPasscode(userId, factorId);
            });

    assertThat(exception)
        .hasMessage("The requested activation factor could not be resent; Okta returned an error.");
  }

  @Test
  void getUserStatus_resetPasswordStateSuccessful() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    UserAccountStatus status = _auth.getUserStatus(null, userId, null);

    assertThat(status).isEqualTo(UserAccountStatus.PASSWORD_RESET);
  }

  @Test
  void getUserStatus_setSecurityQuestionsStateSuccessful() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    _auth.setPassword(userId, "thisIsAValidPassword1!".toCharArray());
    UserAccountStatus status = _auth.getUserStatus(null, userId, null);

    assertThat(status).isEqualTo(UserAccountStatus.SET_SECURITY_QUESTIONS);
  }

  @Test
  void getUserStatus_selectMfaStateSuccessful() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    _auth.setPassword(userId, "thisIsAValidPassword1!".toCharArray());
    _auth.setRecoveryQuestion(userId, "Who was your third grade teacher?", "Jane Doe");
    UserAccountStatus status = _auth.getUserStatus(null, userId, null);

    assertThat(status).isEqualTo(UserAccountStatus.MFA_SELECT);
  }

  @Test
  void getUserStatus_pendingSmsActivationStateSuccessful() {
    String userId = validSetup();
    _auth.enrollSmsMfa(userId, VALID_PHONE_NUMBER);
    UserAccountStatus status = _auth.getUserStatus(null, userId, null);

    assertThat(status).isEqualTo(UserAccountStatus.SMS_PENDING_ACTIVATION);
  }

  @Test
  void getUserStatus_pendingPhoneCallActivationStateSuccessful() {
    String userId = validSetup();
    _auth.enrollVoiceCallMfa(userId, VALID_PHONE_NUMBER);
    UserAccountStatus status = _auth.getUserStatus(null, userId, null);

    assertThat(status).isEqualTo(UserAccountStatus.CALL_PENDING_ACTIVATION);
  }

  @Test
  void getUserStatus_pendingEmailActivationStateSuccessful() {
    String userId = validSetup();
    _auth.enrollEmailMfa(userId);
    UserAccountStatus status = _auth.getUserStatus(null, userId, null);

    assertThat(status).isEqualTo(UserAccountStatus.EMAIL_PENDING_ACTIVATION);
  }

  @Test
  void getUserStatus_pendingGoogleAuthActivationStateSuccessful() {
    String userId = validSetup();
    _auth.enrollAuthenticatorAppMfa(userId, "google");
    UserAccountStatus status = _auth.getUserStatus(null, userId, null);

    assertThat(status).isEqualTo(UserAccountStatus.GOOGLE_PENDING_ACTIVATION);
  }

  @Test
  void getUserStatus_pendingOktaAuthActivationStateSuccessful() {
    String userId = validSetup();
    _auth.enrollAuthenticatorAppMfa(userId, "okta");
    UserAccountStatus status = _auth.getUserStatus(null, userId, null);

    assertThat(status).isEqualTo(UserAccountStatus.OKTA_PENDING_ACTIVATION);
  }

  @Test
  void getUserStatus_pendingSecurityKeyActivationStateSuccessful() {
    String userId = validSetup();
    _auth.enrollSecurityKey(userId);
    UserAccountStatus status = _auth.getUserStatus(null, userId, null);

    assertThat(status).isEqualTo(UserAccountStatus.FIDO_PENDING_ACTIVATION);
  }

  @Test
  void getUserStatus_activeStateSuccesful() {
    String userId = validSetup();
    String factorId = _auth.enrollSmsMfa(userId, VALID_PHONE_NUMBER);
    _auth.verifyActivationPasscode(userId, factorId, "123456");
    UserAccountStatus status = _auth.getUserStatus(null, userId, null);

    assertThat(status).isEqualTo(UserAccountStatus.ACTIVE);
  }

  private String validSetup() {
    String userId = _auth.activateUser(VALID_ACTIVATION_TOKEN);
    _auth.setPassword(userId, "thisIsAValidPassword1!".toCharArray());
    _auth.setRecoveryQuestion(userId, "Who was your third grade teacher?", "Jane Doe");
    return userId;
  }
}
