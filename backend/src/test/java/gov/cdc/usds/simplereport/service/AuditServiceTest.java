package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.verify;

import com.fasterxml.jackson.core.JsonProcessingException;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ConsoleApiAuditEvent;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.GraphQlInputs;
import gov.cdc.usds.simplereport.db.model.auxiliary.HttpRequestDetails;
import gov.cdc.usds.simplereport.logging.GraphqlQueryState;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportEntryOnlyUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

class AuditServiceTest extends BaseServiceTest<AuditService> {

  @Autowired private ApiUserService _userService;
  @Autowired private TestDataFactory testDataFactory;
  @MockitoBean AuditLoggerService auditLoggerServiceSpy;
  @Captor private ArgumentCaptor<ConsoleApiAuditEvent> auditLogCaptor;

  @Test
  @WithSimpleReportEntryOnlyUser
  void smokeTestGraphqlAudit() throws JsonProcessingException {
    initSampleData(); // need to have the org exist
    UserInfo userInfo = _userService.getCurrentUserInfo();
    GraphqlQueryState state = new GraphqlQueryState();
    state.setRequestId("ABCDE");

    LinkedHashMap<String, String> covid19Result = new LinkedHashMap<>();
    covid19Result.put("diseaseName", "COVID-19");
    covid19Result.put("testResult", "POSITIVE");
    LinkedHashMap<String, String> covid19RedactedResult = new LinkedHashMap<>();
    covid19RedactedResult.put("diseaseName", "redacted");
    covid19RedactedResult.put("testResult", "redacted");
    LinkedHashMap<String, String> fluAResult = new LinkedHashMap<>();
    fluAResult.put("diseaseName", "redacted");
    fluAResult.put("testResult", "redacted");
    LinkedHashMap<String, String> fluARedactedResult = new LinkedHashMap<>();
    fluARedactedResult.put("diseaseName", "redacted");
    fluARedactedResult.put("testResult", "redacted");
    LinkedHashMap<String, String> fluBResult = new LinkedHashMap<>();
    fluBResult.put("diseaseName", "Flu B");
    fluBResult.put("testResult", "NEGATIVE");
    LinkedHashMap<String, String> fluBRedactedResult = new LinkedHashMap<>();
    fluBRedactedResult.put("diseaseName", "redacted");
    fluBRedactedResult.put("testResult", "redacted");

    List<LinkedHashMap<String, String>> multiplexResults =
        List.of(covid19Result, fluAResult, fluBResult);
    List<LinkedHashMap<String, String>> redactedMultiplexResults =
        List.of(covid19RedactedResult, fluARedactedResult, fluBRedactedResult);

    int[] unredactablePrimitiveArray = new int[3];
    TestEvent[] redactableTestEventArray = new TestEvent[3];
    Organization org = testDataFactory.saveValidOrganization();
    Facility facility = testDataFactory.createValidFacility(org);
    Person patient = testDataFactory.createFullPerson(org);
    TestOrder testOrder = testDataFactory.createTestOrder(patient, facility);
    redactableTestEventArray[0] = new TestEvent(testOrder);

    state.setGraphqlDetails(
        new GraphQlInputs(
            "A",
            "B",
            Map.of(
                "disease",
                "COVID-19",
                "non-pii key",
                "non-pii value",
                "results",
                multiplexResults,
                "unredactablePrimitiveArray",
                unredactablePrimitiveArray,
                "redactableTestEventArray",
                redactableTestEventArray)));
    state.setHttpDetails(
        new HttpRequestDetails(
            "foo.com",
            "1.2.3.4",
            List.of("127.0.0.1:1", "10.0.0.0:2"),
            "ftp",
            "simplereport.name",
            "/fuzz"));
    _service.logGraphQlEvent(
        state,
        List.of(),
        userInfo.getWrapped(),
        userInfo.getPermissions(),
        userInfo.getIsAdmin(),
        userInfo.getOrganization().orElse(null));

    verify(auditLoggerServiceSpy, atLeastOnce()).logEvent(auditLogCaptor.capture());
    ConsoleApiAuditEvent saved = auditLogCaptor.getValue();
    Map<String, Object> graphQlVariables = saved.getGraphqlQueryDetails().getVariables();

    assertEquals(1L, auditLogCaptor.getAllValues().size());
    assertEquals("ABCDE", saved.getRequestId());
    assertEquals("ftp", saved.getHttpRequestDetails().getForwardedProtocol());
    assertEquals("A", saved.getGraphqlQueryDetails().getOperationName());
    assertEquals(
        Map.of(
            "disease",
            "redacted",
            "results",
            redactedMultiplexResults,
            "unredactablePrimitiveArray",
            unredactablePrimitiveArray,
            "redactableTestEventArray",
            redactableTestEventArray,
            "non-pii key",
            "non-pii value"),
        graphQlVariables);

    TestEvent[] redactableTestEventArrayResult =
        (TestEvent[]) graphQlVariables.get("redactableTestEventArray");
    assertEquals("redacted", redactableTestEventArrayResult[0].getPatientData().getCountry());
    assertEquals("redacted", redactableTestEventArrayResult[0].getPatientData().getRace());
    assertEquals("redacted", redactableTestEventArrayResult[0].getPatientData().getLookupId());
    assertEquals(
        List.of(
                UserPermission.SEARCH_PATIENTS,
                UserPermission.START_TEST,
                UserPermission.SUBMIT_TEST,
                UserPermission.UPDATE_TEST)
            .stream()
            .map(Enum::name)
            .collect(Collectors.toList()),
        saved.getUserPermissions());
  }

  @Test
  void anonymousRequestAuditSaved() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    _service.logAnonymousRestEvent("abc", request, HttpStatus.OK.value());

    verify(auditLoggerServiceSpy, atLeastOnce()).logEvent(auditLogCaptor.capture());
    assertEquals(1L, auditLogCaptor.getAllValues().size());
  }
}
