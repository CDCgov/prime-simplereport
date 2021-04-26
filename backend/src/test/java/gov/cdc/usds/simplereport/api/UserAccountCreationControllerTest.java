package gov.cdc.usds.simplereport.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.ComponentScan.Filter;
import org.springframework.context.annotation.FilterType;
import gov.cdc.usds.simplereport.config.TemplateConfiguration;
import gov.cdc.usds.simplereport.config.WebConfiguration;
import gov.cdc.usds.simplereport.logging.AuditLoggingAdvice;


@WebMvcTest(
    controllers = UserAccountCreationControllerTest.class,
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
            get(ResourceLinks.USER_ACCOUNT_REQUEST);

        this._mockMvc.perform(builder).andExpect(status().isOk());
    }

}
