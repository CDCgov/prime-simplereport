package gov.cdc.usds.simplereport.api.graphql;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

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
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.MultiplexResultInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.TestOrderService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.io.IOException;
import java.util.ArrayList;
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
@WithSimpleReportStandardUser // this is ridiculously sneaky
class QueueManagementTest extends BaseGraphqlTest {

  private static final String QUERY = "queue-dates-query";

  @Autowired private TestDataFactory _dataFactory;
  @Autowired private OrganizationService _orgService;
  @Autowired private TestOrderService _testOrderService;
  @MockBean private CurrentTenantDataAccessContextHolder _tenantDataAccessContextHolder;

  private Organization _org;
  private Facility _site;

  private List<MultiplexResultInput> positiveCovidResult;

  @BeforeEach
  public void init() {
    _org = _orgService.getCurrentOrganizationNoCache();
    _site = _orgService.getFacilities(_org).get(0);
    _site.setDefaultDeviceTypeSpecimenType(
        _dataFactory.getGenericDevice(), _dataFactory.getGenericSpecimen());
    positiveCovidResult =
        List.of(new MultiplexResultInput(_diseaseService.covid().getName(), TestResult.POSITIVE));
  }

  @Test
  void enqueueOnePatient() throws Exception {
    Person p = _dataFactory.createFullPerson(_org);
    String personId = p.getInternalId().toString();
    Map<String, Object> variables = getFacilityScopedArguments();
    variables.put("id", personId);
    variables.put("symptomOnsetDate", "2020-11-30");
    performEnqueueMutation(variables, Optional.empty());
    ArrayNode queueData = fetchQueue();
    ObjectNode facilityData = fetchActiveFacility();
    assertEquals(1, queueData.size());
    JsonNode queueEntry = queueData.get(0);

    // assert on queue data
    assertNotNull(queueEntry.get("internalId").asText());
    assertNotNull(queueEntry.get("dateAdded").asText());
    assertNotNull(queueEntry.get("symptoms").asText());
    assertEquals("2020-11-30", queueEntry.get("symptomOnset").asText());
    assertEquals("ORIGINAL", queueEntry.get("correctionStatus").asText());

    assertNotNull(queueEntry.get("deviceType").get("internalId").asText());
    assertEquals("LumiraDX", queueEntry.get("deviceType").get("name").asText());
    assertEquals(
        "LumiraDx SARS-CoV-2 Ag Test*", queueEntry.get("deviceType").get("model").asText());
    assertEquals("15", queueEntry.get("deviceType").get("testLength").asText());

    assertNotNull(queueEntry.get("specimenType").get("internalId").asText());
    assertEquals("Swab of the Nose", queueEntry.get("specimenType").get("name").asText());
    assertEquals("445297001", queueEntry.get("specimenType").get("typeCode").asText());

    assertNotNull(queueEntry.get("patient").get("internalId").asText());
    assertEquals("1899-05-10", queueEntry.get("patient").get("birthDate").asText());

    // assert on active facility data
    assertNotNull(facilityData.get("id").asText());
    assertEquals("Injection Site", facilityData.get("name").asText());
    assertEquals(2, facilityData.get("deviceTypes").size());

    JsonNode firstDevice = facilityData.get("deviceTypes").get(0);
    JsonNode secondDevice = facilityData.get("deviceTypes").get(1);

    JsonNode sofia =
        firstDevice.get("name").asText().equals("Quidel Sofia 2") ? firstDevice : secondDevice;
    JsonNode lumiraDX =
        firstDevice.get("name").asText().equals("LumiraDX") ? firstDevice : secondDevice;
    assertEquals("15", sofia.get("testLength").asText());
    assertEquals("15", lumiraDX.get("testLength").asText());
    assertNotNull(sofia.get("swabTypes"));
    assertNotNull(lumiraDX.get("swabTypes"));
  }

  @Test
  void updateItemInQueue() throws Exception {
    Person p = _dataFactory.createFullPerson(_org);
    TestOrder o = _dataFactory.createTestOrder(p, _site);
    UUID orderId = o.getInternalId();
    DeviceType d = _dataFactory.getGenericDevice();
    String deviceId = d.getInternalId().toString();
    SpecimenType specimen = _dataFactory.getGenericSpecimen();
    String specimenId = specimen.getInternalId().toString();
    String dateTested = "2020-12-31T14:30:30Z";
    Map<String, Object> variables =
        Map.of(
            "id", orderId.toString(),
            "deviceId", deviceId,
            "specimenId", specimenId,
            "results", positiveCovidResult,
            "dateTested", dateTested);

    performQueueUpdateMutation(variables, Optional.empty());

    TestOrder updatedTestOrder = _testOrderService.getTestOrder(_org, orderId);
    assertEquals(
        deviceId, updatedTestOrder.getDeviceType().getInternalId().toString(), "device type ID");
    assertEquals(
        TestResult.POSITIVE,
        updatedTestOrder.getResults().stream().findFirst().get().getTestResult());
    assertNull(updatedTestOrder.getTestEvent());

    ObjectNode singleQueueEntry = (ObjectNode) fetchQueue().get(0);
    assertEquals(orderId.toString(), singleQueueEntry.get("internalId").asText());
    assertEquals(
        p.getInternalId().toString(), singleQueueEntry.path("patient").path("internalId").asText());
    assertEquals(dateTested, singleQueueEntry.path("dateTested").asText());
  }

  @Test
  void updateQueueItemMultiplex() throws Exception {
    Person p = _dataFactory.createFullPerson(_org);
    TestOrder o = _dataFactory.createTestOrder(p, _site);
    UUID orderId = o.getInternalId();
    DeviceType d = _dataFactory.getGenericDevice();
    SpecimenType specimen = _dataFactory.getGenericSpecimen();
    String deviceId = d.getInternalId().toString();
    String specimenId = specimen.getInternalId().toString();
    String dateTested = "2020-12-31T14:30:30Z";
    List<MultiplexResultInput> results = new ArrayList<>();
    results.add(new MultiplexResultInput(_diseaseService.covid().getName(), TestResult.POSITIVE));
    results.add(new MultiplexResultInput(_diseaseService.fluA().getName(), TestResult.POSITIVE));
    results.add(new MultiplexResultInput(_diseaseService.fluB().getName(), TestResult.POSITIVE));
    Map<String, Object> variables =
        Map.of(
            "id", orderId.toString(),
            "deviceId", deviceId,
            "specimenId", specimenId,
            "results", results,
            "dateTested", dateTested);

    performQueueUpdateMutation(variables, Optional.empty());

    TestOrder updatedTestOrder = _testOrderService.getTestOrder(_org, orderId);
    assertEquals(
        deviceId, updatedTestOrder.getDeviceType().getInternalId().toString(), "device type ID");
    assertEquals(
        TestResult.POSITIVE,
        updatedTestOrder.getResults().stream().findFirst().get().getTestResult());
    updatedTestOrder
        .getResults()
        .forEach(result -> assertEquals(TestResult.POSITIVE, result.getTestResult()));
    assertNull(updatedTestOrder.getTestEvent());

    ObjectNode singleQueueEntry = (ObjectNode) fetchQueue().get(0);
    assertEquals(orderId.toString(), singleQueueEntry.get("internalId").asText());
    assertEquals(
        p.getInternalId().toString(), singleQueueEntry.path("patient").path("internalId").asText());
    assertEquals(dateTested, singleQueueEntry.path("dateTested").asText());
  }

  @Test
  void enqueueOnePatientIsoDate() throws Exception {
    Person p = _dataFactory.createFullPerson(_org);
    String personId = p.getInternalId().toString();
    HashMap<String, Object> variables = getFacilityScopedArguments();
    variables.put("id", personId);
    variables.put("symptomOnsetDate", "2020-11-30");
    performEnqueueMutation(variables, Optional.empty());
    ArrayNode queueData = fetchQueue();
    assertEquals(1, queueData.size());
    JsonNode queueEntry = queueData.get(0);
    String symptomOnset = queueEntry.get("symptomOnset").asText();
    assertEquals("2020-11-30", symptomOnset);
  }

  @Test
  void queueOperations_standardUser_successDependsOnFacilityAccess() throws Exception {
    Person p = _dataFactory.createMinimalPerson(_org, _site);
    UUID personId = p.getInternalId();
    DeviceType d = _dataFactory.getGenericDevice();
    SpecimenType s = _dataFactory.getGenericSpecimen();
    UUID deviceId = d.getInternalId();
    UUID specimenId = s.getInternalId();
    String dateTested = "2020-12-31T14:30:30Z";

    // The test default standard user is configured to access _site by default,
    // so we need to remove access to establish a baseline in this test
    updateSelfPrivileges(Role.USER, false, Set.of());
    HashMap<String, Object> enqueueVariables = getFacilityScopedArguments();
    enqueueVariables.put("id", personId.toString());
    enqueueVariables.put("symptomOnsetDate", "2020-11-30");
    performEnqueueMutation(enqueueVariables, Optional.of(ACCESS_ERROR));
    updateSelfPrivileges(Role.USER, false, Set.of(_site.getInternalId()));
    performEnqueueMutation(enqueueVariables, Optional.empty());

    ArrayNode queueData = fetchQueue();
    assertEquals(1, queueData.size());
    JsonNode queueEntry = queueData.get(0);
    UUID orderId = UUID.fromString(queueEntry.get("internalId").asText());
    updateSelfPrivileges(Role.USER, false, Set.of());
    Map<String, Object> updateVariables =
        Map.of(
            "id",
            orderId.toString(),
            "deviceId",
            deviceId.toString(),
            "specimenId",
            specimenId.toString(),
            "results",
            positiveCovidResult,
            "dateTested",
            dateTested);
    performQueueUpdateMutation(updateVariables, Optional.of(ACCESS_ERROR));
    updateSelfPrivileges(Role.USER, false, Set.of(_site.getInternalId()));
    performQueueUpdateMutation(updateVariables, Optional.empty());
    updateSelfPrivileges(Role.USER, true, Set.of());
    performQueueUpdateMutation(updateVariables, Optional.empty());

    updateSelfPrivileges(Role.USER, false, Set.of());
    // updateTimeOfTestQuestions uses the exact same security restrictions
    Map<String, Object> removeVariables = Map.of("patientId", personId.toString());
    performRemoveFromQueueMutation(removeVariables, Optional.of(ACCESS_ERROR));
    updateSelfPrivileges(Role.USER, false, Set.of(_site.getInternalId()));
    performRemoveFromQueueMutation(removeVariables, Optional.empty());

    updateSelfPrivileges(Role.USER, false, Set.of());
    fetchQueueWithError(ACCESS_ERROR);
    updateSelfPrivileges(Role.USER, true, Set.of());
    fetchQueue();
    updateSelfPrivileges(Role.USER, false, Set.of(_site.getInternalId()));
    fetchQueue();
  }

  @Test
  void addPatientsToQueue_getQueue_NPlusOne() throws Exception {
    Person p1 = _dataFactory.createFullPerson(_org);
    String personId1 = p1.getInternalId().toString();
    HashMap<String, Object> variables = getFacilityScopedArguments();
    variables.put("id", personId1);
    variables.put("symptomOnsetDate", "2020-11-30");
    performEnqueueMutation(variables, Optional.empty());

    // get the first query count
    long startQueryCount = hibernateQueryInterceptor.getQueryCount();
    fetchQueue();
    long firstRunCount = hibernateQueryInterceptor.getQueryCount() - startQueryCount;

    for (int ii = 0; ii < 10; ii++) {
      // add more tests to the queue. (which needs more patients)
      Person p = _dataFactory.createFullPerson(_org);
      String personId = p.getInternalId().toString();
      variables = getFacilityScopedArguments();
      variables.put("id", personId);
      variables.put("symptomOnsetDate", "2020-11-30");
      performEnqueueMutation(variables, Optional.empty());
    }

    startQueryCount = hibernateQueryInterceptor.getQueryCount();
    fetchQueue();
    long secondRunCount = hibernateQueryInterceptor.getQueryCount() - startQueryCount;
    assertEquals(firstRunCount, secondRunCount);
  }

  private HashMap<String, Object> getFacilityScopedArguments() {
    return new HashMap<>(Map.of("facilityId", _site.getInternalId().toString()));
  }

  private ArrayNode fetchQueue() {
    return (ArrayNode) runQuery(QUERY, getFacilityScopedArguments()).get("queue");
  }

  private ObjectNode fetchActiveFacility() {
    return (ObjectNode) runQuery(QUERY, getFacilityScopedArguments()).get("facility");
  }

  private void fetchQueueWithError(String expectedError) {
    runQuery(QUERY, getFacilityScopedArguments(), expectedError);
  }

  private void performEnqueueMutation(Map<String, Object> variables, Optional<String> expectedError)
      throws IOException {
    runQuery("add-to-queue", variables, expectedError.orElse(null));
  }

  private void performRemoveFromQueueMutation(
      Map<String, Object> variables, Optional<String> expectedError) throws IOException {
    runQuery("remove-from-queue", variables, expectedError.orElse(null));
  }

  private void performQueueUpdateMutation(
      Map<String, Object> variables, Optional<String> expectedError) throws IOException {
    runQuery("edit-queue-item", variables, expectedError.orElse(null));
  }
}
