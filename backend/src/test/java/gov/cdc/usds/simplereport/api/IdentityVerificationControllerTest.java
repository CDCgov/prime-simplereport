package gov.cdc.usds.simplereport.api;

import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.is;
import static org.mockito.AdditionalMatchers.not;
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
import gov.cdc.usds.simplereport.api.model.accountrequest.AccountRequestOrganizationCreateTemplate;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.TemplateConfiguration;
import gov.cdc.usds.simplereport.config.WebConfiguration;
import gov.cdc.usds.simplereport.config.authorization.DemoAuthenticationConfiguration;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.logging.AuditLoggingAdvice;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.email.EmailProviderTemplate;
import gov.cdc.usds.simplereport.service.email.EmailService;
import gov.cdc.usds.simplereport.service.idverification.DemoExperianService;
import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.FilterType;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@Import({
  DemoAuthenticationConfiguration.class,
  DemoExperianService.class,
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
class IdentityVerificationControllerTest {
  @Autowired private MockMvc _mockMvc;

  @Autowired private DemoExperianService _experianService;
  @MockBean private OktaRepository _oktaRepo;
  @MockBean private EmailService _emailService;
  @MockBean private OrganizationService _orgService;

  // Dependencies of TenantDataAccessFilter
  @MockBean private ApiUserService _mockApiUserService;
  @MockBean private CurrentTenantDataAccessContextHolder _mockContextHolder;

  private static final String FAKE_ORG_EXTERNAL_ID = "FAKE_ORG_EXTERNAL_ID";
  private static final String FAKE_ORG_EXTERNAL_ID_DOES_NOT_EXIST = "DOES_NOT_EXIST";
  private static final String FAKE_ORG_ADMIN_EMAIL = "org.admin.email@example.com";
  private static final String FAKE_NON_EXISTENT_EMAIL = "notfound@example.com";

  private static final UUID VALID_SESSION_UUID =
      UUID.fromString("099244e0-bebc-4f59-83fd-453dc7f0b858");

  private static final String GET_QUESTIONS_REQUEST =
      "{\"orgExternalId\": \"%s\", \"firstName\":\"Jane\", \"lastName\":\"Doe\", \"dateOfBirth\":\"1980-08-12\", \"email\":\"%s\", \"phoneNumber\":\"410-867-5309\", \"streetAddress1\":\"1600 Pennsylvania Ave\", \"city\":\"Washington\", \"state\":\"DC\", \"zip\":\"20500\"}";
  private static final String SUBMIT_ANSWERS_CORRECT_REQUEST =
      "{\"orgExternalId\": \""
          + FAKE_ORG_EXTERNAL_ID
          + "\", \"sessionId\": \""
          + VALID_SESSION_UUID
          + "\", \"answers\": [1, 4, 2, 1]}";
  private static final String SUBMIT_ANSWERS_INCORRECT_REQUEST =
      "{\"orgExternalId\": \""
          + FAKE_ORG_EXTERNAL_ID
          + "\", \"sessionId\": \""
          + VALID_SESSION_UUID
          + "\", \"answers\": [4, 3, 2, 1]}";

  @BeforeEach
  public void setup() {
    _experianService.reset();

    _experianService.addSessionId(VALID_SESSION_UUID);

    Organization org = mock(Organization.class);
    when(_orgService.getOrganization(FAKE_ORG_EXTERNAL_ID)).thenReturn(org);
    when(_orgService.getOrganization(not(eq(FAKE_ORG_EXTERNAL_ID))))
        .thenThrow(IllegalGraphqlArgumentException.class);
    when(org.getExternalId()).thenReturn(FAKE_ORG_EXTERNAL_ID);
    Set<String> orgEmails =
        new HashSet<>() {
          {
            add(FAKE_ORG_ADMIN_EMAIL);
          }
        };
    when(_oktaRepo.getAllUsersForOrganization(org)).thenReturn(orgEmails);
  }

  @Test
  void getQuestions_isOk() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_GET_QUESTIONS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(getQuestionRequestBody(FAKE_ORG_EXTERNAL_ID, FAKE_ORG_ADMIN_EMAIL));

    this._mockMvc
        .perform(builder)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.sessionId", org.hamcrest.Matchers.any(String.class)))
        .andExpect(jsonPath("$.questionSet", org.hamcrest.Matchers.any(List.class)));

    verifyEmailsNotSent();
  }

  @Test
  void getQuestions_orgDoesNotExist_failure() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_GET_QUESTIONS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(
                getQuestionRequestBody(FAKE_ORG_EXTERNAL_ID_DOES_NOT_EXIST, FAKE_ORG_ADMIN_EMAIL));

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
            .content(getQuestionRequestBody(FAKE_ORG_EXTERNAL_ID, FAKE_NON_EXISTENT_EMAIL));

    this._mockMvc.perform(builder).andExpect(status().isBadRequest());

    verifyEmailsSent();
  }

  @Test
  void submitAnswers_correctAnswer_success() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_SUBMIT_ANSWERS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(SUBMIT_ANSWERS_CORRECT_REQUEST);

    this._mockMvc
        .perform(builder)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.passed", is(true)))
        .andExpect(jsonPath("$.email", equalTo(FAKE_ORG_ADMIN_EMAIL)));

    verifyEmailsNotSent();
  }

  @Test
  void submitAnswers_incorrectAnswers_success() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ID_VERIFICATION_SUBMIT_ANSWERS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(SUBMIT_ANSWERS_INCORRECT_REQUEST);

    this._mockMvc
        .perform(builder)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.passed", is(false)))
        .andExpect(jsonPath("$.email", equalTo(FAKE_ORG_ADMIN_EMAIL)));

    verifyEmailsSent();
  }

  private String getQuestionRequestBody(String orgExternalId, String email) {
    return String.format(GET_QUESTIONS_REQUEST, orgExternalId, email);
  }

  private void verifyEmailsSent() throws IOException {
    // should send email to support
    verify(_emailService, times(1))
        .send(
            anyList(),
            eq("New account request"),
            any(AccountRequestOrganizationCreateTemplate.class));

    // should send email to requester
    verify(_emailService, times(1))
        .sendWithProviderTemplate(
            FAKE_ORG_ADMIN_EMAIL, EmailProviderTemplate.ID_VERIFICATION_FAILED);
  }

  private void verifyEmailsNotSent() throws IOException {
    // should not send email to support
    verify(_emailService, times(0)).send(anyList(), anyString(), any());

    // should send email to requester
    verify(_emailService, times(0)).sendWithProviderTemplate(anyString(), any());
  }
}
