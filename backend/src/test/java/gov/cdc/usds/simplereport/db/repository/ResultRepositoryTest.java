package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class ResultRepositoryTest extends BaseRepositoryTest {

  @Autowired TestDataFactory _factory;
  @Autowired ResultRepository _repo;
  @Autowired DiseaseService diseaseService;

  private Organization ORG;
  private Facility FACILITY;
  private Person PATIENT;

  // We can't use @BeforeAll here because that runs outside a request context, which is required for
  // creating auditable entities like org and facility.
  @BeforeEach
  void setUp() {
    ORG = _factory.saveValidOrganization();
    FACILITY = _factory.createValidFacility(ORG);
    PATIENT = _factory.createFullPerson(ORG);
  }

  @Test
  void fetchesAllResultsForMultiplexTestEvent() {
    TestEvent event =
        _factory.createMultiplexTestEvent(
            PATIENT,
            FACILITY,
            TestResult.POSITIVE,
            TestResult.NEGATIVE,
            TestResult.NEGATIVE,
            false);

    List<Result> results = _repo.findAllByTestEvent(event);
    assertEquals(3, results.size());
  }

  @Test
  void fetchesAllResultsForCovidOnlyTest() {
    TestEvent event = _factory.createTestEvent(PATIENT, FACILITY, TestResult.POSITIVE);

    List<Result> results = _repo.findAllByTestEvent(event);
    assertEquals(1, results.size());
    assertEquals(TestResult.POSITIVE, results.get(0).getTestResult());
  }

  @Test
  void fetchesSpecificResultGivenDiseaseAndTestEvent() {
    TestEvent event =
        _factory.createMultiplexTestEvent(
            PATIENT,
            FACILITY,
            TestResult.POSITIVE,
            TestResult.NEGATIVE,
            TestResult.NEGATIVE,
            false);

    Optional<Result> result = _repo.findResultByTestEventAndDisease(event, diseaseService.covid());
    assertEquals(TestResult.POSITIVE, result.get().getTestResult());
  }

  @Test
  void fetchesSpecificResultGivenDiseaseAndTestOrder() {
    TestEvent event =
        _factory.createMultiplexTestEvent(
            PATIENT,
            FACILITY,
            TestResult.POSITIVE,
            TestResult.NEGATIVE,
            TestResult.NEGATIVE,
            false);
    TestOrder order = event.getOrder();

    Result result = _repo.findResultByTestOrderAndDisease(order, diseaseService.covid());
    assertEquals(TestResult.POSITIVE, result.getTestResult());
  }

  @Test
  void findAllByTestOrderSuccessful() {
    TestEvent event =
        _factory.createMultiplexTestEvent(
            PATIENT,
            FACILITY,
            TestResult.POSITIVE,
            TestResult.NEGATIVE,
            TestResult.NEGATIVE,
            false);

    List<Result> result = _repo.findAllByTestOrder(event.getTestOrder());
    assertEquals(3, result.size());
  }

  @Test
  void findAllByDiseaseSuccessful() {
    Person patient = _factory.createMinimalPerson(ORG, FACILITY, "Sarah", "Sally", "Samuels", "");
    _factory.createTestEvent(patient, FACILITY, TestResult.NEGATIVE);

    _factory.createMultiplexTestEvent(
        PATIENT, FACILITY, TestResult.POSITIVE, TestResult.NEGATIVE, TestResult.NEGATIVE, false);

    List<Result> results = _repo.findAllByDisease(diseaseService.covid());
    assertEquals(2, results.size());
  }
}
