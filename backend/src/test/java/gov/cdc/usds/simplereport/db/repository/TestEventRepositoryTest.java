package gov.cdc.usds.simplereport.db.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Facility_;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.Result_;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestEvent_;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.TestOrder_;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultWithCount;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

class TestEventRepositoryTest extends BaseRepositoryTest {

  @Autowired private TestEventRepository _repo;
  @Autowired private TestDataFactory _dataFactory;
  @Autowired private OrganizationService _orgService;
  @Autowired private DiseaseService _diseaseService;

  private Specification<TestEvent> filter(UUID facilityId, TestResult result) {
    return (root, query, cb) -> {
      Join<TestEvent, Result> resultJoin = root.join(TestEvent_.results);
      Join<TestEvent, TestOrder> order = root.join(TestEvent_.order);
      order.on(
          cb.equal(
              root.get(TestEvent_.internalId),
              order.get(TestOrder_.testEvent).get(TestEvent_.internalId)));
      query.orderBy(cb.desc(root.get(TestEvent_.createdAt)));

      Predicate p = cb.conjunction();
      if (facilityId != null) {
        p =
            cb.and(
                p, cb.equal(root.get(TestEvent_.facility).get(Facility_.internalId), facilityId));
      }
      if (result != null) {
        p = cb.and(p, cb.equal(resultJoin.get(Result_.testResult), result));
      }
      return p;
    };
  }

  @Test
  void testFindByPatient() {
    Organization org = _dataFactory.saveValidOrganization();
    Facility place = _dataFactory.createValidFacility(org);
    Person patient = _dataFactory.createMinimalPerson(org);

    _dataFactory.createTestEvent(patient, place, TestResult.POSITIVE);
    flush();
    _dataFactory.createTestEvent(patient, place, TestResult.NEGATIVE);
    flush();

    List<TestEvent> found = _repo.findAllByPatientAndFacilities(patient, Set.of(place));
    assertEquals(2, found.size());
  }

  @Test
  void testLatestTestEventForPerson() {
    Date d1 = Date.from(Instant.parse("2000-01-01T00:00:00Z"));
    final Date DATE_1MIN_FUTURE =
        new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(3));
    List<TestEvent> foundTestReports1 =
        _repo.queryMatchAllBetweenDates(d1, DATE_1MIN_FUTURE, PageRequest.of(0, 100));
    Organization org = _dataFactory.saveValidOrganization();
    Facility place = _dataFactory.createValidFacility(org);
    Person patient = _dataFactory.createMinimalPerson(org);

    var firstEvent = _dataFactory.createTestEvent(patient, place, TestResult.POSITIVE);
    flush();
    var secondEvent = _dataFactory.createTestEvent(patient, place, TestResult.UNDETERMINED);
    flush();

    var savedSecondEvent = _repo.findById(secondEvent.getInternalId()).orElseThrow();
    assertEquals(TestResult.UNDETERMINED, savedSecondEvent.getCovidTestResult().orElseThrow());
    List<TestEvent> foundTestReports2 =
        _repo.queryMatchAllBetweenDates(d1, DATE_1MIN_FUTURE, Pageable.unpaged());
    assertEquals(2, foundTestReports2.size() - foundTestReports1.size());

    testTestEventUnitTests(
        firstEvent.getOrder(),
        firstEvent); // just leverage existing order, event to test on newer columns
  }

  @Test
  void fetchResults_multipleEntries_sortedLifo() throws InterruptedException {
    Organization org = _dataFactory.saveValidOrganization();
    Person adam = _dataFactory.createMinimalPerson(org, null, "Adam", "A.", "Astaire", "Jr.");
    Person brad = _dataFactory.createMinimalPerson(org, null, "Bradley", "B.", "Bones", null);
    Person charlie =
        _dataFactory.createMinimalPerson(org, null, "Charles", "C.", "Crankypants", "3rd");
    Facility facility = _dataFactory.createValidFacility(org);

    TestOrder charlieOrder = _dataFactory.createTestOrder(charlie, facility);
    pause();
    TestOrder adamOrder = _dataFactory.createTestOrder(adam, facility);
    pause();
    TestOrder bradleyOrder = _dataFactory.createTestOrder(brad, facility);

    List<TestEvent> results =
        _repo.findAll(filter(facility.getInternalId(), null), PageRequest.of(0, 10)).toList();
    assertEquals(0, results.size());

    _dataFactory.submitTest(bradleyOrder, TestResult.NEGATIVE);
    pause();
    _dataFactory.submitTest(charlieOrder, TestResult.POSITIVE);
    pause();
    _dataFactory.submitTest(adamOrder, TestResult.UNDETERMINED);

    results = _repo.findAll(filter(facility.getInternalId(), null), PageRequest.of(0, 10)).toList();
    assertEquals(3, results.size());
    assertEquals("Adam", results.get(0).getPatient().getFirstName());
    assertEquals("Charles", results.get(1).getPatient().getFirstName());
    assertEquals("Bradley", results.get(2).getPatient().getFirstName());

    results =
        _repo
            .findAll(filter(facility.getInternalId(), TestResult.POSITIVE), PageRequest.of(0, 10))
            .toList();
    assertEquals(1, results.size());
    assertEquals("Charles", results.get(0).getPatient().getFirstName());
  }

  @Test
  void countByResultForFacility_singleFacility_success() {
    Date d1 = Date.from(Instant.parse("2000-01-01T00:00:00Z"));
    final Date DATE_1MIN_FUTURE =
        new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(3));
    Organization org = _dataFactory.saveValidOrganization();
    Facility place = createTestEventsForMetricsTests(org);

    List<TestResultWithCount> results =
        _repo.countByResultForFacility(place.getInternalId(), d1, DATE_1MIN_FUTURE, "96741-4");

    assertEquals(2, results.size());

    Map<TestResult, Long> resultMap =
        results.stream()
            .collect(
                Collectors.toMap(TestResultWithCount::getResult, TestResultWithCount::getCount));

    assertEquals(1L, resultMap.get(TestResult.POSITIVE));
    assertEquals(1L, resultMap.get(TestResult.UNDETERMINED));
  }

  @Test
  void countByResultByFacility_singleFacility_success() {
    Date d1 = Date.from(Instant.parse("2000-01-01T00:00:00Z"));
    final Date DATE_1MIN_FUTURE =
        new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(3));
    Organization org = _dataFactory.saveValidOrganization();
    Facility place = createTestEventsForMetricsTests(org);

    List<TestResultWithCount> results =
        _repo.countByResultByFacility(
            Set.of(place.getInternalId()), d1, DATE_1MIN_FUTURE, "96741-4");

    assertEquals(2, results.size());

    Map<TestResult, Long> resultMap =
        results.stream()
            .collect(
                Collectors.toMap(TestResultWithCount::getResult, TestResultWithCount::getCount));

    assertEquals(1L, resultMap.get(TestResult.POSITIVE));
    assertEquals(1L, resultMap.get(TestResult.UNDETERMINED));
  }

  @Test
  void countByResultByFacility_singleFacility_onlyCountsCovid() {
    Date d1 = Date.from(Instant.parse("2000-01-01T00:00:00Z"));
    final Date DATE_1MIN_FUTURE =
        new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(3));
    Organization org = _dataFactory.saveValidOrganization();
    Facility place = createTestEventsForMetricsTests(org);
    var p = _dataFactory.createMinimalPerson(org);
    _dataFactory.createMultiplexTestEvent(
        p, place, TestResult.POSITIVE, TestResult.NEGATIVE, TestResult.UNDETERMINED, false);

    List<TestResultWithCount> results =
        _repo.countByResultByFacility(
            Set.of(place.getInternalId()), d1, DATE_1MIN_FUTURE, "96741-4");

    assertEquals(2, results.size());

    Map<TestResult, Long> resultMap =
        results.stream()
            .collect(
                Collectors.toMap(TestResultWithCount::getResult, TestResultWithCount::getCount));

    assertEquals(2L, resultMap.get(TestResult.POSITIVE));
    assertEquals(1L, resultMap.get(TestResult.UNDETERMINED));
    assertNull(resultMap.get(TestResult.NEGATIVE));
  }

  @Test
  void countByResultByFacility_entireOrganization_success() {
    Date d1 = Date.from(Instant.parse("2000-01-01T00:00:00Z"));
    final Date DATE_1MIN_FUTURE =
        new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(3));
    Organization org = _dataFactory.saveValidOrganization();
    createTestEventsForMetricsTests(org);

    Set<UUID> facilityIds =
        _orgService.getFacilities(org).stream()
            .map(Facility::getInternalId)
            .collect(Collectors.toSet());

    List<TestResultWithCount> results =
        _repo.countByResultByFacility(facilityIds, d1, DATE_1MIN_FUTURE, "96741-4");

    assertEquals(3, results.size());

    Map<TestResult, Long> resultMap =
        results.stream()
            .collect(
                Collectors.toMap(TestResultWithCount::getResult, TestResultWithCount::getCount));

    assertEquals(2L, resultMap.get(TestResult.POSITIVE));
    assertEquals(1L, resultMap.get(TestResult.NEGATIVE));
    assertEquals(1L, resultMap.get(TestResult.UNDETERMINED));
  }

  @Test
  void testEventFromTestOrder_copies_deviceAndSpecimen() {
    // GIVEN
    DeviceType facilityDevice = _dataFactory.getGenericDevice();
    SpecimenType facilitySpecimen = _dataFactory.getGenericSpecimen();

    DeviceType newDevice = _dataFactory.createDeviceType("new device", "llc", "t");
    SpecimenType newSpecimen =
        _dataFactory.createSpecimenType("new specimen", "123456", "321", "123456");

    Organization org = _dataFactory.saveValidOrganization();
    Facility facility = _dataFactory.createValidFacility(org);
    facility.setDefaultDeviceTypeSpecimenType(facilityDevice, facilitySpecimen);
    Person patient = _dataFactory.createMinimalPerson(org);

    TestOrder order = _dataFactory.createTestOrder(patient, facility);
    order.setDeviceTypeAndSpecimenType(newDevice, newSpecimen);

    // WHEN
    TestEvent testEvent = new TestEvent(order);

    // THEN
    assertEquals(testEvent.getDeviceType(), newDevice);
    assertEquals(testEvent.getSpecimenType(), newSpecimen);
    assertNotEquals(testEvent.getDeviceType(), facilityDevice);
    assertNotEquals(testEvent.getSpecimenType(), facilitySpecimen);
  }

  private Facility createTestEventsForMetricsTests(Organization org) {
    Facility place = _dataFactory.createValidFacility(org);
    Person patient = _dataFactory.createMinimalPerson(org);

    TestOrder firstOrder =
        _dataFactory.createTestOrderWithCovidResult(patient, place, TestResult.POSITIVE);
    _dataFactory.createTestEvent(firstOrder);
    flush();

    TestOrder secondOrder =
        _dataFactory.createTestOrder(
            patient,
            place,
            List.of(
                new Result(_diseaseService.covid(), TestResult.UNDETERMINED),
                new Result(_diseaseService.covid(), TestResult.UNDETERMINED)));
    _dataFactory.createTestEvent(secondOrder);
    flush();

    Facility otherPlace = _dataFactory.createValidFacility(org, "Other Place");
    Person otherPatient =
        _dataFactory.createMinimalPerson(org, otherPlace, "First", "Middle", "Last", "");

    TestOrder firstOrderOtherPlace =
        _dataFactory.createTestOrderWithCovidResult(otherPatient, otherPlace, TestResult.NEGATIVE);
    _dataFactory.createTestEvent(firstOrderOtherPlace);
    flush();

    TestOrder secondOrderOtherPlace =
        _dataFactory.createTestOrderWithCovidResult(otherPatient, otherPlace, TestResult.POSITIVE);
    _dataFactory.createTestEvent(secondOrderOtherPlace);
    flush();

    return place;
  }

  private void compareAskOnEntrySurvey(AskOnEntrySurvey a1, AskOnEntrySurvey a2) {
    assertEquals(a1.getNoSymptoms(), a2.getNoSymptoms());
    assertEquals(a1.getPregnancy(), a2.getPregnancy());
    assertEquals(a1.getSymptomOnsetDate(), a2.getSymptomOnsetDate());
  }

  private void testTestEventUnitTests(TestOrder startingOrder, TestEvent startingEvent) {
    assertEquals(startingOrder.getInternalId(), startingEvent.getTestOrderId());
    assertEquals(TestCorrectionStatus.ORIGINAL, startingEvent.getCorrectionStatus());
    assertNull(startingEvent.getPriorCorrectedTestEventId());
    assertNotNull(startingOrder.getAskOnEntrySurvey().getSurvey());
    assertNotNull(startingEvent.getPatientData());

    compareAskOnEntrySurvey(
        startingOrder.getAskOnEntrySurvey().getSurvey(), startingEvent.getSurveyData());

    // repo level test. Higher level tests done in TestOrderServiceTest
    String reason = "Unit Test Correction " + LocalDateTime.now();
    var correctionEvent =
        _dataFactory.createTestEventCorrection(startingEvent, TestCorrectionStatus.REMOVED, reason);

    Optional<TestEvent> eventReloadOptional = _repo.findById(correctionEvent.getInternalId());
    assertTrue(eventReloadOptional.isPresent());
    TestEvent eventReloaded = eventReloadOptional.get();
    assertThat(eventReloaded.getResults()).isNotEmpty();

    assertEquals(reason, eventReloaded.getReasonForCorrection());
    assertEquals(TestCorrectionStatus.REMOVED, eventReloaded.getCorrectionStatus());
    assertEquals(startingEvent.getInternalId(), eventReloaded.getPriorCorrectedTestEventId());
    // compare with starting event. Verify that was correctly copied
    assertEquals(startingEvent.getTestOrderId(), eventReloaded.getTestOrderId());
    assertEquals(
        startingEvent.getOrganization().getInternalId(),
        eventReloaded.getOrganization().getInternalId());
    assertEquals(
        startingEvent.getFacility().getInternalId(), eventReloaded.getFacility().getInternalId());
    assertEquals(
        startingEvent.getCovidTestResult().get(), eventReloaded.getCovidTestResult().get());
    assertEquals(startingEvent.getProviderData(), eventReloaded.getProviderData());
    assertEquals(startingEvent.getPatientData(), eventReloaded.getPatientData());
    compareAskOnEntrySurvey(startingEvent.getSurveyData(), eventReloaded.getSurveyData());
  }
}
