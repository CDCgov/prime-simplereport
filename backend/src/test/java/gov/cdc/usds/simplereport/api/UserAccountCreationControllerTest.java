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
import org.junit.jupiter.api.AfterEach;
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

  private static final String VALID_ACTIVATION_TOKEN = "validActivationToken";

  private static final String VALID_PASSWORD_REQUEST = "{\"password\":\"superStrongPassword!\"}";

  @BeforeEach
  public void setup() throws Exception {
    _oktaAuth.reset();
  }

  @AfterEach
  public void teardown() {
    _oktaAuth.reset();
  }

  @Test
  void setPasswordIsOk() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.USER_SET_PASSWORD)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .header("authorization", VALID_ACTIVATION_TOKEN)
            .header("X-Forwarded-For", "1.1.1.1")
            .header("User-Agent", "Chrome")
            .content(VALID_PASSWORD_REQUEST);

    this._mockMvc.perform(builder).andExpect(status().isOk());
  }

  @Test
  void setPassword_failsWithoutActivationToken() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.USER_SET_PASSWORD)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(VALID_PASSWORD_REQUEST);

    this._mockMvc.perform(builder).andExpect(status().isForbidden());
  }

  @Test
  void setPassword_worksAsExpectedWithMultipleSessions() throws Exception {
    MockHttpServletRequestBuilder firstBuilder =
        post(ResourceLinks.USER_SET_PASSWORD)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .header("authorization", VALID_ACTIVATION_TOKEN)
            .header("X-Forwarded-For", "1.1.1.1")
            .header("User-Agent", "Chrome")
            .content(VALID_PASSWORD_REQUEST);

    String secondValidPasswordRequest = "{\"password\":\"secondSuperStrongPassword!?\"}";
    String secondValidActivationToken = "anotherValidAuthToken";

    _oktaAuth.getStateTokenFromActivationToken(secondValidActivationToken);

    MockHttpServletRequestBuilder secondBuilder =
        post(ResourceLinks.USER_SET_PASSWORD)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .header("authorization", secondValidActivationToken)
            .header("X-Forwarded-For", "1.1.1.1")
            .header("User-Agent", "Chrome")
            .content(secondValidPasswordRequest);

    HttpSession firstSession =
        this._mockMvc
            .perform(firstBuilder)
            .andExpect(status().isOk())
            .andReturn()
            .getRequest()
            .getSession(false);

    HttpSession secondSession =
        this._mockMvc
            .perform(secondBuilder)
            .andExpect(status().isOk())
            .andReturn()
            .getRequest()
            .getSession(false);

    assertThat(firstSession.getId()).isNotEqualTo(secondSession.getId());
    assertThat(firstSession.getAttribute("stateToken"))
        .isEqualTo("stateToken " + VALID_ACTIVATION_TOKEN);
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
            .header("authorization", VALID_ACTIVATION_TOKEN)
            .header("X-Forwarded-For", "1.1.1.1")
            .header("User-Agent", "Chrome")
            .content(VALID_PASSWORD_REQUEST)
            .session(session);

    MockHttpServletRequestBuilder setRecoveryQuestionBuilder =
        post(ResourceLinks.USER_SET_RECOVERY_QUESTION)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content("{}")
            .session(session);

    HttpSession setPasswordResponse =
        this._mockMvc
            .perform(setPasswordBuilder)
            .andExpect(status().isOk())
            .andReturn()
            .getRequest()
            .getSession(false);

    HttpSession setRecoveryQuestionResponse =
        this._mockMvc
            .perform(setRecoveryQuestionBuilder)
            .andExpect(status().isOk())
            .andReturn()
            .getRequest()
            .getSession(false);

    // assert that the state token is propagated to the recovery question session
    assertThat(setRecoveryQuestionResponse.getAttribute("stateToken"))
        .isEqualTo("stateToken " + VALID_ACTIVATION_TOKEN);
    assertEquals(setPasswordResponse, setRecoveryQuestionResponse);
  }
}
