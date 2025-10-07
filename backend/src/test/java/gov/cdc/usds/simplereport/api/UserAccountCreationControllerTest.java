package gov.cdc.usds.simplereport.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import gov.cdc.usds.simplereport.api.apiuser.UserAccountCreationController;
import gov.cdc.usds.simplereport.config.WebConfiguration;
import gov.cdc.usds.simplereport.config.authorization.DemoAuthenticationConfiguration;
import gov.cdc.usds.simplereport.idp.authentication.DemoOktaAuthentication;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
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

@Import({
  DemoAuthenticationConfiguration.class,
  DemoOktaAuthentication.class,
  DemoOktaRepository.class
})
@WebMvcTest(
    controllers = UserAccountCreationController.class,
    excludeFilters =
        @Filter(
            classes = {AuditLoggingAdvice.class, WebConfiguration.class},
            type = FilterType.ASSIGNABLE_TYPE))
class UserAccountCreationControllerTest extends BaseNonSpringBootTestConfiguration {

  @Autowired private MockMvc _mockMvc;

  @Autowired private DemoOktaAuthentication _oktaAuth;

  private static final String VALID_ACTIVATION_REQUEST =
      "{\"activationToken\":\"validActivationToken\"}";

  private static final String VALID_SET_PASSWORD_REQUEST =
      "{\"password\":\"superStrongPassword!\"}";

  private static final String VALID_RECOVERY_QUESTION_REQUEST =
      "{\"question\":\"Who was your third grade teacher?\", \"answer\" : \"Jane Doe\"}";

  private static final String VALID_ENROLL_PHONE_MFA_REQUEST = "{\"userInput\":\"(555)-867-5309\"}";

  private static final String VALID_ENROLL_EMAIL_MFA_REQUEST = "{\"userInput\":\"me@example.com\"}";

  private static final String VALID_ENROLL_AUTH_APP_MFA_REQUEST = "{\"userInput\":\"okta\"}";

  private static final String VALID_ACTIVATION_PASSCODE_REQUEST = "{\"userInput\":\"123456\"}";

  private static final String VALID_ACTIVATE_SECURITY_KEY_REQUEST =
      "{\"attestation\":\"123456\", \"clientData\":\"dataaaaa\"}";

  private static final String USER_ID_ATTRIBUTE_KEY = "userId";
  private static final String FACTOR_ID_ATTRIBUTE_KEY = "factorId";

  @BeforeEach
  public void setup() throws Exception {
    _oktaAuth.reset();
  }

  @Test
  void initialize_isOk() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder activateUserBuilder =
        createPostRequest(
            session, VALID_ACTIVATION_REQUEST, ResourceLinks.USER_ACTIVATE_ACCOUNT_REQUEST);

    this._mockMvc.perform(activateUserBuilder).andExpect(status().isOk());

    assertThat(session.getAttribute(USER_ID_ATTRIBUTE_KEY)).isNotNull();
  }

  @Test
  void initialize_failsWithoutValidActivationToken() throws Exception {
    // request must contain "activationToken", not just "token"
    String invalidRequest = "{\"token\":\"validActivationToken\"}";
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder activateUserBuilder =
        createPostRequest(session, invalidRequest, ResourceLinks.USER_ACTIVATE_ACCOUNT_REQUEST);

    this._mockMvc.perform(activateUserBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void setPassword_isOkAndSessionPropogates() throws Exception {
    MockHttpSession session = new MockHttpSession();

    HttpSession activationResponse = issueActivationRequest(session);

    MockHttpServletRequestBuilder setPasswordBuilder =
        createPostRequest(session, VALID_SET_PASSWORD_REQUEST, ResourceLinks.USER_SET_PASSWORD);

    HttpSession setPasswordResponse =
        this._mockMvc
            .perform(setPasswordBuilder)
            .andExpect(status().isOk())
            .andReturn()
            .getRequest()
            .getSession(false);

    assertThat(activationResponse).isEqualTo(setPasswordResponse);
  }

  @Test
  void setPassword_failsWithoutInitialization() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder setPasswordBuilder =
        createPostRequest(session, VALID_SET_PASSWORD_REQUEST, ResourceLinks.USER_SET_PASSWORD);

    this._mockMvc.perform(setPasswordBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void setRecoveryQuestions_isOk() throws Exception {
    MockHttpSession session = new MockHttpSession();

    issueActivationRequest(session);
    issueSetPasswordRequest(session);

    MockHttpServletRequestBuilder setRecoveryQuestionBuilder =
        createPostRequest(
            session, VALID_RECOVERY_QUESTION_REQUEST, ResourceLinks.USER_SET_RECOVERY_QUESTION);
    HttpSession setRecoveryQuestionResponse =
        performRequestAndGetSession(setRecoveryQuestionBuilder);

    // assert that the userId is propagated to the recovery question session
    assertThat(setRecoveryQuestionResponse.getAttribute(USER_ID_ATTRIBUTE_KEY)).isNotNull();
  }

  @Test
  void setRecoveryQuestions_failsWithoutInitialization() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder setRecoveryQuestionBuilder =
        createPostRequest(
            session, VALID_RECOVERY_QUESTION_REQUEST, ResourceLinks.USER_SET_RECOVERY_QUESTION);

    this._mockMvc.perform(setRecoveryQuestionBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void enrollSmsMfaIsOk() throws Exception {
    MockHttpSession session = new MockHttpSession();

    issueActivationRequest(session);
    HttpSession setPasswordSession = issueSetPasswordRequest(session);

    MockHttpServletRequestBuilder enrollSmsMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_PHONE_MFA_REQUEST, ResourceLinks.USER_ENROLL_SMS_MFA);
    HttpSession enrollSmsMfaResponse = performRequestAndGetSession(enrollSmsMfaBuilder);

    assertThat(setPasswordSession.getAttribute(USER_ID_ATTRIBUTE_KEY))
        .isEqualTo(enrollSmsMfaResponse.getAttribute(USER_ID_ATTRIBUTE_KEY));
    assertThat(enrollSmsMfaResponse.getAttribute(FACTOR_ID_ATTRIBUTE_KEY)).isNotNull();
  }

  @Test
  void enrollSmsMfa_failsWithInvalidRequestBody() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);
    issueSetPasswordRequest(session);

    String invalidRequestBody = "{\"input\":\"555-867-5309\"}";
    MockHttpServletRequestBuilder enrollSmsMfaBuilder =
        createPostRequest(session, invalidRequestBody, ResourceLinks.USER_ENROLL_SMS_MFA);

    this._mockMvc.perform(enrollSmsMfaBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void wnrollSmsMfa_failsWithoutActivatedUser() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder enrollSmsMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_PHONE_MFA_REQUEST, ResourceLinks.USER_ENROLL_SMS_MFA);

    this._mockMvc.perform(enrollSmsMfaBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void enrollVoiceCallMfa_isOk() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);
    HttpSession setPasswordSession = issueSetPasswordRequest(session);

    MockHttpServletRequestBuilder enrollVoiceCallMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_PHONE_MFA_REQUEST, ResourceLinks.USER_ENROLL_VOICE_CALL_MFA);
    HttpSession enrollVoiceCallMfaResponse = performRequestAndGetSession(enrollVoiceCallMfaBuilder);

    assertThat(setPasswordSession.getAttribute(USER_ID_ATTRIBUTE_KEY))
        .isEqualTo(enrollVoiceCallMfaResponse.getAttribute(USER_ID_ATTRIBUTE_KEY));
    assertThat(enrollVoiceCallMfaResponse.getAttribute(FACTOR_ID_ATTRIBUTE_KEY)).isNotNull();
  }

  @Test
  void enrollVoiceCallMfa_failsWithInvalidRequestBody() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);
    issueSetPasswordRequest(session);

    String invalidRequestBody = "{\"input\":\"555-867-5309\"}";
    MockHttpServletRequestBuilder enrollVoiceCallMfaBuilder =
        createPostRequest(session, invalidRequestBody, ResourceLinks.USER_ENROLL_VOICE_CALL_MFA);

    this._mockMvc.perform(enrollVoiceCallMfaBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void enrollVoiceCallMfa_failsWithoutValidPhoneNumber() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);
    issueSetPasswordRequest(session);

    String invalidRequestBody = "{\"userInput\":\"555\"}";
    MockHttpServletRequestBuilder enrollVoiceCallMfaBuilder =
        createPostRequest(session, invalidRequestBody, ResourceLinks.USER_ENROLL_VOICE_CALL_MFA);

    this._mockMvc.perform(enrollVoiceCallMfaBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void enrollVoiceCallMfa_failsWithoutActivatedUser() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder enrollVoiceCallMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_PHONE_MFA_REQUEST, ResourceLinks.USER_ENROLL_VOICE_CALL_MFA);

    this._mockMvc.perform(enrollVoiceCallMfaBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void enrollEmailMfa_isOk() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);
    HttpSession setPasswordSession = issueSetPasswordRequest(session);

    MockHttpServletRequestBuilder enrollEmailMfaBuilder =
        createPostRequest(session, "", ResourceLinks.USER_ENROLL_EMAIL_MFA);

    HttpSession enrollEmailMfaResponse = performRequestAndGetSession(enrollEmailMfaBuilder);

    assertThat(setPasswordSession.getAttribute(USER_ID_ATTRIBUTE_KEY))
        .isEqualTo(enrollEmailMfaResponse.getAttribute(USER_ID_ATTRIBUTE_KEY));
    assertThat(enrollEmailMfaResponse.getAttribute(FACTOR_ID_ATTRIBUTE_KEY)).isNotNull();
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
    issueActivationRequest(session);
    HttpSession setPasswordSession = issueSetPasswordRequest(session);

    MockHttpServletRequestBuilder enrollAuthAppMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_AUTH_APP_MFA_REQUEST, ResourceLinks.USER_ENROLL_AUTH_APP_MFA);

    MvcResult enrollAuthAppMfaResponse =
        this._mockMvc.perform(enrollAuthAppMfaBuilder).andExpect(status().isOk()).andReturn();

    HttpSession enrollAuthAppMfaResponseSession =
        enrollAuthAppMfaResponse.getRequest().getSession(false);

    assertThat(setPasswordSession.getAttribute(USER_ID_ATTRIBUTE_KEY))
        .isEqualTo(enrollAuthAppMfaResponseSession.getAttribute(USER_ID_ATTRIBUTE_KEY));
    assertThat(enrollAuthAppMfaResponseSession.getAttribute(FACTOR_ID_ATTRIBUTE_KEY)).isNotNull();
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
    issueActivationRequest(session);
    issueSetPasswordRequest(session);

    MockHttpServletRequestBuilder enrollAuthAppMfaBuilder =
        createPostRequest(
            session, "{\"userInput\":\"lastPass\"}", ResourceLinks.USER_ENROLL_AUTH_APP_MFA);

    this._mockMvc.perform(enrollAuthAppMfaBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void enrollSecurityKeyMfa_isOk() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);
    HttpSession setPasswordSession = issueSetPasswordRequest(session);

    MockHttpServletRequestBuilder enrollSecurityKeyBuilder =
        createPostRequest(session, "", ResourceLinks.USER_ENROLL_SECURITY_KEY_MFA);
    MvcResult enrollSecurityKeyResponse =
        this._mockMvc.perform(enrollSecurityKeyBuilder).andExpect(status().isOk()).andReturn();
    HttpSession enrollSecurityKeyResponseSession =
        enrollSecurityKeyResponse.getRequest().getSession(false);

    assertThat(setPasswordSession.getAttribute(USER_ID_ATTRIBUTE_KEY))
        .isEqualTo(enrollSecurityKeyResponseSession.getAttribute(USER_ID_ATTRIBUTE_KEY));
    assertThat(enrollSecurityKeyResponseSession.getAttribute(FACTOR_ID_ATTRIBUTE_KEY)).isNotNull();
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
    issueActivationRequest(session);
    issueSetPasswordRequest(session);

    MockHttpServletRequestBuilder enrollSecurityKeyBuilder =
        createPostRequest(session, "", ResourceLinks.USER_ENROLL_SECURITY_KEY_MFA);
    MockHttpServletRequestBuilder activateSecurityKeyBuilder =
        createPostRequest(
            session,
            VALID_ACTIVATE_SECURITY_KEY_REQUEST,
            ResourceLinks.USER_ACTIVATE_SECURITY_KEY_MFA);

    performRequestAndGetSession(enrollSecurityKeyBuilder);

    this._mockMvc.perform(activateSecurityKeyBuilder).andExpect(status().isOk());
  }

  @Test
  void activateSecurityKey_failsWithoutEnrollment() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);
    issueSetPasswordRequest(session);

    MockHttpServletRequestBuilder activateSecurityKeyBuilder =
        createPostRequest(
            session,
            VALID_ACTIVATE_SECURITY_KEY_REQUEST,
            ResourceLinks.USER_ACTIVATE_SECURITY_KEY_MFA);

    this._mockMvc.perform(activateSecurityKeyBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void activateSecurityKey_failsWithInvalidAttestation() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);
    issueSetPasswordRequest(session);

    MockHttpServletRequestBuilder enrollSecurityKeyBuilder =
        createPostRequest(session, "", ResourceLinks.USER_ENROLL_SECURITY_KEY_MFA);

    MockHttpServletRequestBuilder activateSecurityKeyBuilder =
        createPostRequest(
            session,
            "{\"attestation\":\"\", \"clientData\":\"dataaaaa\"}",
            ResourceLinks.USER_ACTIVATE_SECURITY_KEY_MFA);

    performRequestAndGetSession(enrollSecurityKeyBuilder);

    this._mockMvc.perform(activateSecurityKeyBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void activateSecurityKey_failsWithInvalidClientData() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);
    issueSetPasswordRequest(session);

    MockHttpServletRequestBuilder enrollSecurityKeyBuilder =
        createPostRequest(session, "", ResourceLinks.USER_ENROLL_SECURITY_KEY_MFA);

    MockHttpServletRequestBuilder activateSecurityKeyBuilder =
        createPostRequest(
            session,
            "{\"attestation\":\"123456\", \"clientData\":\"\"}",
            ResourceLinks.USER_ACTIVATE_SECURITY_KEY_MFA);

    performRequestAndGetSession(enrollSecurityKeyBuilder);

    this._mockMvc.perform(activateSecurityKeyBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void activateSecurityKey_failsWithInvalidRequest() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);
    issueSetPasswordRequest(session);

    MockHttpServletRequestBuilder enrollSecurityKeyBuilder =
        createPostRequest(session, "", ResourceLinks.USER_ENROLL_SECURITY_KEY_MFA);

    MockHttpServletRequestBuilder activateSecurityKeyBuilder =
        createPostRequest(
            session, "{\"attestation\":\"123456\"}", ResourceLinks.USER_ACTIVATE_SECURITY_KEY_MFA);

    performRequestAndGetSession(enrollSecurityKeyBuilder);

    this._mockMvc.perform(activateSecurityKeyBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void verifyActivationPasscode_isOk() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);
    issueSetPasswordRequest(session);

    MockHttpServletRequestBuilder enrollAuthAppMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_AUTH_APP_MFA_REQUEST, ResourceLinks.USER_ENROLL_AUTH_APP_MFA);

    MockHttpServletRequestBuilder verifyPasscodeBuilder =
        createPostRequest(
            session,
            VALID_ACTIVATION_PASSCODE_REQUEST,
            ResourceLinks.USER_VERIFY_ACTIVATION_PASSCODE);

    this._mockMvc.perform(enrollAuthAppMfaBuilder).andExpect(status().isOk());
    this._mockMvc.perform(verifyPasscodeBuilder).andExpect(status().isOk());
  }

  @Test
  void verifyActivationPasscode_failsWithInvalidPasscode() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);
    issueSetPasswordRequest(session);

    MockHttpServletRequestBuilder enrollAuthAppMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_AUTH_APP_MFA_REQUEST, ResourceLinks.USER_ENROLL_AUTH_APP_MFA);

    MockHttpServletRequestBuilder verifyPasscodeBuilder =
        createPostRequest(
            session, "{\"userInput\":\"1234\"}", ResourceLinks.USER_VERIFY_ACTIVATION_PASSCODE);

    this._mockMvc.perform(enrollAuthAppMfaBuilder).andExpect(status().isOk());
    this._mockMvc.perform(verifyPasscodeBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void verifyActivationPasscode_failsWithoutEnrolledMfa() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);
    issueSetPasswordRequest(session);

    MockHttpServletRequestBuilder verifyPasscodeBuilder =
        createPostRequest(
            session,
            VALID_ACTIVATION_PASSCODE_REQUEST,
            ResourceLinks.USER_VERIFY_ACTIVATION_PASSCODE);

    this._mockMvc.perform(verifyPasscodeBuilder).andExpect(status().is4xxClientError());
  }

  @Test
  void getUserAccountStatus_resetPasswordStateSuccessful() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);

    MockHttpServletRequestBuilder getUserStatusBuilder =
        createGetRequest(session, "", ResourceLinks.USER_GET_STATUS);

    MvcResult getUserStatusResponse =
        this._mockMvc.perform(getUserStatusBuilder).andExpect(status().isOk()).andReturn();

    assertThat(getUserStatusResponse.getResponse().getContentAsString()).contains("PASSWORD_RESET");
  }

  @Test
  void getUserAccountStatus_activeStateSuccessful() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);
    issueSetPasswordRequest(session);

    // Set the user's recovery questions
    MockHttpServletRequestBuilder setRecoveryQuestionBuilder =
        createPostRequest(
            session, VALID_RECOVERY_QUESTION_REQUEST, ResourceLinks.USER_SET_RECOVERY_QUESTION);
    this._mockMvc.perform(setRecoveryQuestionBuilder).andExpect(status().isOk());

    // Enroll the user in SMS MFA
    MockHttpServletRequestBuilder enrollSmsMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_PHONE_MFA_REQUEST, ResourceLinks.USER_ENROLL_SMS_MFA);
    this._mockMvc.perform(enrollSmsMfaBuilder).andExpect(status().isOk());

    // Activate SMS MFA
    MockHttpServletRequestBuilder activateSmsMfaBuilder =
        createPostRequest(
            session,
            VALID_ACTIVATION_PASSCODE_REQUEST,
            ResourceLinks.USER_VERIFY_ACTIVATION_PASSCODE);
    this._mockMvc.perform(activateSmsMfaBuilder).andExpect(status().isOk());

    // Get user status
    MockHttpServletRequestBuilder getUserStatusBuilder =
        createGetRequest(session, "", ResourceLinks.USER_GET_STATUS);
    MvcResult getUserStatusResponse =
        this._mockMvc.perform(getUserStatusBuilder).andExpect(status().isOk()).andReturn();

    assertThat(getUserStatusResponse.getResponse().getContentAsString()).contains("ACTIVE");
  }

  @Test
  void resendActivationCode_isOK() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);
    issueSetPasswordRequest(session);

    // Set the user's recovery questions
    MockHttpServletRequestBuilder setRecoveryQuestionBuilder =
        createPostRequest(
            session, VALID_RECOVERY_QUESTION_REQUEST, ResourceLinks.USER_SET_RECOVERY_QUESTION);
    this._mockMvc.perform(setRecoveryQuestionBuilder).andExpect(status().isOk());

    // Enroll the user in SMS MFA
    MockHttpServletRequestBuilder enrollSmsMfaBuilder =
        createPostRequest(
            session, VALID_ENROLL_PHONE_MFA_REQUEST, ResourceLinks.USER_ENROLL_SMS_MFA);
    this._mockMvc.perform(enrollSmsMfaBuilder).andExpect(status().isOk());

    MockHttpServletRequestBuilder resendActivationPasscodeBuilder =
        createPostRequest(session, "", ResourceLinks.USER_RESEND_ACTIVATION_PASSCODE);

    this._mockMvc.perform(resendActivationPasscodeBuilder).andExpect(status().isOk());
  }

  @Test
  void resendActivationCode_failsIfUserIsNotEnrolledInMfa() throws Exception {
    MockHttpSession session = new MockHttpSession();
    issueActivationRequest(session);
    issueSetPasswordRequest(session);

    // Set the user's recovery questions
    MockHttpServletRequestBuilder setRecoveryQuestionBuilder =
        createPostRequest(
            session, VALID_RECOVERY_QUESTION_REQUEST, ResourceLinks.USER_SET_RECOVERY_QUESTION);
    this._mockMvc.perform(setRecoveryQuestionBuilder).andExpect(status().isOk());

    MockHttpServletRequestBuilder resendActivationPasscodeBuilder =
        createPostRequest(session, "", ResourceLinks.USER_RESEND_ACTIVATION_PASSCODE);

    this._mockMvc.perform(resendActivationPasscodeBuilder).andExpect(status().is4xxClientError());
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

  private MockHttpServletRequestBuilder createGetRequest(
      MockHttpSession session, String requestBody, String link) {
    return get(link)
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

  private HttpSession issueActivationRequest(MockHttpSession session) throws Exception {
    MockHttpServletRequestBuilder activateUserBuilder =
        createPostRequest(
            session, VALID_ACTIVATION_REQUEST, ResourceLinks.USER_ACTIVATE_ACCOUNT_REQUEST);

    return this._mockMvc
        .perform(activateUserBuilder)
        .andExpect(status().isOk())
        .andReturn()
        .getRequest()
        .getSession(false);
  }

  private HttpSession issueSetPasswordRequest(MockHttpSession session) throws Exception {
    MockHttpServletRequestBuilder setPasswordBuilder =
        createPostRequest(session, VALID_SET_PASSWORD_REQUEST, ResourceLinks.USER_SET_PASSWORD);

    return this._mockMvc
        .perform(setPasswordBuilder)
        .andExpect(status().isOk())
        .andReturn()
        .getRequest()
        .getSession(false);
  }
}
