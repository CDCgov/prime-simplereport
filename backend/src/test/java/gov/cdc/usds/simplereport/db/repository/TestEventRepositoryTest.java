package gov.cdc.usds.simplereport.db.repository;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class TestEventRepositoryTest extends BaseRepositoryTest {

    @Autowired
    private TestEventRepository _repo;
    @Autowired
    private TestDataFactory _dataFactory;

    @Test
    public void testFindByPatient() {
        Organization org = _dataFactory.createValidOrg();
        Facility place = _dataFactory.createValidFacility(org);
        Person patient = _dataFactory.createMinimalPerson(org);
        _repo.save(new TestEvent(TestResult.POSITIVE, place.getDefaultDeviceType(), patient, place));
        _repo.save(new TestEvent(TestResult.UNDETERMINED, place.getDefaultDeviceType(), patient, place));
        flush();
        List<TestEvent> found = _repo.findAllByPatient(patient);
        assertEquals(2, found.size());
    }

    @Test
    public void testLatestTestEventForPerson() {
        Date d1 = Date.from(Instant.parse("2000-01-01T00:00:00Z"));
        final Date DATE_1MIN_FUTURE = new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(3));
        List<TestEvent> foundTestReports1 = _repo.queryMatchAllBetweenDates(d1, DATE_1MIN_FUTURE);
        Organization org = _dataFactory.createValidOrg();
        Facility place = _dataFactory.createValidFacility(org);
        Person patient = _dataFactory.createMinimalPerson(org);
        TestEvent first = new TestEvent(TestResult.POSITIVE, place.getDefaultDeviceType(), patient, place);
        TestEvent second = new TestEvent(TestResult.UNDETERMINED, place.getDefaultDeviceType(), patient, place);
        _repo.save(first);
        _repo.save(second);
        flush();
        TestEvent found = _repo.findFirst1ByPatientOrderByCreatedAtDesc(patient);
        assertEquals(second.getResult(), TestResult.UNDETERMINED);
        List<TestEvent> foundTestReports2 = _repo.queryMatchAllBetweenDates(d1, DATE_1MIN_FUTURE);
        assertEquals(2, foundTestReports2.size() - foundTestReports1.size());
    }
}
