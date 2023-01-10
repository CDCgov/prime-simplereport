package gov.cdc.usds.simplereport.api.pxp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import gov.cdc.usds.simplereport.api.BaseFullStackTest;
import gov.cdc.usds.simplereport.api.ResourceLinks;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.logging.LoggingConstants;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
class PatientSelfRegistrationControllerTest extends BaseFullStackTest {
  @Autowired private MockMvc _mockMvc;
  @Autowired private PatientSelfRegistrationController _controller;

  private Organization _org;
  private Facility _site;
  private PatientSelfRegistrationLink _orgRegistrationLink;
  private PatientSelfRegistrationLink _facilityRegistrationLink;

  @BeforeEach
  void init() {
    truncateDb();
    TestUserIdentities.withStandardUser(
        () -> {
          _org = _dataFactory.saveValidOrganization();
          _site = _dataFactory.createValidFacility(_org);
          _orgRegistrationLink = _dataFactory.createPatientRegistrationLink(_org);
          _facilityRegistrationLink = _dataFactory.createPatientRegistrationLink(_site);
        });
  }

  @Test
  void contextLoads() throws Exception {
    assertThat(_controller).isNotNull();
  }

  @Test
  void registrationEntityOrgNameFound() throws Exception {
    String link = _orgRegistrationLink.getLink();

    MockHttpServletRequestBuilder builder =
        get(ResourceLinks.ENTITY_NAME).param("patientRegistrationLink", link);

    MvcResult result =
        this._mockMvc
            .perform(builder)
            .andExpect(status().isOk())
            .andExpect(header().exists(LoggingConstants.REQUEST_ID_HEADER))
            .andReturn();

    String content = result.getResponse().getContentAsString();
    assertEquals(_org.getOrganizationName(), content);
  }

  @Test
  void registrationEntityFacilityNameFound() throws Exception {
    String link = _facilityRegistrationLink.getLink();

    MockHttpServletRequestBuilder builder =
        get(ResourceLinks.ENTITY_NAME).param("patientRegistrationLink", link);

    MvcResult result =
        this._mockMvc
            .perform(builder)
            .andExpect(status().isOk())
            .andExpect(header().exists(LoggingConstants.REQUEST_ID_HEADER))
            .andReturn();

    String content = result.getResponse().getContentAsString();
    assertEquals(_site.getFacilityName(), content);
  }

  @Test
  void registrationAddsPerson() throws Exception {
    String link = _facilityRegistrationLink.getLink();
    String firstName = "Luke";
    String lastName = "Skywalker";
    String requestBody =
        "{\"registrationLink\":\""
            + link
            + "\",\"birthDate\":\"1990-08-10\",\"firstName\":\""
            + firstName
            + "\",\"lastName\":\""
            + lastName
            + "\",\"role\":\"STUDENT\",\"telephone\":\"(800) 232-4636\",\"email\":\"foo@bar.com\",\"testResultDelivery\":null,\"preferredLanguage\":null,\"race\":null,\"ethnicity\":null,\"gender\":null,\"residentCongregateSetting\":true,\"employedInHealthcare\":true,\"lookupId\":\"21a6b50a-3b3f-4689-a9a3-6879e51a471d\",\"suffix\":null,\"address\":{\"street\":[\"736 Jackson PI NW\",\"CA\"],\"city\":null,\"state\":\"CA\",\"county\":\"\",\"zipCode\":\"92037\"}}";

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.SELF_REGISTER)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    String requestId =
        _mockMvc
            .perform(builder)
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getHeader(LoggingConstants.REQUEST_ID_HEADER);

    assertLastAuditEntry(HttpStatus.OK, ResourceLinks.SELF_REGISTER, requestId);
  }

  @Test
  void registrationCheckExistingPatient() throws Exception {
    String link = _facilityRegistrationLink.getLink();
    String firstName = "Luke";
    String lastName = "Skywalker";
    String requestBody =
        "{\"birthDate\":\"1990-08-10\",\"firstName\":\""
            + firstName
            + "\",\"lastName\":\""
            + lastName
            + "\",\"postalCode\":\"92037\"}";

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.EXISTING_PATIENT)
            .queryParam("patientRegistrationLink", link)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    String requestId =
        _mockMvc
            .perform(builder)
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getHeader(LoggingConstants.REQUEST_ID_HEADER);

    assertLastAuditEntry(HttpStatus.OK, ResourceLinks.EXISTING_PATIENT, requestId);
  }
}
