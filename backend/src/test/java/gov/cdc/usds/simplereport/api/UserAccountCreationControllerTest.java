package gov.cdc.usds.simplereport.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import gov.cdc.usds.simplereport.api.apiuser.UserAccountCreationController;
import gov.cdc.usds.simplereport.config.TemplateConfiguration;
import gov.cdc.usds.simplereport.config.WebConfiguration;
import gov.cdc.usds.simplereport.idp.authentication.DemoOktaAuthentication;
import gov.cdc.usds.simplereport.logging.AuditLoggingAdvice;
import javax.servlet.http.HttpSession;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@Import(DemoOktaAuthentication.class)
@WebMvcTest(
    controllers = UserAccountCreationController.class,
    includeFilters =
        @Filter(
            classes = {TemplateConfiguration.class},
            type = FilterType.ASSIGNABLE_TYPE),
    excludeFilters =
        @Filter(
            classes = {AuditLoggingAdvice.class, WebConfiguration.class},
            type = FilterType.ASSIGNABLE_TYPE))
class UserAccountCreationControllerTest {

  @Autowired private MockMvc _mockMvc;

  @Autowired private DemoOktaAuthentication _oktaAuth;

  private static final String VALID_PASSWORD_REQUEST =
      "{\"activationToken\":\"validActivationToken\", \"password\":\"superStrongPassword!\"}";

  private static final String VALID_RECOVERY_QUESTION_REQUEST =
      "{\"question\":\"Who was your third grade teacher?\", \"answer\" : \"Jane Doe\"}";

  private static final String VALID_ENROLL_PHONE_MFA_REQUEST = "{\"userInput\":\"555-867-5309\"}";

  private static final String VALID_ENROLL_EMAIL_MFA_REQUEST = "{\"userInput\":\"me@example.com\"}";

  private static final String VALID_ENROLL_AUTH_APP_MFA_REQUEST = "{\"userInput\":\"okta\"}";

  private static final String VALID_ACTIVATION_PASSCODE_REQUEST = "{\"userInput\":\"123456\"}";

  private static final String VALID_ACTIVATE_SECURITY_KEY_REQUEST =
      "{\"attestation\":\"123456\", \"clientData\":\"dataaaaa\"}";

  @BeforeEach
  public void setup() throws Exception {
    _oktaAuth.reset();
  }

  @Test
  void setPasswordIsOk() throws Exception {
    MockHttpServletRequestBuilder builder =
        createActivationRequest(new MockHttpSession(), VALID_PASSWORD_REQUEST);
    this._mockMvc.perform(builder).andExpect(status().isOk());
  }

  @Test
  void setPassword_failsWithoutActivationToken() throws Exception {
    String passwordRequestNoActivation = "{\"password\":\"superStrongPassword!\"}";

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.USER_SET_PASSWORD)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(passwordRequestNoActivation);

    this._mockMvc.perform(builder).andExpect(status().isForbidden());
  }

  @Test
  void setPassword_worksAsExpectedWithMultipleSessions() throws Exception {
    MockHttpServletRequestBuilder firstBuilder =
        createActivationRequest(new MockHttpSession(), VALID_PASSWORD_REQUEST);

    String secondValidPasswordRequest =
        "{\"activationToken\":\"anotherValidAuthToken\", \"password\":\"secondSuperStrongPassword!?\"}";

    MockHttpServletRequestBuilder secondBuilder =
        createActivationRequest(new MockHttpSession(), secondValidPasswordRequest);

    HttpSession firstSession = performRequestAndGetSession(firstBuilder);

    HttpSession secondSession = performRequestAndGetSession(secondBuilder);

    assertThat(firstSession.getId()).isNotEqualTo(secondSession.getId());
    assertThat(firstSession.getAttribute("userId")).isEqualTo("userId " + "validActivationToken");
  }

  @Test
  void setPasswordThenRecoveryQuestions() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder setPasswordBuilder =
        createActivationRequest(session, VALID_PASSWORD_REQUEST);

    MockHttpServletRequestBuilder setRecoveryQuestionBuilder =
        createPostRequest(
            session, VALID_RECOVERY_QUESTION_REQUEST, ResourceLinks.USER_SET_RECOVERY_QUESTION);

    HttpSession setPasswordResponse = performRequestAndGetSession(setPasswordBuilder);

    HttpSession setRecoveryQuestionResponse =
        performRequestAndGetSession(setRecoveryQuestionBuilder);

    // assert that the userId is propagated to the recovery question session
    assertThat(setRecoveryQuestionResponse.getAttribute("userId"))
        .isEqualTo("userId " + "validActivationToken");
    assertEquals(setPasswordResponse, setRecoveryQuestionResponse);
  }

  @Test
  void enrollSmsMfaIsOk() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder setPasswordBuilder =
        createActivationRequest(session, VALID_PASSWORD_REQUEST);

    MockHttpServletRequestBuilder enrollSmsMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_PHONE_MFA_REQUEST, ResourceLinks.USER_ENROLL_SMS_MFA);

    HttpSession setPasswordResponse = performRequestAndGetSession(setPasswordBuilder);

    HttpSession enrollSmsMfaResponse = performRequestAndGetSession(enrollSmsMfaBuilder);

    assertThat(setPasswordResponse.getAttribute("userId"))
        .isEqualTo(enrollSmsMfaResponse.getAttribute("userId"));
    assertThat(enrollSmsMfaResponse.getAttribute("factorId")).isNotNull();
  }

  @Test
  void cannotEnrollSmsMfa_withoutActivatedUser() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder enrollSmsMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_PHONE_MFA_REQUEST, ResourceLinks.USER_ENROLL_SMS_MFA);

    this._mockMvc.perform(enrollSmsMfaBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void enrollVoiceCallMfaIsOk() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder activateUserBuilder =
        createActivationRequest(session, VALID_PASSWORD_REQUEST);

    MockHttpServletRequestBuilder enrollVoiceCallMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_PHONE_MFA_REQUEST, ResourceLinks.USER_ENROLL_VOICE_CALL_MFA);

    HttpSession setPasswordResponse = performRequestAndGetSession(activateUserBuilder);

    HttpSession enrollVoiceCallMfaResponse = performRequestAndGetSession(enrollVoiceCallMfaBuilder);

    assertThat(setPasswordResponse.getAttribute("userId"))
        .isEqualTo(enrollVoiceCallMfaResponse.getAttribute("userId"));
    assertThat(enrollVoiceCallMfaResponse.getAttribute("factorId")).isNotNull();
  }

  @Test
  void cannotEnrollVoiceCallMfa_withoutActivatedUser() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder enrollVoiceCallMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_PHONE_MFA_REQUEST, ResourceLinks.USER_ENROLL_VOICE_CALL_MFA);

    this._mockMvc.perform(enrollVoiceCallMfaBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void cannotEnrollVoiceCallMfa_withoutValidPhoneNumber() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder activateUserBuilder =
        createActivationRequest(session, VALID_PASSWORD_REQUEST);

    MockHttpServletRequestBuilder enrollVoiceCallMfaBuilder =
        createPostRequest(
            session, "{\"userInput\":\"555\"}", ResourceLinks.USER_ENROLL_VOICE_CALL_MFA);

    this._mockMvc.perform(activateUserBuilder).andExpect(status().isOk());

    this._mockMvc.perform(enrollVoiceCallMfaBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void enrollEmailMfa_isOk() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder activateUserBuilder =
        createActivationRequest(session, VALID_PASSWORD_REQUEST);

    MockHttpServletRequestBuilder enrollEmailMfaBuilder =
        createPostRequest(session, "", ResourceLinks.USER_ENROLL_EMAIL_MFA);

    HttpSession setPasswordResponse = performRequestAndGetSession(activateUserBuilder);

    HttpSession enrollEmailMfaResponse = performRequestAndGetSession(enrollEmailMfaBuilder);

    assertThat(setPasswordResponse.getAttribute("userId"))
        .isEqualTo(enrollEmailMfaResponse.getAttribute("userId"));
    assertThat(enrollEmailMfaResponse.getAttribute("factorId")).isNotNull();
  }

  @Test
  void cannotEnrollEmailMfa_withoutActivatedUser() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder enrollEmailMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_EMAIL_MFA_REQUEST, ResourceLinks.USER_ENROLL_EMAIL_MFA);

    this._mockMvc.perform(enrollEmailMfaBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void enrollAuthenticatorAppMfa_isOk() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder activateUserBuilder =
        createActivationRequest(session, VALID_PASSWORD_REQUEST);

    MockHttpServletRequestBuilder enrollAuthAppMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_AUTH_APP_MFA_REQUEST, ResourceLinks.USER_ENROLL_AUTH_APP_MFA);

    HttpSession setPasswordResponse = performRequestAndGetSession(activateUserBuilder);

    MvcResult enrollAuthAppMfaResponse =
        this._mockMvc.perform(enrollAuthAppMfaBuilder).andExpect(status().isOk()).andReturn();

    HttpSession enrollAuthAppMfaResponseSession =
        enrollAuthAppMfaResponse.getRequest().getSession(false);

    assertThat(setPasswordResponse.getAttribute("userId"))
        .isEqualTo(enrollAuthAppMfaResponseSession.getAttribute("userId"));
    assertThat(enrollAuthAppMfaResponseSession.getAttribute("factorId")).isNotNull();
    assertThat(enrollAuthAppMfaResponse.getResponse().getContentAsString()).contains("QrCode");
  }

  @Test
  void cannotEnrollAuthAppMfa_withoutActivatedUser() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder enrollAuthAppMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_AUTH_APP_MFA_REQUEST, ResourceLinks.USER_ENROLL_AUTH_APP_MFA);

    this._mockMvc.perform(enrollAuthAppMfaBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void cannotEnrollAuthAppMfa_withInvalidAppType() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder activateUserBuilder =
        createActivationRequest(session, VALID_PASSWORD_REQUEST);

    MockHttpServletRequestBuilder enrollAuthAppMfaBuilder =
        createPostRequest(
            session, "{\"userInput\":\"lastPass\"}", ResourceLinks.USER_ENROLL_AUTH_APP_MFA);

    this._mockMvc.perform(activateUserBuilder).andExpect(status().isOk());

    this._mockMvc.perform(enrollAuthAppMfaBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void enrollSecurityKeyMfa_isOk() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder activateUserBuilder =
        createActivationRequest(session, VALID_PASSWORD_REQUEST);

    MockHttpServletRequestBuilder enrollSecurityKeyBuilder =
        createPostRequest(session, "", ResourceLinks.USER_ENROLL_SECURITY_KEY_MFA);

    HttpSession setPasswordResponse = performRequestAndGetSession(activateUserBuilder);

    MvcResult enrollSecurityKeyResponse =
        this._mockMvc.perform(enrollSecurityKeyBuilder).andExpect(status().isOk()).andReturn();

    HttpSession enrollSecurityKeyResponseSession =
        enrollSecurityKeyResponse.getRequest().getSession(false);

    assertThat(setPasswordResponse.getAttribute("userId"))
        .isEqualTo(enrollSecurityKeyResponseSession.getAttribute("userId"));
    assertThat(enrollSecurityKeyResponseSession.getAttribute("factorId")).isNotNull();
    assertThat(enrollSecurityKeyResponse.getResponse().getContentAsString()).contains("activation");
  }

  @Test
  void enrollSecurityKey_failsWithoutActivatedUser() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder enrollSecurityKeyBuilder =
        createPostRequest(session, "", ResourceLinks.USER_ENROLL_SECURITY_KEY_MFA);

    this._mockMvc.perform(enrollSecurityKeyBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void activateSecurityKey_successful() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder activateUserBuilder =
        createActivationRequest(session, VALID_PASSWORD_REQUEST);

    MockHttpServletRequestBuilder enrollSecurityKeyBuilder =
        createPostRequest(session, "", ResourceLinks.USER_ENROLL_SECURITY_KEY_MFA);

    MockHttpServletRequestBuilder activateSecurityKeyBuilder =
        createPostRequest(
            session,
            VALID_ACTIVATE_SECURITY_KEY_REQUEST,
            ResourceLinks.USER_ACTIVATE_SECURITY_KEY_MFA);

    performRequestAndGetSession(activateUserBuilder);
    performRequestAndGetSession(enrollSecurityKeyBuilder);

    this._mockMvc.perform(activateSecurityKeyBuilder).andExpect(status().isOk());
  }

  @Test
  void activateSecurityKey_failsWithoutEnrollment() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder activateUserBuilder =
        createActivationRequest(session, VALID_PASSWORD_REQUEST);

    MockHttpServletRequestBuilder activateSecurityKeyBuilder =
        createPostRequest(
            session,
            VALID_ACTIVATE_SECURITY_KEY_REQUEST,
            ResourceLinks.USER_ACTIVATE_SECURITY_KEY_MFA);

    performRequestAndGetSession(activateUserBuilder);

    this._mockMvc.perform(activateSecurityKeyBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void activateSecurityKey_failsWithInvalidAttestation() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder activateUserBuilder =
        createActivationRequest(session, VALID_PASSWORD_REQUEST);

    MockHttpServletRequestBuilder enrollSecurityKeyBuilder =
        createPostRequest(session, "", ResourceLinks.USER_ENROLL_SECURITY_KEY_MFA);

    MockHttpServletRequestBuilder activateSecurityKeyBuilder =
        createPostRequest(
            session,
            "{\"attestation\":\"\", \"clientData\":\"dataaaaa\"}",
            ResourceLinks.USER_ACTIVATE_SECURITY_KEY_MFA);

    performRequestAndGetSession(activateUserBuilder);
    performRequestAndGetSession(enrollSecurityKeyBuilder);

    this._mockMvc.perform(activateSecurityKeyBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void activateSecurityKey_failsWithInvalidClientData() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder activateUserBuilder =
        createActivationRequest(session, VALID_PASSWORD_REQUEST);

    MockHttpServletRequestBuilder enrollSecurityKeyBuilder =
        createPostRequest(session, "", ResourceLinks.USER_ENROLL_SECURITY_KEY_MFA);

    MockHttpServletRequestBuilder activateSecurityKeyBuilder =
        createPostRequest(
            session,
            "{\"attestation\":\"123456\", \"clientData\":\"\"}",
            ResourceLinks.USER_ACTIVATE_SECURITY_KEY_MFA);

    performRequestAndGetSession(activateUserBuilder);
    performRequestAndGetSession(enrollSecurityKeyBuilder);

    this._mockMvc.perform(activateSecurityKeyBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void verifyActivationPasscode_isOk() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder activateUserBuilder =
        createActivationRequest(session, VALID_PASSWORD_REQUEST);

    MockHttpServletRequestBuilder enrollAuthAppMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_AUTH_APP_MFA_REQUEST, ResourceLinks.USER_ENROLL_AUTH_APP_MFA);

    MockHttpServletRequestBuilder verifyPasscodeBuilder =
        createPostRequest(
            session,
            VALID_ACTIVATION_PASSCODE_REQUEST,
            ResourceLinks.USER_VERIFY_ACTIVATION_PASSCODE);

    this._mockMvc.perform(activateUserBuilder).andExpect(status().isOk());

    this._mockMvc.perform(enrollAuthAppMfaBuilder).andExpect(status().isOk());

    this._mockMvc.perform(verifyPasscodeBuilder).andExpect(status().isOk());
  }

  @Test
  void verifyActivationPasscode_failsWithInvalidPasscode() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder activateUserBuilder =
        createActivationRequest(session, VALID_PASSWORD_REQUEST);

    MockHttpServletRequestBuilder enrollAuthAppMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_AUTH_APP_MFA_REQUEST, ResourceLinks.USER_ENROLL_AUTH_APP_MFA);

    MockHttpServletRequestBuilder verifyPasscodeBuilder =
        createPostRequest(
            session, "{\"userInput\":\"1234\"}", ResourceLinks.USER_VERIFY_ACTIVATION_PASSCODE);

    this._mockMvc.perform(activateUserBuilder).andExpect(status().isOk());

    this._mockMvc.perform(enrollAuthAppMfaBuilder).andExpect(status().isOk());

    this._mockMvc.perform(verifyPasscodeBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void verifyActivationPasscode_failsWithoutEnrolledMfa() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder activateUserBuilder =
        createActivationRequest(session, VALID_PASSWORD_REQUEST);

    MockHttpServletRequestBuilder verifyPasscodeBuilder =
        createPostRequest(
            session,
            VALID_ACTIVATION_PASSCODE_REQUEST,
            ResourceLinks.USER_VERIFY_ACTIVATION_PASSCODE);

    this._mockMvc.perform(activateUserBuilder).andExpect(status().isOk());

    this._mockMvc.perform(verifyPasscodeBuilder).andExpect(status().is4xxClientError());
  }

  private MockHttpServletRequestBuilder createActivationRequest(
      MockHttpSession session, String requestBody) {
    return post(ResourceLinks.USER_SET_PASSWORD)
        .contentType(MediaType.APPLICATION_JSON_VALUE)
        .accept(MediaType.APPLICATION_JSON)
        .characterEncoding("UTF-8")
        .header("X-Forwarded-For", "1.1.1.1")
        .header("User-Agent", "Chrome")
        .content(requestBody)
        .session(session);
  }

  private MockHttpServletRequestBuilder createPostRequest(
      MockHttpSession session, String requestBody, String link) {
    return post(link)
        .contentType(MediaType.APPLICATION_JSON_VALUE)
        .accept(MediaType.APPLICATION_JSON)
        .characterEncoding("UTF-8")
        .content(requestBody)
        .session(session);
  }

  private HttpSession performRequestAndGetSession(MockHttpServletRequestBuilder builder)
      throws Exception {
    return this._mockMvc
        .perform(builder)
        .andExpect(status().isOk())
        .andReturn()
        .getRequest()
        .getSession(false);
  }
}
