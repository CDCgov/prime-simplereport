package gov.cdc.usds.simplereport.service;

import static org.assertj.core.api.Assertions.assertThat;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.repository.ResultRepository;
import gov.cdc.usds.simplereport.db.repository.TestEventRepository;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
@SliceTestConfiguration.WithSimpleReportStandardUser
class ResultServiceTest extends BaseServiceTest<ResultService> {

  @Autowired private ResultRepository resultRepository;

  @Autowired private TestEventRepository testEventRepository;

  @Autowired private TestDataFactory testDataFactory;

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
