package gov.cdc.usds.simplereport.api.pxp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import gov.cdc.usds.simplereport.api.BaseFullStackTest;
import gov.cdc.usds.simplereport.api.ResourceLinks;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TimeOfConsent;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.logging.LoggingConstants;
import gov.cdc.usds.simplereport.service.TimeOfConsentService;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
class PatientExperienceControllerTest extends BaseFullStackTest {

  @Autowired private MockMvc _mockMvc;

  @Autowired private TimeOfConsentService _tocService;

  @Autowired private PatientExperienceController _controller;

  private Organization org;
  private Facility facility;
  private Person person;
  private PatientLink patientLink;
  private TestEvent testEvent;

  @BeforeEach
  void init() {
    truncateDb();
    TestUserIdentities.withStandardUser(
        () -> {
          org = _dataFactory.createValidOrg();
          facility = _dataFactory.createValidFacility(org);
          person = _dataFactory.createFullPerson(org);
          testEvent = _dataFactory.createTestEvent(person, facility, TestResult.NEGATIVE);
          patientLink = _dataFactory.createPatientLink(testEvent.getTestOrder());
        });
  }

  @Test
  void contextLoads() {
    assertThat(_controller).isNotNull();
  }

  @Test
  void preAuthorizerThrows403() throws Exception {
    String dob = "1900-01-01";
    String requestBody =
        "{\"patientLinkId\":\"" + UUID.randomUUID() + "\",\"dateOfBirth\":\"" + dob + "\"}";

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.VERIFY_LINK)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    this._mockMvc
        .perform(builder)
        .andExpect(status().isForbidden())
        .andExpect(header().exists(LoggingConstants.REQUEST_ID_HEADER));
    assertNoAuditEvent();
  }

  @Test
  void preAuthorizerSucceeds() throws Exception {
    // GIVEN
    String dob = person.getBirthDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    String requestBody =
        "{\"patientLinkId\":\""
            + patientLink.getInternalId()
            + "\",\"dateOfBirth\":\""
            + dob
            + "\"}";

    // WHEN
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.VERIFY_LINK)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    // THEN
    String requestId = runBuilderReturningRequestId(_mockMvc, builder, status().isOk());
    assertLastAuditEntry(HttpStatus.OK, ResourceLinks.VERIFY_LINK, requestId);
  }

  @Test
  void verifyLinkReturnsPerson() throws Exception {
    // GIVEN
    String dob = person.getBirthDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    String requestBody =
        "{\"patientLinkId\":\""
            + patientLink.getInternalId()
            + "\",\"dateOfBirth\":\""
            + dob
            + "\"}";

    // WHEN
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.VERIFY_LINK)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    // THEN
    String requestId =
        _mockMvc
            .perform(builder)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.firstName", is(person.getFirstName())))
            .andExpect(jsonPath("$.lastName", is(person.getLastName())))
            .andExpect(jsonPath("$.lastTest.deviceTypeName", is("Acme SuperFine")))
            .andExpect(jsonPath("$.lastTest.deviceTypeModel", is("SFN")))
            .andReturn()
            .getResponse()
            .getHeader(LoggingConstants.REQUEST_ID_HEADER);

    assertLastAuditEntry(HttpStatus.OK, ResourceLinks.VERIFY_LINK, requestId);
  }

  @Test
  void verifyLinkReturns410forExpiredLinks() throws Exception {
    // GIVEN
    TestUserIdentities.withStandardUser(
        () -> patientLink = _dataFactory.expirePatientLink(patientLink));
    String dob = person.getBirthDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    String requestBody =
        "{\"patientLinkId\":\""
            + patientLink.getInternalId()
            + "\",\"dateOfBirth\":\""
            + dob
            + "\"}";

    // WHEN
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.VERIFY_LINK)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    // THEN
    String requestId = runBuilderReturningRequestId(_mockMvc, builder, status().isGone());
    assertLastAuditEntry(HttpStatus.GONE, ResourceLinks.VERIFY_LINK, requestId);
  }

  @Test
  void verifyLinkSavesTimeOfConsent() throws Exception {
    // GIVEN
    String dob = person.getBirthDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    String requestBody =
        "{\"patientLinkId\":\""
            + patientLink.getInternalId()
            + "\",\"dateOfBirth\":\""
            + dob
            + "\"}";

    // WHEN
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.VERIFY_LINK)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    // THEN
    _mockMvc.perform(builder).andExpect(status().isOk());
    List<TimeOfConsent> tocList = _tocService.getTimeOfConsent(patientLink);
    assertNotNull(tocList);
    assertNotEquals(tocList.size(), 0);
  }

  @Test
  void updatePatientReturnsUpdatedPerson() throws Exception {
    // GIVEN
    String dob = person.getBirthDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    String newTelephone = "(212) 867-5309";
    String newEmail = "fake@example.com";

    String requestBody =
        "{\"patientLinkId\":\""
            + patientLink.getInternalId()
            + "\",\"dateOfBirth\":\""
            + dob
            + "\",\"data\":{\"phoneNumbers\":"
            + "[{\"type\":\"MOBILE\",\"number\":\""
            + newTelephone
            + "\"},{\"type\":\"LANDLINE\",\"number\":\"(631) 867-5309"
            + "\"}],\"role\":\"UNKNOWN\",\"email\":\""
            + newEmail
            + "\",\"race\":\"refused\",\"ethnicity\":\"not_hispanic\",\"gender\":\"female\",\"residentCongregateSetting\":false,\"employedInHealthcare\":true,\"address\":{\"street\":[\"12 Someplace\",\"CA\"],\"city\":null,\"state\":\"CA\",\"county\":null,\"zipCode\":\"67890\"}}}";

    // WHEN
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.UPDATE_PATIENT)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    // THEN
    _mockMvc
        .perform(builder)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.telephone", is(newTelephone)))
        .andExpect(jsonPath("$.email", is(newEmail)));
  }

  @Test
  void updatePatientAcceptsPostalOrZipCode() throws Exception {
    // GIVEN
    String dob = person.getBirthDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    String newTelephone = "(212) 867-5309";
    String newEmail = "fake@example.com";
    String zipcode = "97209";

    String requestBody =
        "{\"patientLinkId\":\""
            + patientLink.getInternalId()
            + "\",\"dateOfBirth\":\""
            + dob
            + "\",\"data\":{\"phoneNumbers\":"
            + "[{\"type\":\"MOBILE\",\"number\":\""
            + newTelephone
            + "\"},{\"type\":\"LANDLINE\",\"number\":\"(631) 867-5309"
            + "\"}],\"role\":\"UNKNOWN\",\"emails\":[\""
            + newEmail
            + "\"],\"race\":\"refused\",\"ethnicity\":\"not_hispanic\",\"gender\":\"female\",\"residentCongregateSetting\":false,\"employedInHealthcare\":true,\"address\":{\"street\":[\"12 Someplace\",\"CA\"],\"city\":null,\"state\":\"CA\",\"county\":null,"
            + "\"zipCode\":\""
            + zipcode
            + "\"}}}";

    // WHEN
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.UPDATE_PATIENT)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    // THEN
    _mockMvc
        .perform(builder)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.zipCode", is(zipcode)));

    String postalCode = "11561";
    String requestBody2 =
        "{\"patientLinkId\":\""
            + patientLink.getInternalId()
            + "\",\"dateOfBirth\":\""
            + dob
            + "\",\"data\":{\"phoneNumbers\":"
            + "[{\"type\":\"MOBILE\",\"number\":\""
            + newTelephone
            + "\"},{\"type\":\"LANDLINE\",\"number\":\"(631) 867-5309"
            + "\"}],\"role\":\"UNKNOWN\",\"emails\":[\""
            + newEmail
            + "\"],\"race\":\"refused\",\"ethnicity\":\"not_hispanic\",\"gender\":\"female\",\"residentCongregateSetting\":false,\"employedInHealthcare\":true,\"address\":{\"street\":[\"12 Someplace\",\"CA\"],\"city\":null,\"state\":\"CA\",\"county\":null,"
            + "\"postalCode\":\""
            + postalCode
            + "\"}}}";

    // WHEN
    MockHttpServletRequestBuilder builder2 =
        post(ResourceLinks.UPDATE_PATIENT)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody2);

    // THEN
    _mockMvc
        .perform(builder2)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.zipCode", is(postalCode)));
  }

  @Test
  void badRegistrationLinkThrows404() throws Exception {
    String link = UUID.randomUUID().toString();

    MockHttpServletRequestBuilder builder =
        get(ResourceLinks.ENTITY_NAME).param("patientRegistrationLink", link);

    this._mockMvc
        .perform(builder)
        .andExpect(status().isNotFound())
        .andExpect(header().exists(LoggingConstants.REQUEST_ID_HEADER));
    assertNoAuditEvent();
  }
}
