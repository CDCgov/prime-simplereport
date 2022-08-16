package gov.cdc.usds.simplereport.api.graphql;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.MultiplexResultInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.sms.SmsService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
@WithSimpleReportStandardUser // hackedy hack
class TestResultTest extends BaseGraphqlTest {

  @Autowired private TestDataFactory _dataFactory;
  @Autowired private OrganizationService _orgService;
  @MockBean private SmsService _smsService;
  @MockBean private CurrentTenantDataAccessContextHolder _tenantDataAccessContextHolder;

  private Organization _org;
  private Facility _site;
  private Facility _secondSite;

  @BeforeEach
  public void init() {
    _org = _orgService.getCurrentOrganizationNoCache();
    _site = _orgService.getFacilities(_org).get(0);
    _secondSite = _orgService.getFacilities(_org).get(1);
  }

  @Test
  void fetchTestResults() throws Exception {
    Person p = _dataFactory.createFullPerson(_org);
    _dataFactory.createTestEvent(p, _site);
    _dataFactory.createTestEvent(p, _site);
    _dataFactory.createTestEvent(p, _site);

    ObjectNode variables = getFacilityScopedArguments();
    ArrayNode testResults = fetchTestResults(variables);
    assertEquals(3, testResults.size());
    assertEquals(
        "SARS-CoV+SARS-CoV-2 (COVID-19) Ag [Presence] in Respiratory specimen by Rapid immunoassay",
        testResults.get(0).get("testPerformed").get("name").asText());

    variables.put("nameType", "short");
    testResults = fetchTestResults(variables);
    assertEquals(3, testResults.size());
    assertEquals(
        "SARS-CoV+SARS-CoV-2 Ag Resp Ql IA.rapid",
        testResults.get(0).get("testPerformed").get("name").asText());
    assertNotNull(testResults.get(0).get("patientLink"));
  }

  @Test
  void submitTestResult() throws Exception {
    Person p = _dataFactory.createFullPerson(_org);
    DeviceType d = _site.getDefaultDeviceType();
    _dataFactory.createTestOrder(p, _site);
    String dateTested = "2020-12-31T14:30:30.001Z";

    ObjectNode variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("deviceId", d.getInternalId().toString())
            .put("patientId", p.getInternalId().toString())
            .put("result", TestResult.NEGATIVE.toString())
            .put("dateTested", dateTested);
    submitTestResult(variables, Optional.empty());

    ArrayNode testResults = fetchTestResults(getFacilityScopedArguments());

    assertTrue(testResults.has(0), "Has at least one submitted test result=");
    assertEquals(testResults.get(0).get("dateTested").asText(), dateTested);
  }

  @Test
  void submitAndFetchTestResultMultiplex() throws Exception {
    Person p = _dataFactory.createFullPerson(_org);
    DeviceType d = _site.getDefaultDeviceType();
    _dataFactory.createTestOrder(p, _site);
    String dateTested = "2020-12-31T14:30:30.001Z";

    List<MultiplexResultInput> results = new ArrayList<>();
    results.add(new MultiplexResultInput(_diseaseService.covid().getName(), TestResult.NEGATIVE));
    results.add(new MultiplexResultInput(_diseaseService.fluA().getName(), TestResult.POSITIVE));
    results.add(
        new MultiplexResultInput(_diseaseService.fluB().getName(), TestResult.UNDETERMINED));

    ObjectNode variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("deviceId", d.getInternalId().toString())
            .put("patientId", p.getInternalId().toString())
            .putPOJO("results", results)
            .put("dateTested", dateTested);
    submitTestResultMultiplex(variables, Optional.empty());

    ArrayNode testResults = fetchTestResultsMultiplex(getFacilityScopedArguments());

    assertTrue(testResults.has(0), "Has at least one submitted test result=");
    assertEquals(testResults.get(0).get("dateTested").asText(), dateTested);
    testResults
        .get(0)
        .get("results")
        .elements()
        .forEachRemaining(
            r -> {
              switch (r.get("disease").get("name").asText()) {
                case "COVID-19":
                  assertEquals(TestResult.NEGATIVE.toString(), r.get("testResult").asText());
                  break;
                case "Flu A":
                  assertEquals(TestResult.POSITIVE.toString(), r.get("testResult").asText());
                  break;
                case "Flu B":
                  assertEquals(TestResult.UNDETERMINED.toString(), r.get("testResult").asText());
                  break;
                default:
                  fail("Unexpected disease=" + r.get("disease").get("name").asText());
              }
            });
  }

  @Test
  void testResultOperations_standardUser_successDependsOnFacilityAccess() throws Exception {
    Person p1 = _dataFactory.createFullPerson(_org);
    Person p2 = _dataFactory.createMinimalPerson(_org, _site);
    DeviceType d = _site.getDefaultDeviceType();
    _dataFactory.createTestOrder(p1, _site);
    _dataFactory.createTestOrder(p2, _site);
    String dateTested = "2020-12-31T14:30:30.001Z";

    // The test default standard user is configured to access _site by default,
    // so we need to remove access to establish a baseline in this test
    updateSelfPrivileges(Role.USER, false, Set.of());
    ObjectNode submitP1Variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("deviceId", d.getInternalId().toString())
            .put("patientId", p1.getInternalId().toString())
            .put("result", TestResult.NEGATIVE.toString())
            .put("dateTested", dateTested);
    ObjectNode submitP2Variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("deviceId", d.getInternalId().toString())
            .put("patientId", p2.getInternalId().toString())
            .put("result", TestResult.NEGATIVE.toString())
            .put("dateTested", dateTested);
    submitTestResult(submitP1Variables, Optional.of(ACCESS_ERROR));
    submitTestResult(submitP2Variables, Optional.of(ACCESS_ERROR));

    updateSelfPrivileges(Role.USER, false, Set.of(_site.getInternalId()));
    submitTestResult(submitP1Variables, Optional.empty());
    submitTestResult(submitP2Variables, Optional.empty());

    updateSelfPrivileges(Role.USER, false, Set.of());
    ObjectNode fetchVariables = getFacilityScopedArguments();
    fetchTestResultsWithError(fetchVariables, ACCESS_ERROR);

    updateSelfPrivileges(Role.USER, true, Set.of());
    ArrayNode testResults = fetchTestResults(fetchVariables);
    assertEquals(2, testResults.size());
    UUID t1Id = UUID.fromString(testResults.get(0).get("internalId").asText());
    UUID t2Id = UUID.fromString(testResults.get(1).get("internalId").asText());

    updateSelfPrivileges(Role.USER, false, Set.of());
    ObjectNode correctT1Variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("id", t1Id.toString())
            .put("reason", "nobody's perfect");
    ObjectNode correctT2Variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("id", t2Id.toString())
            .put("reason", "nobody's perfect");
    correctTest(correctT1Variables, Optional.of(ACCESS_ERROR));
    correctTest(correctT2Variables, Optional.of(ACCESS_ERROR));

    updateSelfPrivileges(Role.USER, false, Set.of(_site.getInternalId()));
    correctTest(correctT1Variables, Optional.empty());
    correctTest(correctT2Variables, Optional.empty());

    updateSelfPrivileges(Role.USER, false, Set.of());
    ObjectNode fetchT1Variables = JsonNodeFactory.instance.objectNode().put("id", t1Id.toString());
    ObjectNode fetchT2Variables = JsonNodeFactory.instance.objectNode().put("id", t2Id.toString());
    fetchTestResult(fetchT1Variables, Optional.of(ACCESS_ERROR));
    fetchTestResult(fetchT2Variables, Optional.of(ACCESS_ERROR));

    updateSelfPrivileges(Role.USER, false, Set.of(_site.getInternalId()));
    fetchTestResult(fetchT1Variables, Optional.empty());
    fetchTestResult(fetchT2Variables, Optional.empty());
  }

  @Test
  void getOrganizationLevelDashboardMetrics_orgAdmin_success() {
    useOrgAdmin();

    Person p1 = _dataFactory.createFullPerson(_org);
    Person p2 = _dataFactory.createMinimalPerson(_org, _site);
    Person p3 = _dataFactory.createMinimalPerson(_org, _secondSite, "Carl", "A", "Scheffer", "");
    Person p4 =
        _dataFactory.createMinimalPerson(_org, _secondSite, "Lindsay", "L", "Wasserman", "");

    DeviceType d = _site.getDefaultDeviceType();
    DeviceType secondSiteDevice = _secondSite.getDefaultDeviceType();

    _dataFactory.createTestOrder(p1, _site);
    _dataFactory.createTestOrder(p2, _site);
    _dataFactory.createTestOrder(p3, _secondSite);
    _dataFactory.createTestOrder(p4, _secondSite);
    String dateTested = "2020-12-31T14:30:30.001Z";

    ObjectNode submitP1Variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("deviceId", d.getInternalId().toString())
            .put("patientId", p1.getInternalId().toString())
            .put("result", TestResult.POSITIVE.toString())
            .put("dateTested", dateTested);
    ObjectNode submitP2Variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("deviceId", d.getInternalId().toString())
            .put("patientId", p2.getInternalId().toString())
            .put("result", TestResult.NEGATIVE.toString())
            .put("dateTested", dateTested);
    ObjectNode submitP3Variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("deviceId", secondSiteDevice.getInternalId().toString())
            .put("patientId", p3.getInternalId().toString())
            .put("result", TestResult.NEGATIVE.toString())
            .put("dateTested", dateTested);
    ObjectNode submitP4Variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("deviceId", secondSiteDevice.getInternalId().toString())
            .put("patientId", p4.getInternalId().toString())
            .put("result", TestResult.NEGATIVE.toString())
            .put("dateTested", dateTested);
    submitTestResult(submitP1Variables, Optional.empty());
    submitTestResult(submitP2Variables, Optional.empty());
    submitTestResult(submitP3Variables, Optional.empty());
    submitTestResult(submitP4Variables, Optional.empty());

    String startDate = "2020-01-01";
    String endDate = new SimpleDateFormat("yyyy-MM-dd").format(Date.from(Instant.now()));

    ObjectNode variables =
        JsonNodeFactory.instance.objectNode().put("startDate", startDate).put("endDate", endDate);

    ObjectNode result =
        runQuery(
            "organization-level-metrics", "GetOrganizationLevelDashboardMetrics", variables, null);

    JsonNode metrics = result.get("organizationLevelDashboardMetrics");
    System.out.println(metrics);
    assertEquals(1L, metrics.get("organizationPositiveTestCount").asLong());
    assertEquals(3L, metrics.get("organizationNegativeTestCount").asLong());
    assertEquals(4L, metrics.get("organizationTotalTestCount").asLong());
    assertEquals(2, metrics.get("facilityMetrics").size());
  }

  @Test
  void getOrganizationLevelDashboardMetrics_orgUser_failure() {
    String startDate = "2020-01-01";
    String endDate = new SimpleDateFormat("yyyy-MM-dd").format(Date.from(Instant.now()));

    ObjectNode variables =
        JsonNodeFactory.instance.objectNode().put("startDate", startDate).put("endDate", endDate);

    useOrgUser();

    runQuery(
        "organization-level-metrics",
        "GetOrganizationLevelDashboardMetrics",
        variables,
        "Current user does not have permission to request [/organizationLevelDashboardMetrics]");
  }

  @Test
  void getTopLevelDashboardMetrics_orgAdmin_success() {
    Person p1 = _dataFactory.createFullPerson(_org);
    Person p2 = _dataFactory.createMinimalPerson(_org, _site);
    DeviceType d = _site.getDefaultDeviceType();
    _dataFactory.createTestOrder(p1, _site);
    _dataFactory.createTestOrder(p2, _site);
    String dateTested = "2020-12-31T14:30:30.001Z";

    ObjectNode submitP1Variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("deviceId", d.getInternalId().toString())
            .put("patientId", p1.getInternalId().toString())
            .put("result", TestResult.POSITIVE.toString())
            .put("dateTested", dateTested);
    ObjectNode submitP2Variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("deviceId", d.getInternalId().toString())
            .put("patientId", p2.getInternalId().toString())
            .put("result", TestResult.NEGATIVE.toString())
            .put("dateTested", dateTested);
    submitTestResult(submitP1Variables, Optional.empty());
    submitTestResult(submitP2Variables, Optional.empty());

    String startDate = "2020-01-01";
    String endDate = new SimpleDateFormat("yyyy-MM-dd").format(Date.from(Instant.now()));

    useOrgAdmin();

    ObjectNode variables =
        JsonNodeFactory.instance.objectNode().put("startDate", startDate).put("endDate", endDate);

    ObjectNode result =
        runQuery("dashboard-metrics", "GetTopLevelDashboardMetrics", variables, null);

    JsonNode metrics = result.get("topLevelDashboardMetrics");
    assertEquals(1L, metrics.get("positiveTestCount").asLong());
    assertEquals(2L, metrics.get("totalTestCount").asLong());
  }

  @Test
  void getTopLevelDashboardMetrics_orgUser_failure() {
    String startDate = "2020-01-01";
    String endDate = new SimpleDateFormat("yyyy-MM-dd").format(Date.from(Instant.now()));

    ObjectNode variables =
        JsonNodeFactory.instance.objectNode().put("startDate", startDate).put("endDate", endDate);

    useOrgUser();

    runQuery(
        "dashboard-metrics",
        "GetTopLevelDashboardMetrics",
        variables,
        "Current user does not have permission to request [/topLevelDashboardMetrics]");
  }

  private ObjectNode getFacilityScopedArguments() {
    return JsonNodeFactory.instance
        .objectNode()
        .put("facilityId", _site.getInternalId().toString());
  }

  private ObjectNode submitTestResult(ObjectNode variables, Optional<String> expectedError) {
    return runQuery("add-test-result-mutation", variables, expectedError.orElse(null));
  }

  private ObjectNode submitTestResultMultiplex(
      ObjectNode variables, Optional<String> expectedError) {
    return runQuery("add-test-result-multiplex-mutation", variables, expectedError.orElse(null));
  }

  private ArrayNode fetchTestResults(ObjectNode variables) {
    return (ArrayNode) runQuery("test-results-query", variables).get("testResults");
  }

  private ArrayNode fetchTestResultsMultiplex(ObjectNode variables) {
    return (ArrayNode) runQuery("test-results-multiplex-query", variables).get("testResults");
  }

  private void fetchTestResultsWithError(ObjectNode variables, String expectedError) {
    runQuery("test-results-query", variables, expectedError);
  }

  private void fetchTestResult(ObjectNode variables, Optional<String> expectedError) {
    runQuery("test-result-query", variables, expectedError.orElse(null));
  }

  private ObjectNode correctTest(ObjectNode variables, Optional<String> expectedError) {
    return runQuery("correct-test-result-mutation", variables, expectedError.orElse(null));
  }
}
