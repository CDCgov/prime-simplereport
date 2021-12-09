package gov.cdc.usds.simplereport.api.graphql;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.ResourceLinks;
import gov.cdc.usds.simplereport.db.model.ApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.repository.ApiAuditEventRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.TimeOfConsentService;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.util.List;
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

  @MockBean private ApiAuditEventRepository _auditRepo;
  @MockBean private TestEventRepository _testEventRepo;
  @MockBean private TimeOfConsentService _consentService;
  @Captor private ArgumentCaptor<ApiAuditEvent> _eventCaptor;

  private Facility _base;
  private Person _patient;
  private PatientLink _link;

  @BeforeEach
  void init() {
    TestUserIdentities.withStandardUser(
        () -> {
          Organization org = _orgService.getCurrentOrganizationNoCache();
          _base = _orgService.getFacilities(org).get(0);
          // TODO: do this upstream
          _base.addDefaultDeviceSpecimen(_dataFactory.getGenericDeviceSpecimen());
          _patient = _dataFactory.createFullPerson(org);
          TestOrder order = _dataFactory.createTestOrder(_patient, _base);
          _link = _dataFactory.createPatientLink(order);
        });
  }

  @Test
  void graphqlQuery_databaseError_eventLogged() {
    when(_testEventRepo.save(any(TestEvent.class))).thenThrow(new IllegalArgumentException("ewww"));
    useOrgUserAllFacilityAccess();
    ObjectNode args =
        patientArgs()
            .put("deviceId", _base.getDefaultDeviceType().getInternalId().toString())
            .put("result", "NEGATIVE");
    runQuery("submit-test", args, "ewww");
    verify(_auditRepo).save(_eventCaptor.capture());
    ApiAuditEvent event = _eventCaptor.getValue();
    assertEquals(List.of("addTestResultNew"), event.getGraphqlErrorPaths());
  }

  @Test
  void graphqlQuery_auditFailure_noDataReturned() {
    when(_auditRepo.save(_eventCaptor.capture()))
        .thenThrow(new IllegalArgumentException("naughty naughty"));
    useOrgUserAllFacilityAccess();
    ObjectNode args = patientArgs().put("symptoms", "{}").put("noSymptoms", true);
    String clientErrorMessage =
        assertThrows(NullPointerException.class, () -> runQuery("update-time-of-test", args))
            .getMessage();
    assertEquals( // I would characterize this as a bug in the test framework
        "Body is empty with status 400", clientErrorMessage);
  }

  @Test
  void restQuery_databaseError_eventLogged() throws Exception {
    doThrow(new RuntimeException("Made you look"))
        .when(_consentService)
        .storeTimeOfConsent(any(PatientLink.class));
    HttpEntity<JsonNode> requestEntity = new HttpEntity<JsonNode>(makeVerifyLinkArgs());
    ResponseEntity<String> resp =
        _restTemplate.exchange(
            ResourceLinks.VERIFY_LINK, HttpMethod.POST, requestEntity, String.class);
    log.info("Response body is {}", resp.getBody());
    verify(_auditRepo).save(_eventCaptor.capture());
    assertThat(_eventCaptor.getValue())
        .as("Saved audit event")
        .matches(e -> e.getHttpRequestDetails().getRequestUri().equals(ResourceLinks.VERIFY_LINK))
        .hasFieldOrPropertyWithValue("responseCode", 500);
  }

  @Test
  void restQuery_auditFailure_noDataReturned()
      throws JsonMappingException, JsonProcessingException {
    when(_auditRepo.save(_eventCaptor.capture())).thenThrow(HibernateException.class);
    HttpEntity<JsonNode> requestEntity = new HttpEntity<JsonNode>(makeVerifyLinkArgs());
    ResponseEntity<String> resp =
        _restTemplate.exchange(
            ResourceLinks.VERIFY_LINK, HttpMethod.POST, requestEntity, String.class);
    assertEquals(HttpStatus.BAD_REQUEST, resp.getStatusCode());
    JsonNode responseJson = new ObjectMapper().readTree(resp.getBody());
    assertEquals(400, responseJson.get("status").asInt());
    assertEquals("Bad Request", responseJson.get("error").asText());
    assertEquals(ResourceLinks.VERIFY_LINK, responseJson.get("path").asText());
  }

  private ObjectNode makeVerifyLinkArgs() {
    return JsonNodeFactory.instance
        .objectNode()
        .put("patientLinkId", _link.getInternalId().toString())
        .put("dateOfBirth", _patient.getBirthDate().toString());
  }

  private ObjectNode patientArgs() {
    return JsonNodeFactory.instance
        .objectNode()
        .put("patientId", _patient.getInternalId().toString());
  }
}
