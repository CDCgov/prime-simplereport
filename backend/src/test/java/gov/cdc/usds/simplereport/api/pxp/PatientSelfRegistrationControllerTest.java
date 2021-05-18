package gov.cdc.usds.simplereport.api.pxp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

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
          _org = _dataFactory.createValidOrg();
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
    System.out.println(link);

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
}
