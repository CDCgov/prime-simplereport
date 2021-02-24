package gov.cdc.usds.simplereport.api.pxp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.UUID;
import java.util.Collections;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import org.springframework.test.web.servlet.result.ContentResultMatchers;
import org.springframework.test.web.servlet.result.MockMvcResultHandlers;

import gov.cdc.usds.simplereport.api.BaseApiTest;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;

@AutoConfigureMockMvc
public class PatientExperienceControllerTest extends BaseApiTest {
  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private OrganizationService _orgService;

  @Autowired
  private TestDataFactory _dataFactory;

  @Autowired
  private TestOrderService _testOrderService;

  @Autowired
  private PatientExperienceController controller;

  private Organization _org;
  private Facility _site;

  @BeforeEach
  public void init() {
    _org = _orgService.getCurrentOrganization();
    _site = _orgService.getFacilities(_org).get(0);
  }

  @Test
  public void contextLoads() throws Exception {
    assertThat(controller).isNotNull();
  }

  @Test
  public void preAuthorizerThrows403() throws Exception {
    String dob = "1900-01-01";
    String requestBody = "{\"patientLinkId\":\"" + UUID.randomUUID() + "\",\"dateOfBirth\":\"" + dob + "\"}";

    MockHttpServletRequestBuilder builder = put("/pxp/link/verify").contentType(MediaType.APPLICATION_JSON_VALUE)
        .accept(MediaType.APPLICATION_JSON).characterEncoding("UTF-8").content(requestBody);

    this.mockMvc.perform(builder).andExpect(status().isForbidden());
  }

  @Test
  public void preAuthorizerSucceeds() throws Exception {
    // GIVEN
    Person p = _dataFactory.createFullPerson(_org);
    TestOrder to = _testOrderService.addPatientToQueue(_site.getInternalId(), p, "", Collections.<String, Boolean>emptyMap(), false,
        LocalDate.of(1865, 12, 25), "", TestResult.POSITIVE, LocalDate.of(1865, 12, 25), false);
    PatientLink pl = to.getPatientLink();

    // WHEN
    String dob = p.getBirthDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    String requestBody = "{\"patientLinkId\":\"" + pl.getInternalId() + "\",\"dateOfBirth\":\"" + dob + "\"}";

    MockHttpServletRequestBuilder builder = put("/pxp/link/verify").contentType(MediaType.APPLICATION_JSON_VALUE)
        .accept(MediaType.APPLICATION_JSON).characterEncoding("UTF-8").content(requestBody);

    // THEN
    this.mockMvc.perform(builder).andExpect(status().isOk());
  }

  // @Test
  // public void verifyLinkReturnsPerson() throws Exception {
  //   assertTrue(false);
  // }

  // @Test
  // public void updatePatientReturnsPerson() throws Exception {
  //   assertTrue(false);
  // }

  // @Test
  // public void aoeSubmitCallsUpdate() throws Exception {
  //   assertTrue(false);
  // }
}
