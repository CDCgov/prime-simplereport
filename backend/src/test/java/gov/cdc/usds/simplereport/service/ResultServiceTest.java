package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.repository.ResultRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class ResultServiceTest extends BaseServiceTest<ResultService> {

  @Autowired private DbTruncator truncator;
  @Autowired private OrganizationService organizationService;
  @Autowired private ResultRepository resultRepository;

  @Autowired private TestEventRepository testEventRepository;

  @Autowired private TestDataFactory testDataFactory;

  private Organization org;
  private Facility facilityA;
  private Facility facilityB;
  private Person personA;
  private Person personB;

  private final Date FIRST_TEST_DATE = Date.from(Instant.parse("2023-01-01T14:31:33.197021300Z"));
  private final Date SECOND_TEST_DATE = Date.from(Instant.parse("2023-06-01T14:31:33.197021300Z"));
  private final Date THIRD_TEST_DATE = Date.from(Instant.parse("2023-12-01T14:31:33.197021300Z"));

  private static Date convertDate(LocalDateTime dateTime) {
    return Date.from(dateTime.atZone(ZoneId.systemDefault()).toInstant());
  }

  @Nested
  class GetResultsTests {
    @BeforeEach
    void setupData() {
      initSampleData();
      org = organizationService.getCurrentOrganization();
      facilityA = testDataFactory.createValidFacility(org, "Facility A");
      facilityB = testDataFactory.createValidFacility(org, "Facility B");
      personA =
          testDataFactory.createMinimalPerson(
              org, facilityA, new PersonName("John", "Jacob", "Reynolds", ""), PersonRole.STAFF);
      personB =
          testDataFactory.createMinimalPerson(
              org,
              facilityA,
              new PersonName("Optimus", "Freakin'", "Prime", ""),
              PersonRole.RESIDENT);

      testDataFactory.createTestEventWithDate(
          personA, facilityA, TestResult.POSITIVE, FIRST_TEST_DATE);
      testDataFactory.createMultiplexTestEventWithDate(
          personB,
          facilityA,
          TestResult.POSITIVE,
          TestResult.NEGATIVE,
          TestResult.POSITIVE,
          false,
          SECOND_TEST_DATE);
      testDataFactory.createMultiplexTestEventWithDate(
          personA,
          facilityB,
          TestResult.POSITIVE,
          TestResult.NEGATIVE,
          TestResult.POSITIVE,
          false,
          THIRD_TEST_DATE);
    }

    private void truncateDb() {
      truncator.truncateAll();
    }

    @AfterEach
    public void cleanup() {
      truncateDb();
    }

    @Test
    @SliceTestConfiguration.WithSimpleReportOrgAdminUser
    void getOrganizationResults_noFilter() {
      var res = _service.getOrganizationResults(null, null, null, null, null, null, 0, 10).toList();

      assertEquals(7, res.size());
    }

    @Test
    @SliceTestConfiguration.WithSimpleReportOrgAdminUser
    void getOrganizationResults_doesNotShowCorrectEvents() {
      var testEvent = testDataFactory.createTestEvent(personA, facilityA);
      testDataFactory.createTestEventCorrection(testEvent, TestCorrectionStatus.CORRECTED);
      var res = _service.getOrganizationResults(null, null, null, null, null, null, 0, 10).toList();

      assertEquals(8, res.size());
    }

    @Test
    @SliceTestConfiguration.WithSimpleReportOrgAdminUser
    void getOrganizationResults_showsRemovedEvents() {
      var testEvent = testDataFactory.createTestEvent(personA, facilityA);
      testDataFactory.createTestEventCorrection(testEvent, TestCorrectionStatus.REMOVED);
      var res = _service.getOrganizationResults(null, null, null, null, null, null, 0, 10).toList();

      assertEquals(8, res.size());
    }

    @Test
    @SliceTestConfiguration.WithSimpleReportOrgAdminUser
    void getFacilityResults_noFilter() {
      var res =
          _service
              .getFacilityResults(
                  facilityA.getInternalId(), null, null, null, null, null, null, 0, 10)
              .toList();
      assertEquals(4, res.size());
    }

    @Test
    @SliceTestConfiguration.WithSimpleReportOrgAdminUser
    void getFacilityResults_filter_condition() {
      var covid = testDataFactory.getCovidDisease();
      var res =
          _service
              .getFacilityResults(
                  facilityA.getInternalId(), null, null, null, covid, null, null, 0, 10)
              .toList();
      assertEquals(2, res.size());
      assertTrue(res.stream().allMatch(r -> covid.getName().equals(r.getDisease().getName())));
    }

    @Test
    @SliceTestConfiguration.WithSimpleReportOrgAdminUser
    void getFacilityResults_filter_result() {
      var res =
          _service
              .getFacilityResults(
                  facilityA.getInternalId(),
                  null,
                  TestResult.POSITIVE,
                  null,
                  null,
                  null,
                  null,
                  0,
                  10)
              .toList();
      assertEquals(3, res.size());
      assertTrue(res.stream().allMatch(r -> TestResult.POSITIVE.equals(r.getTestResult())));
    }

    @Test
    @SliceTestConfiguration.WithSimpleReportOrgAdminUser
    void getFacilityResults_filter_patient() {
      var res =
          _service
              .getFacilityResults(
                  facilityA.getInternalId(),
                  personB.getInternalId(),
                  null,
                  null,
                  null,
                  null,
                  null,
                  0,
                  10)
              .toList();
      assertEquals(3, res.size());
      assertTrue(
          res.stream()
              .allMatch(
                  r ->
                      personB
                          .getInternalId()
                          .equals(r.getTestEvent().getPatient().getInternalId())));
    }

    @Test
    @SliceTestConfiguration.WithSimpleReportOrgAdminUser
    void getFacilityResults_filter_role() {
      var res =
          _service
              .getFacilityResults(
                  facilityB.getInternalId(), null, null, PersonRole.STAFF, null, null, null, 0, 10)
              .toList();
      assertEquals(3, res.size());
      assertTrue(
          res.stream()
              .allMatch(
                  r ->
                      personA
                          .getInternalId()
                          .equals(r.getTestEvent().getPatient().getInternalId())));
    }

    @Test
    @SliceTestConfiguration.WithSimpleReportOrgAdminUser
    void getFacilityResults_filter_date() {
      var res =
          _service
              .getFacilityResults(
                  null,
                  null,
                  null,
                  null,
                  null,
                  convertDate(LocalDateTime.of(2023, 4, 2, 0, 0, 0)),
                  convertDate(LocalDateTime.of(2023, 11, 30, 23, 59, 59)),
                  0,
                  10)
              .toList();
      assertEquals(3, res.size());
      assertEquals(SECOND_TEST_DATE, res.get(0).getTestEvent().getDateTested());
      assertEquals(SECOND_TEST_DATE, res.get(1).getTestEvent().getDateTested());
      assertEquals(SECOND_TEST_DATE, res.get(2).getTestEvent().getDateTested());
    }
  }

  @Test
  void addAndRemoveResultsToTestOrder_test() {
    // GIVEN
    Organization org = testDataFactory.saveValidOrganization();
    Facility facility = testDataFactory.createValidFacility(org);
    Person patient = testDataFactory.createFullPerson(org);
    TestOrder testOrder = testDataFactory.createTestOrder(patient, facility);
    SupportedDisease covidDisease = testDataFactory.getCovidDisease();

    Result covidResult = new Result(covidDisease, TestResult.POSITIVE);

    assertThat(resultRepository.findAll()).isEmpty();
    assertThat(testOrder.getResults()).isEmpty();

    // WHEN adding results
    TestOrder updatedTestOrder = _service.addResultsToTestOrder(testOrder, List.of(covidResult));

    // THEN
    assertThat(updatedTestOrder).isEqualTo(testOrder);

    // verify all results
    List<Result> resultsFromRepo = resultRepository.findAll();
    assertThat(resultsFromRepo).hasSize(1);
    resultsFromRepo.forEach(
        result ->
            assertThat(result.getTestOrder().getInternalId()).isEqualTo(testOrder.getInternalId()));

    // verify results on the TestOrder Object
    assertThat(testOrder.getResults()).hasSize(1);
    testOrder
        .getResults()
        .forEach(
            result ->
                assertThat(result.getTestOrder().getInternalId())
                    .isEqualTo(testOrder.getInternalId()));

    // THEN removing results from test order
    TestOrder updatedTestOrderAgain = _service.removeTestOrderResults(testOrder);
    assertThat(updatedTestOrderAgain).isEqualTo(updatedTestOrder);

    // verify all results has been removed
    assertThat(resultRepository.findAll()).isEmpty();
    assertThat(testOrder.getResults()).isEmpty();
  }

  @Test
  void addResultsToTestEvent_test() {
    // GIVEN
    Organization org = testDataFactory.saveValidOrganization();
    Facility facility = testDataFactory.createValidFacility(org);
    Person patient = testDataFactory.createFullPerson(org);
    TestOrder testOrder = testDataFactory.createTestOrder(patient, facility);
    TestEvent testEvent = testEventRepository.save(new TestEvent(testOrder));
    SupportedDisease covidDisease = testDataFactory.getCovidDisease();

    Result covidResult = new Result(covidDisease, TestResult.POSITIVE);

    assertThat(resultRepository.findAll()).isEmpty();
    assertThat(testOrder.getResults()).isEmpty();
    assertThat(testEvent.getResults()).isEmpty();

    // WHEN adding results
    TestEvent updatedTestEvent = _service.addResultsToTestEvent(testEvent, List.of(covidResult));

    // THEN
    assertThat(updatedTestEvent).isEqualTo(testEvent);

    // verify all results
    List<Result> resultsFromRepo = resultRepository.findAll();
    assertThat(resultsFromRepo).hasSize(1);
    resultsFromRepo.forEach(
        result ->
            assertThat(result.getTestEvent().getInternalId()).isEqualTo(testEvent.getInternalId()));

    // verify results on the TestEvent Object
    assertThat(testEvent.getResults()).hasSize(1);
    testEvent
        .getResults()
        .forEach(
            result ->
                assertThat(result.getTestEvent().getInternalId())
                    .isEqualTo(testEvent.getInternalId()));
  }

  @Test
  void separateCombinedResultsToTestEventResultsAndTestOrderResults_test() {
    // GIVEN
    Organization org = testDataFactory.saveValidOrganization();
    Facility facility = testDataFactory.createValidFacility(org);
    Person patient = testDataFactory.createFullPerson(org);
    TestOrder testOrder = testDataFactory.createTestOrder(patient, facility);
    TestEvent testEvent = testEventRepository.save(new TestEvent(testOrder));
    SupportedDisease covidDisease = testDataFactory.getCovidDisease();

    Result covidResult = new Result(covidDisease, TestResult.POSITIVE);

    assertThat(resultRepository.findAll()).isEmpty();
    assertThat(testOrder.getResults()).isEmpty();
    assertThat(testEvent.getResults()).isEmpty();

    // add same test results for TestOrder & TestEvent
    _service.addResultsToTestOrder(testOrder, List.of(covidResult));
    _service.addResultsToTestEvent(testEvent, testOrder.getResults());

    // ensure the Result will have both testEvent and testOrder populated
    assertThat(resultRepository.findAll()).hasSize(1);
    testOrder
        .getResults()
        .forEach(
            result -> {
              assertThat(result.getTestOrder()).isEqualTo(testOrder);
              assertThat(result.getTestEvent()).isEqualTo(testEvent);
            });
    testEvent
        .getResults()
        .forEach(
            result -> {
              assertThat(result.getTestOrder()).isEqualTo(testOrder);
              assertThat(result.getTestEvent()).isEqualTo(testEvent);
            });

    // WHEN
    _service.separateCombinedResultsToTestEventResultsAndTestOrderResults(testEvent);

    // verify all results
    List<Result> resultsFromRepo = resultRepository.findAll();
    assertThat(resultsFromRepo).hasSize(2);

    // verify results on the TestEvent Object
    assertThat(testEvent.getResults()).hasSize(1);
    testEvent
        .getResults()
        .forEach(
            result -> {
              assertThat(result.getTestEvent().getInternalId())
                  .isEqualTo(testEvent.getInternalId());
              assertThat(result.getTestOrder()).isNull();
            });

    // verify results on the TestOrder Object
    assertThat(testOrder.getResults()).hasSize(1);
    testOrder
        .getResults()
        .forEach(
            result -> {
              assertThat(result.getTestOrder().getInternalId())
                  .isEqualTo(testOrder.getInternalId());
              assertThat(result.getTestEvent()).isNull();
            });
  }
}
