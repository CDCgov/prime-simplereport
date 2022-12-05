package gov.cdc.usds.simplereport.db.model;

import static org.assertj.core.api.Assertions.assertThat;

import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.hl7.fhir.r4.model.Identifier;
import org.hl7.fhir.r4.model.Identifier.IdentifierUse;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

class PersonTest {

  @Test
  void validPerson_toFhir() {
    var birthDate = LocalDate.now();
    var person =
        Mockito.spy(
            new Person(
                null,
                null,
                null,
                "Austin",
                "Wingate",
                "Curtis",
                "Jr",
                birthDate,
                new StreetAddress(
                    List.of("501 Virginia St E", "#1"), "Charleston", "WV", "25301", "Kanawha"),
                "USA",
                null,
                List.of("email1", "email2"),
                "black",
                "not hispanic or latino",
                List.of(),
                "Male",
                false,
                false,
                "English",
                null));
    ReflectionTestUtils.setField(
        person,
        "phoneNumbers",
        List.of(
            new PhoneNumber(PhoneType.MOBILE, "304-555-1234"),
            new PhoneNumber(PhoneType.LANDLINE, "3045551233")));

    var actual = person.toFhir();
    assertThat(actual.getName()).hasSize(1);
    assertThat(actual.getTelecom()).hasSize(4);
    assertThat(actual.getAddress()).hasSize(1);

    assertThat(actual.getTelecom().stream().map(ContactPoint::getValue))
        .containsAll(List.of("(304) 555 1234", "(304) 555 1233", "email1", "email2"));
    actual
        .getTelecom()
        .forEach(
            telecom -> {
              if (telecom.getValue().contains("email")) {
                assertThat(telecom.getSystem()).isEqualTo(ContactPointSystem.EMAIL);
              }
            });

    assertThat(actual.getGender()).isEqualTo(AdministrativeGender.MALE);
    assertThat(actual.getBirthDate())
        .isEqualTo(Date.from(birthDate.atStartOfDay(ZoneId.systemDefault()).toInstant()));
  }

  @Test
  void person_toFhir_includesIdentifier() {
    var person = new Person();
    var expectedIdentifier =
        new Identifier().setValue(person.getInternalId().toString()).setUse(IdentifierUse.USUAL);

    var actual = person.toFhir();
    assertThat(actual.getIdentifier()).isEqualTo(List.of(expectedIdentifier));
  }

  @Test
  void emptyPerson_toFhir() {
    var person = new Person();

    var actual = person.toFhir();
    assertThat(actual.getName()).isEmpty();
    assertThat(actual.getTelecom()).isEmpty();
    assertThat(actual.getAddress()).isEmpty();
    assertThat(actual.getGender()).isNull();
    assertThat(actual.getBirthDate()).isNull();
  }

  @Test
  void femalePerson_toFhir() {
    var realPerson =
        new Person(
            null, null, null, null, null, null, null, null, null, null, null, null, null, null,
            null, "Female", false, false, null, null);

    var actual = realPerson.toFhir();

    assertThat(actual.getGender()).isEqualTo(AdministrativeGender.FEMALE);
  }

  @Test
  void unknownGenderPerson_toFhir() {
    var realPerson =
        new Person(
            null, null, null, null, null, null, null, null, null, null, null, null, null, null,
            null, "UNK", false, false, null, null);

    var actual = realPerson.toFhir();

    assertThat(actual.getGender()).isEqualTo(AdministrativeGender.UNKNOWN);
  }
}
