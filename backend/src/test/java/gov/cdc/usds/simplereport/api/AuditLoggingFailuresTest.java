package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
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
import org.hibernate.HibernateException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;

class AuditLoggingFailuresTest extends BaseApiTest {

  private static final Logger LOG = LoggerFactory.getLogger(AuditLoggingFailuresTest.class);
  @Autowired private TestRestTemplate _restTemplate;
  @Autowired private OrganizationService _orgService;

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
          Organization org = _orgService.getCurrentOrganization();
          _base = _orgService.getFacilities(org).get(0);
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
    assertEquals(List.of("addTestResult"), event.getGraphqlErrorPaths());
  }

  @Test
  void graphqlQuery_auditFailure_noDataReturned() {
    when(_auditRepo.save(_eventCaptor.capture()))
        .thenThrow(new IllegalArgumentException("naughty naughty"));
    useOrgUserAllFacilityAccess();
    ObjectNode args = patientArgs().put("symptoms", "{}").put("noSymptoms", true);
    assertThrows(NullPointerException.class, () -> runQuery("update-time-of-test", args));
    // this is not... precisely as it should be?
  }

  @Test
  void restQuery_databaseError_eventLogged() throws Exception {
    doThrow(new RuntimeException("Made you look"))
        .when(_consentService)
        .storeTimeOfConsent(any(PatientLink.class));
    HttpEntity<JsonNode> requestEntity = new HttpEntity<JsonNode>(makeVerifyLinkArgs());
    ResponseEntity<String> resp =
        _restTemplate.exchange("/pxp/link/verify", HttpMethod.PUT, requestEntity, String.class);
    LOG.info("Response body is {}", resp.getBody());
    verify(_auditRepo, atLeastOnce()).save(_eventCaptor.capture());
    _eventCaptor
        .getAllValues()
        .forEach(
            e ->
                LOG.info(
                    "Captured REST request {} {} {}",
                    e.getRequestId(),
                    e.getHttpRequestDetails().getRequestUri(),
                    e.getResponseCode()));
    assertEquals(500, _eventCaptor.getValue().getResponseCode());
  }

  @Test
  void restQuery_auditFailure_noDataReturned() {
    when(_auditRepo.save(_eventCaptor.capture())).thenThrow(HibernateException.class);
    HttpEntity<JsonNode> requestEntity = new HttpEntity<JsonNode>(makeVerifyLinkArgs());
    // also not quite how we would draw it up
    assertThrows(
        RestClientException.class,
        () ->
            _restTemplate.exchange(
                "/pxp/link/verify", HttpMethod.PUT, requestEntity, String.class));
    /*    LOG.info("Got response {} after audit failure", resp);
    assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, resp.getStatusCode());
    assertEquals("", resp.getBody()); */
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
