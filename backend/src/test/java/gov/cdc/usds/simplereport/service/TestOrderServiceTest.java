package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.test_util.TestDataBuilder.getAddress;
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
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.AddTestResultResponse;
import gov.cdc.usds.simplereport.api.model.OrganizationLevelDashboardMetrics;
import gov.cdc.usds.simplereport.api.model.TopLevelDashboardMetrics;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentQueueItemException;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.IdentifiedEntity;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
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
import gov.cdc.usds.simplereport.service.datasource.QueryCountService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
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
import java.util.Optional;
import java.util.Set;
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
import org.springframework.data.domain.Page;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = {"spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"})
@SuppressWarnings("checkstyle:MagicNumber")
class TestOrderServiceTest extends BaseServiceTest<TestOrderService> {

  @Autowired @SpyBean private OrganizationService _organizationService;
  @Autowired private PersonService _personService;
  @Autowired private TestEventRepository _testEventRepository;
  @Autowired @SpyBean private TestOrderRepository _testOrderRepository;
  @Autowired private ResultRepository _resultRepository;
  @Autowired private TestDataFactory _dataFactory;
  @SpyBean private PatientLinkService patientLinkService;
  @MockBean private TestResultsDeliveryService testResultsDeliveryService;

  @MockBean(name = "csvQueueReportingService")
  TestEventReportingService testEventReportingService;

  @MockBean(name = "fhirQueueReportingService")
  TestEventReportingService fhirQueueReportingService;

  @SpyBean ReportTestEventToRSEventListener reportTestEventToRSEventListener;

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
  private Facility _site;

  @BeforeEach
  void setupData() {
    initSampleData();
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
            getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English",
            null,
            null);

    _service.addPatientToQueue(
        facility.getInternalId(),
        patient,
        "",
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);

    UUID defaultDeviceType = facility.getDefaultDeviceType().getInternalId();
    UUID defaultSpecimenType = facility.getDefaultSpecimenType().getInternalId();

    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(1, queue.size());

    List<MultiplexResultInput> positiveCovidOnlyResult = makeCovidOnlyResult(TestResult.POSITIVE);
    // WHEN
    _service.addMultiplexResult(
        defaultDeviceType,
        defaultSpecimenType,
        positiveCovidOnlyResult,
        patient.getInternalId(),
        null);

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
    verify(fhirQueueReportingService).report(any());
    TestEvent sentEvent = testEventArgumentCaptor.getValue();
    TestResult testResult = sentEvent.getCovidTestResult().get();
    assertThat(sentEvent.getPatient().getInternalId()).isEqualTo(patient.getInternalId());
    assertThat(testResult).isEqualTo(TestResult.POSITIVE);
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
            getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English",
            null,
            null);

    _service.addPatientToQueue(
        facility.getInternalId(),
        p,
        "",
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);

    List<MultiplexResultInput> positiveCovidOnlyResult = makeCovidOnlyResult(TestResult.POSITIVE);
    _service.addMultiplexResult(
        _dataFactory.getGenericDevice().getInternalId(),
        _dataFactory.getGenericSpecimen().getInternalId(),
        positiveCovidOnlyResult,
        p.getInternalId(),
        null);

    verify(testEventReportingService).report(any());
    verify(fhirQueueReportingService).report(any());

    List<TestEvent> testEvents =
        _testEventRepository.findAllByPatientAndFacilities(p, List.of(facility));
    assertThat(testEvents).hasSize(1);
    assertThat(testEvents.get(0).getPatientHasPriorTests()).isFalse();

    _service.addPatientToQueue(
        facility.getInternalId(),
        p,
        "",
        "",
        Collections.emptyMap(),
        LocalDate.of(1866, 12, 25),
        false);
    _service.addMultiplexResult(
        _dataFactory.getGenericDevice().getInternalId(),
        _dataFactory.getGenericSpecimen().getInternalId(),
        positiveCovidOnlyResult,
        p.getInternalId(),
        null);

    testEvents = _testEventRepository.findAllByPatientAndFacilities(p, List.of(facility));
    assertThat(testEvents).hasSize(2);
    assertThat(testEvents.get(0).getPatientHasPriorTests()).isFalse();
    assertThat(testEvents.get(1).getPatientHasPriorTests()).isTrue();
    verify(testEventReportingService, times(2)).report(any());
    verify(fhirQueueReportingService, times(2)).report(any());
  }

  @Test
  @WithSimpleReportStandardUser
  void getQueue_standardUser_successDependsOnFacilityAccess() {
    Facility facility =
        _dataFactory.createValidFacility(_organizationService.getCurrentOrganization());

    UUID facilityId = facility.getInternalId();
    assertThrows(AccessDeniedException.class, () -> _service.getQueue(facilityId));

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
            getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "Spanish",
            null,
            "Space-faring maverick");

    _service.addPatientToQueue(
        facility.getInternalId(),
        p,
        "",
        "",
        Collections.emptyMap(),
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
            getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "German",
            null,
            "success depends on Fred's access");

    UUID facilityId = facility.getInternalId();
    Map<String, Boolean> symptoms = Collections.emptyMap();
    LocalDate symptomOnsetDate = LocalDate.of(1865, 12, 25);

    assertThrows(
        AccessDeniedException.class,
        () -> _service.addPatientToQueue(facilityId, p, "", "", symptoms, symptomOnsetDate, false));

    TestUserIdentities.setFacilityAuthorities(facility);
    _service.addPatientToQueue(
        facility.getInternalId(),
        p,
        "",
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    TestUserIdentities.setFacilityAuthorities();

    assertThrows(AccessDeniedException.class, () -> _service.getQueue(facilityId));

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
            getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "French",
            null,
            null);
    _personService.updateTestResultDeliveryPreference(
        p.getInternalId(), TestResultDeliveryPreference.SMS);
    _service.addPatientToQueue(
        facility.getInternalId(),
        p,
        "",
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);

    UUID defaultDeviceType = facility.getDefaultDeviceType().getInternalId();
    UUID defaultSpecimenType = facility.getDefaultSpecimenType().getInternalId();

    List<MultiplexResultInput> positiveCovidResult = makeCovidOnlyResult(TestResult.POSITIVE);

    _service.addMultiplexResult(
        defaultDeviceType, defaultSpecimenType, positiveCovidResult, p.getInternalId(), null);

    verify(testResultsDeliveryService).smsTestResults(any(PatientLink.class));

    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(0, queue.size());
    verify(testEventReportingService).report(any());
    verify(fhirQueueReportingService).report(any());
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
            getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "Spanish",
            null,
            null);
    _service.addPatientToQueue(
        facility.getInternalId(),
        p,
        "",
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);

    UUID defaultDeviceType = facility.getDefaultDeviceType().getInternalId();
    UUID defaultSpecimenType = facility.getDefaultSpecimenType().getInternalId();

    List<MultiplexResultInput> positiveCovidOnlyResult = makeCovidOnlyResult(TestResult.POSITIVE);

    _service.addMultiplexResult(
        defaultDeviceType, defaultSpecimenType, positiveCovidOnlyResult, p.getInternalId(), null);

    List<TestOrder> queue = _service.getQueue(facility.getInternalId());
    assertEquals(0, queue.size());
    verify(testEventReportingService).report(any());
    verify(fhirQueueReportingService).report(any());
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
            getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "English",
            null,
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
            getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STUDENT,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "Spanish",
            null,
            null);

    _service.addPatientToQueue(
        facility1.getInternalId(),
        p1,
        "",
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    _service.addPatientToQueue(
        facility1.getInternalId(),
        p2,
        "",
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);

    TestUserIdentities.setFacilityAuthorities();

    UUID deviceId = _dataFactory.getGenericDevice().getInternalId();
    UUID specimenId = _dataFactory.getGenericSpecimen().getInternalId();
    List<MultiplexResultInput> positiveCovidOnlyResult = makeCovidOnlyResult(TestResult.POSITIVE);
    UUID patientTwoId = p2.getInternalId();

    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.addMultiplexResult(
                deviceId, specimenId, positiveCovidOnlyResult, patientTwoId, null));

    UUID patientOneId = p1.getInternalId();
    // caller has access to the patient (whose facility is null)
    // but cannot modify the test order which was created at a non-accessible facility
    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.addMultiplexResult(
                deviceId, specimenId, positiveCovidOnlyResult, patientOneId, null));

    // make sure the nothing was sent to storage queue
    verifyNoInteractions(testEventReportingService);

    TestUserIdentities.setFacilityAuthorities(facility1);
    _service.addMultiplexResult(
        deviceId, specimenId, positiveCovidOnlyResult, p1.getInternalId(), null);
    List<TestOrder> queue = _service.getQueue(facility1.getInternalId());
    assertEquals(1, queue.size());

    // make sure the corrected event is sent to storage queue
    verify(testEventReportingService).report(any());
    verify(fhirQueueReportingService).report(any());

    List<MultiplexResultInput> negativeCovidResult = makeCovidOnlyResult(TestResult.NEGATIVE);

    _service.addMultiplexResult(
        deviceId, specimenId, negativeCovidResult, p2.getInternalId(), null);

    queue = _service.getQueue(facility1.getInternalId());
    assertEquals(0, queue.size());

    // make sure the second event is sent to storage queue
    verify(testEventReportingService, times(2)).report(any());
    verify(fhirQueueReportingService, times(2)).report(any());
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
        facility.getInternalId(),
        p,
        "",
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceType deviceType = _dataFactory.getGenericDevice();
    SpecimenType specimenType = _dataFactory.getGenericSpecimen();
    facility.setDefaultDeviceTypeSpecimenType(deviceType, specimenType);
    List<MultiplexResultInput> positiveCovidOnlyResult = makeCovidOnlyResult(TestResult.POSITIVE);
    _service.addMultiplexResult(
        deviceType.getInternalId(),
        specimenType.getInternalId(),
        positiveCovidOnlyResult,
        p.getInternalId(),
        null);

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
        facility.getInternalId(),
        p,
        "",
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceType deviceType = _dataFactory.getGenericDevice();
    SpecimenType specimenType = _dataFactory.getGenericSpecimen();
    facility.setDefaultDeviceTypeSpecimenType(deviceType, specimenType);

    List<MultiplexResultInput> positiveCovidResult = makeCovidOnlyResult(TestResult.POSITIVE);
    _service.addMultiplexResult(
        deviceType.getInternalId(),
        specimenType.getInternalId(),
        positiveCovidResult,
        p.getInternalId(),
        null);
    UUID deviceId = deviceType.getInternalId();
    UUID specimentId = specimenType.getInternalId();
    UUID patientId = p.getInternalId();

    assertThrows(
        NonexistentQueueItemException.class,
        () ->
            _service.addMultiplexResult(
                deviceId, specimentId, positiveCovidResult, patientId, null));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addTestResult_correction() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person p = _dataFactory.createFullPerson(org);
    _service.addPatientToQueue(
        facility.getInternalId(),
        p,
        "",
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceType deviceType = _dataFactory.getGenericDevice();
    SpecimenType specimenType = _dataFactory.getGenericSpecimen();
    facility.setDefaultDeviceTypeSpecimenType(deviceType, specimenType);

    // Create test event for a later correction
    List<MultiplexResultInput> positiveCovidOnlyResult = makeCovidOnlyResult(TestResult.POSITIVE);
    _service.addMultiplexResult(
        deviceType.getInternalId(),
        specimenType.getInternalId(),
        positiveCovidOnlyResult,
        p.getInternalId(),
        null);
    List<TestEvent> testEvents =
        _testEventRepository.findAllByPatientAndFacilities(p, List.of(facility));
    assertEquals(1, testEvents.size());

    // Mark existing test order as "corrected", re-open as "pending" order status
    TestEvent originalTestEvent = testEvents.get(0);
    _service.markAsCorrection(originalTestEvent.getInternalId(), "Cold feet");

    // Issue test correction
    List<MultiplexResultInput> negativeCovidOnlyResult = makeCovidOnlyResult(TestResult.NEGATIVE);
    AddTestResultResponse response =
        _service.addMultiplexResult(
            deviceType.getInternalId(),
            specimenType.getInternalId(),
            negativeCovidOnlyResult,
            p.getInternalId(),
            null);

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
    assertEquals(1, _resultRepository.findAllByTestOrder(response.getTestOrder()).size());
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
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceType deviceType = _dataFactory.getGenericDevice();
    SpecimenType specimenType = _dataFactory.getGenericSpecimen();
    facility.setDefaultDeviceTypeSpecimenType(deviceType, specimenType);
    when(testResultsDeliveryService.smsTestResults(any(PatientLink.class))).thenReturn(true);
    when(testResultsDeliveryService.smsTestResults(any(UUID.class))).thenReturn(true);

    // WHEN
    List<MultiplexResultInput> positiveCovidOnlyResult = makeCovidOnlyResult(TestResult.POSITIVE);
    AddTestResultResponse res =
        _service.addMultiplexResult(
            deviceType.getInternalId(),
            specimenType.getInternalId(),
            positiveCovidOnlyResult,
            patient.getInternalId(),
            null);

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
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceType deviceType = _dataFactory.getGenericDevice();
    SpecimenType specimenType = _dataFactory.getGenericSpecimen();
    facility.setDefaultDeviceTypeSpecimenType(deviceType, specimenType);

    when(testResultsDeliveryService.smsTestResults(any(PatientLink.class))).thenReturn(false);
    when(testResultsDeliveryService.smsTestResults(any(UUID.class))).thenReturn(false);

    // WHEN
    List<MultiplexResultInput> positiveCovidOnlyResult = makeCovidOnlyResult(TestResult.POSITIVE);
    AddTestResultResponse res =
        _service.addMultiplexResult(
            deviceType.getInternalId(),
            specimenType.getInternalId(),
            positiveCovidOnlyResult,
            patient.getInternalId(),
            null);

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
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceType deviceType = _dataFactory.getGenericDevice();
    SpecimenType specimenType = _dataFactory.getGenericSpecimen();
    facility.setDefaultDeviceTypeSpecimenType(deviceType, specimenType);

    when(testResultsDeliveryService.emailTestResults(any(PatientLink.class))).thenReturn(true);
    when(testResultsDeliveryService.emailTestResults(any(UUID.class))).thenReturn(true);

    // WHEN
    List<MultiplexResultInput> positiveCovidOnlyResult = makeCovidOnlyResult(TestResult.POSITIVE);
    AddTestResultResponse res =
        _service.addMultiplexResult(
            deviceType.getInternalId(),
            specimenType.getInternalId(),
            positiveCovidOnlyResult,
            patient.getInternalId(),
            null);

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
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceType deviceType = _dataFactory.getGenericDevice();
    SpecimenType specimenType = _dataFactory.getGenericSpecimen();
    facility.setDefaultDeviceTypeSpecimenType(deviceType, specimenType);

    when(testResultsDeliveryService.emailTestResults(any(PatientLink.class))).thenReturn(false);
    when(testResultsDeliveryService.emailTestResults(any(UUID.class))).thenReturn(false);

    // WHEN
    List<MultiplexResultInput> positiveCovidOnlyResult = makeCovidOnlyResult(TestResult.POSITIVE);
    AddTestResultResponse res =
        _service.addMultiplexResult(
            deviceType.getInternalId(),
            specimenType.getInternalId(),
            positiveCovidOnlyResult,
            patient.getInternalId(),
            null);

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
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceType deviceType = _dataFactory.getGenericDevice();
    SpecimenType specimenType = _dataFactory.getGenericSpecimen();
    facility.setDefaultDeviceTypeSpecimenType(deviceType, specimenType);
    when(testResultsDeliveryService.emailTestResults(any(PatientLink.class))).thenReturn(true);
    when(testResultsDeliveryService.emailTestResults(any(UUID.class))).thenReturn(true);

    // WHEN
    List<MultiplexResultInput> positiveCovidOnlyResult = makeCovidOnlyResult(TestResult.POSITIVE);

    AddTestResultResponse res =
        _service.addMultiplexResult(
            deviceType.getInternalId(),
            specimenType.getInternalId(),
            positiveCovidOnlyResult,
            patient.getInternalId(),
            null);

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
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceType deviceType = _dataFactory.getGenericDevice();
    SpecimenType specimenType = _dataFactory.getGenericSpecimen();
    facility.setDefaultDeviceTypeSpecimenType(deviceType, specimenType);

    // WHEN
    List<MultiplexResultInput> positiveCovidOnlyResult = makeCovidOnlyResult(TestResult.POSITIVE);
    AddTestResultResponse res =
        _service.addMultiplexResult(
            deviceType.getInternalId(),
            specimenType.getInternalId(),
            positiveCovidOnlyResult,
            patient.getInternalId(),
            null);

    // THEN
    assertTrue(res.getDeliverySuccess());
    verifyNoInteractions(testResultsDeliveryService);
    verify(testEventReportingService).report(any());
    verify(fhirQueueReportingService).report(any());
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
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceType deviceType = _dataFactory.getGenericDevice();
    SpecimenType specimenType = _dataFactory.getGenericSpecimen();
    facility.setDefaultDeviceTypeSpecimenType(deviceType, specimenType);

    // WHEN
    List<MultiplexResultInput> positiveCovidOnlyResult = makeCovidOnlyResult(TestResult.POSITIVE);
    AddTestResultResponse res =
        _service.addMultiplexResult(
            deviceType.getInternalId(),
            specimenType.getInternalId(),
            positiveCovidOnlyResult,
            patient.getInternalId(),
            null);

    // THEN
    List<Result> testOrderResults = _resultRepository.findAllByTestOrder(res.getTestOrder());
    List<Result> testEventResults =
        _resultRepository.findAllByTestEvent(res.getTestOrder().getTestEvent());
    assertEquals(1, testOrderResults.size());
    assertEquals(1, testEventResults.size());

    Result testOrderResult = testOrderResults.get(0);
    Result testEventResult = testEventResults.get(0);

    // we create two different results, 1 mutable for the testOrder, 1 immutable for the testEvent
    assertThat(testOrderResult).isNotEqualTo(testEventResult);

    // verify the testOrder Result
    assertThat(testOrderResult.getTestOrder()).isNotNull();
    assertThat(testOrderResult.getTestEvent()).isNull();
    assertThat(testOrderResult.getTestResult()).isEqualTo(TestResult.POSITIVE);
    assertThat(testOrderResult.getDisease()).isEqualTo(_diseaseService.covid());

    // verify the testEvent Result
    assertThat(testEventResult.getTestOrder()).isNull();
    assertThat(testEventResult.getTestEvent()).isNotNull();
    assertThat(testEventResult.getTestResult()).isEqualTo(TestResult.POSITIVE);
    assertThat(testEventResult.getDisease()).isEqualTo(_diseaseService.covid());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void editQueueItemMultiplexResult_worksWithSingleResult() {
    TestOrder order = addTestToQueue();

    MultiplexResultInput covidResult = new MultiplexResultInput("COVID-19", TestResult.POSITIVE);

    TestOrder updatedOrder =
        _service.editQueueItemMultiplexResult(
            order.getInternalId(),
            _dataFactory.getGenericDevice().getInternalId(),
            _dataFactory.getGenericSpecimen().getInternalId(),
            List.of(covidResult),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    assertEquals(1, _service.getTestOrder(updatedOrder.getInternalId()).getResults().size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void editQueueItemMultiplexResult_worksWithMultipleResults() {
    TestOrder order = addTestToQueue();

    TestOrder updatedOrder =
        _service.editQueueItemMultiplexResult(
            order.getInternalId(),
            _dataFactory.getGenericDevice().getInternalId(),
            _dataFactory.getGenericSpecimen().getInternalId(),
            makeMultiplexTestResult(TestResult.POSITIVE, TestResult.NEGATIVE, TestResult.NEGATIVE),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    assertEquals(3, _service.getTestOrder(updatedOrder.getInternalId()).getResults().size());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void editQueueItemMultiplexResult_worksWithEmptyResults() {
    TestOrder order = addTestToQueue();

    TestOrder updatedOrder =
        _service.editQueueItemMultiplexResult(
            order.getInternalId(),
            _dataFactory.getGenericDevice().getInternalId(),
            _dataFactory.getGenericSpecimen().getInternalId(),
            List.of(),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    assertTrue(_service.getTestOrder(updatedOrder.getInternalId()).getResults().isEmpty());
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
        _dataFactory.getGenericDevice().getInternalId(),
        _dataFactory.getGenericSpecimen().getInternalId(),
        List.of(covidResult, fluAResult, fluBResult),
        convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    MultiplexResultInput updatedCovidResult =
        new MultiplexResultInput("COVID-19", TestResult.NEGATIVE);
    TestOrder updatedOrder =
        _service.editQueueItemMultiplexResult(
            order.getInternalId(),
            _dataFactory.getGenericDevice().getInternalId(),
            _dataFactory.getGenericSpecimen().getInternalId(),
            List.of(updatedCovidResult, fluAResult, fluBResult),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    assertEquals(3, _service.getTestOrder(updatedOrder.getInternalId()).getResults().size());

    AddTestResultResponse response =
        _service.addMultiplexResult(
            updatedOrder.getDeviceType().getInternalId(),
            updatedOrder.getSpecimenType().getInternalId(),
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
            order.getDeviceType().getInternalId(),
            order.getSpecimenType().getInternalId(),
            List.of(new MultiplexResultInput("COVID-19", TestResult.POSITIVE)),
            order.getPatient().getInternalId(),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    TestEvent originalEvent = response.getTestOrder().getTestEvent();

    _service.markAsCorrection(originalEvent.getInternalId(), "Incorrect result");

    AddTestResultResponse correctedResponse =
        _service.addMultiplexResult(
            order.getDeviceType().getInternalId(),
            order.getSpecimenType().getInternalId(),
            List.of(new MultiplexResultInput("COVID-19", TestResult.NEGATIVE)),
            order.getPatient().getInternalId(),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    assertEquals(1, _resultRepository.findAllByTestOrder(order).size());
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
        makeMultiplexTestResult(TestResult.NEGATIVE, TestResult.POSITIVE, TestResult.POSITIVE);

    TestOrder order = addTestToQueue();
    AddTestResultResponse response =
        _service.addMultiplexResult(
            order.getDeviceType().getInternalId(),
            order.getSpecimenType().getInternalId(),
            originalResults,
            order.getPatient().getInternalId(),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    TestEvent originalEvent = response.getTestOrder().getTestEvent();

    _service.markAsCorrection(originalEvent.getInternalId(), "Incorrect result");

    List<MultiplexResultInput> correctedResults =
        makeMultiplexTestResult(TestResult.NEGATIVE, TestResult.NEGATIVE, TestResult.NEGATIVE);

    AddTestResultResponse correctedResponse =
        _service.addMultiplexResult(
            order.getDeviceType().getInternalId(),
            order.getSpecimenType().getInternalId(),
            correctedResults,
            order.getPatient().getInternalId(),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    assertEquals(3, _resultRepository.findAllByTestOrder(order).size());
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
        makeMultiplexTestResult(TestResult.NEGATIVE, TestResult.POSITIVE, TestResult.NEGATIVE);

    TestOrder order = addTestToQueue();
    AddTestResultResponse response =
        _service.addMultiplexResult(
            order.getDeviceType().getInternalId(),
            order.getSpecimenType().getInternalId(),
            originalResults,
            order.getPatient().getInternalId(),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    TestEvent originalEvent = response.getTestOrder().getTestEvent();

    TestEvent removedEvent = _service.markAsError(originalEvent.getInternalId(), "Duplicate test");

    assertEquals(3, _resultRepository.findAllByTestOrder(order).size());
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
    UUID facilityId = facility.getInternalId();

    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.getFacilityTestEventsResults(facilityId, null, null, null, null, null, 0, 10));

    TestUserIdentities.setFacilityAuthorities(facility);
    _service.getFacilityTestEventsResults(
        facility.getInternalId(), null, null, null, null, null, 0, 10);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void fetchTestEventsAtArchivedFacility_orgAdminUser_ok() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createArchivedFacility(org, "deleted facility");
    Person p = _dataFactory.createMinimalPerson(org, facility);
    _dataFactory.createTestEvent(p, facility);

    Page<TestEvent> testEventsByFacility =
        _service.getFacilityTestEventsResults(
            facility.getInternalId(), null, null, null, null, null, 0, 10);
    assertThat(testEventsByFacility.getTotalElements()).isEqualTo(1);
    assertThat(testEventsByFacility.getTotalPages()).isEqualTo(1);
  }

  @Test
  @WithSimpleReportStandardUser
  void fetchTestEventsAtArchivedFacility_standardUser_failure() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createArchivedFacility(org, "deleted facility");
    Person p = _dataFactory.createMinimalPerson(org, facility);
    _dataFactory.createTestEvent(p, facility);
    UUID facilityId = facility.getInternalId();

    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.getFacilityTestEventsResults(facilityId, null, null, null, null, null, 0, 10));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void fetchAllFacilityTestEventsResults_orgAdminUser_ok() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createValidFacility(org);
    Person p = _dataFactory.createMinimalPerson(org, facility);
    _dataFactory.createTestEvent(p, facility);

    Page<TestEvent> testEventsByOrg =
        _service.getOrganizationTestEventsResults(null, null, null, null, null, 0, 10);
    assertThat(testEventsByOrg.getTotalElements()).isEqualTo(1);
    assertThat(testEventsByOrg.getTotalPages()).isEqualTo(1);
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
        () -> _service.getOrganizationTestEventsResults(null, null, null, null, null, 0, 10));
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
    facility.setDefaultDeviceTypeSpecimenType(
        _dataFactory.getGenericDevice(), _dataFactory.getGenericSpecimen());
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
    facility.setDefaultDeviceTypeSpecimenType(
        _dataFactory.getGenericDevice(), _dataFactory.getGenericSpecimen());
    Person p = _dataFactory.createFullPerson(org);

    // add some initial data
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);

    // count queries
    long startQueryCount = QueryCountService.get().getSelect();
    _service.getFacilityTestEventsResults(
        facility.getInternalId(), null, null, null, null, null, 0, 50);
    long firstPassTotal = QueryCountService.get().getSelect() - startQueryCount;

    // add more data
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);
    _dataFactory.createTestEvent(p, facility);

    // count queries again and make sure queries made didn't increase
    startQueryCount = QueryCountService.get().getSelect();
    _service.getFacilityTestEventsResults(
        facility.getInternalId(), null, null, null, null, null, 0, 50);
    long secondPassTotal = QueryCountService.get().getSelect() - startQueryCount;
    assertEquals(firstPassTotal, secondPassTotal);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void editTestResult_getQueue_NPlusOne() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    facility.setDefaultDeviceTypeSpecimenType(
        _dataFactory.getGenericDevice(), _dataFactory.getGenericSpecimen());
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
            getAddress(),
            "USA",
            TestDataFactory.getListOfOnePhoneNumber(),
            PersonRole.STAFF,
            null,
            null,
            null,
            null,
            null,
            null,
            false,
            false,
            "Spanish",
            null,
            null);

    _service.addPatientToQueue(
        facilityId, p1, "", "", Collections.emptyMap(), LocalDate.of(1865, 12, 25), false);

    // get the first query count
    long startQueryCount = QueryCountService.get().getSelect();
    _service.getQueue(facility.getInternalId());
    long firstRunCount = QueryCountService.get().getSelect() - startQueryCount;

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
              getAddress(),
              "USA",
              TestDataFactory.getListOfOnePhoneNumber(),
              PersonRole.STAFF,
              null,
              null,
              null,
              null,
              null,
              null,
              false,
              false,
              "French",
              null,
              null);

      _service.addPatientToQueue(
          facilityId, p, "", "", Collections.emptyMap(), LocalDate.of(1865, 12, 25), false);
    }

    startQueryCount = QueryCountService.get().getSelect();
    _service.getQueue(facility.getInternalId());
    long secondRunCount = QueryCountService.get().getSelect() - startQueryCount;
    assertEquals(firstRunCount, secondRunCount);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void markAsErrorTest() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    facility.setDefaultDeviceTypeSpecimenType(
        _dataFactory.getGenericDevice(), _dataFactory.getGenericSpecimen());
    Person person = _dataFactory.createFullPerson(org);
    TestEvent testEvent = _dataFactory.createTestEvent(person, facility);

    String reasonMsg = "Testing correction marking as error " + LocalDateTime.now();
    TestEvent deleteMarkerEvent = _service.markAsError(testEvent.getInternalId(), reasonMsg);
    assertNotNull(deleteMarkerEvent);

    assertEquals(TestCorrectionStatus.REMOVED, deleteMarkerEvent.getCorrectionStatus());
    assertEquals(reasonMsg, deleteMarkerEvent.getReasonForCorrection());

    assertEquals(testEvent.getTestOrder().getInternalId(), testEvent.getTestOrderId());

    List<TestEvent> events_before =
        _service
            .getFacilityTestEventsResults(
                facility.getInternalId(), null, null, null, null, null, 0, 50)
            .toList();
    assertEquals(1, events_before.size());

    // verify the original order was updated
    TestEvent refreshedTestResult = _service.getTestResult(testEvent.getInternalId());
    TestOrder onlySavedOrder = refreshedTestResult.getTestOrder();
    TestEvent mostRecentEvent = onlySavedOrder.getTestEvent();
    assertEquals(reasonMsg, onlySavedOrder.getReasonForCorrection());
    assertEquals(deleteMarkerEvent.getInternalId(), mostRecentEvent.getInternalId());
    assertEquals(TestCorrectionStatus.REMOVED, onlySavedOrder.getCorrectionStatus());

    // make sure the original item is removed from the result and ONLY the
    // "corrected" removed one is shown
    List<TestEvent> events_after =
        _service
            .getFacilityTestEventsResults(
                facility.getInternalId(), null, null, null, null, null, 0, 50)
            .toList();
    assertEquals(1, events_after.size());
    assertEquals(
        deleteMarkerEvent.getInternalId().toString(),
        events_after.get(0).getInternalId().toString());

    // verify that a Result object is created for the original and new TestEvent and one for the
    // TestOrder
    assertEquals(1, _resultRepository.findAllByTestOrder(onlySavedOrder).size());
    assertEquals(1, _resultRepository.findAllByTestEvent(mostRecentEvent).size());
    assertEquals(1, _resultRepository.findAllByTestEvent(deleteMarkerEvent).size());

    // make sure the corrected event is sent to storage queue, which gets picked up to be delivered
    // to report stream
    verify(testEventReportingService).report(deleteMarkerEvent);
    verify(fhirQueueReportingService).report(any());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void markAsErrorTest_usesCorrectDeviceAndSpecimenFacilityHasBeenUpdated() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    DeviceType device = _dataFactory.getGenericDevice();
    SpecimenType specimen = _dataFactory.getGenericSpecimen();
    facility.setDefaultDeviceTypeSpecimenType(device, specimen);
    Person person = _dataFactory.createFullPerson(org);
    TestEvent testEvent = _dataFactory.createTestEvent(person, facility);

    facility.getAddress().setState("ND");
    _organizationService.updateFacility(
        facility.getInternalId(),
        facility.getFacilityName(),
        facility.getCliaNumber(),
        facility.getAddress(),
        facility.getTelephone(),
        facility.getEmail(),
        facility.getOrderingProvider().getNameInfo(),
        facility.getOrderingProvider().getAddress(),
        facility.getOrderingProvider().getProviderId(),
        facility.getOrderingProvider().getTelephone(),
        facility.getDeviceTypes().stream().map(IdentifiedEntity::getInternalId).toList());

    String reasonMsg = "Testing correction marking as error " + LocalDateTime.now();
    TestEvent deletedTest = _service.markAsError(testEvent.getInternalId(), reasonMsg);

    assertEquals(deletedTest.getDeviceType().getInternalId(), device.getInternalId());
    assertEquals(deletedTest.getSpecimenType().getInternalId(), specimen.getInternalId());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void correctionsTest() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    facility.setDefaultDeviceTypeSpecimenType(
        _dataFactory.getGenericDevice(), _dataFactory.getGenericSpecimen());
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
  void markAsErrorTest_backwardCompatible() {
    // GIVEN
    String reasonMsg = "Testing correction marking as error " + LocalDateTime.now();
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    facility.setDefaultDeviceTypeSpecimenType(
        _dataFactory.getGenericDevice(), _dataFactory.getGenericSpecimen());
    Person person = _dataFactory.createFullPerson(org);
    TestEvent testEvent = _dataFactory.createTestEvent(person, facility);

    // ensure the Result will have both testEvent and testOrder populated
    _resultRepository.deleteAll(testEvent.getOrder().getResults());
    Set<Result> results = testEvent.getResults();
    results.forEach(result -> result.setTestOrder(testEvent.getTestOrder()));
    _resultRepository.saveAll(results);

    // assert that we have the same Result object for both testEvent and testOrder
    List<Result> allOldResultsByTestOrder =
        _resultRepository.findAllByTestOrder(testEvent.getTestOrder());
    List<Result> allOldResultsByTestEvent = _resultRepository.findAllByTestEvent(testEvent);
    assertEquals(1, allOldResultsByTestEvent.size());
    assertEquals(1, allOldResultsByTestOrder.size());
    Result testOrderOldResult = allOldResultsByTestOrder.get(0);
    Result testEventOldResult = allOldResultsByTestEvent.get(0);
    assertThat(testOrderOldResult.getInternalId()).isEqualTo(testEventOldResult.getInternalId());

    // WHEN
    TestEvent deleteMarkerEvent = _service.markAsError(testEvent.getInternalId(), reasonMsg);

    // THEN
    assertNotNull(deleteMarkerEvent);

    assertEquals(TestCorrectionStatus.REMOVED, deleteMarkerEvent.getCorrectionStatus());
    assertEquals(reasonMsg, deleteMarkerEvent.getReasonForCorrection());

    assertEquals(testEvent.getTestOrder().getInternalId(), testEvent.getTestOrderId());

    // assert that we have two Result objects for both testEvent and testOrder
    List<Result> allResultsByTestOrder =
        _resultRepository.findAllByTestOrder(testEvent.getTestOrder());
    List<Result> allResultsByTestEvent = _resultRepository.findAllByTestEvent(testEvent);
    assertEquals(1, allResultsByTestOrder.size());
    assertEquals(1, allResultsByTestEvent.size());

    Result testOrderResult = allResultsByTestOrder.get(0);
    Result testEventResult = allResultsByTestEvent.get(0);
    assertThat(testEventResult.getInternalId()).isNotEqualTo(testOrderResult.getInternalId());

    assertThat(testEventResult.getTestOrder()).isNull();
    assertThat(testEventResult.getTestEvent()).isNotNull();

    assertThat(testOrderResult.getTestOrder()).isNotNull();
    assertThat(testOrderResult.getTestEvent()).isNull();

    assertThat(testEventResult.getTestResult()).isEqualTo(TestResult.NEGATIVE);
    assertThat(testOrderResult.getTestResult()).isEqualTo(TestResult.NEGATIVE);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void correctionsTest_backwardCompatible() {
    // GIVEN
    String reasonMsg = "Testing correction marking as error " + LocalDateTime.now();
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    facility.setDefaultDeviceTypeSpecimenType(
        _dataFactory.getGenericDevice(), _dataFactory.getGenericSpecimen());
    Person person = _dataFactory.createFullPerson(org);
    TestEvent testEvent = _dataFactory.createTestEvent(person, facility);

    // ensure the Result will have both testEvent and testOrder populated
    _resultRepository.deleteAll(testEvent.getOrder().getResults());
    Set<Result> results = testEvent.getResults();
    results.forEach(result -> result.setTestOrder(testEvent.getTestOrder()));
    _resultRepository.saveAll(results);

    // assert that we have the same Result object for both testEvent and testOrder
    List<Result> allOldResultsByTestOrder =
        _resultRepository.findAllByTestOrder(testEvent.getTestOrder());
    List<Result> allOldResultsByTestEvent = _resultRepository.findAllByTestEvent(testEvent);
    assertEquals(1, allOldResultsByTestEvent.size());
    assertEquals(1, allOldResultsByTestOrder.size());
    Result testOrderOldResult = allOldResultsByTestOrder.get(0);
    Result testEventOldResult = allOldResultsByTestEvent.get(0);
    assertThat(testOrderOldResult.getInternalId()).isEqualTo(testEventOldResult.getInternalId());

    // WHEN
    TestEvent originalEvent = _service.markAsCorrection(testEvent.getInternalId(), reasonMsg);

    // THEN
    TestOrder updatedOrder = originalEvent.getTestOrder();
    assertEquals(TestCorrectionStatus.CORRECTED, updatedOrder.getCorrectionStatus());
    assertEquals(reasonMsg, updatedOrder.getReasonForCorrection());
    assertEquals(testEvent.getInternalId(), updatedOrder.getTestEvent().getInternalId());
    assertEquals(OrderStatus.PENDING, updatedOrder.getOrderStatus());

    // assert that we have two Result objects for both testEvent and testOrder
    List<Result> allResultsByTestOrder =
        _resultRepository.findAllByTestOrder(testEvent.getTestOrder());
    List<Result> allResultsByTestEvent = _resultRepository.findAllByTestEvent(testEvent);
    assertEquals(1, allResultsByTestOrder.size());
    assertEquals(1, allResultsByTestEvent.size());

    Result testOrderResult = allResultsByTestOrder.get(0);
    Result testEventResult = allResultsByTestEvent.get(0);
    assertThat(testEventResult.getInternalId()).isNotEqualTo(testOrderResult.getInternalId());

    assertThat(testEventResult.getTestOrder()).isNull();
    assertThat(testEventResult.getTestEvent()).isNotNull();

    assertThat(testOrderResult.getTestOrder()).isNotNull();
    assertThat(testOrderResult.getTestEvent()).isNull();

    assertThat(testEventResult.getTestResult()).isEqualTo(TestResult.NEGATIVE);
    assertThat(testOrderResult.getTestResult()).isEqualTo(TestResult.NEGATIVE);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void correctTest_backDatedFromCurrentDate() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    facility.setDefaultDeviceTypeSpecimenType(
        _dataFactory.getGenericDevice(), _dataFactory.getGenericSpecimen());
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
    facility.setDefaultDeviceTypeSpecimenType(
        _dataFactory.getGenericDevice(), _dataFactory.getGenericSpecimen());
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
  void correctTest_usesCorrectDeviceAndSpecimenFacilityHasBeenUpdated() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    DeviceType device = _dataFactory.getGenericDevice();
    SpecimenType specimen = _dataFactory.getGenericSpecimen();
    facility.setDefaultDeviceTypeSpecimenType(device, specimen);
    Person p = _dataFactory.createFullPerson(org);
    TestEvent originalEvent = _dataFactory.createTestEvent(p, facility);

    facility.getAddress().setState("ND");
    _organizationService.updateFacility(
        facility.getInternalId(),
        facility.getFacilityName(),
        facility.getCliaNumber(),
        facility.getAddress(),
        facility.getTelephone(),
        facility.getEmail(),
        facility.getOrderingProvider().getNameInfo(),
        facility.getOrderingProvider().getAddress(),
        facility.getOrderingProvider().getProviderId(),
        facility.getOrderingProvider().getTelephone(),
        facility.getDeviceTypes().stream().map(IdentifiedEntity::getInternalId).toList());

    // Re-open the original test as a correction
    String reasonMsg = "Testing correction marking as error " + LocalDateTime.now();
    _service.markAsCorrection(originalEvent.getInternalId(), reasonMsg);

    // Re-submit the corrected test
    List<MultiplexResultInput> correctedTestResult = makeCovidOnlyResult(TestResult.UNDETERMINED);
    AddTestResultResponse response =
        _service.addMultiplexResult(
            device.getInternalId(),
            specimen.getInternalId(),
            correctedTestResult,
            p.getInternalId(),
            null);
    TestEvent correctedEvent = response.getTestOrder().getTestEvent();
    assertEquals(correctedEvent.getDeviceType().getInternalId(), device.getInternalId());
    assertEquals(correctedEvent.getSpecimenType().getInternalId(), specimen.getInternalId());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void removeACorrectedTest_success() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    DeviceType device = _dataFactory.getGenericDevice();
    SpecimenType specimen = _dataFactory.getGenericSpecimen();
    facility.setDefaultDeviceTypeSpecimenType(device, specimen);
    Person p = _dataFactory.createFullPerson(org);
    TestEvent originalEvent = _dataFactory.createTestEvent(p, facility);

    // Re-open the original test as a correction
    String reasonMsg = "Testing correction marking as error " + LocalDateTime.now();
    _service.markAsCorrection(originalEvent.getInternalId(), reasonMsg);

    // Re-submit the corrected test
    List<MultiplexResultInput> correctedTestResult = makeCovidOnlyResult(TestResult.UNDETERMINED);
    AddTestResultResponse response =
        _service.addMultiplexResult(
            device.getInternalId(),
            specimen.getInternalId(),
            correctedTestResult,
            p.getInternalId(),
            null);
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
    // There should also be exactly 4 Result objects, 1 for the order, and 1 per each TestEvent
    assertEquals(
        3, _testEventRepository.findAllByPatientAndFacilities(p, List.of(facility)).size());
    assertEquals(1, _testOrderRepository.fetchPastResults(org, facility).size());
    assertEquals(1, _resultRepository.findAllByTestOrder(response.getTestOrder()).size());
    assertEquals(1, _resultRepository.findAllByTestEvent(originalEvent).size());
    assertEquals(1, _resultRepository.findAllByTestEvent(correctedEvent).size());
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
        _service
            .getFacilityTestEventsResults(_site.getInternalId(), null, null, null, null, null, 0, 5)
            .toList();
    List<TestEvent> results_page1 =
        _service
            .getFacilityTestEventsResults(_site.getInternalId(), null, null, null, null, null, 1, 5)
            .toList();
    List<TestEvent> results_page2 =
        _service
            .getFacilityTestEventsResults(_site.getInternalId(), null, null, null, null, null, 2, 5)
            .toList();
    List<TestEvent> results_page3 =
        _service
            .getFacilityTestEventsResults(_site.getInternalId(), null, null, null, null, null, 3, 5)
            .toList();

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
        _service
            .getFacilityTestEventsResults(
                _site.getInternalId(), null, TestResult.POSITIVE, null, null, null, 0, 10)
            .toList();
    List<TestEvent> negatives =
        _service
            .getFacilityTestEventsResults(
                _site.getInternalId(), null, TestResult.NEGATIVE, null, null, null, 0, 10)
            .toList();
    List<TestEvent> inconclusives =
        _service
            .getFacilityTestEventsResults(
                _site.getInternalId(), null, TestResult.UNDETERMINED, null, null, null, 0, 10)
            .toList();
    List<TestEvent> students =
        _service
            .getFacilityTestEventsResults(
                _site.getInternalId(), null, null, PersonRole.STUDENT, null, null, 0, 10)
            .toList();
    List<TestEvent> visitors =
        _service
            .getFacilityTestEventsResults(
                _site.getInternalId(), null, null, PersonRole.VISITOR, null, null, 0, 10)
            .toList();
    List<TestEvent> june1to3 =
        _service
            .getFacilityTestEventsResults(
                _site.getInternalId(),
                null,
                null,
                null,
                convertDate(LocalDateTime.of(2021, 6, 1, 0, 0, 0)),
                convertDate(LocalDateTime.of(2021, 6, 3, 23, 59, 59)),
                0,
                10)
            .toList();
    List<TestEvent> priorToJune2Noon =
        _service
            .getFacilityTestEventsResults(
                _site.getInternalId(),
                null,
                null,
                null,
                null,
                convertDate(LocalDateTime.of(2021, 6, 2, 11, 59, 59)),
                0,
                10)
            .toList();
    List<TestEvent> positivesAmos =
        _service
            .getFacilityTestEventsResults(
                _site.getInternalId(),
                _dataFactory.getPersonByName(AMOS).getInternalId(),
                TestResult.POSITIVE,
                null,
                null,
                null,
                0,
                10)
            .toList();
    List<TestEvent> negativesAmos =
        _service
            .getFacilityTestEventsResults(
                _site.getInternalId(),
                _dataFactory.getPersonByName(AMOS).getInternalId(),
                TestResult.NEGATIVE,
                null,
                null,
                null,
                0,
                10)
            .toList();
    List<TestEvent> allFilters =
        _service
            .getFacilityTestEventsResults(
                _site.getInternalId(),
                _dataFactory.getPersonByName(CHARLES).getInternalId(),
                TestResult.POSITIVE,
                PersonRole.RESIDENT,
                convertDate(LocalDateTime.of(2021, 6, 1, 0, 0, 0)),
                convertDate(LocalDateTime.of(2021, 6, 1, 23, 59, 59)),
                0,
                10)
            .toList();

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
        _service
            .getFacilityTestEventsResults(
                facility.getInternalId(), null, null, null, null, null, 0, 10)
            .toList();
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
        _service
            .getFacilityTestEventsResults(
                facility.getInternalId(), null, null, null, null, null, 0, 10)
            .toList();
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
        _service.getFacilityTestEventsResults(
            facility.getInternalId(), null, TestResult.NEGATIVE, null, null, null, 0, 10);

    var expected = List.of(expected_allNeg.getInternalId(), expected_covidPos.getInternalId());
    var actualInternalIds = res.stream().map(TestEvent::getInternalId).collect(Collectors.toList());
    assertTrue(actualInternalIds.containsAll(expected));
    assertEquals(expected.size(), actualInternalIds.size());
    assertFalse(actualInternalIds.contains(notExpected_allPos.getInternalId()));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getTestResultsCount() {
    makedata();
    int size =
        _service.getTestResultsCount(_site.getInternalId(), null, null, null, null, null, null);
    assertEquals(11, size);
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void getTestResultsCount_forOrganization() {
    var testEvents = makeAdminData();
    var orgId = testEvents.get(0).getOrganization().getInternalId();
    int size = _service.getTestResultsCount(null, null, null, null, null, null, orgId);
    assertEquals(4, size);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getTestResultsCount_forOrganization_failsForNonSiteAdmins() {
    var otherOrgId = UUID.randomUUID();
    assertThrows(
        AccessDeniedException.class,
        () -> _service.getTestResultsCount(null, null, null, null, null, null, otherOrgId));
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
        () -> _service.getOrganizationLevelDashboardMetrics(startDate, endDate));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getTopLevelDashboardMetrics_inOrgWithOrgAdmin_success() {
    makedata();
    Date startDate = Date.from(Instant.parse("2000-01-01T00:00:00Z"));
    Date endDate = new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(3));

    TopLevelDashboardMetrics metrics =
        _service.getTopLevelDashboardMetrics(null, startDate, endDate, "COVID-19");
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
        () -> _service.getTopLevelDashboardMetrics(null, startDate, endDate, "COVID-19"));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getTopLevelDashboardMetrics_showsNonCovidResults() {
    makedata();
    makeSpecificDiseaseData(_diseaseService.fluA());
    Date startDate = Date.from(Instant.parse("2000-01-01T00:00:00Z"));
    Date endDate = new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(3));

    TopLevelDashboardMetrics metrics =
        _service.getTopLevelDashboardMetrics(null, startDate, endDate, "Flu A");
    assertEquals(1, metrics.getPositiveTestCount());
    assertEquals(2, metrics.getTotalTestCount());
  }

  @Test
  void markAsErrorTest_successDependsOnFacilityAccess() {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createValidFacility(org);
    Person p = _dataFactory.createFullPerson(org);
    TestEvent _e = _dataFactory.createTestEvent(p, facility);

    String reasonMsg = "Testing correction marking as error " + LocalDateTime.now();
    UUID facilityId = facility.getInternalId();
    UUID testEventId = _e.getInternalId();

    assertThrows(AccessDeniedException.class, () -> _service.markAsError(testEventId, reasonMsg));
    assertThrows(
        AccessDeniedException.class,
        () ->
            _service.getFacilityTestEventsResults(facilityId, null, null, null, null, null, 0, 10));
    assertThrows(AccessDeniedException.class, () -> _service.getTestResult(testEventId));

    // make sure the corrected event is not sent to storage queue
    verifyNoInteractions(testEventReportingService);
    verifyNoInteractions(fhirQueueReportingService);

    TestUserIdentities.setFacilityAuthorities(facility);
    TestEvent correctedTestEvent = _service.markAsError(_e.getInternalId(), reasonMsg);
    _service.getFacilityTestEventsResults(
        facility.getInternalId(), null, null, null, null, null, 0, 10);
    _service.getTestResult(_e.getInternalId()).getTestOrder();
    // make sure the corrected event is sent to storage queue
    verify(testEventReportingService).report(correctedTestEvent);
    verify(fhirQueueReportingService).report(any());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void removeFromQueueByFacilityId_notAuthorizedError() {
    UUID facilityId = UUID.randomUUID();
    assertThrows(
        AccessDeniedException.class, () -> _service.removeFromQueueByFacilityId(facilityId));
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void removeFromQueueByFacilityId_facilityNotFoundError() {
    UUID facilityId = UUID.randomUUID();
    when(this._organizationService.getFacilityById(facilityId)).thenReturn(Optional.empty());
    assertThrows(
        IllegalGraphqlArgumentException.class,
        () -> _service.removeFromQueueByFacilityId(facilityId));
  }

  @Test
  @SliceTestConfiguration.WithSimpleReportSiteAdminUser
  void removeFromQueueByFacilityId_success() {
    UUID facilityId = UUID.randomUUID();
    Facility mockFacility = mock(Facility.class);
    List<TestOrder> mockOrders = List.of();
    doReturn(Optional.of(mockFacility)).when(this._organizationService).getFacilityById(facilityId);
    doReturn(mockOrders).when(_testOrderRepository).fetchQueueItemsByFacilityId(mockFacility);
    ArgumentCaptor<List<TestOrder>> ordersCaptor = ArgumentCaptor.forClass(List.class);
    doReturn(null).when(_testOrderRepository).saveAll(ordersCaptor.capture());

    _service.removeFromQueueByFacilityId(facilityId);
    assertEquals(mockOrders, ordersCaptor.getValue());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void addTestResult_sentToReportingService() {
    // GIVEN
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _organizationService.getFacilities(org).get(0);
    Person patient = _dataFactory.createFullPerson(org);

    _service.addPatientToQueue(
        facility.getInternalId(),
        patient,
        "",
        "",
        Collections.emptyMap(),
        LocalDate.of(1865, 12, 25),
        false);
    DeviceType deviceType = _dataFactory.getGenericDevice();
    SpecimenType specimenType = _dataFactory.getGenericSpecimen();
    facility.setDefaultDeviceTypeSpecimenType(deviceType, specimenType);

    // WHEN
    List<MultiplexResultInput> positiveCovidOnlyResult = makeCovidOnlyResult(TestResult.POSITIVE);
    _service.addMultiplexResult(
        deviceType.getInternalId(),
        specimenType.getInternalId(),
        positiveCovidOnlyResult,
        patient.getInternalId(),
        null);

    // THEN
    verify(reportTestEventToRSEventListener, times(1)).handleEvent(any());
    verify(testEventReportingService, times(1)).report(any());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void removeTest_sentToReportingService() {
    // GIVEN
    List<MultiplexResultInput> originalResults =
        makeMultiplexTestResult(TestResult.NEGATIVE, TestResult.POSITIVE, TestResult.NEGATIVE);

    TestOrder order = addTestToQueue();
    AddTestResultResponse response =
        _service.addMultiplexResult(
            order.getDeviceType().getInternalId(),
            order.getSpecimenType().getInternalId(),
            originalResults,
            order.getPatient().getInternalId(),
            convertDate(LocalDateTime.of(2022, 6, 5, 10, 10, 10, 10)));

    TestEvent originalEvent = response.getTestOrder().getTestEvent();

    // WHEN
    _service.markAsError(originalEvent.getInternalId(), "Duplicate test");

    // THEN
    // Invoked once when result is added, invoked again when marked as error
    verify(reportTestEventToRSEventListener, times(2)).handleEvent(any());
    verify(testEventReportingService, times(2)).report(any());
  }

  private List<TestEvent> makeAdminData() {
    var org = _organizationService.createOrganization("Da Org", "airport", "da-org-airport");
    _organizationService.setIdentityVerified("da-org-airport", true);
    var facility = _dataFactory.createValidFacility(org, "Da Facilitiy");
    var person = _dataFactory.createMinimalPerson(org);
    return List.of(
        _dataFactory.createTestEvent(person, facility, TestResult.POSITIVE),
        _dataFactory.createTestEvent(person, facility, TestResult.POSITIVE),
        _dataFactory.createTestEvent(person, facility, TestResult.NEGATIVE),
        _dataFactory.createTestEvent(person, facility, TestResult.UNDETERMINED));
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
    patientsToSurveys.put(
        AMOS, new AskOnEntrySurvey(null, null, Map.of("fake", true), false, null, null));
    patientsToSurveys.put(
        CHARLES, new AskOnEntrySurvey(null, null, Collections.emptyMap(), false, null, null));
    patientsToSurveys.put(
        DEXTER, new AskOnEntrySurvey(null, null, Collections.emptyMap(), true, null, null));
    patientsToSurveys.put(
        ELIZABETH, new AskOnEntrySurvey(null, null, Map.of("fake", true), false, null, null));
    patientsToSurveys.put(
        FRANK, new AskOnEntrySurvey(null, null, Collections.emptyMap(), false, null, null));
    patientsToSurveys.put(
        GALE, new AskOnEntrySurvey(null, null, Collections.emptyMap(), true, null, null));
    patientsToSurveys.put(
        HEINRICK, new AskOnEntrySurvey(null, null, Map.of("fake", true), false, null, null));
    patientsToSurveys.put(
        IAN, new AskOnEntrySurvey(null, null, Collections.emptyMap(), false, null, null));
    patientsToSurveys.put(
        JANNELLE, new AskOnEntrySurvey(null, null, Collections.emptyMap(), true, null, null));
    patientsToSurveys.put(
        KACEY, new AskOnEntrySurvey(null, null, Map.of("fake", true), false, null, null));
    patientsToSurveys.put(
        LEELOO, new AskOnEntrySurvey(null, null, Collections.emptyMap(), false, null, null));

    List<TestEvent> testEvents =
        patientsToResults.keySet().stream()
            .map(
                n -> {
                  TestResult t = patientsToResults.get(n);
                  PersonRole r = patientsToRoles.get(n);
                  AskOnEntrySurvey s = patientsToSurveys.get(n);
                  Date d = patientsToDates.get(n);

                  Person person = _dataFactory.createMinimalPerson(org, _site, n, r);
                  return _dataFactory.createTestEvent(person, _site, s, t, d);
                })
            .collect(Collectors.toList());
    // Make one result in another facility
    Facility _otherSite = _dataFactory.createValidFacility(org, "The Other Facility");
    _dataFactory.createTestEvent(
        _dataFactory.createMinimalPerson(org, _otherSite, BRAD), _otherSite, TestResult.NEGATIVE);
    return testEvents;
  }

  private List<TestEvent> makeSpecificDiseaseData(SupportedDisease disease) {
    Organization org = _organizationService.getCurrentOrganization();
    _site = _dataFactory.createValidFacility(org, "The Facility for " + disease.getName());
    Map<PersonName, TestResult> patientsToResults = new HashMap<>();
    patientsToResults.put(AMOS, TestResult.POSITIVE);
    patientsToResults.put(CHARLES, TestResult.NEGATIVE);

    Map<PersonName, Date> patientsToDates = new HashMap<>();
    patientsToDates.put(AMOS, convertDate(LocalDateTime.of(2021, 6, 1, 0, 0, 0)));
    patientsToDates.put(CHARLES, convertDate(LocalDateTime.of(2021, 6, 1, 12, 0, 0)));

    Map<PersonName, PersonRole> patientsToRoles = new HashMap<>();
    patientsToRoles.put(AMOS, PersonRole.RESIDENT);
    patientsToRoles.put(CHARLES, PersonRole.RESIDENT);

    Map<PersonName, AskOnEntrySurvey> patientsToSurveys = new HashMap<>();
    patientsToSurveys.put(
        AMOS, new AskOnEntrySurvey(null, null, Map.of("fake", true), false, null, null));
    patientsToSurveys.put(
        CHARLES, new AskOnEntrySurvey(null, null, Collections.emptyMap(), false, null, null));

    return patientsToResults.keySet().stream()
        .map(
            n -> {
              TestResult t = patientsToResults.get(n);
              PersonRole r = patientsToRoles.get(n);
              AskOnEntrySurvey s = patientsToSurveys.get(n);
              Date d = patientsToDates.get(n);

              Person person = _dataFactory.createMinimalPerson(org, _site, n, r);
              return _dataFactory.createTestEvent(person, _site, s, t, d, disease);
            })
        .collect(Collectors.toList());
  }

  private List<MultiplexResultInput> makeCovidOnlyResult(TestResult covidTestResult) {
    MultiplexResultInput covidResult = new MultiplexResultInput("COVID-19", covidTestResult);
    return List.of(covidResult);
  }

  private List<MultiplexResultInput> makeMultiplexTestResult(
      TestResult covidTestResult, TestResult fluATestResult, TestResult fluBTestResult) {
    MultiplexResultInput covidResult = new MultiplexResultInput("COVID-19", covidTestResult);
    MultiplexResultInput fluAResult = new MultiplexResultInput("Flu A", fluATestResult);
    MultiplexResultInput fluBResult = new MultiplexResultInput("Flu B", fluBTestResult);
    return List.of(covidResult, fluAResult, fluBResult);
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
            "",
            Collections.emptyMap(),
            LocalDate.of(2022, 6, 5),
            false);

    facility.setDefaultDeviceTypeSpecimenType(
        _dataFactory.getGenericDevice(), _dataFactory.getGenericSpecimen());

    return order;
  }
}
