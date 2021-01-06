package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import com.yannbriancon.interceptor.HibernateQueryInterceptor;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.repository.DeviceTypeRepository;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;

@SuppressWarnings("checkstyle:MagicNumber")
public class TestOrderServiceTest extends BaseServiceTestOrgUser<TestOrderService> {

    @Autowired
    private DeviceTypeRepository _deviceTypeRepo;
    @Autowired
    private OrganizationService _organizationService;
    @Autowired
    private PersonService _personService;
    @Autowired
    private HibernateQueryInterceptor hibernateQueryInterceptor;
    @Autowired
    private TestDataFactory _dataFactory;

    @BeforeEach
    void setupData() {
        initSampleData();
    }
    
    @Test
    public void addPatientToQueue() {
        Organization org = _organizationService.getCurrentOrganization();
        Facility facility = _organizationService.getFacilities(org).get(0);
        Person p = _personService.addPatient(null, "FOO", "Fred", null, "", "Sr.",
                LocalDate.of(1865, 12, 25), "123 Main", "Apartment 3", "Syracuse", "NY", "11801",
                "8883334444", "STAFF", null, "Nassau", null, null, null, false, false);

        _service.addPatientToQueue(facility.getInternalId(), p, "",
                Collections.<String, Boolean>emptyMap(), false, LocalDate.of(1865, 12, 25), "",
                TestResult.POSITIVE, LocalDate.of(1865, 12, 25), false);

        List<TestOrder> queue = _service.getQueue(facility.getInternalId().toString());
        assertEquals(1, queue.size());
    }

    @Test
    public void addTestResult() {
        Organization org = _organizationService.getCurrentOrganization();
        Facility facility = _organizationService.getFacilities(org).get(0);
        Person p = _personService.addPatient(null, "FOO", "Fred", null, "", "Sr.",
                LocalDate.of(1865, 12, 25), "123 Main", "Apartment 3", "Syracuse", "NY", "11801",
                "8883334444", "STAFF", null, "Nassau", null, null, null, false, false);
        _service.addPatientToQueue(facility.getInternalId(), p, "",
                Collections.<String, Boolean>emptyMap(), false, LocalDate.of(1865, 12, 25), "",
                TestResult.POSITIVE, LocalDate.of(1865, 12, 25), false);
        DeviceType devA = _deviceTypeRepo.save(new DeviceType("A", "B", "C", "D"));

        _service.addTestResult(devA.getInternalId().toString(), TestResult.POSITIVE,
                p.getInternalId().toString(), null);

        List<TestOrder> queue = _service.getQueue(facility.getInternalId().toString());
        assertEquals(0, queue.size());
    }

    @Test
    public void editTestResult() {
        Organization org = _organizationService.getCurrentOrganization();
        Facility facility = _organizationService.getFacilities(org).get(0);
        Person p = _personService.addPatient(null, "FOO", "Fred", null, "", "Sr.",
                LocalDate.of(1865, 12, 25), "123 Main", "Apartment 3", "Syracuse", "NY", "11801",
                "8883334444", "STAFF", null, "Nassau", null, null, null, false, false);
        TestOrder o = _service.addPatientToQueue(facility.getInternalId(), p, "",
                Collections.<String, Boolean>emptyMap(), false, LocalDate.of(1865, 12, 25), "",
                TestResult.POSITIVE, LocalDate.of(1865, 12, 25), false);
        DeviceType devA = _deviceTypeRepo.save(new DeviceType("A", "B", "C", "D"));

        _service.editQueueItem(o.getInternalId().toString(), devA.getInternalId().toString(),
                TestResult.POSITIVE.toString(), null);

        List<TestOrder> queue = _service.getQueue(facility.getInternalId().toString());
        assertEquals(1, queue.size());
        assertEquals(TestResult.POSITIVE, queue.get(0).getTestResult());
        assertEquals(devA.getInternalId(), queue.get(0).getDeviceType().getInternalId());
    }

    @Test
    public void fetchTestResults() {
        Organization org = _organizationService.getCurrentOrganization();
        Facility facility = _organizationService.getFacilities(org).get(0);
        Person p = _dataFactory.createFullPerson(org);
        TestEvent _e = _dataFactory.createTestEvent(p, facility);

        // Count queries with one order
        hibernateQueryInterceptor.startQueryCount();
        _service.getTestResults(facility.getInternalId().toString());
        assertEquals(7, hibernateQueryInterceptor.getQueryCount());

        // Count queries with three order
        TestEvent _e1 = _dataFactory.createTestEvent(p, facility);
        TestEvent _e2 = _dataFactory.createTestEvent(p, facility);
        hibernateQueryInterceptor.startQueryCount();
        _service.getTestResults(facility.getInternalId().toString());
        assertEquals(7, hibernateQueryInterceptor.getQueryCount());
    }
}
