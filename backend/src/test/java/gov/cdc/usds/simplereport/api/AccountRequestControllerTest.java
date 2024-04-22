package gov.cdc.usds.simplereport.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.equalToIgnoringCase;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.hamcrest.MockitoHamcrest.argThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.DocumentContext;
import com.jayway.jsonpath.JsonPath;
import com.sendgrid.helpers.mail.Mail;
import gov.cdc.usds.simplereport.api.accountrequest.AccountRequestController;
import gov.cdc.usds.simplereport.api.model.TemplateVariablesProvider;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.OrganizationQueueItem;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.OrganizationQueueService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.email.EmailProvider;
import gov.cdc.usds.simplereport.service.email.EmailService;
import java.util.List;
import java.util.UUID;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

class AccountRequestControllerTest extends BaseFullStackTest {

  @Autowired private MockMvc _mockMvc;
  @Autowired private AccountRequestController _controller;

  @MockBean private EmailProvider mockSendGrid;
  @SpyBean private EmailService emailService;

  @MockBean private ApiUserService _apiUserService;
  @MockBean private DemoOktaRepository _oktaRepo;
  @MockBean private OrganizationService _orgService;
  @MockBean private OrganizationQueueService _orgQueueService;

  @Captor private ArgumentCaptor<TemplateVariablesProvider> contentCaptor;
  @Captor private ArgumentCaptor<Mail> mail;
  @Captor private ArgumentCaptor<String> orgNameCaptor;
  @Captor private ArgumentCaptor<String> externalIdCaptor;

  @BeforeEach
  void clearDb() {
    truncateDb();
  }

  @Test
  void contextLoads() {
    assertThat(_controller).isNotNull();
  }

  // waitlist request tests
  @Test
  void waitlistIsOk() throws Exception {
    String requestBody =
        "{\"name\":\"Angela Chan\",\"email\":\"qasas@mailinator.com\",\"phone\":\"+1 (157) 294-1842\",\"state\":\"Exercitation odit pr\",\"organization\":\"Lane Moss LLC\",\"disease-interest\":[\"Flu A\", \"RSV\"],\"additional-conditions\":\"other conditions\",\"referral\":\"Ea error voluptate v\"}";

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.WAITLIST_REQUEST)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    this._mockMvc.perform(builder).andExpect(status().isOk());

    verify(emailService)
        .send(
            eq(List.of("support@simplereport.gov")),
            eq("New waitlist request"),
            contentCaptor.capture());
    assertThat(contentCaptor.getValue().getTemplateName()).isEqualTo("waitlist-request");
    assertThat(contentCaptor.getValue().toTemplateVariables()).containsEntry("name", "Angela Chan");

    verify(mockSendGrid, times(1)).send(mail.capture());
    assertThat(mail.getValue().getContent().get(0).getValue())
        .contains(
            "new SimpleReport waitlist request",
            "Angela Chan",
            "qasas@mailinator.com",
            "other conditions",
            "[Flu A, RSV]",
            "Exercitation odit pr");
  }

  @Test
  void waitlistIsOk_withEmptyOptionalFields() throws Exception {
    String requestBody =
        "{\"name\":\"Angela Chan\",\"email\":\"qasas@mailinator.com\",\"phone\":\"+1 (157) 294-1842\",\"state\":\"Exercitation odit pr\",\"organization\":\"Lane Moss LLC\",\"disease-interest\":[],\"additional-conditions\":\"\",\"referral\":\"\"}";

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.WAITLIST_REQUEST)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    this._mockMvc.perform(builder).andExpect(status().isOk());

    verify(emailService)
        .send(
            eq(List.of("support@simplereport.gov")),
            eq("New waitlist request"),
            contentCaptor.capture());

    verify(mockSendGrid, times(1)).send(mail.capture());
    assertThat(mail.getValue().getContent().get(0).getValue())
        .isEqualTo(
            """
                                A new SimpleReport waitlist request has been submitted with the following details:<br>
                                <br>
                                <b>Name: </b>Angela Chan<br>
                                <b>Email address: </b>qasas@mailinator.com<br>
                                <b>Phone number: </b>+1 (157) 294-1842<br>
                                <b>State: </b>Exercitation odit pr<br>
                                <b>Organization: </b>Lane Moss LLC<br>
                                <b>Disease interest:</b> <br>
                                <b>Additional conditions:</b> <br>
                                <b>Referral: </b>
                                """);
  }

  @Test
  @DisplayName("waitlist request fails without email")
  void waitlistValidatesInput() throws Exception {
    String requestBody =
        "{\"name\":\"Angela Chan\",\"phone\":\"+1 (157) 294-1842\",\"state\":\"Exercitation odit pr\",\"organization\":\"Lane Moss LLC\",\"referral\":\"Ea error voluptate v\",\"disease-interest\":[],\"additional-conditions\":\"\",}";

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.WAITLIST_REQUEST)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    this._mockMvc.perform(builder).andExpect(status().isBadRequest());
    verifyNoInteractions(emailService);
  }

  @Test
  @DisplayName("waitlist request early exits with form honeypot set to true")
  void waitlistFailsWithFormHoneypot() throws Exception {
    String requestBody =
        "{\"name\":\"Angela Chan\",\"email\":\"qasas@mailinator.com\",\"phone\":\"+1 (157) 294-1842\",\"state\":\"Exercitation odit pr\",\"organization\":\"Lane Moss LLC\",\"disease-interest\":[],\"additional-conditions\":\"\",\"referral\":\"\",\"form-honeypot\":\"true\"}";

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.WAITLIST_REQUEST)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    this._mockMvc.perform(builder).andExpect(status().isOk());
    verifyNoInteractions(emailService);
  }

  @Test
  void submitOrganizationAccountRequestAddToQueue_nameCleaning_success() throws Exception {
    // given
    OrganizationQueueItem queueItem = mock(OrganizationQueueItem.class);
    when(queueItem.getExternalId()).thenReturn("AZ-Central-Schools-SOME_UUID");
    when(_orgQueueService.queueNewRequest(eq("Central Schools"), any(), any()))
        .thenReturn(queueItem);

    // when
    String requestBody =
        createAccountRequest(
            " Central   Schools  ",
            "AZ",
            "k12",
            "Mary",
            "",
            "Lopez",
            "kyvuzoxy@mailinator.com",
            "+1 (969) 768-2863");
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_ADD_TO_QUEUE)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);
    this._mockMvc.perform(builder).andExpect(status().isOk());

    // then
    verify(_orgQueueService)
        .queueNewRequest(orgNameCaptor.capture(), externalIdCaptor.capture(), any());

    assertThat(orgNameCaptor.getValue()).isEqualTo("Central Schools");
    assertThat(externalIdCaptor.getValue()).startsWith("AZ-Central-Schools-");
  }

  @Test
  @DisplayName("Duplicate org in different state succeeds but state is appended to name")
  void submitOrganizationAccountRequestAddToQueue_duplicateOrgInDifferentState_success()
      throws Exception {
    // given
    mockVerifiedDefaultOrganization();

    OrganizationQueueItem queueItem = mock(OrganizationQueueItem.class);
    when(queueItem.getExternalId()).thenReturn("CA-Central-Schools-CA-SOME_UUID");
    when(_orgQueueService.queueNewRequest(eq("Central Schools-CA"), any(), any()))
        .thenReturn(queueItem);

    // when, another org with same name in a different state
    String requestBody =
        createAccountRequest(
            "Central Schools",
            "CA",
            "k12",
            "Mary",
            "",
            "Lopez",
            "mlopez@example.com",
            "+1 (969) 768-2863");
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_ADD_TO_QUEUE)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    // then
    MvcResult result = this._mockMvc.perform(builder).andReturn();
    String jsonString = result.getResponse().getContentAsString();
    DocumentContext context = JsonPath.parse(jsonString);
    String orgExternalId = context.read("$.orgExternalId");
    assertTrue(orgExternalId.startsWith("CA-Central-Schools-CA-"));

    verify(_orgQueueService)
        .queueNewRequest(orgNameCaptor.capture(), externalIdCaptor.capture(), any());
    assertThat(orgNameCaptor.getValue()).isEqualTo("Central Schools-CA");
    assertThat(externalIdCaptor.getValue()).startsWith("CA-Central-Schools-CA-");
  }

  @Test
  void submitOrganizationAccountRequestAddToQueue_emptyOrgName_failure() throws Exception {
    // failures when cleaning and checking organization name
    String requestBody =
        createAccountRequest(
            " ", "AZ", "k12", "Mary", "", "Lopez", "kyvuzoxy@mailinator.com", "+1 (969) 768-2863");
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_ADD_TO_QUEUE)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    MvcResult result = this._mockMvc.perform(builder).andReturn();
    assertThat(result.getResponse().getStatus()).isEqualTo(400);
    assertThat(result.getResponse().getContentAsString())
        .contains("The organization name is empty.");
  }

  @ParameterizedTest
  @ValueSource(strings = {"% ^ #", "-", "  --- --- ---"})
  void submitOrganizationAccountRequestAddToQueue_invalidOrgName_failure(String orgName)
      throws Exception {
    // failures when cleaning and checking organization external id
    String requestBody =
        createAccountRequest(
            orgName,
            "AZ",
            "k12",
            "Mary",
            "",
            "Lopez",
            "kyvuzoxy@mailinator.com",
            "+1 (969) 768-2863");
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_ADD_TO_QUEUE)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    MvcResult result = this._mockMvc.perform(builder).andReturn();
    assertThat(result.getResponse().getStatus()).isEqualTo(400);
    assertThat(result.getResponse().getContentAsString())
        .contains("The organization name is invalid.");
  }

  @Test
  @DisplayName("Duplicate org in same state fails")
  void submitOrganizationAccountRequestAddToQueue_duplicateOrgInSameState_failure()
      throws Exception {
    // given
    mockVerifiedDefaultOrganization();

    // when
    String duplicateRequestBody =
        createAccountRequest(
            "Central Schools",
            "AZ",
            "k12",
            "Susie",
            "",
            "Smith",
            "susie@example.com",
            "760-858-9900");

    MockHttpServletRequestBuilder duplicateBuilder =
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_ADD_TO_QUEUE)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(duplicateRequestBody);

    // then
    MvcResult result = this._mockMvc.perform(duplicateBuilder).andReturn();
    assertThat(result.getResponse().getStatus()).isEqualTo(400);
    assertThat(result.getResponse().getContentAsString())
        .contains("This organization has already registered with SimpleReport.");
  }

  @Test
  @DisplayName("Duplicate org in same state with different letter casing fails")
  void submitOrganizationAccountRequestAddToQueue_duplicateOrgInSameStateDifferentCasing_failure()
      throws Exception {
    // given
    mockVerifiedDefaultOrganization();

    // when
    String duplicateRequestBody =
        createAccountRequest(
            "CENTRAL SCHOOLS",
            "AZ",
            "k12",
            "Susie",
            "",
            "Smith",
            "susie@example.com",
            "760-858-9900");

    MockHttpServletRequestBuilder duplicateBuilder =
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_ADD_TO_QUEUE)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(duplicateRequestBody);
    MvcResult result = this._mockMvc.perform(duplicateBuilder).andReturn();

    // then
    assertThat(result.getResponse().getStatus()).isEqualTo(400);
    assertThat(result.getResponse().getContentAsString())
        .contains("This organization has already registered with SimpleReport.");
  }

  @Test
  @DisplayName("Duplicate org with admin re-signing up fails")
  void submitOrganizationAccountRequestAddToQueue_duplicateOrgWithAdmin_failure() throws Exception {
    // given
    mockVerifiedOrganization("Central Schools", "AZ", "mlopez@mailinator.com");

    // when
    String duplicateRequestBody =
        createAccountRequest(
            "Central Schools",
            "AZ",
            "k12",
            "Mary",
            "",
            "Lopez",
            "mlopez@mailinator.com",
            "+1 (969) 768-2863");

    MockHttpServletRequestBuilder duplicateBuilder =
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_ADD_TO_QUEUE)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(duplicateRequestBody);

    // then
    MvcResult result = this._mockMvc.perform(duplicateBuilder).andReturn();
    assertThat(result.getResponse().getStatus()).isEqualTo(400);
    assertThat(result.getResponse().getContentAsString())
        .contains(
            "Duplicate organization with admin user who has completed identity verification.");
  }

  @Test
  void submitOrganizationAccountRequestAddToQueue_duplicateUser_failure() throws Exception {
    // given
    when(_apiUserService.userExists("kyvuzoxy@mailinator.com")).thenReturn(true);

    // when
    String duplicateRequestBody =
        createAccountRequest(
            "Different Org, Same User",
            "AZ",
            "k12",
            "Mary",
            "",
            "Lopez",
            "kyvuzoxy@mailinator.com",
            "+1 (969) 768-2863");

    MockHttpServletRequestBuilder duplicateBuilder =
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_ADD_TO_QUEUE)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(duplicateRequestBody);

    // then
    MvcResult result = this._mockMvc.perform(duplicateBuilder).andReturn();
    assertThat(result.getResponse().getStatus()).isEqualTo(400);
    assertThat(result.getResponse().getContentAsString())
        .contains("This email address is already associated with a SimpleReport user.");
  }

  private String createAccountRequest(
      String orgName,
      String state,
      String orgType,
      String firstName,
      String middleName,
      String lastName,
      String workEmail,
      String workPhone) {
    JSONObject requestBody = new JSONObject();
    requestBody.put("name", orgName);
    requestBody.put("state", state);
    requestBody.put("type", orgType);
    requestBody.put("firstName", firstName);
    requestBody.put("middleName", middleName);
    requestBody.put("lastName", lastName);
    requestBody.put("email", workEmail);
    requestBody.put("workPhoneNumber", workPhone);
    return requestBody.toString();
  }

  private void mockVerifiedOrganization(String orgName, String state, String email) {
    String orgNameNoSpaces = orgName.replaceAll(" ", "-");
    String generatedExternalId =
        String.format("%s-%s-%s", state, orgNameNoSpaces, UUID.randomUUID());
    Organization org = mock(Organization.class);
    when(org.getExternalId()).thenReturn(generatedExternalId);
    when(org.getIdentityVerified()).thenReturn(true);

    when(_orgService.getOrganizationsByName(argThat(equalToIgnoringCase(orgName))))
        .thenReturn(List.of(org));
    when(_oktaRepo.fetchAdminUserEmail(org)).thenReturn(List.of(email));
  }

  private void mockVerifiedDefaultOrganization() throws Exception {
    mockVerifiedOrganization("Central Schools", "AZ", "kyvuzoxy@mailinator.com");
  }
}
