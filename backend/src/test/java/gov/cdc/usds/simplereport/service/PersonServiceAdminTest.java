package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

import gov.cdc.usds.simplereport.db.model.Person;

@SuppressWarnings("checkstyle:MagicNumber")
public class PersonServiceAdminTest extends BaseServiceTestAdmin<PersonService> {

    @Test
    public void deletePatient() {
        Person p = _service.addPatient(null, "FOO", "Fred", null, "Fosbury", "Sr.", LocalDate.of(1865, 12, 25), "123 Main",
                "Apartment 3", "Hicksville", "NY",
                "11801", "5555555555", "STAFF", null, "Nassau", null, null, null, false, false);

        Person deletedPerson = _service.setIsDeleted(p.getInternalId(), true);

        assertEquals(0, _service.getPatients(null).size());
        assertTrue(deletedPerson.isDeleted());
    }


}
