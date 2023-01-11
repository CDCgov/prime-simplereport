package gov.cdc.usds.simplereport.api.reportstream;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import gov.cdc.usds.simplereport.api.BaseFullStackTest;
import gov.cdc.usds.simplereport.config.WebConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.logging.LoggingConstants;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
class ReportStreamCallbackControllerTest extends BaseFullStackTest {
  @Autowired private MockMvc mockMvc;

  private Organization org;
  private Facility site;
  private Person person;
  private TestEvent testEvent;

  @BeforeEach
  void init() {
    truncateDb();
    TestUserIdentities.withStandardUser(
        () -> {
          org = _dataFactory.saveValidOrganization();
          site = _dataFactory.createValidFacility(org);
          person = _dataFactory.createFullPerson(org);
          testEvent = _dataFactory.createTestEvent(person, site);
        });
  }

  @Test
  void validationFailure() throws Exception {
    MockHttpServletRequestBuilder builder =
        post(WebConfiguration.RS_QUEUE_CALLBACK)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content("{}");

    mockMvc
        .perform(builder)
        .andExpect(status().isForbidden())
        .andExpect(header().exists(LoggingConstants.REQUEST_ID_HEADER));

    assertNoAuditEvent();
  }

  @Test
  void success() throws Exception {
    String requestBody =
        String.format(
            "{\"testEventInternalId\":\"%s\", \"isError\": false, \"details\":\"%s\"}",
            testEvent.getInternalId(), "nope");
    MockHttpServletRequestBuilder builder =
        post(WebConfiguration.RS_QUEUE_CALLBACK)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .header("x-functions-key", "WATERMELON") // configured in application-default.yaml
            .content(requestBody);

    String requestId = runBuilderReturningRequestId(mockMvc, builder, status().isOk());
    assertLastAuditEntry(HttpStatus.OK, WebConfiguration.RS_QUEUE_CALLBACK, requestId);
  }
}
