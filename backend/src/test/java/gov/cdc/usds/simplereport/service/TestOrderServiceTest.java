package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.fail;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportEntryOnlyUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@SuppressWarnings("checkstyle:MagicNumber")
class TestOrderServiceTest extends BaseServiceTest<TestOrderService> {

  @Autowired
  private OrganizationService _organizationService;
  @Autowired
  private PersonService _personService;
  @Autowired
  private TestDataFactory _dataFactory;

  private static final PersonName AMOS = new PersonName("Amos", null, "Quint", null);
  private static final PersonName BRAD = new PersonName("Bradley", "Z.", "Jones", "Jr.");
  private static final PersonName CHARLES = new PersonName("Charles", "Mathew", "Albemarle", "Sr.");
  private static final PersonName DEXTER = new PersonName("Dexter", null, "Jones", null);
  private static final PersonName ELIZABETH = new PersonName("Elizabeth", "Martha", "Merriwether", null);
  private static final PersonName FRANK = new PersonName("Frank", "Mathew", "Bones", "3");
  private static final PersonName GALE = new PersonName("Gale", "Mary", "Vittorio", "PhD");
  private static final PersonName HEINRICK = new PersonName("Heinrick", "Mark", "Silver", "III");
  private static final PersonName IAN = new PersonName("Ian", "Brou", "Rutter", null);
  private static final PersonName JANNELLE = new PersonName("Jannelle", "Martha", "Cromack", null);
  private static final PersonName KACEY = new PersonName("Kacey", "L", "Mathie", null);
  private static final PersonName LEELOO = new PersonName("Leeloo", "Dallas", "Multipass", null);
  private Facility _site;

  @BeforeEach
  void setupData() {
    initSampleData();
  }

  @Test
  void addPatientToQueue() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _personService.addPatient(null, "FOO", "Fred", null, "", "Sr.", LocalDate.of(1865, 12, 25),
        _dataFactory.getAddress(), "8883334444", PersonRole.STAFF, null, null, null, null, false, false);

    _service.addPatientToQueue(facility.getInternalId(), p, "", Collections.<String, Boolean>emptyMap(), false,
        LocalDate.of(1865, 12, 25), "", TestResult.POSITIVE, LocalDate.of(1865, 12, 25), false);

    List<TestOrder> queue = _service.getQueue(facility.getInternalId().toString());
    assertEquals(1, queue.size());
  }

  @Test
  @WithSimpleReportStandardUser
  void addTestResult() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _personService.addPatient(null, "FOO", "Fred", null, "", "Sr.", LocalDate.of(1865, 12, 25),
        _dataFactory.getAddress(), "8883334444", PersonRole.STAFF, null, null, null, null, false, false);
    _service.addPatientToQueue(facility.getInternalId(), p, "", Collections.<String, Boolean>emptyMap(), false,
        LocalDate.of(1865, 12, 25), "", TestResult.POSITIVE, LocalDate.of(1865, 12, 25), false);
    DeviceType devA = _dataFactory.getGenericDevice();

    _service.addTestResult(devA.getInternalId().toString(), TestResult.POSITIVE, p.getInternalId().toString(), null);

    List<TestOrder> queue = _service.getQueue(facility.getInternalId().toString());
    assertEquals(0, queue.size());
  }

  @Test
  @WithSimpleReportStandardUser
  void editTestResult_standardUser_ok() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _personService.addPatient(null, "FOO", "Fred", null, "", "Sr.", LocalDate.of(1865, 12, 25),
        _dataFactory.getAddress(), "8883334444", PersonRole.STAFF, null, null, null, null, false, false);
    TestOrder o = _service.addPatientToQueue(facility.getInternalId(), p, "", Collections.<String, Boolean>emptyMap(),
        false, LocalDate.of(1865, 12, 25), "", TestResult.POSITIVE, LocalDate.of(1865, 12, 25), false);
    DeviceType devA = _dataFactory.getGenericDevice();
    assertNotEquals(o.getDeviceType().getName(), devA.getName());

    _service.editQueueItem(o.getInternalId().toString(), devA.getInternalId().toString(),
        TestResult.POSITIVE.toString(), null);

    List<TestOrder> queue = _service.getQueue(facility.getInternalId().toString());
    assertEquals(1, queue.size());
    assertEquals(TestResult.POSITIVE, queue.get(0).getTestResult());
    assertEquals(devA.getInternalId(), queue.get(0).getDeviceType().getInternalId());
  }

  @Test
  @WithSimpleReportEntryOnlyUser
  void editTestResult_entryOnlyUser_ok() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _dataFactory.createFullPerson(org);
    TestOrder o = _service.addPatientToQueue(facility.getInternalId(), p, "", Collections.<String, Boolean>emptyMap(),
        false, LocalDate.of(1865, 12, 25), "", TestResult.POSITIVE, LocalDate.of(1865, 12, 25), false);
    DeviceType devA = _dataFactory.getGenericDevice();

    _service.editQueueItem(o.getInternalId().toString(), devA.getInternalId().toString(),
        TestResult.POSITIVE.toString(), null);

    List<TestOrder> queue = _service.getQueue(facility.getInternalId().toString());
    assertEquals(1, queue.size());
    assertEquals(TestResult.POSITIVE, queue.get(0).getTestResult());
    assertEquals(devA.getInternalId(), queue.get(0).getDeviceType().getInternalId());
  }

  @Test
  @WithSimpleReportStandardUser
  void fetchTestEventsResults_standardUser_ok() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _dataFactory.createFullPerson(org);
    _dataFactory.createTestEvent(p, facility);
  }

  @Test
  @WithSimpleReportEntryOnlyUser
  void fetchTestResults_entryOnlyUser_error() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _dataFactory.createFullPerson(org);
    _dataFactory.createTestEvent(p, facility);

    // https://github.com/CDCgov/prime-simplereport/issues/677
    // assertSecurityError(() ->
    // _service.getTestResults(facility.getInternalId()));
    assertSecurityError(() -> _service.getTestResults(p));
  }

  // watch for N+1 queries
  @WithSimpleReportStandardUser
  void fetchTestEventsResults_getTestEventsResults_NPlusOne() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _dataFactory.createFullPerson(org);

    // Count queries with one order
    _service.getTestEventsResults(facility.getInternalId(), 0, 50);
    long startQueryCount = _hibernateQueryInterceptor.getQueryCount();

    // Count queries with three order N+1 test
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);
    _service.getTestEventsResults(facility.getInternalId(), 0, 50);
    long endQueryCount = _hibernateQueryInterceptor.getQueryCount();
    assertEquals(endQueryCount, startQueryCount);
  }

  @Test
  @WithSimpleReportStandardUser
  void editTestResult_getQueue_NPlusOne() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    UUID facilityId = facility.getInternalId();

    Person p1 = _personService.addPatient(facilityId, "FOO", "Fred", null, "", "Sr.", LocalDate.of(1865, 12, 25),
        _dataFactory.getAddress(), "8883334444", PersonRole.STAFF, null, null, null, null, false, false);

    _service.addPatientToQueue(facilityId, p1, "", Collections.<String, Boolean>emptyMap(), false,
        LocalDate.of(1865, 12, 25), "", TestResult.POSITIVE, LocalDate.of(1865, 12, 25), false);

    // get the first query count
    long startQueryCount = _hibernateQueryInterceptor.getQueryCount();
    _service.getQueue(facility.getInternalId().toString());
    long firstRunCount = _hibernateQueryInterceptor.getQueryCount() - startQueryCount;

    for (int ii = 0; ii < 2; ii++) {
      // add more tests to the queue. (which needs more patients)
      Person p = _personService.addPatient(facilityId, "FOO", "Fred", null, "", "Sr.", LocalDate.of(1865, 12, 25),
          _dataFactory.getAddress(), "8883334444", PersonRole.STAFF, null, null, null, null, false, false);

      _service.addPatientToQueue(facilityId, p, "", Collections.<String, Boolean>emptyMap(), false,
          LocalDate.of(1865, 12, 25), "", TestResult.POSITIVE, LocalDate.of(1865, 12, 25), false);
    }

    startQueryCount = _hibernateQueryInterceptor.getQueryCount();
    _service.getQueue(facility.getInternalId().toString());
    long secondRunCount = _hibernateQueryInterceptor.getQueryCount() - startQueryCount;
    assertEquals(firstRunCount, secondRunCount);
  }

  @Test
  void correctionsTest() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _dataFactory.createFullPerson(org);
    TestEvent _e = _dataFactory.createTestEvent(p, facility);
    TestOrder _o = _e.getTestOrder();

    String reasonMsg = "Testing correction marking as error " + LocalDateTime.now().toString();
    TestEvent deleteMarkerEvent = _service.correctTestMarkAsError(_e.getInternalId(), reasonMsg);
    assertNotNull(deleteMarkerEvent);

    assertEquals(TestCorrectionStatus.REMOVED, deleteMarkerEvent.getCorrectionStatus());
    assertEquals(reasonMsg, deleteMarkerEvent.getReasonForCorrection());

    assertEquals(_e.getTestOrder().getInternalId(), _e.getTestOrderId());

    List<TestEvent> events_before = _service.getTestEventsResults(facility.getInternalId(), 0, 50);
    assertEquals(1, events_before.size());

    // verify the original order was updated
    TestOrder onlySavedOrder = _service.getTestResult(_e.getInternalId()).getTestOrder();
    assertEquals(reasonMsg, onlySavedOrder.getReasonForCorrection());
    assertEquals(deleteMarkerEvent.getInternalId().toString(), onlySavedOrder.getTestEventId().toString());
    assertEquals(TestCorrectionStatus.REMOVED, onlySavedOrder.getCorrectionStatus());

    // make sure the original item is removed from the result and ONLY the
    // "corrected" removed one is shown
    List<TestEvent> events_after = _service.getTestEventsResults(facility.getInternalId(), 0, 50);
    assertEquals(1, events_after.size());
    assertEquals(deleteMarkerEvent.getInternalId().toString(), events_after.get(0).getInternalId().toString());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getTestEventsResults_pagination() {
    List<TestEvent> testEvents = makedata();
    List<TestEvent> results_page0 = _service.getTestEventsResults(_site.getInternalId(), 0, 5);
    List<TestEvent> results_page1 = _service.getTestEventsResults(_site.getInternalId(), 1, 5);
    List<TestEvent> results_page2 = _service.getTestEventsResults(_site.getInternalId(), 2, 5);
    List<TestEvent> results_page3 = _service.getTestEventsResults(_site.getInternalId(), 3, 5);

    Collections.reverse(testEvents);

    assertTestResultsList(results_page0, testEvents.subList(0, 5));
    assertTestResultsList(results_page1, testEvents.subList(5, 10));
    assertTestResultsList(results_page2, testEvents.subList(10, 12));
    assertEquals(0, results_page3.size());
  }

  private List<TestEvent> makedata() {
    Organization org = _organizationService.getCurrentOrganization();
    _site = _dataFactory.createValidFacility(org, "The Facility");
    List<PersonName> patients = Arrays.asList(AMOS, BRAD, ELIZABETH, CHARLES, DEXTER, FRANK, GALE, HEINRICK, IAN,
        JANNELLE, KACEY, LEELOO);
    List<TestEvent> testEvents = patients.stream().map((PersonName p) -> {
      Person person = _dataFactory.createMinimalPerson(org, _site, p);
      return _dataFactory.createTestEvent(person, _site);
    }).collect(Collectors.toList());
    return testEvents;
  }

  private static void assertTestResultsList(List<TestEvent> found, List<TestEvent> expected) {
    // check common elements first
    for (int i = 0; i < expected.size() && i < found.size(); i++) {
      assertEquals(expected.get(i).getInternalId(), found.get(i).getInternalId());
    }
    // *then* check if there are extras
    if (expected.size() != found.size()) {
      fail("Expected" + expected.size() + " items but found " + found.size());
    }
  }
}
