package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;

import com.google.i18n.phonenumbers.NumberParseException;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentQueueItemException;
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
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.service.sms.SmsService;
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
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.access.AccessDeniedException;

@SuppressWarnings("checkstyle:MagicNumber")
class TestOrderServiceTest extends BaseServiceTest<TestOrderService> {

  @Autowired private OrganizationService _organizationService;
  @Autowired private PersonService _personService;
  @Autowired private TestDataFactory _dataFactory;
  @MockBean private SmsService _smsService;

  private static final PersonName AMOS = new PersonName("Amos", null, "Quint", null);
  private static final PersonName BRAD = new PersonName("Bradley", "Z.", "Jones", "Jr.");
  private static final PersonName CHARLES = new PersonName("Charles", "Mathew", "Albemarle", "Sr.");
  private static final PersonName DEXTER = new PersonName("Dexter", null, "Jones", null);
  private static final PersonName ELIZABETH =
      new PersonName("Elizabeth", "Martha", "Merriwether", null);
  private static final PersonName FRANK = new PersonName("Frank", "Mathew", "Bones", "3");
  private static final PersonName GALE = new PersonName("Gale", "Mary", "Vittorio", "PhD");
  private static final PersonName HEINRICK = new PersonName("Heinrick", "Mark", "Silver", "III");
  private static final PersonName IAN = new PersonName("Ian", "Brou", "Rutter", null);
  private static final PersonName JANNELLE = new PersonName("Jannelle", "Martha", "Cromack", null);
  private static final PersonName KACEY = new PersonName("Kacey", "L", "Mathie", null);
  private static final PersonName LEELOO = new PersonName("Leeloo", "Dallas", "Multipass", null);
  private Facility _site;
  private Facility _otherSite;

  @BeforeEach
  void setupData() {
    initSampleData();
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void roundTrip() throws NumberParseException {
    Facility facility =
        _dataFactory.createValidFacility(_organizationService.getCurrentOrganization());
    Person p =
        _personService.addPatient(
            (UUID) null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English");

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

    TestUserIdentities.setFacilityAuthorities(facility);
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
            (UUID) null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "Spanish");

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
            (UUID) null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "German");

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

    TestUserIdentities.setFacilityAuthorities(facility);
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
    TestUserIdentities.setFacilityAuthorities();

    assertThrows(AccessDeniedException.class, () -> _service.getQueue(facility.getInternalId()));

    TestUserIdentities.setFacilityAuthorities(facility);
    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(1, queue.size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addTestResult_orgAdmin_ok() throws NumberParseException {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p =
        _personService.addPatient(
            (UUID) null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "French");
    _personService.updateTestResultDeliveryPreference(
        p.getInternalId(), TestResultDeliveryPreference.SMS);
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

    verify(_smsService).sendToPatientLink(any(UUID.class), anyString());

    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(0, queue.size());
  }

  @Test
  @WithSimpleReportStandardAllFacilitiesUser
  void addTestResult_standardUserAllFacilities_ok() throws NumberParseException {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p =
        _personService.addPatient(
            (UUID) null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "Spanish");
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
  void addTestResult_standardUser_successDependsOnFacilityAccess() throws NumberParseException {
    Facility facility1 =
        _dataFactory.createValidFacility(
            _organizationService.getCurrentOrganization(), "First One");
    Facility facility2 =
        _dataFactory.createValidFacility(
            _organizationService.getCurrentOrganization(), "Second One");

    TestUserIdentities.setFacilityAuthorities(facility1);

    Person p1 =
        _personService.addPatient(
            (UUID) null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English");
    Person p2 =
        _personService.addPatient(
            facility1.getInternalId(),
            "BAR",
            "Baz",
            null,
            "",
            "Jr.",
            LocalDate.of(1900, 1, 25),
            _dataFactory.getAddress(),
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STUDENT,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "Spanish");

    _service.addPatientToQueue(
        facility1.getInternalId(),
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
        facility1.getInternalId(),
        p2,
        "",
        Collections.<String, Boolean>emptyMap(),
        false,
        LocalDate.of(1865, 12, 25),
        "",
        TestResult.NEGATIVE,
        LocalDate.of(1865, 12, 25),
        false);

    TestUserIdentities.setFacilityAuthorities();

    DeviceType devA = _dataFactory.getGenericDevice();
    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.addTestResult(
                devA.getInternalId().toString(), TestResult.POSITIVE, p2.getInternalId(), null));

    // caller has access to the patient (whose facility is null)
    // but cannot modify the test order which was created at a non-accessible facility
    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.addTestResult(
                devA.getInternalId().toString(), TestResult.POSITIVE, p1.getInternalId(), null));

    TestUserIdentities.setFacilityAuthorities(facility1);
    _service.addTestResult(
        devA.getInternalId().toString(), TestResult.POSITIVE, p1.getInternalId(), null);
    List<TestOrder> queue = _service.getQueue(facility1.getInternalId());
    assertEquals(1, queue.size());

    _service.addTestResult(
        devA.getInternalId().toString(), TestResult.NEGATIVE, p2.getInternalId(), null);

    queue = _service.getQueue(facility1.getInternalId());
    assertEquals(0, queue.size());
  }

  @Test
  @WithSimpleReportEntryOnlyAllFacilitiesUser
  void addTestResult_entryOnlyUserAllFacilities_ok() throws NumberParseException {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _dataFactory.createFullPerson(org);
    _personService.updateTestResultDeliveryPreference(
        p.getInternalId(), TestResultDeliveryPreference.SMS);
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

    verify(_smsService).sendToPatientLink(any(UUID.class), anyString());

    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(0, queue.size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addTestResult_testAlreadySubmitted_failure() throws NumberParseException {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _dataFactory.createFullPerson(org);
    _personService.updateTestResultDeliveryPreference(
        p.getInternalId(), TestResultDeliveryPreference.SMS);
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
    assertThrows(
        NonexistentQueueItemException.class,
        () ->
            _service.addTestResult(
                devA.getInternalId().toString(), TestResult.POSITIVE, p.getInternalId(), null));
  }

  @Test
  @WithSimpleReportStandardAllFacilitiesUser
  void editTestResult_standardAllFacilitiesUser_ok() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p =
        _personService.addPatient(
            (UUID) null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English");
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

    TestUserIdentities.setFacilityAuthorities(facility);
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
    TestUserIdentities.setFacilityAuthorities();

    DeviceType devA = _dataFactory.getGenericDevice();

    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.editQueueItem(
                o.getInternalId(),
                devA.getInternalId().toString(),
                TestResult.POSITIVE.toString(),
                null));

    TestUserIdentities.setFacilityAuthorities(facility);
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
  @WithSimpleReportOrgAdminUser
  void editTestResult_testAlreadySubmitted_failure() throws NumberParseException {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _dataFactory.createFullPerson(org);
    _personService.updateTestResultDeliveryPreference(
        p.getInternalId(), TestResultDeliveryPreference.SMS);
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
        o.getInternalId(), devA.getInternalId().toString(), TestResult.NEGATIVE.toString(), null);

    _service.addTestResult(
        devA.getInternalId().toString(), TestResult.POSITIVE, p.getInternalId(), null);

    assertThrows(
        NonexistentQueueItemException.class,
        () ->
            _service.editQueueItem(
                o.getInternalId(),
                devA.getInternalId().toString(),
                TestResult.POSITIVE.toString(),
                null));
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
        () -> _service.getTestEventsResults(facility.getInternalId(), null, null, 0, 10));

    TestUserIdentities.setFacilityAuthorities(facility);
    _service.getTestEventsResults(facility.getInternalId(), null, null, 0, 10);
  }

  @Test
  @WithSimpleReportStandardUser
  void fetchTestResults_standardUser_successDependsOnFacilityAccess() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility f1 = _dataFactory.createValidFacility(org, "First One");
    Facility f2 = _dataFactory.createValidFacility(org, "Second One");
    Person p1 = _dataFactory.createMinimalPerson(org, f1);
    Person p2 = _dataFactory.createMinimalPerson(org);
    _dataFactory.createTestEvent(p1, f1);
    _dataFactory.createTestEvent(p2, f1);
    _dataFactory.createTestEvent(p2, f2);

    assertThrows(AccessDeniedException.class, () -> _service.getTestResults(p1));
    // filters out all test results from inaccessible facilities, but we can still
    // request test results for a patient whose own facility is null
    assertEquals(0, _service.getTestResults(p2).size());

    TestUserIdentities.setFacilityAuthorities(f1);
    assertEquals(1, _service.getTestResults(p1).size());
    // filters out all test results from inaccessible facilities
    assertEquals(1, _service.getTestResults(p2).size());

    TestUserIdentities.setFacilityAuthorities(f1, f2);
    assertEquals(1, _service.getTestResults(p1).size());
    assertEquals(2, _service.getTestResults(p2).size());
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
  @Test
  @WithSimpleReportStandardAllFacilitiesUser
  void fetchTestEventsResults_getTestEventsResults_NPlusOne() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _dataFactory.createFullPerson(org);

    // add some initial data
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);

    // count queries
    long startQueryCount = _hibernateQueryInterceptor.getQueryCount();
    int firstQueryResults =
        _service.getTestEventsResults(facility.getInternalId(), null, null, 0, 50).size();
    long firstPassTotal = _hibernateQueryInterceptor.getQueryCount() - startQueryCount;

    // add more data
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);

    // count queries again and make queries made didn't increase
    startQueryCount = _hibernateQueryInterceptor.getQueryCount();
    int secondQueryResults =
        _service.getTestEventsResults(facility.getInternalId(), null, null, 0, 50).size();
    long secondPassTotal = _hibernateQueryInterceptor.getQueryCount() - startQueryCount;
    assertEquals(firstPassTotal, secondPassTotal);
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
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "Spanish");

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
              TestDataFactory.getListOfOnePhoneNumber(),
              PersonRole.STAFF,
              null,
              null,
              null,
              null,
              null,
              false,
              false,
              "French");

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
        _service.getTestEventsResults(facility.getInternalId(), null, null, 0, 50);
    assertEquals(1, events_before.size());

    // verify the original order was updated
    TestEvent refreshedTestResult = _service.getTestResult(_e.getInternalId());
    TestOrder onlySavedOrder = refreshedTestResult.getTestOrder();
    TestEvent mostRecentEvent = onlySavedOrder.getTestEvent();
    assertEquals(reasonMsg, onlySavedOrder.getReasonForCorrection());
    assertEquals(deleteMarkerEvent.getInternalId(), mostRecentEvent.getInternalId());
    assertEquals(TestCorrectionStatus.REMOVED, onlySavedOrder.getCorrectionStatus());

    // make sure the original item is removed from the result and ONLY the
    // "corrected" removed one is shown
    List<TestEvent> events_after =
        _service.getTestEventsResults(facility.getInternalId(), null, null, 0, 50);
    assertEquals(1, events_after.size());
    assertEquals(
        deleteMarkerEvent.getInternalId().toString(),
        events_after.get(0).getInternalId().toString());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getTestEventsResults_pagination() {
    List<TestEvent> testEvents = makedata();
    List<TestEvent> results_page0 =
        _service.getTestEventsResults(_site.getInternalId(), null, null, 0, 5);
    List<TestEvent> results_page1 =
        _service.getTestEventsResults(_site.getInternalId(), null, null, 1, 5);
    List<TestEvent> results_page2 =
        _service.getTestEventsResults(_site.getInternalId(), null, null, 2, 5);
    List<TestEvent> results_page3 =
        _service.getTestEventsResults(_site.getInternalId(), null, null, 3, 5);

    Collections.reverse(testEvents);

    assertTestResultsList(results_page0, testEvents.subList(0, 5));
    assertTestResultsList(results_page1, testEvents.subList(5, 10));
    assertTestResultsList(results_page2, testEvents.subList(10, 11));
    assertEquals(0, results_page3.size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getTestEventsResults_filtering() {
    List<TestEvent> testEvents = makedata();
    List<TestEvent> positives =
        _service.getTestEventsResults(_site.getInternalId(), null, TestResult.POSITIVE, 0, 10);
    List<TestEvent> negatives =
        _service.getTestEventsResults(_site.getInternalId(), null, TestResult.NEGATIVE, 0, 10);
    List<TestEvent> inconclusives =
        _service.getTestEventsResults(_site.getInternalId(), null, TestResult.UNDETERMINED, 0, 10);
    List<TestEvent> positivesAmos =
        _service.getTestEventsResults(
            _site.getInternalId(),
            _dataFactory.getPersonByName(AMOS).getInternalId(),
            TestResult.POSITIVE,
            0,
            10);
    List<TestEvent> negativesAmos =
        _service.getTestEventsResults(
            _site.getInternalId(),
            _dataFactory.getPersonByName(AMOS).getInternalId(),
            TestResult.NEGATIVE,
            0,
            10);

    Collections.reverse(testEvents);

    assertTestResultsList(
        positives,
        testEvents.stream()
            .filter(t -> t.getResult() == TestResult.POSITIVE)
            .collect(Collectors.toList()));
    assertTestResultsList(
        negatives,
        testEvents.stream()
            .filter(t -> t.getResult() == TestResult.NEGATIVE)
            .collect(Collectors.toList()));
    assertTestResultsList(
        inconclusives,
        testEvents.stream()
            .filter(t -> t.getResult() == TestResult.UNDETERMINED)
            .collect(Collectors.toList()));
    assertTestResultsList(
        positivesAmos,
        testEvents.stream()
            .filter(
                t ->
                    t.getResult() == TestResult.POSITIVE
                        && t.getPatient().getNameInfo().equals(AMOS))
            .collect(Collectors.toList()));
    assertTestResultsList(
        negativesAmos,
        testEvents.stream()
            .filter(
                t ->
                    t.getResult() == TestResult.NEGATIVE
                        && t.getPatient().getNameInfo().equals(AMOS))
            .collect(Collectors.toList()));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getTestResultsCount() {
    makedata();
    int size = _service.getTestResultsCount(_site.getInternalId(), null, null);
    assertEquals(11, size);
  }

  private List<TestEvent> makedata() {
    Organization org = _organizationService.getCurrentOrganization();
    _site = _dataFactory.createValidFacility(org, "The Facility");
    Map<PersonName, TestResult> patientsToResults = new HashMap<>();
    patientsToResults.put(AMOS, TestResult.POSITIVE);
    patientsToResults.put(CHARLES, TestResult.POSITIVE);
    patientsToResults.put(DEXTER, TestResult.POSITIVE);
    patientsToResults.put(ELIZABETH, TestResult.NEGATIVE);
    patientsToResults.put(FRANK, TestResult.NEGATIVE);
    patientsToResults.put(GALE, TestResult.NEGATIVE);
    patientsToResults.put(HEINRICK, TestResult.NEGATIVE);
    patientsToResults.put(IAN, TestResult.UNDETERMINED);
    patientsToResults.put(JANNELLE, TestResult.UNDETERMINED);
    patientsToResults.put(KACEY, TestResult.UNDETERMINED);
    patientsToResults.put(LEELOO, TestResult.UNDETERMINED);

    List<TestEvent> testEvents =
        patientsToResults.entrySet().stream()
            .map(
                e -> {
                  PersonName p = e.getKey();
                  TestResult r = e.getValue();
                  Person person = _dataFactory.createMinimalPerson(org, _site, p);
                  return _dataFactory.createTestEvent(person, _site, r);
                })
            .collect(Collectors.toList());
    // Make one result in another facility
    _otherSite = _dataFactory.createValidFacility(org, "The Other Facility");
    _dataFactory.createTestEvent(
        _dataFactory.createMinimalPerson(org, _otherSite, BRAD), _otherSite, TestResult.NEGATIVE);
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
        () -> _service.getTestEventsResults(facility.getInternalId(), null, null, 0, 10));
    assertThrows(
        AccessDeniedException.class,
        () -> _service.getTestResult(_e.getInternalId()).getTestOrder());

    TestUserIdentities.setFacilityAuthorities(facility);
    _service.correctTestMarkAsError(_e.getInternalId(), reasonMsg);
    _service.getTestEventsResults(facility.getInternalId(), null, null, 0, 10);
    _service.getTestResult(_e.getInternalId()).getTestOrder();
  }
}
