package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportEntryOnlyAllFacilitiesUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportEntryOnlyUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardAllFacilitiesUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;

@SuppressWarnings("checkstyle:MagicNumber")
class TestOrderServiceTest extends BaseServiceTest<TestOrderService> {

  @Autowired private OrganizationService _organizationService;
  @Autowired private PersonService _personService;
  @Autowired private TestDataFactory _dataFactory;

  @BeforeEach
  void setupData() {
    initSampleData();
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void roundTrip() {
    Facility facility =
        _dataFactory.createValidFacility(_organizationService.getCurrentOrganization());
    Person p =
        _personService.addPatient(
            null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "8883334444",
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            false,
            false);

    _service.addPatientToQueue(
        facility.getInternalId(),
        p,
        "",
        Collections.<String, Boolean>emptyMap(),
        false,
        LocalDate.of(1865, 12, 25),
        "",
        TestResult.POSITIVE,
        LocalDate.of(1865, 12, 25),
        false);

    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(1, queue.size());

    DeviceType devA = _dataFactory.getGenericDevice();
    _service.addTestResult(
        devA.getInternalId().toString(), TestResult.POSITIVE, p.getInternalId(), null);

    queue = _service.getQueue(facility.getInternalId());
    assertEquals(0, queue.size());
  }

  @Test
  @WithSimpleReportStandardUser
  void getQueue_standardUser_successDependsOnFacilityAccess() {
    Facility facility =
        _dataFactory.createValidFacility(_organizationService.getCurrentOrganization());

    assertThrows(AccessDeniedException.class, () -> _service.getQueue(facility.getInternalId()));

    TestUserIdentities.addFacilityAuthorities(facility);
    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(0, queue.size());
  }

  @Test
  @WithSimpleReportStandardAllFacilitiesUser
  void addPatientToQueue_standardUserAllFacilities_ok() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p =
        _personService.addPatient(
            null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "8883334444",
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            false,
            false);

    _service.addPatientToQueue(
        facility.getInternalId(),
        p,
        "",
        Collections.<String, Boolean>emptyMap(),
        false,
        LocalDate.of(1865, 12, 25),
        "",
        TestResult.POSITIVE,
        LocalDate.of(1865, 12, 25),
        false);

    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(1, queue.size());
  }

  @Test
  void addPatientToQueue_standardUser_successDependsOnFacilityAccess() {
    Facility facility =
        _dataFactory.createValidFacility(_organizationService.getCurrentOrganization());

    Person p =
        _personService.addPatient(
            null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "8883334444",
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            false,
            false);

    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.addPatientToQueue(
                facility.getInternalId(),
                p,
                "",
                Collections.<String, Boolean>emptyMap(),
                false,
                LocalDate.of(1865, 12, 25),
                "",
                TestResult.POSITIVE,
                LocalDate.of(1865, 12, 25),
                false));

    TestUserIdentities.addFacilityAuthorities(facility);
    _service.addPatientToQueue(
        facility.getInternalId(),
        p,
        "",
        Collections.<String, Boolean>emptyMap(),
        false,
        LocalDate.of(1865, 12, 25),
        "",
        TestResult.POSITIVE,
        LocalDate.of(1865, 12, 25),
        false);
    TestUserIdentities.removeFacilityAuthorities(facility);

    assertThrows(AccessDeniedException.class, () -> _service.getQueue(facility.getInternalId()));

    TestUserIdentities.addFacilityAuthorities(facility);
    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(1, queue.size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addTestResult_orgAdmin_ok() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p =
        _personService.addPatient(
            null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "8883334444",
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            false,
            false);
    _service.addPatientToQueue(
        facility.getInternalId(),
        p,
        "",
        Collections.<String, Boolean>emptyMap(),
        false,
        LocalDate.of(1865, 12, 25),
        "",
        TestResult.POSITIVE,
        LocalDate.of(1865, 12, 25),
        false);
    DeviceType devA = _dataFactory.getGenericDevice();

    _service.addTestResult(
        devA.getInternalId().toString(), TestResult.POSITIVE, p.getInternalId(), null);

    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(0, queue.size());
  }

  @Test
  @WithSimpleReportStandardAllFacilitiesUser
  void addTestResult_standardUserAllFacilities_ok() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p =
        _personService.addPatient(
            null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "8883334444",
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            false,
            false);
    _service.addPatientToQueue(
        facility.getInternalId(),
        p,
        "",
        Collections.<String, Boolean>emptyMap(),
        false,
        LocalDate.of(1865, 12, 25),
        "",
        TestResult.POSITIVE,
        LocalDate.of(1865, 12, 25),
        false);
    DeviceType devA = _dataFactory.getGenericDevice();

    _service.addTestResult(
        devA.getInternalId().toString(), TestResult.POSITIVE, p.getInternalId(), null);

    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(0, queue.size());
  }

  @Test
  @WithSimpleReportStandardUser
  void addTestResult_standardUser_successDependsOnFacilityAccess() {
    Facility facility =
        _dataFactory.createValidFacility(_organizationService.getCurrentOrganization());
    TestUserIdentities.addFacilityAuthorities(facility);

    Person p1 =
        _personService.addPatient(
            null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "8883334444",
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            false,
            false);
    Person p2 =
        _personService.addPatient(
            facility.getInternalId(),
            "BAR",
            "Baz",
            null,
            "",
            "Jr.",
            LocalDate.of(1900, 1, 25),
            _dataFactory.getAddress(),
            "2229993333",
            PersonRole.STUDENT,
            null,
            null,
            null,
            null,
            false,
            false);

    _service.addPatientToQueue(
        facility.getInternalId(),
        p1,
        "",
        Collections.<String, Boolean>emptyMap(),
        false,
        LocalDate.of(1865, 12, 25),
        "",
        TestResult.POSITIVE,
        LocalDate.of(1865, 12, 25),
        false);
    _service.addPatientToQueue(
        facility.getInternalId(),
        p2,
        "",
        Collections.<String, Boolean>emptyMap(),
        false,
        LocalDate.of(1865, 12, 25),
        "",
        TestResult.NEGATIVE,
        LocalDate.of(1865, 12, 25),
        false);

    TestUserIdentities.removeFacilityAuthorities(facility);

    DeviceType devA = _dataFactory.getGenericDevice();
    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.addTestResult(
                devA.getInternalId().toString(), TestResult.POSITIVE, p2.getInternalId(), null));

    TestUserIdentities.addFacilityAuthorities(facility);
    _service.addTestResult(
        devA.getInternalId().toString(), TestResult.POSITIVE, p1.getInternalId(), null);
    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(1, queue.size());

    _service.addTestResult(
        devA.getInternalId().toString(), TestResult.NEGATIVE, p2.getInternalId(), null);

    queue = _service.getQueue(facility.getInternalId());
    assertEquals(0, queue.size());
  }

  @Test
  @WithSimpleReportStandardAllFacilitiesUser
  void editTestResult_standardAllFacilitiesUser_ok() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p =
        _personService.addPatient(
            null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "8883334444",
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            false,
            false);
    TestOrder o =
        _service.addPatientToQueue(
            facility.getInternalId(),
            p,
            "",
            Collections.<String, Boolean>emptyMap(),
            false,
            LocalDate.of(1865, 12, 25),
            "",
            TestResult.POSITIVE,
            LocalDate.of(1865, 12, 25),
            false);
    DeviceType devA = _dataFactory.getGenericDevice();
    assertNotEquals(o.getDeviceType().getName(), devA.getName());

    _service.editQueueItem(
        o.getInternalId(), devA.getInternalId().toString(), TestResult.POSITIVE.toString(), null);

    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(1, queue.size());
    assertEquals(TestResult.POSITIVE, queue.get(0).getTestResult());
    assertEquals(devA.getInternalId(), queue.get(0).getDeviceType().getInternalId());
  }

  @Test
  @WithSimpleReportEntryOnlyUser
  void editTestResult_entryOnlyUser_successDependsOnFacilityAccess() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createValidFacility(org);
    Person p = _dataFactory.createFullPerson(org);

    TestUserIdentities.addFacilityAuthorities(facility);
    TestOrder o =
        _service.addPatientToQueue(
            facility.getInternalId(),
            p,
            "",
            Collections.<String, Boolean>emptyMap(),
            false,
            LocalDate.of(1865, 12, 25),
            "",
            TestResult.POSITIVE,
            LocalDate.of(1865, 12, 25),
            false);
    TestUserIdentities.removeFacilityAuthorities(facility);

    DeviceType devA = _dataFactory.getGenericDevice();

    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.editQueueItem(
                o.getInternalId(),
                devA.getInternalId().toString(),
                TestResult.POSITIVE.toString(),
                null));

    TestUserIdentities.addFacilityAuthorities(facility);
    _service.editQueueItem(
        o.getInternalId(), devA.getInternalId().toString(), TestResult.POSITIVE.toString(), null);
  }

  @Test
  @WithSimpleReportEntryOnlyAllFacilitiesUser
  void editTestResult_entryOnlyAllFacilitiesUser_ok() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _dataFactory.createFullPerson(org);
    TestOrder o =
        _service.addPatientToQueue(
            facility.getInternalId(),
            p,
            "",
            Collections.<String, Boolean>emptyMap(),
            false,
            LocalDate.of(1865, 12, 25),
            "",
            TestResult.POSITIVE,
            LocalDate.of(1865, 12, 25),
            false);
    DeviceType devA = _dataFactory.getGenericDevice();

    _service.editQueueItem(
        o.getInternalId(), devA.getInternalId().toString(), TestResult.POSITIVE.toString(), null);

    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(1, queue.size());
    assertEquals(TestResult.POSITIVE, queue.get(0).getTestResult());
    assertEquals(devA.getInternalId(), queue.get(0).getDeviceType().getInternalId());
  }

  @Test
  @WithSimpleReportStandardUser
  void fetchTestEventsResults_standardUser_successDependsOnFacilityAccess() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createValidFacility(org);
    Person p = _dataFactory.createMinimalPerson(org, facility);
    _dataFactory.createTestEvent(p, facility);

    assertThrows(
        AccessDeniedException.class,
        () -> _service.getTestEventsResults(facility.getInternalId(), new Date(0)));

    TestUserIdentities.addFacilityAuthorities(facility);
    _service.getTestEventsResults(facility.getInternalId(), new Date(0));
  }

  @Test
  @WithSimpleReportStandardUser
  void fetchTestResults_standardUser_successDependsOnFacilityAccess() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createValidFacility(org);
    Person p = _dataFactory.createMinimalPerson(org, facility);
    _dataFactory.createTestEvent(p, facility);

    assertThrows(AccessDeniedException.class, () -> _service.getTestResults(p));

    TestUserIdentities.addFacilityAuthorities(facility);
    _service.getTestResults(p);
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
    _service.getTestEventsResults(facility.getInternalId(), new Date(0));
    long startQueryCount = _hibernateQueryInterceptor.getQueryCount();

    // Count queries with three order N+1 test
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);
    _service.getTestEventsResults(facility.getInternalId(), new Date(0));
    long endQueryCount = _hibernateQueryInterceptor.getQueryCount();
    assertEquals(endQueryCount, startQueryCount);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void editTestResult_getQueue_NPlusOne() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    UUID facilityId = facility.getInternalId();

    Person p1 =
        _personService.addPatient(
            facilityId,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "8883334444",
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            false,
            false);

    _service.addPatientToQueue(
        facilityId,
        p1,
        "",
        Collections.<String, Boolean>emptyMap(),
        false,
        LocalDate.of(1865, 12, 25),
        "",
        TestResult.POSITIVE,
        LocalDate.of(1865, 12, 25),
        false);

    // get the first query count
    long startQueryCount = _hibernateQueryInterceptor.getQueryCount();
    _service.getQueue(facility.getInternalId());
    long firstRunCount = _hibernateQueryInterceptor.getQueryCount() - startQueryCount;

    for (int ii = 0; ii < 2; ii++) {
      // add more tests to the queue. (which needs more patients)
      Person p =
          _personService.addPatient(
              facilityId,
              "FOO",
              "Fred",
              null,
              "",
              "Sr.",
              LocalDate.of(1865, 12, 25),
              _dataFactory.getAddress(),
              "8883334444",
              PersonRole.STAFF,
              null,
              null,
              null,
              null,
              false,
              false);

      _service.addPatientToQueue(
          facilityId,
          p,
          "",
          Collections.<String, Boolean>emptyMap(),
          false,
          LocalDate.of(1865, 12, 25),
          "",
          TestResult.POSITIVE,
          LocalDate.of(1865, 12, 25),
          false);
    }

    startQueryCount = _hibernateQueryInterceptor.getQueryCount();
    _service.getQueue(facility.getInternalId());
    long secondRunCount = _hibernateQueryInterceptor.getQueryCount() - startQueryCount;
    assertEquals(firstRunCount, secondRunCount);
  }

  @Test
  @WithSimpleReportOrgAdminUser
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

    List<TestEvent> events_before =
        _service.getTestEventsResults(facility.getInternalId(), new Date(0));
    assertEquals(1, events_before.size());

    // verify the original order was updated
    TestOrder onlySavedOrder = _service.getTestResult(_e.getInternalId()).getTestOrder();
    assertEquals(reasonMsg, onlySavedOrder.getReasonForCorrection());
    assertEquals(
        deleteMarkerEvent.getInternalId().toString(), onlySavedOrder.getTestEventId().toString());
    assertEquals(TestCorrectionStatus.REMOVED, onlySavedOrder.getCorrectionStatus());

    // make sure the original item is removed from the result and ONLY the
    // "corrected" removed one is shown
    List<TestEvent> events_after =
        _service.getTestEventsResults(facility.getInternalId(), new Date(0));
    assertEquals(1, events_after.size());
    assertEquals(
        deleteMarkerEvent.getInternalId().toString(),
        events_after.get(0).getInternalId().toString());
  }

  @Test
  void correctionsTest_successDependsOnFacilityAccess() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createValidFacility(org);
    Person p = _dataFactory.createFullPerson(org);
    TestEvent _e = _dataFactory.createTestEvent(p, facility);

    String reasonMsg = "Testing correction marking as error " + LocalDateTime.now().toString();
    assertThrows(
        AccessDeniedException.class,
        () -> _service.correctTestMarkAsError(_e.getInternalId(), reasonMsg));
    assertThrows(
        AccessDeniedException.class,
        () -> _service.getTestEventsResults(facility.getInternalId(), new Date(0)));
    assertThrows(
        AccessDeniedException.class,
        () -> _service.getTestResult(_e.getInternalId()).getTestOrder());

    TestUserIdentities.addFacilityAuthorities(facility);
    _service.correctTestMarkAsError(_e.getInternalId(), reasonMsg);
    _service.getTestEventsResults(facility.getInternalId(), new Date(0));
    _service.getTestResult(_e.getInternalId()).getTestOrder();
  }
}
