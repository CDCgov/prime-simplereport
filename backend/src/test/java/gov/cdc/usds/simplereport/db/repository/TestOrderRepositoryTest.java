package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;
import java.util.List;

import javax.persistence.PersistenceException;

import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;

import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;

@SuppressWarnings("checkstyle:MagicNumber")
public class TestOrderRepositoryTest extends BaseRepositoryTest {

    @Autowired
    private TestOrderRepository _repo;
    @Autowired
    private PersonRepository _personRepo;
    @Autowired
    private OrganizationRepository _orgRepo;
    @Autowired
    private TestEventRepository _events;
    @Autowired
    private TestDataFactory _dataFactory;

    @Test
    public void runChanges() {
        Organization gwu = _orgRepo.save(new Organization("George Washington", "gwu"));
        Organization gtown = _orgRepo.save(new Organization("Georgetown", "gt"));
        Facility site = _dataFactory.createValidFacility(gtown);
        Facility otherSite = _dataFactory.createValidFacility(gwu);
        Person hoya = _personRepo.save(new Person(gtown, "lookupId", "Joe", null, "Schmoe", null, LocalDate.now(), null,
                "(123) 456-7890", PersonRole.RESIDENT, "", null, "", "", false, false));
        TestOrder order = _repo.save(new TestOrder(hoya, site));
        List<TestOrder> queue = _repo.fetchQueue(gwu, otherSite);
        assertEquals(0, queue.size());
        queue = _repo.fetchQueue(gtown, site);
        assertEquals(1, queue.size());
        doTest(order, TestResult.NEGATIVE);
        assertEquals(0, _repo.fetchQueue(gtown, site).size());
        assertEquals(1, _repo.fetchPastResults(gtown, site).size());
    }

    @Test
    public void testLifeCycle() {
        DeviceType device = _dataFactory.getGenericDevice();
        Organization gtown = _orgRepo.save(new Organization("Georgetown", "gt"));
        Person hoya = _personRepo.save(new Person(gtown, "lookupId", "Joe", null, "Schmoe", null, LocalDate.now(), null,
                "(123) 456-7890", PersonRole.RESIDENT, "", null, "", "", false, false));
        Facility site = _dataFactory.createValidFacility(gtown);
        TestOrder order = _repo.save(new TestOrder(hoya, site));
        assertNotNull(order);
        flush();
        TestEvent ev = _events.save(new TestEvent(TestResult.POSITIVE, device, hoya, site, order));
        assertNotNull(ev);
        order.setTestEvent(ev);
        _repo.save(order);
        flush();

        assertNotNull(_repo.findByTestEventId(gtown, ev.getInternalId()));
        assertEquals(ev.getInternalId(), order.getTestEventId());

        // LocalDate.now() makes it random.
        String unitTestCorrectionStr = "Correction unit test: " + LocalDate.now().toString();
        order.setReasonForCorrection(unitTestCorrectionStr);
        _repo.save(order);
        flush();
        assertEquals(unitTestCorrectionStr, _repo.findByTestEventId(gtown, ev.getInternalId()).getReasonForCorrection());
    }

    @Test
    public void createOrder_duplicatesFound_error() {
        Organization org = _dataFactory.createValidOrg();
        Person patient0 = _dataFactory.createMinimalPerson(org);
        Facility site = _dataFactory.createValidFacility(org);
        TestOrder order1 = new TestOrder(patient0, site);
        _repo.save(order1);
        flush();
        TestOrder order2 = new TestOrder(patient0, site);
        PersistenceException caught = assertThrows(PersistenceException.class, () -> {
            _repo.save(order2);
            flush();
        });
        assertEquals(ConstraintViolationException.class, caught.getCause().getClass());
    }

    @Test
    public void createOrder_duplicateCanceled_ok() {
        Organization org = _dataFactory.createValidOrg();
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
    public void createOrder_duplicateSubmitted_ok() {
        Organization org = _dataFactory.createValidOrg();
        Person patient0 = _dataFactory.createMinimalPerson(org);
        Facility site = _dataFactory.createValidFacility(org);
        TestOrder order1 = new TestOrder(patient0, site);
        _repo.save(order1);
        flush();
        TestEvent didit = _events.save(new TestEvent(TestResult.NEGATIVE, site.getDefaultDeviceType(), patient0, site, order1));
        order1.setTestEvent(didit);
        order1.setResult(didit.getResult());
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
    public void fetchQueue_multipleEntries_sortedFifo() {
        Organization org = _dataFactory.createValidOrg();
        Person adam = _dataFactory.createMinimalPerson(org, null, "Adam", "A.", "Astaire", "Jr.");
        Person brad = _dataFactory.createMinimalPerson(org, null, "Bradley", "B.", "Bones", null);
        Person charlie = _dataFactory.createMinimalPerson(org, null, "Charles", "C.", "Crankypants", "3rd");
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

    @Test
    public void fetchResults_multipleEntries_sortedLifo() throws InterruptedException {
        Organization org = _dataFactory.createValidOrg();
        Person adam = _dataFactory.createMinimalPerson(org, null, "Adam", "A.", "Astaire", "Jr.");
        Person brad = _dataFactory.createMinimalPerson(org, null, "Bradley", "B.", "Bones", null);
        Person charlie = _dataFactory.createMinimalPerson(org, null, "Charles", "C.", "Crankypants", "3rd");
        Facility facility = _dataFactory.createValidFacility(org);

        TestOrder charlieOrder = _repo.save(new TestOrder(charlie, facility));
        pause();
        TestOrder adamOrder = _repo.save(new TestOrder(adam, facility));
        pause();
        TestOrder bradleyOrder = _repo.save(new TestOrder(brad, facility));

        List<TestOrder> results = _repo.fetchPastResults(org, facility);
        assertEquals(0, results.size());

        doTest(bradleyOrder, TestResult.NEGATIVE);
        pause();
        doTest(charlieOrder, TestResult.POSITIVE);
        pause();
        doTest(adamOrder, TestResult.UNDETERMINED);

        results = _repo.fetchPastResults(org, facility);
        assertEquals(3, results.size());
        assertEquals("Adam", results.get(0).getPatient().getFirstName());
        assertEquals("Charles", results.get(1).getPatient().getFirstName());
        assertEquals("Bradley", results.get(2).getPatient().getFirstName());
    }

    private void doTest(TestOrder order, TestResult result) {
        order.setResult(result);
        TestEvent event = _events.save(new TestEvent(order));
        order.setTestEvent(event);
        order.markComplete();
        _repo.save(order);
        flush();
        TestOrder lookuporder = _repo.findByTestEventId(order.getOrganization(), event.getInternalId());
        assertNotNull(lookuporder);
        assertEquals(lookuporder.getInternalId(), order.getInternalId());
    }

    private static void pause() {
        try {
            Thread.sleep(2);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
