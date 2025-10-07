package gov.cdc.usds.simplereport.db.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

import gov.cdc.usds.simplereport.api.BaseNonSpringBootTestConfiguration;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResultDeliveryPreference;
import java.io.IOException;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.boot.test.json.JsonContent;
import org.springframework.boot.test.json.ObjectContent;

@JsonTest
class PersonSerializationTest extends BaseNonSpringBootTestConfiguration {

  private static final int BIRTH_YEAR = 2000;
  private static final int BIRTH_MONTH = 3;
  private static final int BIRTH_DAY = 31;

  @Autowired private JacksonTester<Person> _tester;

  @Test
  void deserialize_stringRace_raceFound() throws IOException {
    ObjectContent<Person> ob = _tester.read("/deserialization/race-scalar.json");
    assertAlexanderHamilton(ob);
  }

  @Test
  void deserialize_arrayRace_raceFound() throws IOException {
    ObjectContent<Person> ob = _tester.read("/deserialization/race-array.json");
    assertAlexanderHamilton(ob);
  }

  @Test
  void deserialize_withFacility_raceFoundNoFacility() throws IOException {
    ObjectContent<Person> ob = _tester.read("/deserialization/with-facility.json");
    assertAlexanderHamilton(ob);
  }

  @Test
  void serialize_withoutFacility_valuesStored() throws IOException {
    Organization fakeOrg = new Organization("ABC", "university", "123", true);
    Person p = makeSerializablePerson(fakeOrg);
    JsonContent<Person> serialized = _tester.write(p);
    assertThat(serialized).extractingJsonPathStringValue("firstName").isEqualTo("John");
    assertThat(serialized)
        .extractingJsonPathStringValue("lastName")
        .isEqualTo("Jingleheimer-Jones");
    assertThat(serialized).extractingJsonPathStringValue("middleName").isEqualTo("Jacob");
    assertThat(serialized).extractingJsonPathStringValue("suffix").isEqualTo("Jr.");
    assertThat(serialized)
        .extractingJsonPathStringValue("birthDate")
        .isEqualTo(String.format("%4d-%02d-%02d", BIRTH_YEAR, BIRTH_MONTH, BIRTH_DAY));
    assertThat(serialized)
        .extractingJsonPathArrayValue("address.street")
        .hasSize(3)
        .isEqualTo(List.of("1600 Pennsylvania Avenue", "Right Side Door", "Down the Steps"));
    assertThat(serialized).extractingJsonPathMapValue("facility").isNull();
    assertThat(serialized).extractingJsonPathMapValue("organization").isNull();
  }

  @Test
  void serialize_withFacility_noOrgOrFacility() throws IOException {
    Organization fakeOrg = new Organization("ABC", "university", "123", true);
    Person p = makeSerializablePerson(fakeOrg);
    Provider mccoy = new Provider("Doc", "", "", "", "NCC1701", null, "(1) (111) 2222222");
    DeviceType device = new DeviceType("Bill", "Weasleys", "1", 15);
    SpecimenType specimenType = new SpecimenType();
    StreetAddress addy =
        new StreetAddress(Collections.singletonList("Moon Base"), "Luna City", "THE MOON", "", "");
    p.setFacility(
        new Facility(
            FacilityBuilder.builder()
                .org(fakeOrg)
                .facilityName("Nice Place")
                .cliaNumber("YOUGOTHERE")
                .facilityAddress(addy)
                .phone("555-867-5309")
                .email("facility@test.com")
                .orderingProvider(mccoy)
                .defaultDeviceType(device)
                .defaultSpecimenType(specimenType)
                .configuredDevices(List.of(device))
                .build()));
    JsonContent<Person> serialized = _tester.write(p);
    assertThat(serialized)
        .extractingJsonPathStringValue("lastName")
        .isEqualTo("Jingleheimer-Jones");
    assertThat(serialized).extractingJsonPathMapValue("facility").isNull();
    assertThat(serialized).extractingJsonPathMapValue("organization").isNull();
  }

  private Person makeSerializablePerson(Organization fakeOrg) {
    StreetAddress addy =
        new StreetAddress(
            List.of("1600 Pennsylvania Avenue", "Right Side Door", "Down the Steps"),
            "Washington",
            "DC",
            "20001",
            "DC");
    Person p =
        new Person(
            fakeOrg,
            null,
            "John",
            "Jacob",
            "Jingleheimer-Jones",
            "Jr.",
            LocalDate.of(BIRTH_YEAR, BIRTH_MONTH, BIRTH_DAY),
            addy,
            "USA",
            null,
            List.of("a@b.c"),
            "marathon",
            "generic",
            Arrays.asList("123"),
            "Male-ish",
            true,
            false,
            "English",
            TestResultDeliveryPreference.NONE);
    PhoneNumber pn = new PhoneNumber(PhoneType.LANDLINE, "5555555555");
    p.setPrimaryPhone(pn);
    return p;
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
