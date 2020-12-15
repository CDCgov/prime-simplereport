package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;

@SuppressWarnings("checkstyle:MagicNumber")
public class PersonServiceTest extends BaseServiceTest<PersonService> {

    // I'll have you know that I didn't actually mean to do this...
    private static final PersonName AMOS = new PersonName("Amos", null, "Quint", null);
    private static final PersonName BRAD = new PersonName("Bradley", "Z.", "Jones", "Jr.");
    private static final PersonName CHARLES = new PersonName("Charles", null, "Albemarle", "Sr.");
    private static final PersonName DEXTER = new PersonName("Dexter", null, "Jones", null);
    private static final PersonName ELIZABETH = new PersonName("Elizabeth", null, "Merriwether", null);
    private static final PersonName FRANK = new PersonName("Frank", null, "Bones", "3");

    @Autowired
    private OrganizationService _orgService;

    private Organization _org;
    private Facility _site1;
    private Facility _site2;

    @Test
    public void roundTrip() {
        _service.addPatient(null, "FOO", "Fred", null, "Fosbury", "Sr.", LocalDate.of(1865, 12, 25), "123 Main",
                "Apartment 3", "Hicksville", "NY",
                "11801", "(888) GET-BENT", "STAFF", null, "Nassau", null, null, null, false, false);
        _service.addPatient(null, "BAR", "Basil", null, "Barnacle", "4th", LocalDate.of(1865, 12, 25), "13 Main", null,
                "Hicksville", "NY",
                "11801", "(888) GET-BENT", "STAFF", null, "Nassau", null, null, null, false, false);
        List<Person> all = _service.getPatients(null);
        assertEquals(2, all.size());
    }

    @Test
    public void getPatients_noFacility_allFetchedAndSorted() {
        makedata();
        List<Person> patients = _service.getPatients(null);
        assertPatientList(patients, CHARLES, FRANK, BRAD, DEXTER, ELIZABETH, AMOS);
    }

    @Test
    public void getPatients_facilitySpecific_nullsAndSpecifiedFetchedAndSorted() {
        makedata();
        List<Person> patients = _service.getPatients(_site1.getInternalId());
        assertPatientList(patients, CHARLES, BRAD, ELIZABETH, AMOS);
        patients = _service.getPatients(_site2.getInternalId());
        assertPatientList(patients, FRANK, BRAD, DEXTER, AMOS);
    }

    private void makedata() {
        _org = _orgService.getCurrentOrganization();
        _site1 = _dataFactory.createValidFacility(_org, "First One");
        _site2 = _dataFactory.createValidFacility(_org, "Second One");

        _dataFactory.createMinimalPerson(_org, null, AMOS);
        _dataFactory.createMinimalPerson(_org, null, BRAD);
        _dataFactory.createMinimalPerson(_org, _site1, ELIZABETH);
        _dataFactory.createMinimalPerson(_org, _site1, CHARLES);
        _dataFactory.createMinimalPerson(_org, _site2, DEXTER);
        _dataFactory.createMinimalPerson(_org, _site2, FRANK);
    }

    private static void assertPatientList(List<Person> found, PersonName... expected) {
        // check common elements first
        for (int i = 0; i < expected.length && i < found.size(); i++) {
            assertEquals(expected[i], found.get(i).getNameInfo());
        }
        // *then* check if there are extras
        if (expected.length != found.size()) {
            fail("Expected" + expected.length + " items but found " + found.size());
        }
    }
}
