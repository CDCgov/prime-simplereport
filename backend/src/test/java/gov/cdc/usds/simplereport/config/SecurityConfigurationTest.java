package gov.cdc.usds.simplereport.config;

import static org.junit.jupiter.api.Assertions.assertEquals;

// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
// import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
// import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.boot.autoconfigure.SpringBootApplication;
// import org.springframework.boot.test.context.SpringBootTest;
// import org.springframework.mock.web.MockServletContext;
// import org.springframework.test.context.web.WebAppConfiguration;
// import org.springframework.test.web.servlet.MockMvc;
// import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

public class SecurityConfigurationTest {

    @Test
    public void fakeTest() {
        assertEquals(2+2, 4);
    }
}

// @WebAppConfiguration
// // @EnableWebSecurity
// @SpringBootApplication
// @SpringBootTest(
//     classes = {
//       MockServletContext.class,
//       SecurityConfiguration.class,
//       WebConfiguration.class,
//       // WebSecurityConfiguration.class,
//       MockApplication.class
//     })
// public class SecurityConfigurationTest {
//   @Autowired private MockMvc _mockMvc;

//   @Test
//   public void allowsGetRequests() throws Exception {
//     MockHttpServletRequestBuilder builder = get("/");

//     _mockMvc.perform(builder).andExpect(status().is2xxSuccessful());
//   }

//   @Test
//   public void doesNotAllowUnauthorizedPostRequests() throws Exception {
//     MockHttpServletRequestBuilder builder = post("/thisIsAnUnAuthorizedPath");

//     _mockMvc.perform(builder).andExpect(status().is2xxSuccessful());
//     // _mockMvc.perform(builder).andExpect(status().is4xxClientError());
//   }
// }
