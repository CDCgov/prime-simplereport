package gov.cdc.usds.simplereport.idp.authentication;

import static com.okta.sdk.cache.Caches.forResource;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.okta.sdk.authc.credentials.TokenClientCredentials;
import com.okta.sdk.cache.CacheManager;
import com.okta.sdk.cache.Caches;
import com.okta.sdk.client.Client;
import com.okta.sdk.client.Clients;
import com.okta.sdk.resource.user.User;
import com.okta.sdk.resource.user.UserBuilder;
import com.okta.sdk.resource.user.UserStatus;
import com.okta.sdk.resource.user.factor.CallUserFactor;
import com.okta.sdk.resource.user.factor.EmailUserFactor;
import com.okta.sdk.resource.user.factor.FactorProvider;
import com.okta.sdk.resource.user.factor.FactorStatus;
import com.okta.sdk.resource.user.factor.FactorType;
import com.okta.sdk.resource.user.factor.SmsUserFactor;
import com.okta.sdk.resource.user.factor.UserFactor;
import dev.samstevens.totp.code.CodeGenerator;
import dev.samstevens.totp.code.DefaultCodeGenerator;
import gov.cdc.usds.simplereport.api.BaseFullStackTest;
import gov.cdc.usds.simplereport.api.model.errors.InvalidActivationLinkException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAuthenticationFailureException;
import java.time.Instant;
import java.util.concurrent.TimeUnit;
import org.json.JSONObject;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.MethodOrderer.OrderAnnotation;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.TestInstance.Lifecycle;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Value;

/**
 * WARNING: THIS TEST CREATES A REAL USER IN OKTA!
 *
 * <p>This tests LiveOktaAuthentication by creating a user and sending them through the account
 * creation flow. The user is not associated with an organization, and is deleted at the end of the
 * test. Running this test does add to our Okta quota, so plase run sparingly.
 *
 * <p>The test is currently disabled, until the Okta token is enabled in our test runner.
 */
@TestInstance(Lifecycle.PER_CLASS)
@TestMethodOrder(OrderAnnotation.class)
@Disabled
class LiveOktaAuthenticationTest extends BaseFullStackTest {

  private static final String PHONE_NUMBER = "999-999-9999";
  private static final String FORMATTED_PHONE_NUMBER = "+19999999999";
  private static final String EMAIL = "test@example.com";

  @Value("${okta.client.org-url}")
  private String _orgUrl;

  @Value("${okta.client.token}")
  private String _token;

  private LiveOktaAuthentication _auth;
  private Client _testClient;
  private String _userId;
  private String _activationToken;

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

    _testClient =
        Clients.builder()
            .setOrgUrl(_orgUrl)
            .setClientCredentials(new TokenClientCredentials(_token))
            .setCacheManager(cacheManager)
            .build();

    User user =
        UserBuilder.instance()
            .setFirstName("TEST")
            .setLastName("INTEGRATION")
            .setEmail(EMAIL)
            .setLogin(EMAIL)
            .setMobilePhone(PHONE_NUMBER)
            .setActive(false)
            .buildAndCreate(_testClient);

    _userId = user.getId();
    _activationToken = user.activate(false).getActivationToken();
  }

  @AfterAll
  void removeUser() {
    User user = _testClient.getUser(_userId);
    user.deactivate();
    user.delete();
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

    User user = _testClient.getUser(_userId);
    assertThat(user.getActivated()).isNotNull();
    assertThat(user.getStatus()).isEqualTo(UserStatus.PROVISIONED);
  }

  @Test
  @Order(2)
  void setPasswordSuccessful() throws Exception {
    // Okta doesn't return the plaintext of the user's password in the response, so instead we check
    // if the passwordChanged field is set.
    assertThat(_testClient.getUser(_userId).getPasswordChanged()).isNull();

    String password = "fooBAR123";
    _auth.setPassword(_userId, password.toCharArray());

    User user = _testClient.getUser(_userId);
    assertThat(user.getPasswordChanged()).isNotNull();
    assertThat(user.getStatus()).isEqualTo(UserStatus.ACTIVE);
  }

  @Test
  @Order(3)
  void setRecoveryQuestionSuccessful() throws Exception {
    String question = "Who was your third grade teacher?";
    _auth.setRecoveryQuestion(_userId, question, "Jane Doe");

    User user = _testClient.getUser(_userId);
    // Similarly to passwords, Okta doesn't return the plaintext of the user's answer.
    assertThat(user.getCredentials().getRecoveryQuestion().getQuestion()).isEqualTo(question);
  }

  @Test
  @Order(4)
  void enrollSmsMfaSuccessful() throws Exception {
    String factorId = _auth.enrollSmsMfa(_userId, PHONE_NUMBER);

    User user = _testClient.getUser(_userId);
    SmsUserFactor smsFactor = (SmsUserFactor) user.getFactor(factorId);
    assertThat(smsFactor.getFactorType()).isEqualTo(FactorType.SMS);
    assertThat(smsFactor.getStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);
    assertThat(smsFactor.getProfile().getPhoneNumber()).isEqualTo(FORMATTED_PHONE_NUMBER);

    user.resetFactors();
  }

  @Test
  @Order(5)
  void enrollVoiceCallMfaSuccessful() throws Exception {
    String factorId = _auth.enrollVoiceCallMfa(_userId, PHONE_NUMBER);

    User user = _testClient.getUser(_userId);
    CallUserFactor callFactor = (CallUserFactor) user.getFactor(factorId);
    assertThat(callFactor.getFactorType()).isEqualTo(FactorType.CALL);
    assertThat(callFactor.getStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);
    assertThat(callFactor.getProfile().getPhoneNumber()).isEqualTo(FORMATTED_PHONE_NUMBER);

    user.resetFactors();
  }

  @Test
  @Order(6)
  void enrollEmailMfaSuccessful() throws Exception {
    String factorId = _auth.enrollEmailMfa(_userId, EMAIL);

    User user = _testClient.getUser(_userId);
    EmailUserFactor emailFactor = (EmailUserFactor) user.getFactor(factorId);
    assertThat(emailFactor.getFactorType()).isEqualTo(FactorType.EMAIL);
    assertThat(emailFactor.getStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);
    assertThat(emailFactor.getProfile().getEmail()).isEqualTo(EMAIL);

    user.resetFactors();
  }

  @Test
  @Order(7)
  void enrollAuthenticatorAppMfaSuccessful_withGoogle() throws Exception {
    JSONObject factorAndCode = _auth.enrollAuthenticatorAppMfa(_userId, "google");

    User user = _testClient.getUser(_userId);
    UserFactor authFactor = user.getFactor(factorAndCode.getString("factorId"));
    assertThat(authFactor.getFactorType()).isEqualTo(FactorType.TOKEN_SOFTWARE_TOTP);
    assertThat(authFactor.getStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);
    assertThat(authFactor.getProvider()).isEqualTo(FactorProvider.GOOGLE);
    assertThat(factorAndCode.isNull("qrcode")).isFalse();

    user.resetFactors();
  }

  @Test
  @Order(8)
  void enrollAuthenticatorAppMfaSuccessful_withOkta() throws Exception {
    JSONObject factorAndCode = _auth.enrollAuthenticatorAppMfa(_userId, "okta");

    User user = _testClient.getUser(_userId);
    UserFactor authFactor = user.getFactor(factorAndCode.getString("factorId"));
    assertThat(authFactor.getFactorType()).isEqualTo(FactorType.TOKEN_SOFTWARE_TOTP);
    assertThat(authFactor.getStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);
    assertThat(authFactor.getProvider()).isEqualTo(FactorProvider.OKTA);
    assertThat(factorAndCode.isNull("qrcode")).isFalse();

    user.resetFactors();
  }

  @Test
  @Order(9)
  void verifyActivationPasscodeSuccessful() throws Exception {
    User user = _testClient.getUser(_userId);

    UserFactor factor = _testClient.instantiate(UserFactor.class);
    factor.setFactorType(FactorType.TOKEN_SOFTWARE_TOTP);
    factor.setProvider(FactorProvider.GOOGLE);
    user.enrollFactor(factor);

    assertThat(factor.getStatus()).isEqualTo(FactorStatus.PENDING_ACTIVATION);

    JSONObject embeddedJson = new JSONObject(factor.getEmbedded());
    String sharedSecret = embeddedJson.getJSONObject("activation").getString("sharedSecret");
    long timeStep = embeddedJson.getJSONObject("activation").getLong("timeStep");

    CodeGenerator codeGenerator = new DefaultCodeGenerator();
    long millisSinceEpoch = Instant.now().toEpochMilli();
    long counter = millisSinceEpoch / 1000 / timeStep;
    String passcode = codeGenerator.generate(sharedSecret, counter);

    String factorId = factor.getId();
    _auth.verifyActivationPasscode(_userId, factorId, passcode);

    UserFactor factorAfterActivation = _testClient.getUser(_userId).getFactor(factorId);
    assertThat(factorAfterActivation.getStatus()).isEqualTo(FactorStatus.ACTIVE);

    user.resetFactors();
  }

  @Test
  @Order(10)
  void resendActivationPasscode() throws Exception {
    String factorId = _auth.enrollSmsMfa(_userId, "4045312484");
    UserFactor factorBeforeResend = _testClient.getUser(_userId).getFactor(factorId);

    // fail the test if an exception is thrown
    try {
      // Okta requires users to wait 30 seconds before re-requesting an activation code.
      Thread.sleep(31000);
      _auth.resendActivationPasscode(_userId, factorId);
    } catch (OktaAuthenticationFailureException | IllegalStateException e) {
      throw new IllegalStateException("An exception should not be thrown.", e);
    }

    User user = _testClient.getUser(_userId);
    assertThat(factorBeforeResend.getLastUpdated())
        .isNotEqualTo(user.getFactor(factorId).getLastUpdated());

    user.resetFactors();
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
    JSONObject mfaResponse = _auth.enrollAuthenticatorAppMfa(_userId, "okta");
    String factorId = mfaResponse.getString("factorId");
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
}
