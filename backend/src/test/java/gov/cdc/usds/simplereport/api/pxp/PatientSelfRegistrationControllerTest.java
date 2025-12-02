package gov.cdc.usds.simplereport.api.pxp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import gov.cdc.usds.simplereport.api.BaseFullStackTest;
import gov.cdc.usds.simplereport.api.ResourceLinks;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientSelfRegistrationLink;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.logging.LoggingConstants;
import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.time.LocalDate;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoSpyBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

class PatientSelfRegistrationControllerTest extends BaseFullStackTest {
  @Autowired private MockMvc _mockMvc;
  @Autowired private PatientSelfRegistrationController _controller;
  @MockitoSpyBean private PersonService personService;

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
  void contextLoads() {
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
    String requestBody =
        """
        {
          "registrationLink": "$link",
          "facilityId": "",
          "birthDate": "1990-08-10",
          "firstName": "Luke",
          "lastName": "Skywalker",
          "role": "STUDENt",
          "telephone": null,
          "testResultDelivery": null,
          "preferredLanguage": null,
          "race": "black",
          "ethnicity": "not_hispanic",
          "gender": "other",
          "genderIdentity": "nonbinary",
          "residentCongregateSetting": true,
          "employedInHealthcare": true,
          "lookupId": "21a6b50a-3b3f-4689-a9a3-6879e51a471d",
          "suffix": null,
          "phoneNumbers": [
            {
              "number": "5551111818",
              "type": "MOBILE"
            }
          ],
          "emails": [
            "xuqoc@mailinator.com"
          ],
          "address": {
            "street": [
              "736 Jackson PI NW",
              "CA"
            ],
            "city": "La Jolla",
            "state": "CA",
            "county": "San Diego",
            "zipCode": "92037"
          },
          "notes": "Mercenary of the void"
        }
        """
            .replace("$link", _facilityRegistrationLink.getLink());

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

    verify(personService)
        .addPatient(
            any(PatientSelfRegistrationLink.class),
            eq("21a6b50a-3b3f-4689-a9a3-6879e51a471d"),
            eq("Luke"),
            eq(null),
            eq("Skywalker"),
            eq(null),
            eq(LocalDate.of(1990, 8, 10)),
            eq(
                new StreetAddress(
                    List.of("736 Jackson PI NW", "CA"), "La Jolla", "CA", "92037", "San Diego")),
            any(),
            eq(List.of(new PhoneNumber(PhoneType.MOBILE, "5551111818"))),
            eq(PersonRole.STUDENT),
            eq(List.of("xuqoc@mailinator.com")),
            eq("black"),
            eq("not_hispanic"),
            any(),
            eq("other"),
            eq("nonbinary"),
            eq(true),
            eq(true),
            any(),
            any(),
            eq("Mercenary of the void"));
  }

  @Test
  void registrationCheckExistingPatient() throws Exception {
    String link = _facilityRegistrationLink.getLink();
    String requestBody =
        """
        {
          "birthDate": "1990-08-10",
          "firstName": "Luke",
          "lastName": "Skywalker",
          "postalCode": "92037"
        }
        """;

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

    verify(personService)
        .isDuplicatePatient(
            eq("Luke"), eq("Skywalker"), eq(LocalDate.of(1990, 8, 10)), any(), any());
  }
}
