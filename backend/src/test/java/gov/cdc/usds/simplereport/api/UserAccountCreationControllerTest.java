package gov.cdc.usds.simplereport.api;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import gov.cdc.usds.simplereport.api.apiuser.UserAccountCreationController;
import gov.cdc.usds.simplereport.config.TemplateConfiguration;
import gov.cdc.usds.simplereport.config.WebConfiguration;
import gov.cdc.usds.simplereport.logging.AuditLoggingAdvice;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

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

  @Test
  void setPasswordIsOk() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.USER_SET_PASSWORD)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content("{}");

    this._mockMvc.perform(builder).andExpect(status().isOk());
  }

  @Test
  void setPassword_worksAsExpectedWithMultipleSessions() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.USER_SET_PASSWORD)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content("{}");

    String firstRequest =
        this._mockMvc
            .perform(builder)
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    String secondRequest =
        this._mockMvc
            .perform(builder)
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    assertThat(firstRequest).isNotEqualTo(secondRequest);
  }

  @Test
  void setRecoveryQuestionsIsOk() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.USER_SET_RECOVERY_QUESTION)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content("{}");

    this._mockMvc.perform(builder).andExpect(status().isOk());
  }

  @Test
  void setPasswordThenRecoveryQuestions() throws Exception {
    MockHttpSession session = new MockHttpSession();

    MockHttpServletRequestBuilder setPasswordBuilder =
        post(ResourceLinks.USER_SET_PASSWORD)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content("{}")
            .session(session);

    MockHttpServletRequestBuilder setRecoveryQuestionBuilder =
        post(ResourceLinks.USER_SET_RECOVERY_QUESTION)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content("{}")
            .session(session);

    String setPasswordResponse =
        this._mockMvc
            .perform(setPasswordBuilder)
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    String setRecoveryQuestionResponse =
        this._mockMvc
            .perform(setRecoveryQuestionBuilder)
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

    assertEquals(setPasswordResponse, setRecoveryQuestionResponse);
  }
}
