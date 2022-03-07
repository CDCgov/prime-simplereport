package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.db.model.*;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class ResultRepositoryTest extends BaseRepositoryTest {

  @Autowired TestDataFactory _factory;
  @Autowired ResultRepository _repo;

  private SupportedDisease COVID;
  private SupportedDisease FLU_A;
  private SupportedDisease FLU_B;

  private TestEvent TEST_EVENT;
  private TestOrder TEST_ORDER;

  private Organization ORG;
  private Facility FACILITY;

  // We can't use @BeforeAll here because that runs outside a request context, which is required for
  // creating auditable entities like org and facility.
  @BeforeEach
  void setUp() {
    COVID = _factory.createSupportedDisease("COVID-19", "1");
    FLU_A = _factory.createSupportedDisease("Flu A", "2");
    FLU_B = _factory.createSupportedDisease("Flu B", "3");

    ORG = _factory.createValidOrg();
    FACILITY = _factory.createValidFacility(ORG);
    Person patient = _factory.createFullPerson(ORG);

    TEST_EVENT = _factory.createTestEvent(patient, FACILITY);
    TEST_ORDER = TEST_EVENT.getTestOrder();
  }

  @Test
  void fetchesAllResultsForMultiplexTestEvent() {
    _repo.save(new Result(TEST_EVENT, TEST_ORDER, COVID, "POSITIVE"));
    _repo.save(new Result(TEST_EVENT, TEST_ORDER, FLU_A, "NEGATIVE"));
    _repo.save(new Result(TEST_EVENT, TEST_ORDER, FLU_B, "NEGATIVE"));

    List<Result> results = _repo.findAllByTestEvent(TEST_EVENT);
    assertEquals(results.size(), 3);
  }

  @Test
  void fetchesAllResultsForCovidOnlyTest() {
    _repo.save(new Result(TEST_EVENT, TEST_ORDER, COVID, "POSITIVE"));

    List<Result> results = _repo.findAllByTestEvent(TEST_EVENT);
    assertEquals(results.size(), 1);
    assertEquals(results.get(0).getResult(), "POSITIVE");
  }

  @Test
  void fetchesSpecificResultGivenDiseaseAndTestEvent() {
    _repo.save(new Result(TEST_EVENT, TEST_ORDER, COVID, "POSITIVE"));
    _repo.save(new Result(TEST_EVENT, TEST_ORDER, FLU_A, "NEGATIVE"));
    _repo.save(new Result(TEST_EVENT, TEST_ORDER, FLU_B, "NEGATIVE"));

    Result result = _repo.findResultByTestEventAndDisease(TEST_EVENT, COVID);
    assertEquals(result.getResult(), "POSITIVE");
  }

  @Test
  void fetchesSpecificResultGivenDiseaseAndTestOrder() {
    _repo.save(new Result(TEST_EVENT, TEST_ORDER, COVID, "POSITIVE"));
    _repo.save(new Result(TEST_EVENT, TEST_ORDER, FLU_A, "NEGATIVE"));
    _repo.save(new Result(TEST_EVENT, TEST_ORDER, FLU_B, "NEGATIVE"));

    Result result = _repo.findResultByTestOrderAndDisease(TEST_ORDER, COVID);
    assertEquals(result.getResult(), "POSITIVE");
  }

  @Test
  void findAllByTestOrderSuccessful() {
    _repo.save(new Result(TEST_EVENT, TEST_ORDER, COVID, "POSITIVE"));
    _repo.save(new Result(TEST_EVENT, TEST_ORDER, FLU_A, "NEGATIVE"));
    _repo.save(new Result(TEST_EVENT, TEST_ORDER, FLU_B, "NEGATIVE"));

    List<Result> result = _repo.findAllByTestOrder(TEST_ORDER);
    assertEquals(result.size(), 3);
  }

  @Test
  void findAllByDiseaseSuccessful() {
    Person patient = _factory.createMinimalPerson(ORG, FACILITY, "Sarah", "Sally", "Samuels", "");
    TestEvent te = _factory.createTestEvent(patient, FACILITY);
    TestOrder to = te.getTestOrder();

    _repo.save(new Result(TEST_EVENT, TEST_ORDER, COVID, "POSITIVE"));
    _repo.save(new Result(te, to, COVID, "NEGATIVE"));

    List<Result> results = _repo.findAllByDisease(COVID);
    assertEquals(results.size(), 2);
  }
}
