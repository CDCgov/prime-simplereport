package gov.cdc.usds.simplereport.api.graphql;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.MultiplexResultInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.sms.SmsService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
  private List<MultiplexResultInput> positiveCovidResult;
  private List<MultiplexResultInput> negativeCovidResult;

  @BeforeEach
  public void init() {
    _org = _orgService.getCurrentOrganizationNoCache();
    _site = _orgService.getFacilities(_org).get(0);
    _secondSite = _orgService.getFacilities(_org).get(1);

    positiveCovidResult =
        List.of(new MultiplexResultInput(_diseaseService.covid().getName(), TestResult.POSITIVE));
    negativeCovidResult =
        List.of(new MultiplexResultInput(_diseaseService.covid().getName(), TestResult.NEGATIVE));
  }

  @Test
  void fetchTestResults() {
    Person p = _dataFactory.createFullPerson(_org);
    _dataFactory.createTestEvent(p, _site);
    _dataFactory.createTestEvent(p, _site);
    _dataFactory.createTestEvent(p, _site);

    HashMap<String, Object> variables = getFacilityScopedArguments();
    ArrayNode testResults = fetchTestResults(variables);

    assertEquals(3, testResults.size());
    assertNotNull(testResults.get(0).get("patientLink"));
  }

  @Test
  void fetchOrganizationTestResults_adminUser() {
    useOrgAdmin();

    Person p = _dataFactory.createFullPerson(_org);
    _dataFactory.createTestEvent(p, _site);
    _dataFactory.createTestEvent(p, _site);
    _dataFactory.createTestEvent(p, _site);

    HashMap<String, Object> variables = getFacilityScopedArguments();
    variables.put("facilityId", null);
    ArrayNode testResults = fetchTestResults(variables);

    testResults = fetchTestResults(variables);
    assertEquals(3, testResults.size());
  }

  @Test
  void fetchOrganizationTestResults__orgUser_failure() {
    HashMap<String, Object> variables = getFacilityScopedArguments();
    variables.put("facilityId", null);
    fetchTestResultsWithError(variables, ACCESS_ERROR);
  }

  @Test
  void submitTestResult() {
    Person p = _dataFactory.createFullPerson(_org);
    DeviceType d = _site.getDefaultDeviceType();
    SpecimenType s = _site.getDefaultSpecimenType();
    _dataFactory.createTestOrder(p, _site);
    String dateTested = "2020-12-31T14:30:30.001Z";

    Map<String, Object> variables =
        Map.of(
            "deviceId",
            d.getInternalId().toString(),
            "specimenId",
            s.getInternalId().toString(),
            "patientId",
            p.getInternalId().toString(),
            "results",
            negativeCovidResult,
            "dateTested",
            dateTested);
    submitQueueItem(variables, Optional.empty());

    ArrayNode testResults = fetchTestResults(getFacilityScopedArguments());

    assertTrue(testResults.has(0), "Has at least one submitted test result=");
    assertEquals(testResults.get(0).get("dateTested").asText(), dateTested);
  }

  @Test
  void submitAndFetchMultiplexResult() {
    Person p = _dataFactory.createFullPerson(_org);
    DeviceType d = _site.getDefaultDeviceType();
    SpecimenType s = _site.getDefaultSpecimenType();
    Map<String, Boolean> symptoms = Map.of("25064002", true);
    LocalDate symptomOnsetDate = LocalDate.of(2020, 9, 15);
    _dataFactory.createTestOrder(
        p, _site, new AskOnEntrySurvey("77386006", symptoms, false, symptomOnsetDate));
    String dateTested = "2020-12-31T14:30:30.001Z";

    List<MultiplexResultInput> results = new ArrayList<>();
    results.add(new MultiplexResultInput(_diseaseService.covid().getName(), TestResult.NEGATIVE));
    results.add(new MultiplexResultInput(_diseaseService.fluA().getName(), TestResult.POSITIVE));
    results.add(
        new MultiplexResultInput(_diseaseService.fluB().getName(), TestResult.UNDETERMINED));

    Map<String, Object> variables =
        Map.of(
            "deviceId",
            d.getInternalId().toString(),
            "specimenId",
            s.getInternalId().toString(),
            "patientId",
            p.getInternalId().toString(),
            "results",
            results,
            "dateTested",
            dateTested);
    submitQueueItem(variables, Optional.empty());

    ArrayNode testResults = fetchTestResultsMultiplex(getFacilityScopedArguments());

    assertTrue(testResults.has(0), "Has at least one submitted test result=");
    assertEquals(dateTested, testResults.get(0).get("dateTested").asText());
    assertEquals("{\"25064002\":\"true\"}", testResults.get(0).get("symptoms").asText());
    assertEquals("false", testResults.get(0).get("noSymptoms").asText());
    assertEquals("77386006", testResults.get(0).get("pregnancy").asText());
    assertEquals("2020-09-15", testResults.get(0).get("symptomOnset").asText());
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
  void testResultOperations_standardUser_successDependsOnFacilityAccess() {
    Person p1 = _dataFactory.createFullPerson(_org);
    Person p2 = _dataFactory.createMinimalPerson(_org, _site);
    DeviceType d = _site.getDefaultDeviceType();
    SpecimenType s = _site.getDefaultSpecimenType();
    Map<String, Boolean> symptoms = Map.of("25064002", true);
    LocalDate symptomOnsetDate = LocalDate.of(2020, 9, 15);

    _dataFactory.createTestOrder(
        p1, _site, new AskOnEntrySurvey("77386006", symptoms, false, symptomOnsetDate));
    _dataFactory.createTestOrder(
        p2, _site, new AskOnEntrySurvey("77386006", symptoms, false, symptomOnsetDate));
    String dateTested = "2020-12-31T14:30:30.001Z";

    // The test default standard user is configured to access _site by default,
    // so we need to remove access to establish a baseline in this test
    updateSelfPrivileges(Role.USER, false, Set.of());
    Map<String, Object> submitP1Variables =
        Map.of(
            "deviceId",
            d.getInternalId().toString(),
            "specimenId",
            s.getInternalId().toString(),
            "patientId",
            p1.getInternalId().toString(),
            "results",
            negativeCovidResult,
            "dateTested",
            dateTested);
    Map<String, Object> submitP2Variables =
        Map.of(
            "deviceId",
            d.getInternalId().toString(),
            "specimenId",
            s.getInternalId().toString(),
            "patientId",
            p2.getInternalId().toString(),
            "results",
            negativeCovidResult,
            "dateTested",
            dateTested);

    submitQueueItem(submitP1Variables, Optional.of(ACCESS_ERROR));
    submitQueueItem(submitP2Variables, Optional.of(ACCESS_ERROR));

    updateSelfPrivileges(Role.USER, false, Set.of(_site.getInternalId()));
    submitQueueItem(submitP1Variables, Optional.empty());
    submitQueueItem(submitP2Variables, Optional.empty());

    updateSelfPrivileges(Role.USER, false, Set.of());
    Map<String, Object> fetchVariables = getFacilityScopedArguments();
    fetchTestResultsWithError(fetchVariables, ACCESS_ERROR);

    updateSelfPrivileges(Role.USER, true, Set.of());
    ArrayNode testResults = fetchTestResults(fetchVariables);
    assertEquals(2, testResults.size());
    UUID t1Id = UUID.fromString(testResults.get(0).get("internalId").asText());
    UUID t2Id = UUID.fromString(testResults.get(1).get("internalId").asText());

    updateSelfPrivileges(Role.USER, false, Set.of());

    Map<String, Object> correctT1Variables =
        Map.of("id", t1Id.toString(), "reason", "nobody's perfect");

    Map<String, Object> correctT2Variables =
        Map.of("id", t2Id.toString(), "reason", "nobody's perfect");

    correctTest(correctT1Variables, Optional.of(ACCESS_ERROR));
    correctTest(correctT2Variables, Optional.of(ACCESS_ERROR));

    updateSelfPrivileges(Role.USER, false, Set.of(_site.getInternalId()));
    correctTest(correctT1Variables, Optional.empty());
    correctTest(correctT2Variables, Optional.empty());

    updateSelfPrivileges(Role.USER, false, Set.of());
    Map<String, Object> fetchT1Variables = Map.of("id", t1Id.toString());
    Map<String, Object> fetchT2Variables = Map.of("id", t2Id.toString());

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
    SpecimenType s = _site.getDefaultSpecimenType();

    DeviceType secondSiteDevice = _secondSite.getDefaultDeviceType();
    SpecimenType secondSiteSpecimen = _secondSite.getDefaultSpecimenType();

    _dataFactory.createTestOrder(p1, _site);
    _dataFactory.createTestOrder(p2, _site);
    _dataFactory.createTestOrder(p3, _secondSite);
    _dataFactory.createTestOrder(p4, _secondSite);
    String dateTested = "2020-12-31T14:30:30.001Z";

    Map<String, Object> submitP1Variables =
        Map.of(
            "deviceId",
            d.getInternalId().toString(),
            "specimenId",
            s.getInternalId().toString(),
            "patientId",
            p1.getInternalId().toString(),
            "results",
            positiveCovidResult,
            "dateTested",
            dateTested);
    Map<String, Object> submitP2Variables =
        Map.of(
            "deviceId",
            d.getInternalId().toString(),
            "specimenId",
            s.getInternalId().toString(),
            "patientId",
            p2.getInternalId().toString(),
            "results",
            negativeCovidResult,
            "dateTested",
            dateTested);
    Map<String, Object> submitP3Variables =
        Map.of(
            "deviceId",
            secondSiteDevice.getInternalId().toString(),
            "specimenId",
            secondSiteSpecimen.getInternalId().toString(),
            "patientId",
            p3.getInternalId().toString(),
            "results",
            negativeCovidResult,
            "dateTested",
            dateTested);
    Map<String, Object> submitP4Variables =
        Map.of(
            "deviceId",
            secondSiteDevice.getInternalId().toString(),
            "specimenId",
            secondSiteSpecimen.getInternalId().toString(),
            "patientId",
            p4.getInternalId().toString(),
            "results",
            negativeCovidResult,
            "dateTested",
            dateTested);
    submitQueueItem(submitP1Variables, Optional.empty());
    submitQueueItem(submitP2Variables, Optional.empty());
    submitQueueItem(submitP3Variables, Optional.empty());
    submitQueueItem(submitP4Variables, Optional.empty());

    String startDate = "2020-01-01";
    String endDate = new SimpleDateFormat("yyyy-MM-dd").format(Date.from(Instant.now()));

    Map<String, Object> variables =
        Map.of(
            "startDate", startDate,
            "endDate", endDate);

    ObjectNode result =
        runQuery(
            "organization-level-metrics", "GetOrganizationLevelDashboardMetrics", variables, null);

    JsonNode metrics = result.get("organizationLevelDashboardMetrics");
    assertEquals(1L, metrics.get("organizationPositiveTestCount").asLong());
    assertEquals(3L, metrics.get("organizationNegativeTestCount").asLong());
    assertEquals(4L, metrics.get("organizationTotalTestCount").asLong());
    assertEquals(2, metrics.get("facilityMetrics").size());
  }

  @Test
  void getOrganizationLevelDashboardMetrics_orgUser_failure() {
    String startDate = "2020-01-01";
    String endDate = new SimpleDateFormat("yyyy-MM-dd").format(Date.from(Instant.now()));

    Map<String, Object> variables =
        Map.of(
            "startDate", startDate,
            "endDate", endDate);
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
    SpecimenType s = _site.getDefaultSpecimenType();
    _dataFactory.createTestOrder(p1, _site);
    _dataFactory.createTestOrder(p2, _site);
    String dateTested = "2020-12-31T14:30:30.001Z";

    Map<String, Object> submitP1Variables =
        Map.of(
            "deviceId",
            d.getInternalId().toString(),
            "specimenId",
            s.getInternalId().toString(),
            "patientId",
            p1.getInternalId().toString(),
            "results",
            positiveCovidResult,
            "dateTested",
            dateTested);
    Map<String, Object> submitP2Variables =
        Map.of(
            "deviceId",
            d.getInternalId().toString(),
            "specimenId",
            s.getInternalId().toString(),
            "patientId",
            p2.getInternalId().toString(),
            "results",
            negativeCovidResult,
            "dateTested",
            dateTested);
    submitQueueItem(submitP1Variables, Optional.empty());
    submitQueueItem(submitP2Variables, Optional.empty());

    String startDate = "2020-01-01";
    String endDate = new SimpleDateFormat("yyyy-MM-dd").format(Date.from(Instant.now()));

    useOrgAdmin();

    Map<String, Object> variables =
        Map.of(
            "startDate", startDate,
            "endDate", endDate);

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

    Map<String, Object> variables =
        Map.of(
            "startDate", startDate,
            "endDate", endDate);

    useOrgUser();

    runQuery(
        "dashboard-metrics",
        "GetTopLevelDashboardMetrics",
        variables,
        "Current user does not have permission to request [/topLevelDashboardMetrics]");
  }

  private HashMap<String, Object> getFacilityScopedArguments() {
    return new HashMap<>(Map.of("facilityId", _site.getInternalId().toString()));
  }

  private ObjectNode submitQueueItem(
      Map<String, Object> variables, Optional<String> expectedError) {
    return runQuery("submit-queue-item", variables, expectedError.orElse(null));
  }

  private ArrayNode fetchTestResults(Map<String, Object> variables) {
    return (ArrayNode)
        runQuery("test-results-with-count-query", variables).get("testResultsPage").get("content");
  }

  private ArrayNode fetchTestResultsMultiplex(Map<String, Object> variables) {
    return (ArrayNode)
        runQuery("test-results-with-count-multiplex-query", variables)
            .get("testResultsPage")
            .get("content");
  }

  private void fetchTestResultsWithError(Map<String, Object> variables, String expectedError) {
    runQuery("test-results-with-count-query", variables, expectedError);
  }

  private void fetchTestResult(Map<String, Object> variables, Optional<String> expectedError) {
    runQuery("test-result-query", variables, expectedError.orElse(null));
  }

  private ObjectNode correctTest(Map<String, Object> variables, Optional<String> expectedError) {
    return runQuery("correct-test-result-mutation", variables, expectedError.orElse(null));
  }
}
