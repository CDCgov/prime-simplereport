package gov.cdc.usds.simplereport.config;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import gov.cdc.usds.simplereport.logging.AuditLoggingAdvice;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.FilterType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@WebMvcTest(
    controllers = DummyCatchAllController.class,
    includeFilters =
        @Filter(
            classes = {TemplateConfiguration.class, SecurityConfiguration.class},
            type = FilterType.ASSIGNABLE_TYPE),
    excludeFilters =
        @Filter(
            classes = {AuditLoggingAdvice.class, WebConfiguration.class},
            type = FilterType.ASSIGNABLE_TYPE))
public class SecurityConfigurationTest {
  @Autowired private MockMvc _mockMvc;

  @Test
  void defaultPathIsAllowed() throws Exception {
    MockHttpServletRequestBuilder builder = get("/");
    this._mockMvc.perform(builder).andExpect(status().isOk());
  }

  @Test
  void postToAccountRequestIsAllowed() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(WebConfiguration.ACCOUNT_REQUEST + "/foo-facility");
    this._mockMvc.perform(builder).andExpect(status().isOk());
  }

  @Test
  void oktaAuthShouldBeRequired() throws Exception {
    MockHttpServletRequestBuilder builder = post("/manage-users");
    this._mockMvc.perform(builder).andExpect(status().isOk());
  }
}
