package gov.cdc.usds.simplereport.api;

import static org.assertj.core.api.Assertions.assertThat;
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
  void getSessionUidIsOk() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.USER_ACCOUNT_REQUEST)
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
    assertThat(firstRequest).isEqualTo("1");

    String secondRequest =
        this._mockMvc
            .perform(builder)
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();
    assertThat(secondRequest).isEqualTo("2");
  }
}
