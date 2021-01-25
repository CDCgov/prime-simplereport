package gov.cdc.usds.simplereport.db.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import java.io.IOException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.boot.test.json.ObjectContent;

import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;

@JsonTest
public class PersonSerializationTest {

    @Autowired
    private JacksonTester<Person> _tester;

    @Test
    public void deserialize_stringRace_raceFound() throws IOException {
        ObjectContent<Person> ob = _tester.read("/deserialization/race-scalar.json");
        assertAlexanderHamilton(ob);
    }

    @Test
    public void deserialize_arrayRace_raceFound() throws IOException {
        ObjectContent<Person> ob = _tester.read("/deserialization/race-array.json");
        assertAlexanderHamilton(ob);
    }

    @Test
    public void deserialize_withFacility_raceFoundNoFacility() throws IOException {
        ObjectContent<Person> ob = _tester.read("/deserialization/with-facility.json");
        assertAlexanderHamilton(ob);
    }

    @Test
    public void serialize_withOrgAndFacility_noOrgOrFacility() throws IOException {
        // consts are to keep style check happy othewise it complains about
        // "magic numbers"
        final int BIRTH_YEAR = 2000;
        final int BIRTH_MONTH = 3;
        final int BIRTH_DAY = 31;
        Organization fakeOrg = new Organization("ABC", "123");
        Person p = new Person(fakeOrg, null, "John", "Jacob", "Jingleheimer-Jones", "Jr.",
                LocalDate.of(BIRTH_YEAR, BIRTH_MONTH, BIRTH_DAY), null, "1234556", null, "a@b.c", "marathon", "generic",
                "Male-ish", true, false);
        Provider mccoy = new Provider("Doc", "", "", "", "NCC1701", null, "(1) (111) 2222222");
        List<DeviceType> configuredDevices = new ArrayList<>();
        DeviceType bill = new DeviceType("Bill", "Weasleys", "1", "12345-6", "E");
        configuredDevices.add(bill);
        StreetAddress addy = new StreetAddress(Collections.singletonList("Moon Base"), "Luna City", "THE MOON", "", "");
        p.setFacility(new Facility(fakeOrg, "Nice Place", "YOUGOTHERE", addy, "555-867-5309", "facility@test.com",
                mccoy, bill, configuredDevices));
        String json = _tester.write(p).getJson();
        assertFalse(json.contains("organization"));
        assertFalse(json.contains("facility"));
    }

    private void assertAlexanderHamilton(ObjectContent<Person> ob) {
        Person p = ob.getObject();
        assertNotNull(p);
        assertEquals("Alexander", p.getFirstName());
        assertEquals("Hamilton", p.getLastName());
        assertEquals("white", p.getRace());
        assertNull(p.getFacility());
    }
}
