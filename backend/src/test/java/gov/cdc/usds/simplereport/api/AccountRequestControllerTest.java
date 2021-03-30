package gov.cdc.usds.simplereport.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import gov.cdc.usds.simplereport.api.accountrequest.AccountRequestController;
import gov.cdc.usds.simplereport.config.WebConfiguration;
import gov.cdc.usds.simplereport.logging.AuditLoggingAdvice;
import gov.cdc.usds.simplereport.service.email.EmailService;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@WebMvcTest(
    controllers = AccountRequestController.class,
    excludeFilters =
        @Filter(
            classes = {AuditLoggingAdvice.class, WebConfiguration.class},
            type = FilterType.ASSIGNABLE_TYPE))
class AccountRequestControllerTest {

  @Autowired private MockMvc _mockMvc;

  @MockBean private EmailService emailService;
  @Captor private ArgumentCaptor<String> contentCaptor;

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
    String content = contentCaptor.getValue();
    assertThat(content)
        .contains(
            "new SimpleReport waitlist request",
            "Angela Chan",
            "qasas@mailinator.com",
            "Exercitation odit pr");
  }

  @Test
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

  @Test
  void accountRequestIsOk() throws Exception {
    String requestBody =
        "{\"first-name\":\"Mary\",\"last-name\":\"Lopez\",\"email\":\"kyvuzoxy@mailinator.com\",\"work-phone-number\":\"+1 (969) 768-2863\",\"cell-phone-number\":\"+1 (319) 682-3114\",\"mailing-address1\":\"707 White Milton Extension\",\"apt-suite-other\":\"FL\",\"apt-floor-suite-no\":\"694\",\"city\":\"Reprehenderit nostr\",\"state\":\"RI\",\"zip\":\"13046\",\"county\":\"Et consectetur sunt\",\"organization-name\":\"Day Hayes Trading\",\"facility-name\":\"Fiona Payne\",\"clia-number\":\"474\",\"workflow\":\"Aut ipsum aute aute\",\"op-first-name\":\"Sawyer\",\"op-last-name\":\"Sears\",\"npi\":\"Quis sit eiusmod Nam\",\"op-phone-number\":\"+1 (583) 883-4172\",\"op-mailing-address1\":\"290 East Rocky Second Street\",\"op-apt-suite-other\":\"UNAVAILABLE\",\"op-apt-floor-suite-no\":\"546\",\"op-city\":\"Dicta cumque sit ip\",\"op-state\":\"AE\",\"op-zip\":\"43675\",\"op-county\":\"Asperiores illum in\",\"facility-type\":\"Urgent care center\",\"records-test-results\":\"No\",\"process-time\":\"15–30 minutes\",\"submitting-results-time\":\"Less than 30 minutes\",\"browsers\":\"Other\",\"testing-devices\":\"Abbott ID Now, BD Veritor, LumiraDX\",\"access-devices\":\"Smartphone\"}";

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ACCOUNT_REQUEST)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    this._mockMvc.perform(builder).andExpect(status().isOk());
    verify(emailService)
        .send(
            eq(List.of("support@simplereport.gov", "Protect-ServiceDesk@hhs.gov")),
            eq("New account request"),
            contentCaptor.capture());
    String content = contentCaptor.getValue();
    assertThat(content)
        .contains(
            "new SimpleReport account request",
            "Mary",
            "Lopez",
            "kyvuzoxy@mailinator.com",
            "Reprehenderit nostr");
  }

  @Test
  void accountRequestValidatesInput() throws Exception {
    String requestBody =
        "{\"first-name\":\"Mary\",\"last-name\":\"Lopez\",\"work-phone-number\":\"+1 (969) 768-2863\",\"cell-phone-number\":\"+1 (319) 682-3114\",\"mailing-address1\":\"707 White Milton Extension\",\"apt-suite-other\":\"FL\",\"apt-floor-suite-no\":\"694\",\"city\":\"Reprehenderit nostr\",\"state\":\"RI\",\"zip\":\"13046\",\"county\":\"Et consectetur sunt\",\"organization-name\":\"Day Hayes Trading\",\"facility-name\":\"Fiona Payne\",\"clia-number\":\"474\",\"workflow\":\"Aut ipsum aute aute\",\"op-first-name\":\"Sawyer\",\"op-last-name\":\"Sears\",\"npi\":\"Quis sit eiusmod Nam\",\"op-phone-number\":\"+1 (583) 883-4172\",\"op-mailing-address1\":\"290 East Rocky Second Street\",\"op-apt-suite-other\":\"UNAVAILABLE\",\"op-apt-floor-suite-no\":\"546\",\"op-city\":\"Dicta cumque sit ip\",\"op-state\":\"AE\",\"op-zip\":\"43675\",\"op-county\":\"Asperiores illum in\",\"facility-type\":\"Urgent care center\",\"records-test-results\":\"No\",\"process-time\":\"15–30 minutes\",\"submitting-results-time\":\"Less than 30 minutes\",\"browsers\":\"Other\",\"testing-devices\":\"Abbott ID Now, BD Veritor, LumiraDX\",\"access-devices\":\"Smartphone\"}";

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ACCOUNT_REQUEST)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    this._mockMvc.perform(builder).andExpect(status().isBadRequest());
    verifyNoInteractions(emailService);
  }
}
