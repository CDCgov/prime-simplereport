package gov.cdc.usds.simplereport.api.pxp;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.is;
import static org.junit.jupiter.api.Assertions.assertEquals;
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
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.TimeOfConsent;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.logging.LoggingConstants;
import gov.cdc.usds.simplereport.service.TimeOfConsentService;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.time.LocalDate;
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
import org.springframework.test.web.servlet.RequestBuilder;
import org.springframework.test.web.servlet.ResultMatcher;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
class PatientExperienceControllerTest extends BaseFullStackTest {

  @Autowired private MockMvc _mockMvc;

  @Autowired private TimeOfConsentService _tocService;

  @Autowired private PatientExperienceController _controller;

  private Organization _org;
  private Facility _site;
  private Person _person;
  private PatientLink _patientLink;
  private TestOrder _testOrder;

  @BeforeEach
  void init() {
    truncateDb();
    TestUserIdentities.withStandardUser(
        () -> {
          _org = _dataFactory.createValidOrg();
          _site = _dataFactory.createValidFacility(_org);
          _person = _dataFactory.createFullPerson(_org);
          _testOrder = _dataFactory.createTestOrder(_person, _site);
          _patientLink = _dataFactory.createPatientLink(_testOrder);
        });
  }

  @Test
  void contextLoads() throws Exception {
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
    String dob = _person.getBirthDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    String requestBody =
        "{\"patientLinkId\":\""
            + _patientLink.getInternalId()
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
    String requestId = runBuilderReturningRequestId(builder, status().isOk());
    assertLastAuditEntry(HttpStatus.OK, ResourceLinks.VERIFY_LINK, requestId);
  }

  @Test
  void verifyLinkReturnsPerson() throws Exception {
    // GIVEN
    String dob = _person.getBirthDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    String requestBody =
        "{\"patientLinkId\":\""
            + _patientLink.getInternalId()
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
            .andExpect(jsonPath("$.firstName", is(_person.getFirstName())))
            .andExpect(jsonPath("$.lastName", is(_person.getLastName())))
            .andReturn()
            .getResponse()
            .getHeader(LoggingConstants.REQUEST_ID_HEADER);

    assertLastAuditEntry(HttpStatus.OK, ResourceLinks.VERIFY_LINK, requestId);
  }

  @Test
  void verifyLinkReturns410forExpiredLinks() throws Exception {
    // GIVEN
    TestUserIdentities.withStandardUser(
        () -> _patientLink = _dataFactory.expirePatientLink(_patientLink));
    String dob = _person.getBirthDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    String requestBody =
        "{\"patientLinkId\":\""
            + _patientLink.getInternalId()
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
    String requestId = runBuilderReturningRequestId(builder, status().isGone());
    assertLastAuditEntry(HttpStatus.GONE, ResourceLinks.VERIFY_LINK, requestId);
  }

  @Test
  void questionnaireSubmissionExpiresPatientLink() throws Exception {
    // GIVEN
    String dob = _person.getBirthDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    boolean noSymptoms = false;
    String symptomOnsetDate = "2021-02-01";
    String requestBody =
        "{\"patientLinkId\":\""
            + _patientLink.getInternalId()
            + "\",\"dateOfBirth\":\""
            + dob
            + "\",\"data\":{\"noSymptoms\":"
            + noSymptoms
            + ",\"symptoms\":\"{\\\"25064002\\\":false,\\\"36955009\\\":false,\\\"43724002\\\":false,\\\"44169009\\\":false,\\\"49727002\\\":false,\\\"62315008\\\":false,\\\"64531003\\\":true,\\\"68235000\\\":false,\\\"68962001\\\":false,\\\"84229001\\\":true,\\\"103001002\\\":false,\\\"162397003\\\":false,\\\"230145002\\\":false,\\\"267036007\\\":false,\\\"422400008\\\":false,\\\"422587007\\\":false,\\\"426000000\\\":false}\",\"symptomOnset\":\""
            + symptomOnsetDate
            + "\",\"firstTest\":true,\"priorTestDate\":null,\"priorTestType\":null,\"priorTestResult\":null,\"pregnancy\":\"261665006\"}}";

    // WHEN
    MockHttpServletRequestBuilder submitBuilder =
        post(ResourceLinks.ANSWER_QUESTIONS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);
    String requestId = runBuilderReturningRequestId(submitBuilder, status().isOk());
    assertLastAuditEntry(HttpStatus.OK, ResourceLinks.ANSWER_QUESTIONS, requestId);

    // OKAY NOW DO IT AGAIN
    MockHttpServletRequestBuilder verifyBuilder =
        post(ResourceLinks.VERIFY_LINK)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    MockHttpServletRequestBuilder secondSubmitBuilder =
        post(ResourceLinks.ANSWER_QUESTIONS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    // THEN
    requestId = runBuilderReturningRequestId(verifyBuilder, status().isGone());
    assertLastAuditEntry(HttpStatus.GONE, ResourceLinks.VERIFY_LINK, requestId);
    requestId = runBuilderReturningRequestId(secondSubmitBuilder, status().isGone());
    assertLastAuditEntry(HttpStatus.GONE, ResourceLinks.ANSWER_QUESTIONS, requestId);
  }

  @Test
  void verifyLinkSavesTimeOfConsent() throws Exception {
    // GIVEN
    String dob = _person.getBirthDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    String requestBody =
        "{\"patientLinkId\":\""
            + _patientLink.getInternalId()
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
    List<TimeOfConsent> tocList = _tocService.getTimeOfConsent(_patientLink);
    assertNotNull(tocList);
    assertNotEquals(tocList.size(), 0);
  }

  @Test
  void updatePatientReturnsUpdatedPerson() throws Exception {
    // GIVEN
    String dob = _person.getBirthDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    String newTelephone = "(212) 867-5309";
    String newEmail = "fake@example.com";

    String requestBody =
        "{\"patientLinkId\":\""
            + _patientLink.getInternalId()
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
    String dob = _person.getBirthDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    String newTelephone = "(212) 867-5309";
    String newEmail = "fake@example.com";
    String zipcode = "97209";

    String requestBody =
        "{\"patientLinkId\":\""
            + _patientLink.getInternalId()
            + "\",\"dateOfBirth\":\""
            + dob
            + "\",\"data\":{\"phoneNumbers\":"
            + "[{\"type\":\"MOBILE\",\"number\":\""
            + newTelephone
            + "\"},{\"type\":\"LANDLINE\",\"number\":\"(631) 867-5309"
            + "\"}],\"role\":\"UNKNOWN\",\"email\":\""
            + newEmail
            + "\",\"race\":\"refused\",\"ethnicity\":\"not_hispanic\",\"gender\":\"female\",\"residentCongregateSetting\":false,\"employedInHealthcare\":true,\"address\":{\"street\":[\"12 Someplace\",\"CA\"],\"city\":null,\"state\":\"CA\",\"county\":null,"
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
            + _patientLink.getInternalId()
            + "\",\"dateOfBirth\":\""
            + dob
            + "\",\"data\":{\"phoneNumbers\":"
            + "[{\"type\":\"MOBILE\",\"number\":\""
            + newTelephone
            + "\"},{\"type\":\"LANDLINE\",\"number\":\"(631) 867-5309"
            + "\"}],\"role\":\"UNKNOWN\",\"email\":\""
            + newEmail
            + "\",\"race\":\"refused\",\"ethnicity\":\"not_hispanic\",\"gender\":\"female\",\"residentCongregateSetting\":false,\"employedInHealthcare\":true,\"address\":{\"street\":[\"12 Someplace\",\"CA\"],\"city\":null,\"state\":\"CA\",\"county\":null,"
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
  void aoeSubmitCallsUpdate() throws Exception {
    // GIVEN
    String dob = _person.getBirthDate().format(DateTimeFormatter.ofPattern("yyyy-MM-dd"));
    boolean noSymptoms = false;
    String symptomOnsetDate = "2021-02-01";
    String requestBody =
        "{\"patientLinkId\":\""
            + _patientLink.getInternalId()
            + "\",\"dateOfBirth\":\""
            + dob
            + "\",\"data\":{\"noSymptoms\":"
            + noSymptoms
            + ",\"symptoms\":\"{\\\"25064002\\\":false,\\\"36955009\\\":false,\\\"43724002\\\":false,\\\"44169009\\\":false,\\\"49727002\\\":false,\\\"62315008\\\":false,\\\"64531003\\\":true,\\\"68235000\\\":false,\\\"68962001\\\":false,\\\"84229001\\\":true,\\\"103001002\\\":false,\\\"162397003\\\":false,\\\"230145002\\\":false,\\\"267036007\\\":false,\\\"422400008\\\":false,\\\"422587007\\\":false,\\\"426000000\\\":false}\",\"symptomOnset\":\""
            + symptomOnsetDate
            + "\",\"firstTest\":true,\"priorTestDate\":null,\"priorTestType\":null,\"priorTestResult\":null,\"pregnancy\":\"261665006\"}}";

    // WHEN
    MockHttpServletRequestBuilder builder =
        post(ResourceLinks.ANSWER_QUESTIONS)
            .contentType(MediaType.APPLICATION_JSON_VALUE)
            .accept(MediaType.APPLICATION_JSON)
            .characterEncoding("UTF-8")
            .content(requestBody);

    // THEN
    _mockMvc.perform(builder).andExpect(status().isOk());

    AskOnEntrySurvey survey = _dataFactory.getAoESurveyForTestOrder(_testOrder.getInternalId());
    assertEquals(survey.getNoSymptoms(), noSymptoms);
    assertEquals(survey.getSymptomOnsetDate(), LocalDate.parse(symptomOnsetDate));
  }

  private String runBuilderReturningRequestId(RequestBuilder builder, ResultMatcher statusMatcher)
      throws Exception {
    return _mockMvc
        .perform(builder)
        .andExpect(statusMatcher)
        .andReturn()
        .getResponse()
        .getHeader(LoggingConstants.REQUEST_ID_HEADER);
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
