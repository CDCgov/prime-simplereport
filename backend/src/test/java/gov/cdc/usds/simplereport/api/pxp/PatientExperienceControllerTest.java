package gov.cdc.usds.simplereport.api.pxp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.startsWith;
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
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.logging.LoggingConstants;
import gov.cdc.usds.simplereport.service.TimeOfConsentService;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.text.SimpleDateFormat;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.TimeZone;
import java.util.UUID;
import org.hamcrest.Matchers;
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

  @Autowired private MockMvc mockMvc;
  @Autowired private TimeOfConsentService tocService;
  @Autowired private PatientExperienceController controller;

  private Organization org;
  private Facility facility;
  private Person person;
  private PatientLink patientLink;
  private TestEvent testEvent;
  private TestEvent removedTestEvent;

  @BeforeEach
  void init() {
    truncateDb();
    TestUserIdentities.withStandardUser(
        () -> {
          org = _dataFactory.saveValidOrganization();
          facility = _dataFactory.createValidFacility(org);
          person = _dataFactory.createFullPerson(org);
          testEvent = _dataFactory.createTestEvent(person, facility, TestResult.NEGATIVE);
          patientLink = _dataFactory.createPatientLink(testEvent.getTestOrder());
        });
  }

  @Test
  void contextLoads() {
    assertThat(controller).isNotNull();
  }

  @Test
  void preAuthorizerThrows403V2() throws Exception {
    String dob = "1900-01-01";
    String requestBody =
        "{\"patientLinkId\":\"" + UUID.randomUUID() + "\",\"dateOfBirth\":\"" + dob + "\"}";

    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.VERIFY_LINK_V2)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    this.mockMvc
        .perform(builder)
        .andExpect(status().isForbidden())
        .andExpect(header().exists(LoggingConstants.REQUEST_ID_HEADER));
    assertNoAuditEvent();
  }

  @Test
  void preAuthorizerSucceedsV2() throws Exception {
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
        post(ResourceLinks.VERIFY_LINK_V2)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    // THEN
    String requestId = runBuilderReturningRequestId(mockMvc, builder, status().isOk());
    assertLastAuditEntry(HttpStatus.OK, ResourceLinks.VERIFY_LINK_V2, requestId);
  }

  @Test
  void verifyLinkV2ReturnsTestResultInfo() throws Exception {

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
        post(ResourceLinks.VERIFY_LINK_V2)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    // THEN
    String requestId =
        mockMvc
            .perform(builder)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.testEventId", is(testEvent.getInternalId().toString())))
            .andExpect(jsonPath("$.results", Matchers.hasSize(1)))
            .andExpect(jsonPath("$.results[0].testResult", is("NEGATIVE")))
            .andExpect(jsonPath("$.results[0].disease.name", is("COVID-19")))
            .andExpect(jsonPath("$.correctionStatus", is("ORIGINAL")))
            .andExpect(jsonPath("$.patient.firstName", is("Fred")))
            .andExpect(jsonPath("$.patient.middleName", is("M")))
            .andExpect(jsonPath("$.patient.lastName", is("Astaire")))
            .andExpect(jsonPath("$.patient.birthDate", is("1899-05-10")))
            .andExpect(jsonPath("$.organization.name", is("The Mall")))
            .andExpect(jsonPath("$.facility.name", is("Imaginary Site")))
            .andExpect(jsonPath("$.facility.cliaNumber", is("123456")))
            .andExpect(jsonPath("$.facility.street", is("736 Jackson PI NW")))
            .andExpect(jsonPath("$.facility.streetTwo", is("")))
            .andExpect(jsonPath("$.facility.city", is("Washington")))
            .andExpect(jsonPath("$.facility.state", is("DC")))
            .andExpect(jsonPath("$.facility.zipCode", is("20503")))
            .andExpect(jsonPath("$.facility.phone", is("555-867-5309")))
            .andExpect(jsonPath("$.facility.orderingProvider.firstName", is("Doctor")))
            .andExpect(jsonPath("$.facility.orderingProvider.middleName", is("")))
            .andExpect(jsonPath("$.facility.orderingProvider.lastName", is("Doom")))
            .andExpect(jsonPath("$.facility.orderingProvider.npi", is("DOOOOOOM")))
            .andExpect(jsonPath("$.deviceType.name", is("Acme SuperFine")))
            .andExpect(jsonPath("$.deviceType.model", is("SFN")))
            .andReturn()
            .getResponse()
            .getHeader(LoggingConstants.REQUEST_ID_HEADER);

    assertLastAuditEntry(HttpStatus.OK, ResourceLinks.VERIFY_LINK_V2, requestId);
  }

  @Test
  void verifyLinkV2ReturnsTestResultInfo_multiplex() throws Exception {
    TestUserIdentities.withStandardUser(
        () -> {
          testEvent =
              _dataFactory.createMultiplexTestEvent(
                  person,
                  facility,
                  TestResult.POSITIVE,
                  TestResult.NEGATIVE,
                  TestResult.NEGATIVE,
                  false);
          patientLink = _dataFactory.createPatientLink(testEvent.getTestOrder());
        });

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
        post(ResourceLinks.VERIFY_LINK_V2)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    // THEN
    String requestId =
        mockMvc
            .perform(builder)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.testEventId", is(testEvent.getInternalId().toString())))
            .andExpect(jsonPath("$.results", Matchers.hasSize(3)))
            .andExpect(
                jsonPath(
                        "$.results[?(@.disease.name == \"COVID-19\" && @.testResult == \"POSITIVE\")]")
                    .exists())
            .andExpect(
                jsonPath(
                        "$.results[?(@.disease.name == \"Flu A\" && @.testResult == \"NEGATIVE\")]")
                    .exists())
            .andExpect(
                jsonPath(
                        "$.results[?(@.disease.name == \"Flu B\" && @.testResult == \"NEGATIVE\")]")
                    .exists())
            .andExpect(jsonPath("$.correctionStatus", is("ORIGINAL")))
            .andExpect(jsonPath("$.patient.firstName", is("Fred")))
            .andExpect(jsonPath("$.patient.middleName", is("M")))
            .andExpect(jsonPath("$.patient.lastName", is("Astaire")))
            .andExpect(jsonPath("$.patient.birthDate", is("1899-05-10")))
            .andExpect(jsonPath("$.organization.name", is("The Mall")))
            .andExpect(jsonPath("$.facility.name", is("Imaginary Site")))
            .andExpect(jsonPath("$.facility.cliaNumber", is("123456")))
            .andExpect(jsonPath("$.facility.street", is("736 Jackson PI NW")))
            .andExpect(jsonPath("$.facility.streetTwo", is("")))
            .andExpect(jsonPath("$.facility.city", is("Washington")))
            .andExpect(jsonPath("$.facility.state", is("DC")))
            .andExpect(jsonPath("$.facility.zipCode", is("20503")))
            .andExpect(jsonPath("$.facility.phone", is("555-867-5309")))
            .andExpect(jsonPath("$.facility.orderingProvider.firstName", is("Doctor")))
            .andExpect(jsonPath("$.facility.orderingProvider.middleName", is("")))
            .andExpect(jsonPath("$.facility.orderingProvider.lastName", is("Doom")))
            .andExpect(jsonPath("$.facility.orderingProvider.npi", is("DOOOOOOM")))
            .andExpect(jsonPath("$.deviceType.name", is("Acme SuperFine")))
            .andExpect(jsonPath("$.deviceType.model", is("SFN")))
            .andReturn()
            .getResponse()
            .getHeader(LoggingConstants.REQUEST_ID_HEADER);

    assertLastAuditEntry(HttpStatus.OK, ResourceLinks.VERIFY_LINK_V2, requestId);
  }

  @Test
  void verifyResultsDisplayForRemovedTests() throws Exception {
    TestUserIdentities.withStandardUser(
        () -> {
          testEvent = _dataFactory.createTestEvent(person, facility, TestResult.POSITIVE);
          patientLink = _dataFactory.createPatientLink(testEvent.getTestOrder());
        });

    TestUserIdentities.withStandardUser(
        () -> {
          removedTestEvent =
              _dataFactory.createTestEventCorrection(testEvent, TestCorrectionStatus.REMOVED);
        });

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
        post(ResourceLinks.VERIFY_LINK_V2)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    // THEN
    String requestId =
        mockMvc
            .perform(builder)
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.testEventId", is(removedTestEvent.getInternalId().toString())))
            .andExpect(jsonPath("$.results", Matchers.hasSize(1)))
            .andExpect(jsonPath("$.results[0].testResult", is("POSITIVE")))
            .andExpect(jsonPath("$.results[0].disease.name", is("COVID-19")))
            .andExpect(jsonPath("$.correctionStatus", is("REMOVED")))
            .andExpect(jsonPath("$.patient.firstName", is("Fred")))
            .andExpect(jsonPath("$.patient.middleName", is("M")))
            .andExpect(jsonPath("$.patient.lastName", is("Astaire")))
            .andExpect(jsonPath("$.patient.birthDate", is("1899-05-10")))
            .andExpect(jsonPath("$.organization.name", is("The Mall")))
            .andExpect(jsonPath("$.facility.name", is("Imaginary Site")))
            .andExpect(jsonPath("$.facility.cliaNumber", is("123456")))
            .andExpect(jsonPath("$.facility.street", is("736 Jackson PI NW")))
            .andExpect(jsonPath("$.facility.streetTwo", is("")))
            .andExpect(jsonPath("$.facility.city", is("Washington")))
            .andExpect(jsonPath("$.facility.state", is("DC")))
            .andExpect(jsonPath("$.facility.zipCode", is("20503")))
            .andExpect(jsonPath("$.facility.phone", is("555-867-5309")))
            .andExpect(jsonPath("$.facility.orderingProvider.firstName", is("Doctor")))
            .andExpect(jsonPath("$.facility.orderingProvider.middleName", is("")))
            .andExpect(jsonPath("$.facility.orderingProvider.lastName", is("Doom")))
            .andExpect(jsonPath("$.facility.orderingProvider.npi", is("DOOOOOOM")))
            .andExpect(jsonPath("$.deviceType.name", is("Acme SuperFine")))
            .andExpect(jsonPath("$.deviceType.model", is("SFN")))
            .andReturn()
            .getResponse()
            .getHeader(LoggingConstants.REQUEST_ID_HEADER);

    assertLastAuditEntry(HttpStatus.OK, ResourceLinks.VERIFY_LINK_V2, requestId);
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
        post(ResourceLinks.VERIFY_LINK_V2)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    // THEN
    String requestId = runBuilderReturningRequestId(mockMvc, builder, status().isGone());
    assertLastAuditEntry(HttpStatus.GONE, ResourceLinks.VERIFY_LINK_V2, requestId);
  }

  @Test
  void getTestResultUnauthenticated_returnsPartialTestResultData() throws Exception {
    // WHEN
    MockHttpServletRequestBuilder builder =
        get(ResourceLinks.GET_TEST_RESULT_UNAUTHENTICATED)
            .characterEncoding("UTF-8")
            .param("patientLink", patientLink.getInternalId().toString());

    var expectedPatient = new HashMap<String, String>();
    expectedPatient.put("firstName", "Fred");
    expectedPatient.put("lastName", "A.");

    var expectedFacility = new HashMap<String, String>();
    expectedFacility.put("name", "Imaginary Site");
    expectedFacility.put("phone", "555-867-5309");

    var dateFormatter = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS");
    dateFormatter.setTimeZone(TimeZone.getTimeZone("GMT"));

    // THEN
    this.mockMvc
        .perform(builder)
        .andExpect(status().isOk())
        .andExpect(jsonPath("$.patient").value(expectedPatient))
        .andExpect(jsonPath("$.facility").value(expectedFacility))
        .andExpect(
            jsonPath("$.expiresAt", startsWith(dateFormatter.format(patientLink.getExpiresAt()))));
  }

  @Test
  void getTestResultUnauthenticated_throwsOnExpiredLink() throws Exception {
    // GIVEN
    TestUserIdentities.withStandardUser(
        () -> patientLink = _dataFactory.expirePatientLink(patientLink));

    // WHEN
    MockHttpServletRequestBuilder builder =
        get(ResourceLinks.GET_TEST_RESULT_UNAUTHENTICATED)
            .characterEncoding("UTF-8")
            .param("patientLink", patientLink.getInternalId().toString());

    // THEN
    this.mockMvc.perform(builder).andExpect(status().isGone());
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
        post(ResourceLinks.VERIFY_LINK_V2)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    // THEN
    mockMvc.perform(builder).andExpect(status().isOk());
    List<TimeOfConsent> tocList = tocService.getTimeOfConsent(patientLink);
    assertNotNull(tocList);
    assertNotEquals(tocList.size(), 0);
  }

  @Test
  void badRegistrationLinkThrows404() throws Exception {
    String link = UUID.randomUUID().toString();

    MockHttpServletRequestBuilder builder =
        get(ResourceLinks.ENTITY_NAME).param("patientRegistrationLink", link);

    this.mockMvc
        .perform(builder)
        .andExpect(status().isNotFound())
        .andExpect(header().exists(LoggingConstants.REQUEST_ID_HEADER));
    assertNoAuditEvent();
  }
}
