package gov.cdc.usds.simplereport.idp.authentication;

import static com.okta.sdk.cache.Caches.forResource;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.okta.sdk.authc.credentials.TokenClientCredentials;
import com.okta.sdk.cache.CacheManager;
import com.okta.sdk.cache.Caches;
import com.okta.sdk.client.Clients;
import gov.cdc.usds.simplereport.api.BaseFullStackTest;
import gov.cdc.usds.simplereport.api.model.errors.BadRequestException;
import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.FactorAndQrCode;
import gov.cdc.usds.simplereport.api.model.useraccountcreation.UserAccountStatus;
import java.util.Map;
import java.util.concurrent.TimeUnit;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.junit.jupiter.api.TestMethodOrder;
import org.openapitools.client.ApiClient;
import org.openapitools.client.api.UserApi;
import org.openapitools.client.api.UserFactorApi;
import org.openapitools.client.model.CallUserFactorProfile;
import org.openapitools.client.model.EmailUserFactorProfile;
import org.openapitools.client.model.FactorProvider;
import org.openapitools.client.model.FactorStatus;
import org.openapitools.client.model.FactorType;
import org.openapitools.client.model.SmsUserFactorProfile;
import org.openapitools.client.model.User;
import org.openapitools.client.model.UserFactor;
import org.openapitools.client.model.UserStatus;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.contract.wiremock.AutoConfigureWireMock;

/**
 * This tests LiveOktaAuthentication with stubbed responses from the Okta API.
 *
 * <p>They are actual responses recorded using WireMock's recording feature.
 */
@TestInstance(Lifecycle.PER_CLASS)
@TestMethodOrder(OrderAnnotation.class)
@AutoConfigureWireMock(port = 8088)
class LiveOktaAuthenticationTest extends BaseFullStackTest {

  private static final String PHONE_NUMBER = "332-699-1229";
  private static final String FORMATTED_PHONE_NUMBER = "+13326991229";
  private static final String EMAIL = "test@example.com";

  @Value("${okta.client.org-url}")
  private String _orgUrl;

  @Value("${okta.client.token}")
  private String _token;

  private LiveOktaAuthentication _auth;
  private String _userId;
  private String _activationToken;
  private UserApi userApi;
  private UserFactorApi userFactorApi;

  @BeforeAll
  void initializeUser() {
    if (_token == null || _token.isEmpty() || _token.contains("MISSING")) {
      throw new IllegalArgumentException("The Okta token cannot be empty.");
    }
    _auth = new LiveOktaAuthentication(_orgUrl, _token);

    // It's not possible to disable caching for _testClient, so instead we reduce timeTolive down to
    // nothing.
    // (Without these caching changes, many tests will fail because they haven't registered the
    // status updates being performed.)
    CacheManager cacheManager =
        Caches.newCacheManager()
            .withDefaultTimeToLive(0, TimeUnit.MILLISECONDS)
            .withDefaultTimeToIdle(0, TimeUnit.MILLISECONDS)
            .withCache(forResource(User.class))
            .withDefaultTimeToIdle(1, TimeUnit.MILLISECONDS)
            .withDefaultTimeToLive(1, TimeUnit.MILLISECONDS)
            .build();

    ApiClient _testClient =
        Clients.builder()
            .setOrgUrl(_orgUrl)
            .setClientCredentials(new TokenClientCredentials(_token))
            .setCacheManager(cacheManager)
            .build();
    userApi = new UserApi(_testClient);
    userFactorApi = new UserFactorApi(_testClient);

    _userId = "00u74fem79YtyTszR1d7";
    _activationToken = "0n9CApQP2uHuSNHxrUrt";
  }

  // Positive Tests
  @Test
  @Order(1)
  void getStatusSuccessful_beforeActivation() {
    UserAccountStatus status = _auth.getUserStatus(_activationToken, null, null);
    assertThat(status).isEqualTo(UserAccountStatus.PENDING_ACTIVATION);
  }

  @Test
  @Order(2)
  void testActivationSuccessful() {
    String userIdResponse =
        _auth.activateUser(
            _activationToken,
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36",
            "23.235.46.133");

    assertThat(userIdResponse).isEqualTo(_userId);

    UserAccountStatus status = _auth.getUserStatus(null, _userId, null);
    assertThat(status).isEqualTo(UserAccountStatus.PASSWORD_RESET);
  }

  @Test
  @Order(3)
  void setPasswordSuccessful() {
    // Okta doesn't return the plaintext of the user's password in the response, so instead we check
    // if the passwordChanged field is set.
    assertThat(userApi.getUser(_userId).getPasswordChanged()).isNull();

    String password = "fooBAR123";
    _auth.setPassword(_userId, password.toCharArray());

    User user = userApi.getUser(_userId);
    assertThat(user.getPasswordChanged()).isNotNull();
    assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);

    UserAccountStatus status = _auth.getUserStatus(null, _userId, null);
    assertThat(status).isEqualTo(UserAccountStatus.SET_SECURITY_QUESTIONS);
  }

  @Test
  @Order(4)
  void setRecoveryQuestionSuccessful() {
    String question = "Who was your third grade teacher?";
    _auth.setRecoveryQuestion(_userId, question, "Jane Doe");

    User user = userApi.getUser(_userId);
    // Similarly to passwords, Okta doesn't return the plaintext of the user's answer.
    assertThat(user.getCredentials().getRecoveryQuestion().getQuestion()).isEqualTo(question);

    UserAccountStatus status = _auth.getUserStatus(null, _userId, null);
    assertThat(status).isEqualTo(UserAccountStatus.MFA_SELECT);
  }

  @Test
  @Order(5)
  void enrollSmsMfaSuccessful() {
    String factorId = _auth.enrollSmsMfa(_userId, PHONE_NUMBER);

    var factor = userFactorApi.getFactor(_userId, factorId);
    assertThat(factor.getFactorType()).isEqualTo(FactorType.SMS);
    assertThat(factor.getStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);
    assertThat(((SmsUserFactorProfile) factor.getProfile()).getPhoneNumber())
        .isEqualTo(FORMATTED_PHONE_NUMBER);

    UserAccountStatus status = _auth.getUserStatus(null, _userId, factorId);
    assertThat(status).isEqualTo(UserAccountStatus.SMS_PENDING_ACTIVATION);
  }

  @Test
  @Order(6)
  void enrollVoiceCallMfaSuccessful() {
    String factorId = _auth.enrollVoiceCallMfa(_userId, PHONE_NUMBER);

    var factor = userFactorApi.getFactor(_userId, factorId);
    assertThat(factor.getFactorType()).isEqualTo(FactorType.CALL);
    assertThat(factor.getStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);
    assertThat(((CallUserFactorProfile) factor.getProfile()).getPhoneNumber())
        .isEqualTo(FORMATTED_PHONE_NUMBER);

    UserAccountStatus status = _auth.getUserStatus(null, _userId, factorId);
    assertThat(status).isEqualTo(UserAccountStatus.CALL_PENDING_ACTIVATION);
  }

  @Test
  @Order(7)
  void enrollEmailMfaSuccessful() {
    String factorId = _auth.enrollEmailMfa(_userId);

    var emailFactor = userFactorApi.getFactor(_userId, factorId);
    assertThat(emailFactor.getFactorType()).isEqualTo(FactorType.EMAIL);
    assertThat(emailFactor.getStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);
    assertThat(((EmailUserFactorProfile) emailFactor.getProfile()).getEmail()).isEqualTo(EMAIL);

    UserAccountStatus status = _auth.getUserStatus(null, _userId, factorId);
    assertThat(status).isEqualTo(UserAccountStatus.EMAIL_PENDING_ACTIVATION);
  }

  @Test
  @Order(8)
  void enrollAuthenticatorAppMfaSuccessful_withGoogle() {
    FactorAndQrCode factorAndCode = _auth.enrollAuthenticatorAppMfa(_userId, "google");

    UserFactor authFactor = userFactorApi.getFactor(_userId, factorAndCode.getFactorId());
    assertThat(authFactor.getFactorType()).isEqualTo(FactorType.TOKEN_SOFTWARE_TOTP);
    assertThat(authFactor.getStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);
    assertThat(authFactor.getProvider()).isEqualTo(FactorProvider.GOOGLE);
    assertThat(factorAndCode.getQrcode()).isNotNull();

    UserAccountStatus status = _auth.getUserStatus(null, _userId, factorAndCode.getFactorId());
    assertThat(status).isEqualTo(UserAccountStatus.GOOGLE_PENDING_ACTIVATION);
  }

  @Test
  @Order(9)
  void enrollAuthenticatorAppMfaSuccessful_withOkta() {
    FactorAndQrCode factorAndCode = _auth.enrollAuthenticatorAppMfa(_userId, "okta");

    UserFactor authFactor = userFactorApi.getFactor(_userId, factorAndCode.getFactorId());
    assertThat(authFactor.getFactorType()).isEqualTo(FactorType.TOKEN_SOFTWARE_TOTP);
    assertThat(authFactor.getStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);
    assertThat(authFactor.getProvider()).isEqualTo(FactorProvider.OKTA);
    assertThat(factorAndCode.getQrcode()).isNotNull();

    UserAccountStatus status = _auth.getUserStatus(null, _userId, factorAndCode.getFactorId());
    assertThat(status).isEqualTo(UserAccountStatus.OKTA_PENDING_ACTIVATION);
  }

  @Test
  @Order(10)
  void enrollSecurityKeySuccessful() {
    var activationObject = _auth.enrollSecurityKey(_userId);

    UserFactor factor = userFactorApi.getFactor(_userId, activationObject.getFactorId());
    assertThat(factor.getFactorType()).isEqualTo(FactorType.WEBAUTHN);
    assertThat(factor.getStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);
    assertThat(((Map) activationObject.getActivation().get("user")).get("id")).isNotNull();
    assertThat(activationObject.getActivation().get("challenge")).isNotNull();

    UserAccountStatus status = _auth.getUserStatus(null, _userId, activationObject.getFactorId());
    assertThat(status).isEqualTo(UserAccountStatus.FIDO_PENDING_ACTIVATION);
  }

  @Test
  @Order(11)
  void verifyActivationPasscodeSuccessful() {
    UserFactor factor = new UserFactor();
    factor.setFactorType(FactorType.TOKEN_SOFTWARE_TOTP);
    factor.setProvider(FactorProvider.GOOGLE);
    var response = userFactorApi.enrollFactor(_userId, factor, false, null, null, false);

    assertThat(response.getStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);

    String passcode = "535334";
    String factorId = response.getId();
    _auth.verifyActivationPasscode(_userId, factorId, passcode);

    UserFactor factorAfterActivation = userFactorApi.getFactor(_userId, factorId);
    assertThat(factorAfterActivation.getStatus()).isEqualTo(FactorStatus.ACTIVE);

    UserAccountStatus status = _auth.getUserStatus(null, _userId, factorId);
    assertThat(status).isEqualTo(UserAccountStatus.ACTIVE);
  }

  @Test
  @Order(12)
  void resendActivationPasscode() {
    String factorId = _auth.enrollSmsMfa(_userId, "4045312484");
    UserFactor factorBeforeResend = userFactorApi.getFactor(_userId, factorId);

    _auth.resendActivationPasscode(_userId, factorId);

    assertThat(factorBeforeResend.getLastUpdated())
        .isNotEqualTo(userFactorApi.getFactor(_userId, factorId).getLastUpdated());

    UserAccountStatus status = _auth.getUserStatus(null, _userId, factorId);
    assertThat(status).isEqualTo(UserAccountStatus.SMS_PENDING_ACTIVATION);
  }

  // Negative Tests
  @Test
  void testActivationFails_withInvalidToken() {
    Exception exception =
        assertThrows(
            InvalidActivationLinkException.class,
            () -> _auth.activateUser("invalidActivationToken", "", ""));
    assertThat(exception).hasMessage("User could not be activated");
  }

  @Test
  void setPasswordFails_withInvalidPassword() {
    char[] password = "short".toCharArray();
    Exception exception =
        assertThrows(BadRequestException.class, () -> _auth.setPassword(_userId, password));
    assertThat(exception).hasMessageContaining("Password requirements were not met");
  }

  @Test
  void setRecoveryQuestionFails_withInvalidQuestion() {
    Exception exception =
        assertThrows(
            BadRequestException.class,
            () -> _auth.setRecoveryQuestion(_userId, "Who was your third grade teacher?", "aa"));
    assertThat(exception)
        .hasMessageContaining(
            "The security question answer must be at least 4 characters in length");
  }

  @Test
  void enrollSmsMfaFails_withInvalidPhoneNumber() {
    Exception exception =
        assertThrows(BadRequestException.class, () -> _auth.enrollSmsMfa(_userId, "999"));
    assertThat(exception).hasMessageContaining("Invalid phone number");
  }

  @Test
  void enrollVoiceCallMfaFails_withInvalidPhoneNumber() {
    Exception exception =
        assertThrows(BadRequestException.class, () -> _auth.enrollVoiceCallMfa(_userId, "999"));
    assertThat(exception).hasMessageContaining("Invalid phone number");
  }

  @Test
  void enrollAuthenticatorAppMfaFails_withInvalidAppType() {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> _auth.enrollAuthenticatorAppMfa(_userId, "app"));
    assertThat(exception).hasMessage("App type not recognized.");
  }

  @Test
  void enrollSecurityKeyFails_withInvalidUserId() {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class, () -> _auth.enrollSecurityKey("fakeUserId"));
    assertThat(exception).hasMessage("Security key could not be enrolled");
  }

  @Test
  void activateSecurityKeyFails_withInvalidData() {
    var activationObject = _auth.enrollSecurityKey(_userId);
    String factorId = activationObject.getFactorId();
    String challenge = activationObject.getActivation().get("challenge").toString();
    String returnedUserId =
        ((Map) activationObject.getActivation().get("user")).get("id").toString();
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> _auth.activateSecurityKey(_userId, factorId, challenge, returnedUserId));
    assertThat(exception).hasMessage("Security key could not be activated");
  }

  @Test
  void verifyActivationPasscodeFails_withInvalidPasscode() {
    FactorAndQrCode mfaResponse = _auth.enrollAuthenticatorAppMfa(_userId, "okta");
    String factorId = mfaResponse.getFactorId();
    Exception exception =
        assertThrows(
            BadRequestException.class,
            () -> _auth.verifyActivationPasscode(_userId, factorId, "1234"));
    assertThat(exception).hasMessageContaining("Invalid security code.");
  }

  @Test
  void resendActivationPasscodeFails_withUnenrolledFactor() {
    Exception exception =
        assertThrows(
            OktaAuthenticationFailureException.class,
            () -> _auth.resendActivationPasscode(_userId, "unenrolledFactorId"));
    assertThat(exception).hasMessage("An exception was thrown while fetching the user's factor.");
  }

  @Test
  void getUserStatus_userIdNull_returnsUnknown() {
    var actual = _auth.getUserStatus(null, null, null);
    assertThat(actual).isEqualTo(UserAccountStatus.UNKNOWN);
  }
}
