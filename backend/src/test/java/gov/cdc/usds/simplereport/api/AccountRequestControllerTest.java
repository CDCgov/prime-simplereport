package gov.cdc.usds.simplereport.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.sendgrid.helpers.mail.Mail;
import gov.cdc.usds.simplereport.api.accountrequest.AccountRequestController;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.api.model.TemplateVariablesProvider;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.email.EmailProvider;
import gov.cdc.usds.simplereport.service.email.EmailService;
import java.util.List;
import java.util.Optional;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
class AccountRequestControllerTest extends BaseFullStackTest {
  @Autowired private MockMvc _mockMvc;
  @Autowired private AccountRequestController _controller;

  @SpyBean private ApiUserService apiUserService;
  @MockBean private EmailProvider mockSendGrid;
  @SpyBean private EmailService emailService;

  @Captor private ArgumentCaptor<TemplateVariablesProvider> contentCaptor;
  @Captor private ArgumentCaptor<Mail> mail;
  @Captor private ArgumentCaptor<String> externalIdCaptor;
  @Captor private ArgumentCaptor<PersonName> nameCaptor;

  @BeforeEach
  void clearDb() {
    truncateDb();
    _oktaRepo.reset();
  }

  @Test
  void contextLoads() throws Exception {
    assertThat(_controller).isNotNull();
  }

  // waitlist request tests
  @Test
  void waitlistIsOk() throws Exception {
    String requestBody =
        "{\"name\":\"Angela Chan\",\"email\":\"qasas@mailinator.com\",\"phone\":\"+1 (157) 294-1842\",\"state\":\"Exercitation odit pr\",\"organization\":\"Lane Moss LLC\",\"referral\":\"Ea error voluptate v\"}";

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
            "Exercitation odit pr");
  }

  @Test
  @DisplayName("waitlist request fails without email")
  void waitlistValidatesInput() throws Exception {
    String requestBody =
        "{\"name\":\"Angela Chan\",\"phone\":\"+1 (157) 294-1842\",\"state\":\"Exercitation odit pr\",\"organization\":\"Lane Moss LLC\",\"referral\":\"Ea error voluptate v\"}";

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.WAITLIST_REQUEST)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    this._mockMvc.perform(builder).andExpect(status().isBadRequest());
    verifyNoInteractions(emailService);
  }

  // account request tests
  @Test
  void accountRequestSuccessful() throws Exception {
    // given
    String requestBody =
        createAccountRequest(
            "Day Hayes Trading",
            "RI",
            "shelter",
            "Mary",
            "",
            "Lopez",
            "kyvuzoxy@mailinator.com",
            "+1 (969) 768-2863");

    // when
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_CREATE)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    this._mockMvc.perform(builder).andExpect(status().isOk());

    // then
    Optional<Organization> org = _orgService.getOrganizationByName("Day Hayes Trading");
    assertThat(org).isPresent();
    assertThat(org.get().getExternalId()).startsWith("RI-Day-Hayes-Trading-");

    assertThat(org.get().getIdentityVerified()).isFalse();

    verify(apiUserService, times(1))
        .createUser(
            eq("kyvuzoxy@mailinator.com"),
            nameCaptor.capture(),
            externalIdCaptor.capture(),
            eq(Role.ADMIN));

    assertThat(nameCaptor.getValue().getFirstName()).isEqualTo("Mary");
    assertNull(nameCaptor.getValue().getMiddleName());
    assertThat(nameCaptor.getValue().getLastName()).isEqualTo("Lopez");
    assertNull(nameCaptor.getValue().getSuffix());
    assertThat(externalIdCaptor.getValue()).contains("RI-Day-Hayes-Trading-");
  }

  @Test
  @DisplayName("Duplicate org in same state fails")
  void duplicateOrgInSameState() throws Exception {
    // given
    String originalRequestBody =
        createAccountRequest(
            "Central Schools",
            "AZ",
            "k12",
            "Mary",
            "",
            "Lopez",
            "kyvuzoxy@mailinator.com",
            "+1 (969) 768-2863");
    MockHttpServletRequestBuilder originalBuilder =
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_CREATE)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(originalRequestBody);
    this._mockMvc.perform(originalBuilder).andExpect(status().isOk());

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
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_CREATE)
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
  void duplicateOrgInSameState() throws Exception {
    // given
    String originalRequestBody =
        createAccountRequest(
            "Central Schools",
            "AZ",
            "k12",
            "Mary",
            "",
            "Lopez",
            "kyvuzoxy@mailinator.com",
            "+1 (969) 768-2863");
    MockHttpServletRequestBuilder originalBuilder =
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_CREATE)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(originalRequestBody);
    this._mockMvc.perform(originalBuilder).andExpect(status().isOk());

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
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_CREATE)
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
  @DisplayName("Duplicate org in different state succeeds but state is appended to name")
  void duplicateOrgInDifferentState() throws Exception {
    // given
    String originalRequestBody =
        createAccountRequest(
            "Central Schools",
            "AZ",
            "k12",
            "Mary",
            "",
            "Lopez",
            "kyvuzoxy@mailinator.com",
            "+1 (969) 768-2863");

    MockHttpServletRequestBuilder originalBuilder =
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_CREATE)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(originalRequestBody);

    this._mockMvc.perform(originalBuilder).andExpect(status().isOk());

    // when
    String duplicateRequestBody =
        createAccountRequest(
            "Central Schools",
            "CA",
            "k12",
            "Susie",
            "",
            "Smith",
            "susie@example.com",
            "760-858-9900");

    MockHttpServletRequestBuilder duplicateBuilder =
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_CREATE)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(duplicateRequestBody);

    this._mockMvc.perform(duplicateBuilder).andExpect(status().isOk());

    // then
    Optional<Organization> originalOrg = _orgService.getOrganizationByName("Central Schools");
    assertThat(originalOrg).isPresent();
    assertThat(originalOrg.get().getExternalId()).startsWith("AZ-Central-Schools");

    Optional<Organization> duplicateOrg = _orgService.getOrganizationByName("Central Schools-CA");
    assertThat(duplicateOrg).isPresent();
    assertThat(duplicateOrg.get().getExternalId()).startsWith("CA-Central-Schools-CA-");
  }

  @Test
  @DisplayName("Cannot create user with existing email address")
  void duplicateUserFails() throws Exception {
    // given
    String originalRequestBody =
        createAccountRequest(
            "Central Schools",
            "AZ",
            "k12",
            "Mary",
            "",
            "Lopez",
            "kyvuzoxy@mailinator.com",
            "+1 (969) 768-2863");
    MockHttpServletRequestBuilder originalBuilder =
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_CREATE)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(originalRequestBody);
    this._mockMvc.perform(originalBuilder).andExpect(status().isOk());

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
        post(ResourceLinks.ACCOUNT_REQUEST_ORGANIZATION_CREATE)
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
}
