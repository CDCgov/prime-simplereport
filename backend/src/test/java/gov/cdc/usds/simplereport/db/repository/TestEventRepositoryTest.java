package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Facility_;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestEvent_;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.TestOrder_;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
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

  private Specification<TestEvent> filter(UUID facilityId, TestResult result) {
    return (root, query, cb) -> {
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
        p = cb.and(p, cb.equal(root.get(TestEvent_.result), result));
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
    _repo.save(
        new TestEvent(
            TestResult.POSITIVE, place.getDefaultDeviceSpecimen(), patient, place, order));
    _repo.save(
        new TestEvent(
            TestResult.UNDETERMINED, place.getDefaultDeviceSpecimen(), patient, place, order));
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
    TestOrder order = _dataFactory.createTestOrder(patient, place);
    TestEvent first =
        new TestEvent(TestResult.POSITIVE, place.getDefaultDeviceSpecimen(), patient, place, order);
    TestEvent second =
        new TestEvent(
            TestResult.UNDETERMINED, place.getDefaultDeviceSpecimen(), patient, place, order);
    _repo.save(first);
    _repo.save(second);
    flush();
    TestEvent found = _repo.findFirst1ByPatientOrderByCreatedAtDesc(patient);
    assertEquals(second.getResult(), TestResult.UNDETERMINED);
    List<TestEvent> foundTestReports2 =
        _repo.queryMatchAllBetweenDates(d1, DATE_1MIN_FUTURE, Pageable.unpaged());
    assertEquals(2, foundTestReports2.size() - foundTestReports1.size());

    testTestEventUnitTests(
        order, first); // just leverage existing order, event to test on newer columns
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

  private void compareAskOnEntrySurvey(AskOnEntrySurvey a1, AskOnEntrySurvey a2) {
    assertEquals(a1.getFirstTest(), a2.getFirstTest());
    assertEquals(a1.getNoSymptoms(), a2.getNoSymptoms());
    assertEquals(a1.getFirstTest(), a2.getFirstTest());
    assertEquals(a1.getPregnancy(), a2.getPregnancy());
    assertEquals(a1.getPriorTestDate(), a2.getPriorTestDate());
    assertEquals(a1.getPriorTestResult(), a2.getPriorTestResult());
    assertEquals(a1.getPriorTestType(), a2.getPriorTestType());
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
    TestEvent correctionEvent = new TestEvent(startingEvent, TestCorrectionStatus.REMOVED, reason);
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
    assertEquals(startingEvent.getResult(), eventReloaded.getResult());
    assertEquals(startingEvent.getProviderData(), eventReloaded.getProviderData());
    assertEquals(startingEvent.getPatientData(), eventReloaded.getPatientData());
    compareAskOnEntrySurvey(startingEvent.getSurveyData(), eventReloaded.getSurveyData());
  }
}
