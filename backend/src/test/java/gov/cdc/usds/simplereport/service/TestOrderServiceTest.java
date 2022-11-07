package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.AddTestResultResponse;
import gov.cdc.usds.simplereport.api.model.OrganizationLevelDashboardMetrics;
import gov.cdc.usds.simplereport.api.model.TopLevelDashboardMetrics;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentQueueItemException;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.MultiplexResultInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.OrderStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.db.repository.ResultRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.db.repository.TestOrderRepository;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportEntryOnlyAllFacilitiesUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportEntryOnlyUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardAllFacilitiesUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(
    properties = {
      "hibernate.query.interceptor.error-level=ERROR",
      "spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"
    })
@SuppressWarnings("checkstyle:MagicNumber")
class TestOrderServiceTest extends BaseServiceTest<TestOrderService> {

  @Autowired private OrganizationService _organizationService;
  @Autowired private PersonService _personService;
  @Autowired private TestEventRepository _testEventRepository;
  @Autowired private TestOrderRepository _testOrderRepository;
  @Autowired private ResultRepository _resultRepository;
  @Autowired private TestDataFactory _dataFactory;
  @SpyBean private PatientLinkService patientLinkService;
  @MockBean private TestResultsDeliveryService testResultsDeliveryService;
  @MockBean TestEventReportingService testEventReportingService;
  @Captor ArgumentCaptor<TestEvent> testEventArgumentCaptor;

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

  private DeviceSpecimenType DEVICE_A = null;
  private Facility _site;
  private Facility _otherSite;

  @BeforeEach
  void setupData() {
    initSampleData();
    DEVICE_A = _dataFactory.getGenericDeviceSpecimen();
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void roundTrip() {
    // GIVEN
    Facility facility =
        _dataFactory.createValidFacility(_organizationService.getCurrentOrganization());
    Person patient =
        _personService.addPatient(
            (UUID) null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English",
            null);

    _service.addPatientToQueue(
        facility.getInternalId(),
        patient,
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceSpecimenType devA = facility.getDefaultDeviceSpecimen();

    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(1, queue.size());

    // WHEN
    _service.addTestResult(
        devA.getInternalId(), TestResult.POSITIVE, patient.getInternalId(), null);

    // THEN
    queue = _service.getQueue(facility.getInternalId());
    assertEquals(0, queue.size());

    List<TestEvent> testEvents =
        _testEventRepository.findAllByPatientAndFacilities(patient, List.of(facility));
    assertThat(testEvents).hasSize(1);
    assertThat(testEvents.get(0).getPatientHasPriorTests()).isFalse();
    verify(patientLinkService).createPatientLink(any());

    // make sure the corrected event is sent to storage queue
    verify(testEventReportingService).report(testEventArgumentCaptor.capture());
    TestEvent sentEvent = testEventArgumentCaptor.getValue();
    assertThat(sentEvent.getPatient().getInternalId()).isEqualTo(patient.getInternalId());
    assertThat(sentEvent.getCovidTestResult().get()).isEqualTo(TestResult.POSITIVE);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addTestResult_populateFirstTest() {
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
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English",
            null);

    _service.addPatientToQueue(
        facility.getInternalId(), p, "", Collections.emptyMap(), LocalDate.of(1865, 12, 25), false);
    _service.addTestResult(
        _dataFactory.getGenericDeviceSpecimen().getInternalId(),
        TestResult.POSITIVE,
        p.getInternalId(),
        null);

    verify(testEventReportingService, times(1)).report(any());

    List<TestEvent> testEvents =
        _testEventRepository.findAllByPatientAndFacilities(p, List.of(facility));
    assertThat(testEvents).hasSize(1);
    assertThat(testEvents.get(0).getPatientHasPriorTests()).isFalse();

    _service.addPatientToQueue(
        facility.getInternalId(), p, "", Collections.emptyMap(), LocalDate.of(1866, 12, 25), false);
    _service.addTestResult(
        _dataFactory.getGenericDeviceSpecimen().getInternalId(),
        TestResult.POSITIVE,
        p.getInternalId(),
        null);

    testEvents = _testEventRepository.findAllByPatientAndFacilities(p, List.of(facility));
    assertThat(testEvents).hasSize(2);
    assertThat(testEvents.get(0).getPatientHasPriorTests()).isFalse();
    assertThat(testEvents.get(1).getPatientHasPriorTests()).isTrue();
    verify(testEventReportingService, times(2)).report(any());
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
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "Spanish",
            null);

    _service.addPatientToQueue(
        facility.getInternalId(), p, "", Collections.emptyMap(), LocalDate.of(1865, 12, 25), false);

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
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "German",
            null);

    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.addPatientToQueue(
                facility.getInternalId(),
                p,
                "",
                Collections.emptyMap(),
                LocalDate.of(1865, 12, 25),
                false));

    TestUserIdentities.setFacilityAuthorities(facility);
    _service.addPatientToQueue(
        facility.getInternalId(), p, "", Collections.emptyMap(), LocalDate.of(1865, 12, 25), false);
    TestUserIdentities.setFacilityAuthorities();

    assertThrows(AccessDeniedException.class, () -> _service.getQueue(facility.getInternalId()));

    TestUserIdentities.setFacilityAuthorities(facility);
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
            (UUID) null,
            "FOO",
            "Fred",
            null,
            "",
            "Sr.",
            LocalDate.of(1865, 12, 25),
            _dataFactory.getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "French",
            null);
    _personService.updateTestResultDeliveryPreference(
        p.getInternalId(), TestResultDeliveryPreference.SMS);
    _service.addPatientToQueue(
        facility.getInternalId(), p, "", Collections.emptyMap(), LocalDate.of(1865, 12, 25), false);
    DeviceSpecimenType devA = facility.getDefaultDeviceSpecimen();

    _service.addTestResult(devA.getInternalId(), TestResult.POSITIVE, p.getInternalId(), null);

    verify(testResultsDeliveryService).smsTestResults(any(PatientLink.class));

    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(0, queue.size());
    verify(testEventReportingService).report(any());
  }

  @Test
  @WithSimpleReportStandardAllFacilitiesUser
  void addTestResult_standardUserAllFacilities_ok() {
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
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "Spanish",
            null);
    _service.addPatientToQueue(
        facility.getInternalId(), p, "", Collections.emptyMap(), LocalDate.of(1865, 12, 25), false);
    DeviceSpecimenType devA = facility.getDefaultDeviceSpecimen();

    _service.addTestResult(devA.getInternalId(), TestResult.POSITIVE, p.getInternalId(), null);

    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(0, queue.size());
    verify(testEventReportingService).report(any());
  }

  @Test
  @WithSimpleReportStandardUser
  void addTestResult_standardUser_successDependsOnFacilityAccess() {
    Facility facility1 =
        _dataFactory.createValidFacility(
            _organizationService.getCurrentOrganization(), "First One");

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
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English",
            null);
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
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STUDENT,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "Spanish",
            null);

    _service.addPatientToQueue(
        facility1.getInternalId(),
        p1,
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    _service.addPatientToQueue(
        facility1.getInternalId(),
        p2,
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);

    TestUserIdentities.setFacilityAuthorities();

    DeviceSpecimenType devA = _dataFactory.getGenericDeviceSpecimen();
    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.addTestResult(
                devA.getInternalId(), TestResult.POSITIVE, p2.getInternalId(), null));

    // caller has access to the patient (whose facility is null)
    // but cannot modify the test order which was created at a non-accessible facility
    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.addTestResult(
                devA.getInternalId(), TestResult.POSITIVE, p1.getInternalId(), null));

    // make sure the nothing was sent to storage queue
    verifyNoInteractions(testEventReportingService);

    TestUserIdentities.setFacilityAuthorities(facility1);
    _service.addTestResult(devA.getInternalId(), TestResult.POSITIVE, p1.getInternalId(), null);
    List<TestOrder> queue = _service.getQueue(facility1.getInternalId());
    assertEquals(1, queue.size());

    // make sure the corrected event is sent to storage queue
    verify(testEventReportingService).report(any());

    _service.addTestResult(devA.getInternalId(), TestResult.NEGATIVE, p2.getInternalId(), null);

    queue = _service.getQueue(facility1.getInternalId());
    assertEquals(0, queue.size());

    // make sure the second event is sent to storage queue
    verify(testEventReportingService, times(2)).report(any());
  }

  @Test
  @WithSimpleReportEntryOnlyAllFacilitiesUser
  void addTestResult_entryOnlyUserAllFacilities_ok() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _dataFactory.createFullPerson(org);
    _personService.updateTestResultDeliveryPreference(
        p.getInternalId(), TestResultDeliveryPreference.SMS);
    _service.addPatientToQueue(
        facility.getInternalId(), p, "", Collections.emptyMap(), LocalDate.of(1865, 12, 25), false);
    DeviceSpecimenType devA = _dataFactory.getGenericDeviceSpecimen();
    facility.addDefaultDeviceSpecimen(devA);

    _service.addTestResult(devA.getInternalId(), TestResult.POSITIVE, p.getInternalId(), null);

    verify(testResultsDeliveryService).smsTestResults(any(PatientLink.class));

    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(0, queue.size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addTestResult_testAlreadySubmitted_failure() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _dataFactory.createFullPerson(org);
    _personService.updateTestResultDeliveryPreference(
        p.getInternalId(), TestResultDeliveryPreference.SMS);
    _service.addPatientToQueue(
        facility.getInternalId(), p, "", Collections.emptyMap(), LocalDate.of(1865, 12, 25), false);
    DeviceSpecimenType devA = _dataFactory.getGenericDeviceSpecimen();
    facility.addDefaultDeviceSpecimen(devA);

    _service.addTestResult(devA.getInternalId(), TestResult.POSITIVE, p.getInternalId(), null);
    assertThrows(
        NonexistentQueueItemException.class,
        () ->
            _service.addTestResult(
                devA.getInternalId(), TestResult.POSITIVE, p.getInternalId(), null));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addTestResult_correction() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _dataFactory.createFullPerson(org);
    _service.addPatientToQueue(
        facility.getInternalId(), p, "", Collections.emptyMap(), LocalDate.of(1865, 12, 25), false);
    DeviceSpecimenType devA = _dataFactory.getGenericDeviceSpecimen();
    facility.addDefaultDeviceSpecimen(devA);

    // Create test event for a later correction
    _service.addTestResult(devA.getInternalId(), TestResult.POSITIVE, p.getInternalId(), null);
    List<TestEvent> testEvents =
        _testEventRepository.findAllByPatientAndFacilities(p, List.of(facility));
    assertEquals(1, testEvents.size());

    // Mark existing test order as "corrected", re-open as "pending" order status
    TestEvent originalTestEvent = testEvents.get(0);
    _service.markAsCorrection(originalTestEvent.getInternalId(), "Cold feet");

    // Issue test correction
    AddTestResultResponse response =
        _service.addTestResult(devA.getInternalId(), TestResult.NEGATIVE, p.getInternalId(), null);

    TestEvent correctionTestEvent = response.getTestOrder().getTestEvent();

    assertEquals(
        originalTestEvent.getInternalId(), correctionTestEvent.getPriorCorrectedTestEventId());
    assertEquals(TestCorrectionStatus.CORRECTED, correctionTestEvent.getCorrectionStatus());
    assertEquals("Cold feet", correctionTestEvent.getReasonForCorrection());
    assertEquals(TestResult.NEGATIVE, correctionTestEvent.getCovidTestResult().get());
    // Date of original test is overwritten by the new correction event
    assertNotEquals(
        LocalDate.of(1865, 12, 25),
        LocalDate.ofInstant(
            correctionTestEvent.getDateTested().toInstant(), ZoneId.systemDefault()));
    assertEquals(2, _resultRepository.findAllByTestOrder(response.getTestOrder()).size());
    assertEquals(1, _resultRepository.findAllByTestEvent(correctionTestEvent).size());
    assertEquals(1, _resultRepository.findAllByTestEvent(originalTestEvent).size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addTestResult_smsDelivery() {
    // GIVEN
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person patient = _dataFactory.createFullPerson(org);

    _personService.updateTestResultDeliveryPreference(
        patient.getInternalId(), TestResultDeliveryPreference.SMS);

    _service.addPatientToQueue(
        facility.getInternalId(),
        patient,
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceSpecimenType devA = _dataFactory.getGenericDeviceSpecimen();
    facility.addDefaultDeviceSpecimen(devA);
    when(testResultsDeliveryService.smsTestResults(any(PatientLink.class))).thenReturn(true);
    when(testResultsDeliveryService.smsTestResults(any(UUID.class))).thenReturn(true);

    // WHEN
    AddTestResultResponse res =
        _service.addTestResult(
            devA.getInternalId(), TestResult.POSITIVE, patient.getInternalId(), null);

    // THEN
    assertTrue(res.getDeliverySuccess());
    ArgumentCaptor<PatientLink> patientLinkCaptor = ArgumentCaptor.forClass(PatientLink.class);
    verify(testResultsDeliveryService).smsTestResults(patientLinkCaptor.capture());
    assertThat(patientLinkCaptor.getValue().getTestOrder().getPatient().getInternalId())
        .isEqualTo(patient.getInternalId());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addTestResult_smsDelivery_failure() {
    // GIVEN
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person patient = _dataFactory.createFullPerson(org);

    _personService.updateTestResultDeliveryPreference(
        patient.getInternalId(), TestResultDeliveryPreference.SMS);

    _service.addPatientToQueue(
        facility.getInternalId(),
        patient,
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceSpecimenType devA = _dataFactory.getGenericDeviceSpecimen();
    facility.addDefaultDeviceSpecimen(devA);

    when(testResultsDeliveryService.smsTestResults(any(PatientLink.class))).thenReturn(false);
    when(testResultsDeliveryService.smsTestResults(any(UUID.class))).thenReturn(false);

    // WHEN
    AddTestResultResponse res =
        _service.addTestResult(
            devA.getInternalId(), TestResult.POSITIVE, patient.getInternalId(), null);

    // THEN
    verify(testResultsDeliveryService).smsTestResults(any(PatientLink.class));
    assertFalse(res.getDeliverySuccess());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addTestResult_emailDelivery() {
    // GIVEN
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person patient = _dataFactory.createFullPerson(org);

    _personService.updateTestResultDeliveryPreference(
        patient.getInternalId(), TestResultDeliveryPreference.EMAIL);

    _service.addPatientToQueue(
        facility.getInternalId(),
        patient,
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceSpecimenType devA = _dataFactory.getGenericDeviceSpecimen();
    facility.addDefaultDeviceSpecimen(devA);

    when(testResultsDeliveryService.emailTestResults(any(PatientLink.class))).thenReturn(true);
    when(testResultsDeliveryService.emailTestResults(any(UUID.class))).thenReturn(true);

    // WHEN
    AddTestResultResponse res =
        _service.addTestResult(
            devA.getInternalId(), TestResult.POSITIVE, patient.getInternalId(), null);

    // THEN
    assertTrue(res.getDeliverySuccess());
    ArgumentCaptor<PatientLink> patientLinkCaptor = ArgumentCaptor.forClass(PatientLink.class);
    verify(testResultsDeliveryService).emailTestResults(patientLinkCaptor.capture());
    assertThat(patientLinkCaptor.getValue().getTestOrder().getPatient().getInternalId())
        .isEqualTo(patient.getInternalId());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addTestResult_emailDelivery_failure() {
    // GIVEN
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person patient = _dataFactory.createFullPerson(org);

    _personService.updateTestResultDeliveryPreference(
        patient.getInternalId(), TestResultDeliveryPreference.EMAIL);

    _service.addPatientToQueue(
        facility.getInternalId(),
        patient,
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceSpecimenType devA = _dataFactory.getGenericDeviceSpecimen();
    facility.addDefaultDeviceSpecimen(devA);

    when(testResultsDeliveryService.emailTestResults(any(PatientLink.class))).thenReturn(false);
    when(testResultsDeliveryService.emailTestResults(any(UUID.class))).thenReturn(false);

    // WHEN
    AddTestResultResponse res =
        _service.addTestResult(
            devA.getInternalId(), TestResult.POSITIVE, patient.getInternalId(), null);

    // THEN
    verify(testResultsDeliveryService).emailTestResults(any(PatientLink.class));
    assertFalse(res.getDeliverySuccess());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addTestResult_emailAndSmsDelivery() {
    // GIVEN
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person patient = _dataFactory.createFullPerson(org);

    _personService.updateTestResultDeliveryPreference(
        patient.getInternalId(), TestResultDeliveryPreference.ALL);

    _service.addPatientToQueue(
        facility.getInternalId(),
        patient,
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceSpecimenType devA = _dataFactory.getGenericDeviceSpecimen();
    facility.addDefaultDeviceSpecimen(devA);
    when(testResultsDeliveryService.emailTestResults(any(PatientLink.class))).thenReturn(true);
    when(testResultsDeliveryService.emailTestResults(any(UUID.class))).thenReturn(true);

    // WHEN
    AddTestResultResponse res =
        _service.addTestResult(
            devA.getInternalId(), TestResult.POSITIVE, patient.getInternalId(), null);

    // THEN
    verify(testResultsDeliveryService).emailTestResults(any(PatientLink.class));
    verify(testResultsDeliveryService).smsTestResults(any(PatientLink.class));
    assertTrue(res.getDeliverySuccess());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addTestResult_NoTestResultDelivery() {
    // GIVEN
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person patient = _dataFactory.createFullPerson(org);

    _personService.updateTestResultDeliveryPreference(
        patient.getInternalId(), TestResultDeliveryPreference.NONE);

    _service.addPatientToQueue(
        facility.getInternalId(),
        patient,
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceSpecimenType devA = _dataFactory.getGenericDeviceSpecimen();
    facility.addDefaultDeviceSpecimen(devA);

    // WHEN
    AddTestResultResponse res =
        _service.addTestResult(
            devA.getInternalId(), TestResult.POSITIVE, patient.getInternalId(), null);

    // THEN
    assertTrue(res.getDeliverySuccess());
    verifyNoInteractions(testResultsDeliveryService);
    verify(testEventReportingService).report(any());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addTestResult_savesResults() {
    // GIVEN
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person patient = _dataFactory.createFullPerson(org);

    _service.addPatientToQueue(
        facility.getInternalId(),
        patient,
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceSpecimenType devA = _dataFactory.getGenericDeviceSpecimen();
    facility.addDefaultDeviceSpecimen(devA);

    // WHEN
    AddTestResultResponse res =
        _service.addTestResult(
            devA.getInternalId(), TestResult.POSITIVE, patient.getInternalId(), null);

    // THEN
    List<Result> results = _resultRepository.findAllByTestOrder(res.getTestOrder());
    assertEquals(1, results.size());

    Result covidResult =
        _resultRepository.findResultByTestOrderAndDisease(
            res.getTestOrder(), _diseaseService.covid());
    assertEquals(TestResult.POSITIVE, covidResult.getTestResult());
    assertEquals(
        covidResult.getTestEvent().getInternalId(),
        res.getTestOrder().getTestEvent().getInternalId());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void editQueueItemMultiplexResult_worksWithSingleResult() {
    TestOrder order = addTestToQueue();

    MultiplexResultInput covidResult = new MultiplexResultInput("COVID-19", TestResult.POSITIVE);

    TestOrder updatedOrder =
        _service.editQueueItemMultiplexResult(
            order.getInternalId(),
            DEVICE_A.getInternalId(),
            List.of(covidResult),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    assertEquals(
        1, _service.getTestOrder(updatedOrder.getInternalId()).getPendingResultSet().size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void editQueueItemMultiplexResult_worksWithMultipleResults() {
    TestOrder order = addTestToQueue();

    MultiplexResultInput covidResult = new MultiplexResultInput("COVID-19", TestResult.POSITIVE);
    MultiplexResultInput fluAResult = new MultiplexResultInput("Flu A", TestResult.NEGATIVE);
    MultiplexResultInput fluBResult = new MultiplexResultInput("Flu B", TestResult.NEGATIVE);

    TestOrder updatedOrder =
        _service.editQueueItemMultiplexResult(
            order.getInternalId(),
            DEVICE_A.getInternalId(),
            List.of(covidResult, fluAResult, fluBResult),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    assertEquals(
        3, _service.getTestOrder(updatedOrder.getInternalId()).getPendingResultSet().size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void editQueueItemMultiplexResult_worksWithEmptyResults() {
    TestOrder order = addTestToQueue();

    TestOrder updatedOrder =
        _service.editQueueItemMultiplexResult(
            order.getInternalId(),
            DEVICE_A.getInternalId(),
            List.of(),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    assertTrue(_service.getTestOrder(updatedOrder.getInternalId()).getPendingResultSet().isEmpty());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addMultiplexResult_multipleEditsBeforeSubmissionSuccessful() {
    TestOrder order = addTestToQueue();

    MultiplexResultInput covidResult = new MultiplexResultInput("COVID-19", TestResult.POSITIVE);
    MultiplexResultInput fluAResult = new MultiplexResultInput("Flu A", TestResult.NEGATIVE);
    MultiplexResultInput fluBResult = new MultiplexResultInput("Flu B", TestResult.NEGATIVE);

    _service.editQueueItemMultiplexResult(
        order.getInternalId(),
        DEVICE_A.getInternalId(),
        List.of(covidResult, fluAResult, fluBResult),
        convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    MultiplexResultInput updatedCovidResult =
        new MultiplexResultInput("COVID-19", TestResult.NEGATIVE);
    TestOrder updatedOrder =
        _service.editQueueItemMultiplexResult(
            order.getInternalId(),
            DEVICE_A.getInternalId(),
            List.of(updatedCovidResult, fluAResult, fluBResult),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    assertEquals(
        3, _service.getTestOrder(updatedOrder.getInternalId()).getPendingResultSet().size());

    AddTestResultResponse response =
        _service.addMultiplexResult(
            updatedOrder.getDeviceSpecimen().getInternalId(),
            List.of(updatedCovidResult, fluAResult, fluBResult),
            order.getPatient().getInternalId(),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    assertEquals(3, _resultRepository.findAllByTestOrder(response.getTestOrder()).size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void multiplexResultMutations_covidOnlyCorrectionSuccessful() {
    TestOrder order = addTestToQueue();
    AddTestResultResponse response =
        _service.addMultiplexResult(
            order.getDeviceSpecimen().getInternalId(),
            List.of(new MultiplexResultInput("COVID-19", TestResult.POSITIVE)),
            order.getPatient().getInternalId(),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    TestEvent originalEvent = response.getTestOrder().getTestEvent();

    _service.markAsCorrection(originalEvent.getInternalId(), "Incorrect result");

    AddTestResultResponse correctedResponse =
        _service.addMultiplexResult(
            order.getDeviceSpecimen().getInternalId(),
            List.of(new MultiplexResultInput("COVID-19", TestResult.NEGATIVE)),
            order.getPatient().getInternalId(),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    assertEquals(2, _resultRepository.findAllByTestOrder(order).size());
    assertEquals(
        1,
        _resultRepository
            .findAllByTestEvent(correctedResponse.getTestOrder().getTestEvent())
            .size());
    assertEquals(1, _resultRepository.findAllByTestEvent(originalEvent).size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void multiplexResultMutations_multiplexCorrectionSuccessful() {

    List<MultiplexResultInput> originalResults =
        List.of(
            new MultiplexResultInput("COVID-19", TestResult.NEGATIVE),
            new MultiplexResultInput("Flu A", TestResult.POSITIVE),
            new MultiplexResultInput("Flu B", TestResult.NEGATIVE));

    TestOrder order = addTestToQueue();
    AddTestResultResponse response =
        _service.addMultiplexResult(
            order.getDeviceSpecimen().getInternalId(),
            originalResults,
            order.getPatient().getInternalId(),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    TestEvent originalEvent = response.getTestOrder().getTestEvent();

    _service.markAsCorrection(originalEvent.getInternalId(), "Incorrect result");

    List<MultiplexResultInput> correctedResults =
        List.of(
            new MultiplexResultInput("COVID-19", TestResult.NEGATIVE),
            new MultiplexResultInput("Flu A", TestResult.NEGATIVE),
            new MultiplexResultInput("Flu B", TestResult.NEGATIVE));

    AddTestResultResponse correctedResponse =
        _service.addMultiplexResult(
            order.getDeviceSpecimen().getInternalId(),
            correctedResults,
            order.getPatient().getInternalId(),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    assertEquals(6, _resultRepository.findAllByTestOrder(order).size());
    assertEquals(
        3,
        _resultRepository
            .findAllByTestEvent(correctedResponse.getTestOrder().getTestEvent())
            .size());
    assertEquals(3, _resultRepository.findAllByTestEvent(originalEvent).size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void multiplexResultMutations_removalSuccessful() {
    List<MultiplexResultInput> originalResults =
        List.of(
            new MultiplexResultInput("COVID-19", TestResult.NEGATIVE),
            new MultiplexResultInput("Flu A", TestResult.POSITIVE),
            new MultiplexResultInput("Flu B", TestResult.NEGATIVE));

    TestOrder order = addTestToQueue();
    AddTestResultResponse response =
        _service.addMultiplexResult(
            order.getDeviceSpecimen().getInternalId(),
            originalResults,
            order.getPatient().getInternalId(),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    TestEvent originalEvent = response.getTestOrder().getTestEvent();

    TestEvent removedEvent = _service.markAsError(originalEvent.getInternalId(), "Duplicate test");

    assertEquals(6, _resultRepository.findAllByTestOrder(order).size());
    assertEquals(3, _resultRepository.findAllByTestEvent(removedEvent).size());
    assertEquals(3, _resultRepository.findAllByTestEvent(originalEvent).size());
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
        () ->
            _service.getTestEventsResults(
                facility.getInternalId(), null, null, null, null, null, 0, 10));

    TestUserIdentities.setFacilityAuthorities(facility);
    _service.getTestEventsResults(facility.getInternalId(), null, null, null, null, null, 0, 10);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void fetchTestEventsAtArchivedFacility_orgAdminUser_ok() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createArchivedFacility(org, "deleted facility");
    Person p = _dataFactory.createMinimalPerson(org, facility);
    _dataFactory.createTestEvent(p, facility);

    _service.getTestEventsResults(facility.getInternalId(), null, null, null, null, null, 0, 10);
  }

  @Test
  @WithSimpleReportStandardUser
  void fetchTestEventsAtArchivedFacility_standardUser_failure() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createArchivedFacility(org, "deleted facility");
    Person p = _dataFactory.createMinimalPerson(org, facility);
    _dataFactory.createTestEvent(p, facility);

    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.getTestEventsResults(
                facility.getInternalId(), null, null, null, null, null, 0, 10));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void fetchAllFacilityTestEventsResults_orgAdminUser_ok() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createValidFacility(org);
    Person p = _dataFactory.createMinimalPerson(org, facility);
    _dataFactory.createTestEvent(p, facility);

    _service.getAllFacilityTestEventsResults(null, null, null, null, null, 0, 10);
  }

  @Test
  @WithSimpleReportStandardUser
  void fetchAllFacilityTestEventsResults_standardUser_failure() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createValidFacility(org);
    Person p = _dataFactory.createMinimalPerson(org, facility);
    _dataFactory.createTestEvent(p, facility);

    assertThrows(
        AccessDeniedException.class,
        () -> _service.getAllFacilityTestEventsResults(null, null, null, null, null, 0, 10));
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
    facility.addDefaultDeviceSpecimen(_dataFactory.getGenericDeviceSpecimen());
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
    facility.addDefaultDeviceSpecimen(_dataFactory.getGenericDeviceSpecimen());
    Person p = _dataFactory.createFullPerson(org);

    // add some initial data
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);

    // count queries
    long startQueryCount = _hibernateQueryInterceptor.getQueryCount();
    int firstQueryResults =
        _service
            .getTestEventsResults(facility.getInternalId(), null, null, null, null, null, 0, 50)
            .size();
    long firstPassTotal = _hibernateQueryInterceptor.getQueryCount() - startQueryCount;

    // add more data
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);

    // count queries again and make sure queries made didn't increase
    startQueryCount = _hibernateQueryInterceptor.getQueryCount();
    int secondQueryResults =
        _service
            .getTestEventsResults(facility.getInternalId(), null, null, null, null, null, 0, 50)
            .size();
    long secondPassTotal = _hibernateQueryInterceptor.getQueryCount() - startQueryCount;
    assertEquals(firstPassTotal, secondPassTotal);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void editTestResult_getQueue_NPlusOne() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    facility.addDefaultDeviceSpecimen(_dataFactory.getGenericDeviceSpecimen());
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
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "Spanish",
            null);

    _service.addPatientToQueue(
        facilityId, p1, "", Collections.emptyMap(), LocalDate.of(1865, 12, 25), false);

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
              "USA",
              TestDataFactory.getListOfOnePhoneNumber(),
              PersonRole.STAFF,
              null,
              null,
              null,
              null,
              null,
              false,
              false,
              "French",
              null);

      _service.addPatientToQueue(
          facilityId, p, "", Collections.emptyMap(), LocalDate.of(1865, 12, 25), false);
    }

    startQueryCount = _hibernateQueryInterceptor.getQueryCount();
    _service.getQueue(facility.getInternalId());
    long secondRunCount = _hibernateQueryInterceptor.getQueryCount() - startQueryCount;
    assertEquals(firstRunCount, secondRunCount);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void markAsErrorTest() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    DeviceSpecimenType device = _dataFactory.getGenericDeviceSpecimen();
    facility.addDefaultDeviceSpecimen(device);
    Person p = _dataFactory.createFullPerson(org);
    TestEvent _e = _dataFactory.createTestEvent(p, facility);
    TestOrder _o = _e.getTestOrder();

    String reasonMsg = "Testing correction marking as error " + LocalDateTime.now();
    TestEvent deleteMarkerEvent = _service.markAsError(_e.getInternalId(), reasonMsg);
    assertNotNull(deleteMarkerEvent);

    assertEquals(TestCorrectionStatus.REMOVED, deleteMarkerEvent.getCorrectionStatus());
    assertEquals(reasonMsg, deleteMarkerEvent.getReasonForCorrection());

    assertEquals(_e.getTestOrder().getInternalId(), _e.getTestOrderId());

    List<TestEvent> events_before =
        _service.getTestEventsResults(
            facility.getInternalId(), null, null, null, null, null, 0, 50);
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
        _service.getTestEventsResults(
            facility.getInternalId(), null, null, null, null, null, 0, 50);
    assertEquals(1, events_after.size());
    assertEquals(
        deleteMarkerEvent.getInternalId().toString(),
        events_after.get(0).getInternalId().toString());

    // verify that a Result object is created for both the original and new TestEvent
    assertEquals(2, _resultRepository.findAllByTestOrder(onlySavedOrder).size());
    assertEquals(1, _resultRepository.findAllByTestEvent(mostRecentEvent).size());
    assertEquals(1, _resultRepository.findAllByTestEvent(deleteMarkerEvent).size());

    // make sure the corrected event is sent to storage queue, which gets picked up to be delivered
    // to report stream
    verify(testEventReportingService).report(deleteMarkerEvent);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void correctionsTest() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    DeviceSpecimenType device = _dataFactory.getGenericDeviceSpecimen();
    facility.addDefaultDeviceSpecimen(device);
    Person p = _dataFactory.createFullPerson(org);
    TestEvent e = _dataFactory.createTestEvent(p, facility);

    String reasonMsg = "Testing correction marking as error " + LocalDateTime.now();

    // A test correction call just returns the original TestEvent...
    TestEvent originalEvent = _service.markAsCorrection(e.getInternalId(), reasonMsg);

    // ...but re-opens the original TestOrder and updates correction status
    TestOrder updatedOrder = originalEvent.getTestOrder();
    assertEquals(TestCorrectionStatus.CORRECTED, updatedOrder.getCorrectionStatus());
    assertEquals(reasonMsg, updatedOrder.getReasonForCorrection());
    assertEquals(e.getInternalId(), updatedOrder.getTestEvent().getInternalId());
    assertEquals(OrderStatus.PENDING, updatedOrder.getOrderStatus());

    // Unlike marking a test as deleted, which immediately creates a second TestEvent
    // that represents the removal, a test correction does not result in another
    // TestEvent being generated and saved
    long testEventCount = _testEventRepository.count();
    assertEquals(1, testEventCount);

    // Does not report to ReportStream
    verify(testEventReportingService, times(0)).report(e);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void correctTest_backDatedFromCurrentDate() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    DeviceSpecimenType device = _dataFactory.getGenericDeviceSpecimen();
    facility.addDefaultDeviceSpecimen(device);
    Person p = _dataFactory.createFullPerson(org);
    TestEvent e = _dataFactory.createTestEvent(p, facility);

    String reasonMsg = "Testing correction marking as error " + LocalDateTime.now();

    assertNull(e.getTestOrder().getDateTestedBackdate());

    // A test correction call just returns the original TestEvent...
    TestEvent originalEvent = _service.markAsCorrection(e.getInternalId(), reasonMsg);

    assertEquals(e.getDateTested(), originalEvent.getTestOrder().getDateTestedBackdate());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void correctTest_backdatePreserved() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    DeviceSpecimenType device = _dataFactory.getGenericDeviceSpecimen();
    facility.addDefaultDeviceSpecimen(device);
    Person p = _dataFactory.createFullPerson(org);

    LocalDate localDate = LocalDate.of(2022, 1, 1);
    Date dateTested = Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    TestEvent e = _dataFactory.createTestEvent(p, facility, null, TestResult.POSITIVE, dateTested);

    String reasonMsg = "Testing correction marking as error " + LocalDateTime.now();

    TestEvent originalEvent = _service.markAsCorrection(e.getInternalId(), reasonMsg);
    assertEquals(0, originalEvent.getTestOrder().getDateTestedBackdate().compareTo(dateTested));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void removeACorrectedTest_success() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    DeviceSpecimenType device = _dataFactory.getGenericDeviceSpecimen();
    facility.addDefaultDeviceSpecimen(device);
    Person p = _dataFactory.createFullPerson(org);
    TestEvent e = _dataFactory.createTestEvent(p, facility);

    // Re-open the original test as a correction
    String reasonMsg = "Testing correction marking as error " + LocalDateTime.now();
    _service.markAsCorrection(e.getInternalId(), reasonMsg);

    // Re-submit the corrected test
    AddTestResultResponse response =
        _service.addTestResult(
            device.getInternalId(), TestResult.UNDETERMINED, p.getInternalId(), null);
    TestEvent correctedEvent = response.getTestOrder().getTestEvent();

    assertEquals(
        2, _testEventRepository.findAllByPatientAndFacilities(p, List.of(facility)).size());
    assertEquals(1, _testOrderRepository.fetchPastResults(org, facility).size());

    // Now mark the corrected test as an error
    String removalMsg = "I changed my mind, remove this test " + LocalDateTime.now();
    TestEvent deleteCorrectedEvent =
        _service.markAsError(correctedEvent.getInternalId(), removalMsg);

    // There should only be a single TestOrder, but three TestEvents - the original, the corrected,
    // and the removed
    // There should also be exactly three Result objects for the order, one per TestEvent
    assertEquals(
        3, _testEventRepository.findAllByPatientAndFacilities(p, List.of(facility)).size());
    assertEquals(1, _testOrderRepository.fetchPastResults(org, facility).size());
    assertEquals(3, _resultRepository.findAllByTestOrder(response.getTestOrder()).size());
    assertEquals(1, _resultRepository.findAllByTestEvent(deleteCorrectedEvent).size());

    TestOrder order = deleteCorrectedEvent.getTestOrder();
    assertEquals(TestCorrectionStatus.REMOVED, order.getCorrectionStatus());
    assertEquals(removalMsg, order.getReasonForCorrection());
    assertEquals(deleteCorrectedEvent.getInternalId(), order.getTestEvent().getInternalId());
    assertEquals(OrderStatus.COMPLETED, order.getOrderStatus());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getTestEventsResults_pagination() {
    List<TestEvent> testEvents = makedata();
    List<TestEvent> results_page0 =
        _service.getTestEventsResults(_site.getInternalId(), null, null, null, null, null, 0, 5);
    List<TestEvent> results_page1 =
        _service.getTestEventsResults(_site.getInternalId(), null, null, null, null, null, 1, 5);
    List<TestEvent> results_page2 =
        _service.getTestEventsResults(_site.getInternalId(), null, null, null, null, null, 2, 5);
    List<TestEvent> results_page3 =
        _service.getTestEventsResults(_site.getInternalId(), null, null, null, null, null, 3, 5);

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
        _service.getTestEventsResults(
            _site.getInternalId(), null, TestResult.POSITIVE, null, null, null, 0, 10);
    List<TestEvent> negatives =
        _service.getTestEventsResults(
            _site.getInternalId(), null, TestResult.NEGATIVE, null, null, null, 0, 10);
    List<TestEvent> inconclusives =
        _service.getTestEventsResults(
            _site.getInternalId(), null, TestResult.UNDETERMINED, null, null, null, 0, 10);
    List<TestEvent> students =
        _service.getTestEventsResults(
            _site.getInternalId(), null, null, PersonRole.STUDENT, null, null, 0, 10);
    List<TestEvent> visitors =
        _service.getTestEventsResults(
            _site.getInternalId(), null, null, PersonRole.VISITOR, null, null, 0, 10);
    List<TestEvent> june1to3 =
        _service.getTestEventsResults(
            _site.getInternalId(),
            null,
            null,
            null,
            convertDate(LocalDateTime.of(2021, 6, 1, 0, 0, 0)),
            convertDate(LocalDateTime.of(2021, 6, 3, 23, 59, 59)),
            0,
            10);
    List<TestEvent> priorToJune2Noon =
        _service.getTestEventsResults(
            _site.getInternalId(),
            null,
            null,
            null,
            null,
            convertDate(LocalDateTime.of(2021, 6, 2, 11, 59, 59)),
            0,
            10);
    List<TestEvent> positivesAmos =
        _service.getTestEventsResults(
            _site.getInternalId(),
            _dataFactory.getPersonByName(AMOS).getInternalId(),
            TestResult.POSITIVE,
            null,
            null,
            null,
            0,
            10);
    List<TestEvent> negativesAmos =
        _service.getTestEventsResults(
            _site.getInternalId(),
            _dataFactory.getPersonByName(AMOS).getInternalId(),
            TestResult.NEGATIVE,
            null,
            null,
            null,
            0,
            10);
    List<TestEvent> allFilters =
        _service.getTestEventsResults(
            _site.getInternalId(),
            _dataFactory.getPersonByName(CHARLES).getInternalId(),
            TestResult.POSITIVE,
            PersonRole.RESIDENT,
            convertDate(LocalDateTime.of(2021, 6, 1, 0, 0, 0)),
            convertDate(LocalDateTime.of(2021, 6, 1, 23, 59, 59)),
            0,
            10);

    Collections.reverse(testEvents);

    assertTestResultsList(
        positives,
        testEvents.stream()
            .filter(t -> t.getCovidTestResult().orElse(null) == TestResult.POSITIVE)
            .collect(Collectors.toList()));
    assertTestResultsList(
        negatives,
        testEvents.stream()
            .filter(t -> t.getCovidTestResult().orElse(null) == TestResult.NEGATIVE)
            .collect(Collectors.toList()));
    assertTestResultsList(
        inconclusives,
        testEvents.stream()
            .filter(t -> t.getCovidTestResult().orElse(null) == TestResult.UNDETERMINED)
            .collect(Collectors.toList()));
    assertTestResultsList(
        students,
        testEvents.stream()
            .filter(t -> t.getPatient().getRole() == PersonRole.STUDENT)
            .collect(Collectors.toList()));
    assertTestResultsList(
        visitors,
        testEvents.stream()
            .filter(t -> t.getPatient().getRole() == PersonRole.VISITOR)
            .collect(Collectors.toList()));
    assertTestResultsList(
        june1to3,
        testEvents.stream()
            .filter(
                t ->
                    !t.getDateTested().before(convertDate(LocalDateTime.of(2021, 6, 1, 0, 0, 0)))
                        && !t.getDateTested()
                            .after(convertDate(LocalDateTime.of(2021, 6, 3, 23, 59, 59))))
            .collect(Collectors.toList()));
    assertTestResultsList(
        priorToJune2Noon,
        testEvents.stream()
            .filter(
                t -> t.getDateTested().before(convertDate(LocalDateTime.of(2021, 6, 2, 12, 0, 0))))
            .collect(Collectors.toList()));
    assertTestResultsList(
        positivesAmos,
        testEvents.stream()
            .filter(
                t ->
                    t.getCovidTestResult().orElse(null) == TestResult.POSITIVE
                        && t.getPatient().getNameInfo().equals(AMOS))
            .collect(Collectors.toList()));
    assertTestResultsList(
        negativesAmos,
        testEvents.stream()
            .filter(
                t ->
                    t.getCovidTestResult().orElse(null) == TestResult.NEGATIVE
                        && t.getPatient().getNameInfo().equals(AMOS))
            .collect(Collectors.toList()));
    assertTestResultsList(
        allFilters,
        testEvents.stream()
            .filter(
                t ->
                    t.getPatient().getNameInfo().equals(CHARLES)
                        && t.getCovidTestResult().orElse(null) == TestResult.POSITIVE
                        && t.getPatient().getRole() == PersonRole.RESIDENT
                        && !t.getDateTested()
                            .before(convertDate(LocalDateTime.of(2021, 6, 1, 0, 0, 0)))
                        && !t.getDateTested()
                            .after(convertDate(LocalDateTime.of(2021, 6, 1, 23, 59, 59))))
            .collect(Collectors.toList()));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getTestEventsResults_withMultiplex_returnsOnlyOneEvent() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createArchivedFacility(org, "deleted facility");
    Person p = _dataFactory.createMinimalPerson(org, facility);
    _dataFactory.createMultiplexTestEvent(
        p, facility, TestResult.POSITIVE, TestResult.NEGATIVE, TestResult.NEGATIVE, false);

    var res =
        _service.getTestEventsResults(
            facility.getInternalId(), null, null, null, null, null, 0, 10);
    assertEquals(1, res.size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getTestEventsResults_withMultiplexAndCovid_returnsOnlyTwoEvent() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createArchivedFacility(org, "deleted facility");
    Person p = _dataFactory.createMinimalPerson(org, facility);
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createMultiplexTestEvent(
        p, facility, TestResult.POSITIVE, TestResult.NEGATIVE, TestResult.NEGATIVE, false);

    var res =
        _service.getTestEventsResults(
            facility.getInternalId(), null, null, null, null, null, 0, 10);
    assertEquals(2, res.size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getTestEventsResults_withResultFilter_returnsFluAndCovidNegatives() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createArchivedFacility(org, "deleted facility");
    Person p = _dataFactory.createMinimalPerson(org, facility);
    var notExpected_allPos =
        _dataFactory.createMultiplexTestEvent(
            p, facility, TestResult.POSITIVE, TestResult.POSITIVE, TestResult.POSITIVE, false);
    var expected_allNeg =
        _dataFactory.createMultiplexTestEvent(
            p, facility, TestResult.NEGATIVE, TestResult.NEGATIVE, TestResult.NEGATIVE, true);
    var expected_covidPos =
        _dataFactory.createMultiplexTestEvent(
            p, facility, TestResult.POSITIVE, TestResult.NEGATIVE, TestResult.NEGATIVE, true);

    var res =
        _service.getTestEventsResults(
            facility.getInternalId(), null, TestResult.NEGATIVE, null, null, null, 0, 10);

    var expected = List.of(expected_allNeg.getInternalId(), expected_covidPos.getInternalId());
    var actualInternalIds = res.stream().map(TestEvent::getInternalId).collect(Collectors.toList());
    assertTrue(actualInternalIds.containsAll(expected));
    assertEquals(expected.size(), actualInternalIds.size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getTestResultsCount() {
    makedata();
    int size = _service.getTestResultsCount(_site.getInternalId(), null, null, null, null, null);
    assertEquals(11, size);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getOrganizationLevelDashboardMetrics_inOrgWithOrgAdmin_success() {
    makedata();
    Date startDate = Date.from(Instant.parse("2000-01-01T00:00:00Z"));
    Date endDate = new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(3));

    OrganizationLevelDashboardMetrics metrics =
        _service.getOrganizationLevelDashboardMetrics(startDate, endDate);
    assertEquals(3, metrics.getOrganizationPositiveTestCount());
    assertEquals(12, metrics.getOrganizationTotalTestCount());
    assertEquals(5, metrics.getOrganizationNegativeTestCount());
    assertEquals(4, metrics.getFacilityMetrics().size());
  }

  @Test
  @WithSimpleReportStandardAllFacilitiesUser
  void getOrganizationLevelDashboardMetrics_inOrgWithStandardUser_failure() {
    makedata();
    Date startDate = Date.from(Instant.parse("2000-01-01T00:00:00Z"));
    Date endDate = new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(3));

    assertThrows(
        AccessDeniedException.class,
        () -> {
          _service.getOrganizationLevelDashboardMetrics(startDate, endDate);
        });
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getTopLevelDashboardMetrics_inOrgWithOrgAdmin_success() {
    makedata();
    Date startDate = Date.from(Instant.parse("2000-01-01T00:00:00Z"));
    Date endDate = new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(3));

    TopLevelDashboardMetrics metrics =
        _service.getTopLevelDashboardMetrics(null, startDate, endDate);
    assertEquals(3, metrics.getPositiveTestCount());
    assertEquals(12, metrics.getTotalTestCount());
  }

  @Test
  @WithSimpleReportStandardAllFacilitiesUser
  void getTopLevelDashboardMetrics_inOrgWithStandardUser_failure() {
    makedata();
    Date startDate = Date.from(Instant.parse("2000-01-01T00:00:00Z"));
    Date endDate = new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(3));

    assertThrows(
        AccessDeniedException.class,
        () -> {
          _service.getTopLevelDashboardMetrics(null, startDate, endDate);
        });
  }

  @Test
  void markAsErrorTest_successDependsOnFacilityAccess() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createValidFacility(org);
    Person p = _dataFactory.createFullPerson(org);
    TestEvent _e = _dataFactory.createTestEvent(p, facility);

    String reasonMsg = "Testing correction marking as error " + LocalDateTime.now();
    assertThrows(
        AccessDeniedException.class, () -> _service.markAsError(_e.getInternalId(), reasonMsg));
    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.getTestEventsResults(
                facility.getInternalId(), null, null, null, null, null, 0, 10));
    assertThrows(
        AccessDeniedException.class,
        () -> _service.getTestResult(_e.getInternalId()).getTestOrder());

    // make sure the corrected event is not sent to storage queue
    verifyNoInteractions(testEventReportingService);

    TestUserIdentities.setFacilityAuthorities(facility);
    TestEvent correctedTestEvent = _service.markAsError(_e.getInternalId(), reasonMsg);
    _service.getTestEventsResults(facility.getInternalId(), null, null, null, null, null, 0, 10);
    _service.getTestResult(_e.getInternalId()).getTestOrder();
    // make sure the corrected event is sent to storage queue
    verify(testEventReportingService).report(correctedTestEvent);
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

    Map<PersonName, Date> patientsToDates = new HashMap<>();
    patientsToDates.put(AMOS, convertDate(LocalDateTime.of(2021, 6, 1, 0, 0, 0)));
    patientsToDates.put(CHARLES, convertDate(LocalDateTime.of(2021, 6, 1, 12, 0, 0)));
    patientsToDates.put(DEXTER, convertDate(LocalDateTime.of(2021, 6, 2, 0, 0, 0)));
    patientsToDates.put(ELIZABETH, convertDate(LocalDateTime.of(2021, 6, 2, 12, 0, 0)));
    patientsToDates.put(FRANK, convertDate(LocalDateTime.of(2021, 6, 3, 0, 0, 0)));
    patientsToDates.put(GALE, convertDate(LocalDateTime.of(2021, 6, 3, 12, 0, 0)));
    patientsToDates.put(HEINRICK, convertDate(LocalDateTime.of(2021, 6, 4, 0, 0, 0)));
    patientsToDates.put(IAN, convertDate(LocalDateTime.of(2021, 6, 4, 12, 0, 0)));
    patientsToDates.put(JANNELLE, convertDate(LocalDateTime.of(2021, 6, 5, 0, 0, 0)));
    patientsToDates.put(KACEY, convertDate(LocalDateTime.of(2021, 6, 5, 12, 0, 0)));
    patientsToDates.put(LEELOO, convertDate(LocalDateTime.of(2021, 6, 6, 0, 0, 0)));

    Map<PersonName, PersonRole> patientsToRoles = new HashMap<>();
    patientsToRoles.put(AMOS, PersonRole.RESIDENT);
    patientsToRoles.put(CHARLES, PersonRole.RESIDENT);
    patientsToRoles.put(DEXTER, PersonRole.STUDENT);
    patientsToRoles.put(ELIZABETH, PersonRole.STUDENT);
    patientsToRoles.put(FRANK, PersonRole.VISITOR);
    patientsToRoles.put(GALE, PersonRole.VISITOR);
    patientsToRoles.put(HEINRICK, PersonRole.STAFF);
    patientsToRoles.put(IAN, PersonRole.STAFF);
    patientsToRoles.put(JANNELLE, PersonRole.RESIDENT);
    patientsToRoles.put(KACEY, PersonRole.RESIDENT);
    patientsToRoles.put(LEELOO, PersonRole.STUDENT);

    Map<PersonName, AskOnEntrySurvey> patientsToSurveys = new HashMap<>();
    patientsToSurveys.put(AMOS, new AskOnEntrySurvey(null, Map.of("fake", true), false, null));
    patientsToSurveys.put(CHARLES, new AskOnEntrySurvey(null, Collections.emptyMap(), false, null));
    patientsToSurveys.put(DEXTER, new AskOnEntrySurvey(null, Collections.emptyMap(), true, null));
    patientsToSurveys.put(ELIZABETH, new AskOnEntrySurvey(null, Map.of("fake", true), false, null));
    patientsToSurveys.put(FRANK, new AskOnEntrySurvey(null, Collections.emptyMap(), false, null));
    patientsToSurveys.put(GALE, new AskOnEntrySurvey(null, Collections.emptyMap(), true, null));
    patientsToSurveys.put(HEINRICK, new AskOnEntrySurvey(null, Map.of("fake", true), false, null));
    patientsToSurveys.put(IAN, new AskOnEntrySurvey(null, Collections.emptyMap(), false, null));
    patientsToSurveys.put(JANNELLE, new AskOnEntrySurvey(null, Collections.emptyMap(), true, null));
    patientsToSurveys.put(KACEY, new AskOnEntrySurvey(null, Map.of("fake", true), false, null));
    patientsToSurveys.put(LEELOO, new AskOnEntrySurvey(null, Collections.emptyMap(), false, null));

    List<TestEvent> testEvents =
        patientsToResults.keySet().stream()
            .map(
                n -> {
                  PersonName p = n;
                  TestResult t = patientsToResults.get(n);
                  PersonRole r = patientsToRoles.get(n);
                  AskOnEntrySurvey s = patientsToSurveys.get(n);
                  Date d = patientsToDates.get(n);

                  Person person = _dataFactory.createMinimalPerson(org, _site, p, r);
                  return _dataFactory.createTestEvent(person, _site, s, t, d);
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
      fail("Expected " + expected.size() + " items but found " + found.size());
    }
  }

  private static Date convertDate(LocalDateTime dateTime) {
    return Date.from(dateTime.atZone(ZoneId.systemDefault()).toInstant());
  }

  private TestOrder addTestToQueue() {
    Organization org = _organizationService.getCurrentOrganization();
    Person patient = _dataFactory.createFullPerson(org);
    return addTestToQueue(org, patient);
  }

  private TestOrder addTestToQueue(Organization org, Person patient) {
    Facility facility = _organizationService.getFacilities(org).get(0);
    _personService.updateTestResultDeliveryPreference(
        patient.getInternalId(), TestResultDeliveryPreference.SMS);

    TestOrder order =
        _service.addPatientToQueue(
            facility.getInternalId(),
            patient,
            "",
            Collections.emptyMap(),
            LocalDate.of(2022, 06, 05),
            false);

    facility.addDefaultDeviceSpecimen(DEVICE_A);

    return order;
  }
}
