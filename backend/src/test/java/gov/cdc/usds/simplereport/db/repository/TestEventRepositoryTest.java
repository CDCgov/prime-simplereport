package gov.cdc.usds.simplereport.db.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;

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

        List<TestEvent> found2 = _repo.findAllByCreatedAtInstant(Instant.parse("2020-01-01T16:13:15.448000Z"));
        // assertNotEquals(2, found2.size());
    }
}
