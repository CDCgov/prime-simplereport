package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Facility_;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.Result_;
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
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;
import javax.persistence.criteria.Join;
import javax.persistence.criteria.Predicate;
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
  @Autowired private ResultRepository _resultRepo;

  private Specification<TestEvent> filter(UUID facilityId, TestResult result) {
    return (root, query, cb) -> {
      Join<TestEvent, Result> resultJoin = root.join(TestEvent_.results);
      Join<TestEvent, TestOrder> order = root.join(TestEvent_.order);
      order.on(cb.equal(root.get(TestEvent_.internalId), order.get(TestOrder_.testEvent)));
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
    Organization org = _dataFactory.createValidOrg();
    Facility place = _dataFactory.createValidFacility(org);
    Person patient = _dataFactory.createMinimalPerson(org);
    TestOrder order = _dataFactory.createTestOrder(patient, place);
    Result positiveResult = new Result(order, _diseaseService.covid(), TestResult.POSITIVE);
    _resultRepo.save(positiveResult);
    HashSet positiveResults = new HashSet<>();
    positiveResults.add(positiveResult);
    _repo.save(new TestEvent(order, false, positiveResults));

    Result negativeResult = new Result(order, _diseaseService.covid(), TestResult.NEGATIVE);
    _resultRepo.save(negativeResult);
    HashSet negativeResults = new HashSet<>();
    negativeResults.add(negativeResult);
    _repo.save(new TestEvent(order, false, negativeResults));
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
    Organization org = _dataFactory.createValidOrg();
    Facility place = _dataFactory.createValidFacility(org);
    Person patient = _dataFactory.createMinimalPerson(org);

    TestOrder firstOrder =
        _dataFactory.createCompletedTestOrder(patient, place, TestResult.POSITIVE);
    var firstResults = firstOrder.getResults();
    var firstEvent = new TestEvent(firstOrder, false, firstResults);
    firstResults.forEach(result -> result.setTestEvent(firstEvent));
    _resultRepo.saveAll(firstResults);
    _repo.save(firstEvent);

    TestOrder secondOrder =
        _dataFactory.createCompletedTestOrder(patient, place, TestResult.UNDETERMINED);
    var secondResults = secondOrder.getResults();
    var secondEvent = new TestEvent(secondOrder, false, secondResults);
    secondResults.forEach(result -> result.setTestEvent(secondEvent));
    _resultRepo.saveAll(secondResults);
    _repo.save(secondEvent);

    flush();
    var savedSecondEvent = _repo.findById(secondEvent.getInternalId()).get();
    assertEquals(TestResult.UNDETERMINED, savedSecondEvent.getCovidTestResult().orElseThrow());
    List<TestEvent> foundTestReports2 =
        _repo.queryMatchAllBetweenDates(d1, DATE_1MIN_FUTURE, Pageable.unpaged());
    assertEquals(2, foundTestReports2.size() - foundTestReports1.size());

    testTestEventUnitTests(
        firstOrder, firstEvent); // just leverage existing order, event to test on newer columns
  }

  @Test
  void fetchResults_multipleEntries_sortedLifo() throws InterruptedException {
    Organization org = _dataFactory.createValidOrg();
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

    _dataFactory.doTest(bradleyOrder, TestResult.NEGATIVE);
    pause();
    _dataFactory.doTest(charlieOrder, TestResult.POSITIVE);
    pause();
    _dataFactory.doTest(adamOrder, TestResult.UNDETERMINED);

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
    Organization org = _dataFactory.createValidOrg();
    Facility place = createTestEventsForMetricsTests(org);

    List<TestResultWithCount> results =
        _repo.countByResultForFacility(place.getInternalId(), d1, DATE_1MIN_FUTURE);

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
    Organization org = _dataFactory.createValidOrg();
    Facility place = createTestEventsForMetricsTests(org);

    List<TestResultWithCount> results =
        _repo.countByResultByFacility(Set.of(place.getInternalId()), d1, DATE_1MIN_FUTURE);

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
    Organization org = _dataFactory.createValidOrg();
    Facility place = createTestEventsForMetricsTests(org);
    var p = _dataFactory.createMinimalPerson(org);
    _dataFactory.createMultiplexTestEvent(
        p, place, TestResult.POSITIVE, TestResult.NEGATIVE, TestResult.UNDETERMINED, false);

    List<TestResultWithCount> results =
        _repo.countByResultByFacility(Set.of(place.getInternalId()), d1, DATE_1MIN_FUTURE);

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
    Organization org = _dataFactory.createValidOrg();
    createTestEventsForMetricsTests(org);

    Set<UUID> facilityIds =
        _orgService.getFacilities(org).stream()
            .map(Facility::getInternalId)
            .collect(Collectors.toSet());

    List<TestResultWithCount> results =
        _repo.countByResultByFacility(facilityIds, d1, DATE_1MIN_FUTURE);

    assertEquals(3, results.size());

    Map<TestResult, Long> resultMap =
        results.stream()
            .collect(
                Collectors.toMap(TestResultWithCount::getResult, TestResultWithCount::getCount));

    assertEquals(2L, resultMap.get(TestResult.POSITIVE));
    assertEquals(1L, resultMap.get(TestResult.NEGATIVE));
    assertEquals(1L, resultMap.get(TestResult.UNDETERMINED));
  }

  private Facility createTestEventsForMetricsTests(Organization org) {
    Facility place = _dataFactory.createValidFacility(org);
    Person patient = _dataFactory.createMinimalPerson(org);

    TestOrder firstOrder =
        _dataFactory.createCompletedTestOrder(patient, place, TestResult.POSITIVE);
    TestEvent firstEvent = new TestEvent(firstOrder);
    _dataFactory.createResult(firstEvent, firstOrder, _diseaseService.covid(), TestResult.POSITIVE);

    TestOrder secondOrder =
        _dataFactory.createCompletedTestOrder(patient, place, TestResult.UNDETERMINED);
    TestEvent secondEvent = new TestEvent(secondOrder);
    _dataFactory.createResult(
        secondEvent, secondOrder, _diseaseService.covid(), TestResult.UNDETERMINED);
    _dataFactory.createResult(
        secondEvent, secondOrder, _diseaseService.fluA(), TestResult.UNDETERMINED);

    _repo.save(firstEvent);
    _repo.save(secondEvent);

    Facility otherPlace = _dataFactory.createValidFacility(org, "Other Place");
    Person otherPatient =
        _dataFactory.createMinimalPerson(org, otherPlace, "First", "Middle", "Last", "");

    TestOrder firstOrderOtherPlace =
        _dataFactory.createCompletedTestOrder(otherPatient, otherPlace, TestResult.NEGATIVE);
    TestEvent firstEventOtherPlace = new TestEvent(firstOrderOtherPlace);
    _dataFactory.createResult(
        firstEventOtherPlace, firstOrderOtherPlace, _diseaseService.covid(), TestResult.NEGATIVE);

    TestOrder secondOrderOtherPlace =
        _dataFactory.createCompletedTestOrder(otherPatient, otherPlace, TestResult.POSITIVE);
    TestEvent secondEventOtherPlace = new TestEvent(secondOrderOtherPlace);
    _dataFactory.createResult(
        secondEventOtherPlace, secondOrderOtherPlace, _diseaseService.covid(), TestResult.POSITIVE);

    _repo.save(firstEventOtherPlace);
    _repo.save(secondEventOtherPlace);
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
    String reason = "Unit Test Correction " + LocalDateTime.now().toString();
    var results = startingEvent.getResults().stream().map(Result::new).collect(Collectors.toSet());
    var correctionEvent =
        new TestEvent(startingEvent, TestCorrectionStatus.REMOVED, reason, results);
    results.forEach(result -> result.setTestEvent(correctionEvent));
    _resultRepo.saveAll(results);
    _repo.save(correctionEvent);

    Optional<TestEvent> eventReloadOptional = _repo.findById(correctionEvent.getInternalId());
    assertTrue(eventReloadOptional.isPresent());
    TestEvent eventReloaded = eventReloadOptional.get();

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
