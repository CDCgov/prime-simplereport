package gov.cdc.usds.simplereport.api;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import gov.cdc.usds.simplereport.api.accountrequest.IdentityVerificationController;
import gov.cdc.usds.simplereport.api.accountrequest.errors.AccountRequestFailureException;
import gov.cdc.usds.simplereport.api.model.accountrequest.AccountRequestOrganizationCreateTemplate;
import gov.cdc.usds.simplereport.api.model.accountrequest.OrganizationAccountRequest;
import gov.cdc.usds.simplereport.config.TemplateConfiguration;
import gov.cdc.usds.simplereport.config.WebConfiguration;
import gov.cdc.usds.simplereport.config.authorization.DemoAuthenticationConfiguration;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import gov.cdc.usds.simplereport.logging.AuditLoggingAdvice;
import gov.cdc.usds.simplereport.service.OrganizationQueueService;
import gov.cdc.usds.simplereport.service.email.EmailProviderTemplate;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.service.idverification.DemoExperianService;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openapitools.client.ApiException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@Import({
  DemoAuthenticationConfiguration.class,
  DemoExperianService.class,
  DemoOktaRepository.class,
})
@WebMvcTest(
    controllers = IdentityVerificationController.class,
    includeFilters =
        @Filter(
            classes = {TemplateConfiguration.class},
            type = FilterType.ASSIGNABLE_TYPE),
    excludeFilters =
        @Filter(
            classes = {AuditLoggingAdvice.class, WebConfiguration.class},
            type = FilterType.ASSIGNABLE_TYPE))
class IdentityVerificationControllerTest extends BaseNonSpringBootTestConfiguration {

  @Autowired private MockMvc _mockMvc;

  @Autowired private DemoExperianService _experianService;
  @MockBean private EmailService _emailService;
  @MockBean private OrganizationQueueService _orgQueueService;

  private static final String FAKE_ORG_EXTERNAL_ID = "FAKE_ORG_EXTERNAL_ID";
  private static final String FAKE_ORG_EXTERNAL_ID_DOES_NOT_EXIST = "DOES_NOT_EXIST";
  private static final String FAKE_ORG_ADMIN_EMAIL = "org.admin.email@example.com";
  private static final String FAKE_ACTIVATION_TOKEN = "foo";
  // email address that generates PersonMatchException in DemoExperianService
  private static final String FAKE_NON_EXISTENT_EMAIL = "notfound@example.com";
  // email address that generates RestClientException in DemoExperianService
  private static final String FAKE_REST_EXCEPTION_EMAIL = "rest.exception@example.com";
  // session id that generates RestClientException in DemoExperianService
  private static final String FAKE_REST_EXCEPTION_SESSION_STRING = "GENERATE_REST_EXCEPTION";

  private static final String VALID_SESSION_STRING = "099244e0-bebc-4f59-83fd-453dc7f0b858";
  private static final UUID VALID_SESSION_UUID = UUID.fromString(VALID_SESSION_STRING);

  private static final String GET_QUESTIONS_REQUEST_TEMPLATE =
      "{\"orgExternalId\": \"%s\", \"firstName\":\"Jane\", \"lastName\":\"Doe\", \"dateOfBirth\":\"1980-08-12\", \"email\":\"%s\", \"phoneNumber\":\"410-867-5309\", \"streetAddress1\":\"1600 Pennsylvania Ave\", \"city\":\"Washington\", \"state\":\"DC\", \"zip\":\"20500\"}";
  private static final String SUBMIT_ANSWERS_REQUEST_TEMPLATE =
      "{\"orgExternalId\": \"%s\", \"sessionId\": \"%s\", \"answers\": [%s]}";

  @BeforeEach
  public void setup() {
    _experianService.reset();

    _experianService.addSessionId(VALID_SESSION_UUID);

    OrganizationAccountRequest accountRequest = mock(OrganizationAccountRequest.class);
    when(accountRequest.getEmail()).thenReturn(FAKE_ORG_ADMIN_EMAIL);

    OrganizationQueueItem orgQueueItem = mock(OrganizationQueueItem.class);
    when(_orgQueueService.getUnverifiedQueuedOrganizationByExternalId(FAKE_ORG_EXTERNAL_ID))
        .thenReturn(Optional.of(orgQueueItem));
    when(orgQueueItem.getRequestData()).thenReturn(accountRequest);
    when(orgQueueItem.getExternalId()).thenReturn(FAKE_ORG_EXTERNAL_ID);
  }

  @Test
  void getQuestions_isOk() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_GET_QUESTIONS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(getQuestionsRequestBody(FAKE_ORG_EXTERNAL_ID, FAKE_ORG_ADMIN_EMAIL));

    this._mockMvc
        .perform(builder)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.sessionId", org.hamcrest.Matchers.any(String.class)))
        .andExpect(jsonPath("$.questionSet", org.hamcrest.Matchers.any(List.class)));

    verifyEmailsNotSent();
  }

  @Test
  void getQuestions_queuedOrg_isOk() throws Exception {
    OrganizationAccountRequest originalRequest = mock(OrganizationAccountRequest.class);
    when(originalRequest.getEmail()).thenReturn(FAKE_ORG_ADMIN_EMAIL);

    OrganizationQueueItem queueItem = mock(OrganizationQueueItem.class);
    when(queueItem.getExternalId()).thenReturn(FAKE_ORG_EXTERNAL_ID);
    when(queueItem.getRequestData()).thenReturn(originalRequest);

    when(_orgQueueService.getUnverifiedQueuedOrganizationByExternalId(FAKE_ORG_EXTERNAL_ID))
        .thenReturn(Optional.of(queueItem));

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_GET_QUESTIONS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(getQuestionsRequestBody(FAKE_ORG_EXTERNAL_ID, FAKE_ORG_ADMIN_EMAIL));

    this._mockMvc
        .perform(builder)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.sessionId", org.hamcrest.Matchers.any(String.class)))
        .andExpect(jsonPath("$.questionSet", org.hamcrest.Matchers.any(List.class)));

    verifyEmailsNotSent();
  }

  @Test
  void getQuestions_queuedOrgNoPersonMatch_failure() throws Exception {
    OrganizationAccountRequest originalRequest = mock(OrganizationAccountRequest.class);
    when(originalRequest.getEmail()).thenReturn(FAKE_ORG_ADMIN_EMAIL);

    OrganizationQueueItem queueItem = mock(OrganizationQueueItem.class);
    when(queueItem.getExternalId()).thenReturn(FAKE_ORG_EXTERNAL_ID);
    when(queueItem.getRequestData()).thenReturn(originalRequest);

    when(_orgQueueService.getUnverifiedQueuedOrganizationByExternalId(FAKE_ORG_EXTERNAL_ID))
        .thenReturn(Optional.of(queueItem));

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_GET_QUESTIONS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(getQuestionsRequestBody(FAKE_ORG_EXTERNAL_ID, FAKE_NON_EXISTENT_EMAIL));

    this._mockMvc.perform(builder).andExpect(status().isBadRequest());

    // could not find person, id verification failed so emails are sent
    verifyEmailsSent();
  }

  @Test
  void getQuestions_orgDoesNotExist_failure() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_GET_QUESTIONS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(
                getQuestionsRequestBody(FAKE_ORG_EXTERNAL_ID_DOES_NOT_EXIST, FAKE_ORG_ADMIN_EMAIL));

    this._mockMvc.perform(builder).andExpect(status().isBadRequest());

    // org does not exist, no emails sent
    verifyEmailsNotSent();
  }

  @Test
  void getQuestions_noPersonMatch_failure() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_GET_QUESTIONS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(getQuestionsRequestBody(FAKE_ORG_EXTERNAL_ID, FAKE_NON_EXISTENT_EMAIL));

    this._mockMvc.perform(builder).andExpect(status().isBadRequest());

    // could not find person, id verification failed so emails are sent
    verifyEmailsSent();
  }

  @Test
  void getQuestions_restClientException_failure() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_GET_QUESTIONS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(getQuestionsRequestBody(FAKE_ORG_EXTERNAL_ID, FAKE_REST_EXCEPTION_EMAIL));

    this._mockMvc.perform(builder).andExpect(status().isBadRequest());

    // general experian request failure, id verification failed so emails are sent
    verifyEmailsSent();
  }

  @Test
  void submitAnswers_correctAnswer_success() throws Exception {
    when(_orgQueueService.createAndActivateQueuedOrganization(any()))
        .thenReturn(FAKE_ACTIVATION_TOKEN);

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_SUBMIT_ANSWERS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(submitAnswersRequestBody(FAKE_ORG_EXTERNAL_ID, VALID_SESSION_STRING, true));

    this._mockMvc
        .perform(builder)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.passed", is(true)))
        .andExpect(jsonPath("$.email", equalTo(FAKE_ORG_ADMIN_EMAIL)))
        .andExpect(jsonPath("$.activationToken", equalTo(FAKE_ACTIVATION_TOKEN)));

    // successful verification, no emails sent
    verifyEmailsNotSent();
  }

  @Test
  void submitAnswers_incorrectAnswers_success() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_SUBMIT_ANSWERS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(submitAnswersRequestBody(FAKE_ORG_EXTERNAL_ID, VALID_SESSION_STRING, false));

    this._mockMvc
        .perform(builder)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.passed", is(false)))
        .andExpect(jsonPath("$.email", equalTo(FAKE_ORG_ADMIN_EMAIL)));

    // unable to verify, emails are sent
    verifyEmailsSent();
  }

  @Test
  void submitAnswers_queuedOrgCorrectAnswers_success() throws Exception {
    OrganizationAccountRequest originalRequest = mock(OrganizationAccountRequest.class);
    when(originalRequest.getEmail()).thenReturn(FAKE_ORG_ADMIN_EMAIL);

    OrganizationQueueItem queueItem = mock(OrganizationQueueItem.class);
    when(queueItem.getExternalId()).thenReturn(FAKE_ORG_EXTERNAL_ID);
    when(queueItem.getRequestData()).thenReturn(originalRequest);

    when(_orgQueueService.getUnverifiedQueuedOrganizationByExternalId(FAKE_ORG_EXTERNAL_ID))
        .thenReturn(Optional.of(queueItem));
    when(_orgQueueService.createAndActivateQueuedOrganization(queueItem))
        .thenReturn(FAKE_ACTIVATION_TOKEN);

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_SUBMIT_ANSWERS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(submitAnswersRequestBody(FAKE_ORG_EXTERNAL_ID, VALID_SESSION_STRING, true));

    this._mockMvc
        .perform(builder)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.passed", is(true)))
        .andExpect(jsonPath("$.email", equalTo(FAKE_ORG_ADMIN_EMAIL)))
        .andExpect(jsonPath("$.activationToken", equalTo(FAKE_ACTIVATION_TOKEN)));

    // successful verification, no emails sent
    verifyEmailsNotSent();
  }

  @Test
  void submitAnswers_queuedOrgIncorrectAnswers_success() throws Exception {
    OrganizationAccountRequest originalRequest = mock(OrganizationAccountRequest.class);
    when(originalRequest.getEmail()).thenReturn(FAKE_ORG_ADMIN_EMAIL);

    OrganizationQueueItem queueItem = mock(OrganizationQueueItem.class);
    when(queueItem.getExternalId()).thenReturn(FAKE_ORG_EXTERNAL_ID);
    when(queueItem.getRequestData()).thenReturn(originalRequest);

    when(_orgQueueService.getUnverifiedQueuedOrganizationByExternalId(FAKE_ORG_EXTERNAL_ID))
        .thenReturn(Optional.of(queueItem));

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_SUBMIT_ANSWERS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(submitAnswersRequestBody(FAKE_ORG_EXTERNAL_ID, VALID_SESSION_STRING, false));

    this._mockMvc
        .perform(builder)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.passed", is(false)))
        .andExpect(jsonPath("$.email", equalTo(FAKE_ORG_ADMIN_EMAIL)));

    // unable to verify, emails are sent
    verifyEmailsSent();
  }

  @Test
  void submitAnswers_queuedOrgDuplicateUser_failure() throws Exception {
    OrganizationAccountRequest originalRequest = mock(OrganizationAccountRequest.class);
    when(originalRequest.getEmail()).thenReturn(FAKE_ORG_ADMIN_EMAIL);

    OrganizationQueueItem queueItem = mock(OrganizationQueueItem.class);
    when(queueItem.getExternalId()).thenReturn(FAKE_ORG_EXTERNAL_ID);
    when(queueItem.getRequestData()).thenReturn(originalRequest);

    when(_orgQueueService.getUnverifiedQueuedOrganizationByExternalId(FAKE_ORG_EXTERNAL_ID))
        .thenReturn(Optional.of(queueItem));
    when(_orgQueueService.createAndActivateQueuedOrganization(queueItem))
        .thenThrow(ApiException.class);

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_SUBMIT_ANSWERS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(submitAnswersRequestBody(FAKE_ORG_EXTERNAL_ID, VALID_SESSION_STRING, true));

    MvcResult result =
        this._mockMvc.perform(builder).andExpect(status().isInternalServerError()).andReturn();

    // okta error when creating user from queued org, no emails should be sent (page instead)
    assertEquals(AccountRequestFailureException.class, result.getResolvedException().getClass());
    verifyEmailsNotSent();
  }

  @Test
  void submitAnswers_restClientException_failure() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_SUBMIT_ANSWERS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(
                submitAnswersRequestBody(
                    FAKE_ORG_EXTERNAL_ID, FAKE_REST_EXCEPTION_SESSION_STRING, true));

    this._mockMvc.perform(builder).andExpect(status().isBadRequest());

    // general request failure to experian, send emails
    verifyEmailsSent();
  }

  @Test
  void submitAnswers_queuedOrgNotFound_failure() throws Exception {
    final String nonExistentOrgExtId = "THIS_ORG_DOES_NOT_EXIST";

    // given
    when(_orgQueueService.getUnverifiedQueuedOrganizationByExternalId(nonExistentOrgExtId))
        .thenReturn(Optional.empty());

    // when
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_SUBMIT_ANSWERS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(submitAnswersRequestBody(nonExistentOrgExtId, VALID_SESSION_STRING, true));
    MvcResult result =
        this._mockMvc.perform(builder).andExpect(status().isBadRequest()).andReturn();

    // then
    assertEquals(
        String.format("An organization with external_id=%s does not exist", nonExistentOrgExtId),
        result.getResponse().getContentAsString());

    verifyEmailsNotSent();
  }

  private String getQuestionsRequestBody(String orgExternalId, String email) {
    return String.format(GET_QUESTIONS_REQUEST_TEMPLATE, orgExternalId, email);
  }

  private String submitAnswersRequestBody(
      String orgExternalId, String sessionId, boolean correctAnswers) {
    // these answers are recognized by DemoExperianService
    String answerString = correctAnswers ? "1, 4, 2, 1, 3" : "4, 3, 2, 1, 1";
    return String.format(SUBMIT_ANSWERS_REQUEST_TEMPLATE, orgExternalId, sessionId, answerString);
  }

  private void verifyEmailsSent() throws IOException {
    // should send email to support
    verify(_emailService, times(1))
        .send(
            anyList(),
            eq("New account ID verification failure"),
            any(AccountRequestOrganizationCreateTemplate.class));

    // should send email to requester
    verify(_emailService, times(1))
        .sendWithDynamicTemplate(
            FAKE_ORG_ADMIN_EMAIL, EmailProviderTemplate.ID_VERIFICATION_FAILED);
  }

  private void verifyEmailsNotSent() throws IOException {
    // should not send email to support
    verify(_emailService, times(0)).send(anyList(), anyString(), any());

    // should send email to requester
    verify(_emailService, times(0)).sendWithDynamicTemplate(anyString(), any());
  }
}
