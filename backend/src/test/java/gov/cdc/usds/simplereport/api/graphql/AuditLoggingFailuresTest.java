package gov.cdc.usds.simplereport.api.graphql;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.ResourceLinks;
import gov.cdc.usds.simplereport.db.model.ConsoleApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.MultiplexResultInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.service.AuditLoggerService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.TimeOfConsentService;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.HibernateException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.reactive.function.client.WebClientRequestException;

/**
 * Tests around edges of audit logging.
 *
 * <ol>
 *   <li>Do we successfully abort request processing if the audit log fails?
 *   <li>Do we successfully log requests where an error takes place in the main transaction?
 * </ol>
 *
 * Since MockMvc does not wrap error handling, this uses TestRestTemplate for PXP requests (this is
 * in any case what the graphql tests use, so there is no additional cost).
 */
@Slf4j
@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
class AuditLoggingFailuresTest extends BaseGraphqlTest {

  @Autowired private TestRestTemplate _restTemplate;
  @Autowired private OrganizationService _orgService;
  @MockBean private CurrentTenantDataAccessContextHolder _tenantDataAccessContextHolder;

  @MockBean private AuditLoggerService auditLoggerServiceSpy;
  @MockBean private TestEventRepository _testEventRepo;
  @MockBean private TimeOfConsentService _consentService;
  @Captor private ArgumentCaptor<ConsoleApiAuditEvent> _eventCaptor;

  private Facility facility;
  private Person patient;
  private PatientLink patientLink;

  @BeforeEach
  void init() {
    TestUserIdentities.withStandardUser(
        () -> {
          Organization org = _orgService.getCurrentOrganizationNoCache();
          facility = _orgService.getFacilities(org).get(0);
          facility.setDefaultDeviceTypeSpecimenType(
              _dataFactory.getGenericDevice(), _dataFactory.getGenericSpecimen());
          patient = _dataFactory.createFullPerson(org);
          TestOrder order = _dataFactory.createTestOrder(patient, facility);
          patientLink = _dataFactory.createPatientLink(order);
        });
  }

  // I tweaked the behavior to not return the original error message in order to improve security
  @Test
  void graphqlQuery_databaseError_eventLogged() {
    when(_testEventRepo.save(any(TestEvent.class))).thenThrow(new IllegalArgumentException("ewww"));
    useOrgUserAllFacilityAccess();
    HashMap<String, Object> args = patientArgs();
    args.put("deviceId", facility.getDefaultDeviceType().getInternalId().toString());
    args.put("specimenId", facility.getDefaultSpecimenType().getInternalId().toString());
    MultiplexResultInput multiplexResultInput =
        new MultiplexResultInput(_diseaseService.covid().getName(), TestResult.NEGATIVE);
    args.put("results", List.of(multiplexResultInput));
    runQuery("submit-queue-item", args, "Something went wrong");
    verify(auditLoggerServiceSpy).logEvent(_eventCaptor.capture());
    ConsoleApiAuditEvent event = _eventCaptor.getValue();
    assertEquals(List.of("submitQueueItem"), event.getGraphqlErrorPaths());
  }

  // I tweaked the behavior to not return the original error message in order to improve security
  @Test
  void graphqlQuery_auditFailure_noDataReturned() {
    doThrow(new IllegalArgumentException("naughty naughty"))
        .when(auditLoggerServiceSpy)
        .logEvent(_eventCaptor.capture());
    useOrgUserAllFacilityAccess();
    HashMap<String, Object> args = patientArgs();
    args.put("symptoms", "{}");
    args.put("noSymptoms", true);
    String clientErrorMessage =
        assertThrows(WebClientRequestException.class, () -> runQuery("update-time-of-test", args))
            .getMessage();
    assertEquals(
        "Request processing failed; nested exception is header: Something went wrong; body: Please check for errors and try again; nested exception is org.springframework.web.util.NestedServletException: Request processing failed; nested exception is header: Something went wrong; body: Please check for errors and try again",
        clientErrorMessage);
  }

  @Test
  void restQuery_databaseError_eventLogged() throws Exception {
    doThrow(new RuntimeException("Made you look"))
        .when(_consentService)
        .storeTimeOfConsent(any(PatientLink.class));
    HttpEntity<JsonNode> requestEntity = new HttpEntity<JsonNode>(makeVerifyLinkArgs());
    ResponseEntity<String> resp =
        _restTemplate.exchange(
            ResourceLinks.VERIFY_LINK_V2, HttpMethod.POST, requestEntity, String.class);
    log.info("Response body is {}", resp.getBody());
    verify(auditLoggerServiceSpy).logEvent(_eventCaptor.capture());
    assertThat(_eventCaptor.getValue())
        .as("Saved audit event")
        .matches(
            e -> e.getHttpRequestDetails().getRequestUri().equals(ResourceLinks.VERIFY_LINK_V2))
        .hasFieldOrPropertyWithValue("responseCode", 500);
  }

  @Test
  void restQuery_auditFailure_noDataReturned() throws JsonProcessingException {
    doThrow(HibernateException.class).when(auditLoggerServiceSpy).logEvent(_eventCaptor.capture());
    HttpEntity<JsonNode> requestEntity = new HttpEntity<JsonNode>(makeVerifyLinkArgs());
    ResponseEntity<String> resp =
        _restTemplate.exchange(
            ResourceLinks.VERIFY_LINK_V2, HttpMethod.POST, requestEntity, String.class);
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
    JsonNode responseJson = new ObjectMapper().readTree(resp.getBody());
    assertEquals(500, responseJson.get("status").asInt());
    assertEquals("Internal Server Error", responseJson.get("error").asText());
    assertEquals(ResourceLinks.VERIFY_LINK_V2, responseJson.get("path").asText());
  }

  private ObjectNode makeVerifyLinkArgs() {
    return JsonNodeFactory.instance
        .objectNode()
        .put("patientLinkId", patientLink.getInternalId().toString())
        .put("dateOfBirth", patient.getBirthDate().toString());
  }

  private HashMap<String, Object> patientArgs() {
    return new HashMap<>(Map.of("patientId", patient.getInternalId().toString()));
  }
}
