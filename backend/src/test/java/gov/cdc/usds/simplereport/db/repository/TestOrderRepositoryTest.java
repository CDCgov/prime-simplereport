package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.ResultService;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.time.LocalDate;
import java.util.List;
import javax.persistence.PersistenceException;
import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class TestOrderRepositoryTest extends BaseRepositoryTest {

  @Autowired private TestOrderRepository _repo;
  @Autowired private PersonRepository _personRepo;
  @Autowired private PhoneNumberRepository _phoneRepo;
  @Autowired private TestEventRepository _events;
  @Autowired private TestDataFactory _dataFactory;
  @Autowired private DiseaseService _diseaseService;
  @Autowired private ResultService resultService;

  @Test
  void runChanges() {
    Organization gwu =
        _dataFactory.saveOrganization("George Washington", "university", "gwu", true);
    Organization gtown = _dataFactory.saveOrganization("Georgetown", "university", "gt", true);
    Facility site = _dataFactory.createValidFacility(gtown);
    Facility otherSite = _dataFactory.createValidFacility(gwu);
    Person hoya =
        _personRepo.save(
            new Person(
                gtown,
                "lookupId",
                "Joe",
                null,
                "Schmoe",
                null,
                LocalDate.now(),
                null,
                "USA",
                PersonRole.RESIDENT,
                List.of("fake@test.com"),
                null,
                "",
                null,
                "",
                false,
                false,
                "English",
                TestResultDeliveryPreference.NONE));
    PhoneNumber pn = new PhoneNumber(PhoneType.LANDLINE, "5555555555");
    pn.setPerson(hoya);
    _phoneRepo.save(pn);
    hoya.setPrimaryPhone(pn);
    hoya = _personRepo.save(hoya);
    TestOrder order = _repo.save(new TestOrder(hoya, site));
    List<TestOrder> queue = _repo.fetchQueue(gwu, otherSite);
    assertEquals(0, queue.size());
    queue = _repo.fetchQueue(gtown, site);
    assertEquals(1, queue.size());
    TestEvent event = _dataFactory.submitTest(order, TestResult.NEGATIVE);
    flush();
    TestOrder lookuporder = _repo.findByTestEvent(order.getOrganization(), event);
    assertNotNull(lookuporder);
    assertEquals(lookuporder.getInternalId(), order.getInternalId());
    assertEquals(0, _repo.fetchQueue(gtown, site).size());
    assertEquals(1, _repo.fetchPastResults(gtown, site).size());
  }

  @Test
  void testLifeCycle() {
    Organization gtown = _dataFactory.saveOrganization("Georgetown", "university", "gt", true);
    Person hoya =
        _personRepo.save(
            new Person(
                gtown,
                "lookupId",
                "Joe",
                null,
                "Schmoe",
                null,
                LocalDate.now(),
                null,
                "USA",
                PersonRole.RESIDENT,
                List.of("joe@shmoe.com"),
                null,
                "",
                null,
                "",
                false,
                false,
                "English",
                TestResultDeliveryPreference.NONE));
    PhoneNumber pn = new PhoneNumber(PhoneType.LANDLINE, "5555555555");
    pn.setPerson(hoya);
    _phoneRepo.save(pn);
    hoya.setPrimaryPhone(pn);
    hoya = _personRepo.save(hoya);
    Facility site = _dataFactory.createValidFacility(gtown);
    TestOrder order = _repo.save(new TestOrder(hoya, site));
    assertNotNull(order);
    flush();
    Result result = new Result(_diseaseService.covid(), TestResult.POSITIVE);
    resultService.addResultsToTestOrder(order, List.of(result));

    TestEvent ev = _events.save(new TestEvent(order));
    assertNotNull(ev);
    order.setTestEventRef(ev);
    _repo.save(order);
    flush();

    assertNotNull(_repo.findByTestEvent(gtown, ev));
    assertEquals(ev, order.getTestEvent());

    // LocalDate.now() makes it random.
    String unitTestCorrectionStr = "Correction unit test: " + LocalDate.now().toString();
    order.setReasonForCorrection(unitTestCorrectionStr);
    _repo.save(order);
    flush();
    assertEquals(unitTestCorrectionStr, _repo.findByTestEvent(gtown, ev).getReasonForCorrection());
  }

  @Test
  void createOrder_duplicatesFound_error() {
    Organization org = _dataFactory.saveValidOrganization();
    Person patient0 = _dataFactory.createMinimalPerson(org);
    Facility site = _dataFactory.createValidFacility(org);
    TestOrder order1 = new TestOrder(patient0, site);
    _repo.save(order1);
    flush();
    TestOrder order2 = new TestOrder(patient0, site);
    _repo.save(order2);
    PersistenceException caught =
        assertThrows(
            PersistenceException.class,
            () -> {
              flush();
            });
    assertEquals(ConstraintViolationException.class, caught.getCause().getClass());
  }

  @Test
  void createOrder_duplicateCanceled_ok() {
    Organization org = _dataFactory.saveValidOrganization();
    Person patient0 = _dataFactory.createMinimalPerson(org);
    Facility site = _dataFactory.createValidFacility(org);
    TestOrder order1 = new TestOrder(patient0, site);
    _repo.save(order1);
    flush();
    order1.cancelOrder();
    _repo.save(order1);
    flush();
    TestOrder order2 = new TestOrder(patient0, site);
    order2 = _repo.save(order2);
    flush();
    assertNotNull(order2.getInternalId());
    assertNotNull(order1.getInternalId());
    assertNotEquals(order1.getInternalId(), order2.getInternalId());
    List<TestOrder> queue = _repo.fetchQueue(org, site);
    assertEquals(1, queue.size());
    assertEquals(order2.getInternalId(), queue.get(0).getInternalId());
  }

  @Test
  void createOrder_duplicateSubmitted_ok() {
    Organization org = _dataFactory.saveValidOrganization();
    Person patient0 = _dataFactory.createMinimalPerson(org);
    Facility site = _dataFactory.createValidFacility(org);
    TestOrder order1 = new TestOrder(patient0, site);
    _repo.save(order1);
    flush();
    Result result = new Result(_diseaseService.covid(), TestResult.NEGATIVE);
    resultService.addResultsToTestOrder(order1, List.of(result));

    TestEvent didit = _events.save(new TestEvent(order1));
    order1.setTestEventRef(didit);
    order1.markComplete();
    _repo.save(order1);
    flush();
    TestOrder order2 = new TestOrder(patient0, site);
    order2 = _repo.save(order2);
    flush();
    assertNotNull(order2.getInternalId());
    assertNotNull(order1.getInternalId());
    assertNotEquals(order1.getInternalId(), order2.getInternalId());
    List<TestOrder> queue = _repo.fetchQueue(org, site);
    assertEquals(1, queue.size());
    assertEquals(order2.getInternalId(), queue.get(0).getInternalId());
  }

  @Test
  void fetchQueue_multipleEntries_sortedFifo() {
    Organization org = _dataFactory.saveValidOrganization();
    Person adam = _dataFactory.createMinimalPerson(org, null, "Adam", "A.", "Astaire", "Jr.");
    Person brad = _dataFactory.createMinimalPerson(org, null, "Bradley", "B.", "Bones", null);
    Person charlie =
        _dataFactory.createMinimalPerson(org, null, "Charles", "C.", "Crankypants", "3rd");
    Facility facility = _dataFactory.createValidFacility(org);
    _repo.save(new TestOrder(charlie, facility));
    pause();
    _repo.save(new TestOrder(adam, facility));
    pause();
    _repo.save(new TestOrder(brad, facility));
    List<TestOrder> orders = _repo.fetchQueue(org, facility);
    assertEquals("Charles", orders.get(0).getPatient().getFirstName());
    assertEquals("Adam", orders.get(1).getPatient().getFirstName());
    assertEquals("Bradley", orders.get(2).getPatient().getFirstName());
  }
}
