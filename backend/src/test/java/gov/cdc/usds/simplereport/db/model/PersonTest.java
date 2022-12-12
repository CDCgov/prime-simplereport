package gov.cdc.usds.simplereport.db.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import gov.cdc.usds.simplereport.api.model.TestEventExport;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;
import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.hl7.fhir.r4.model.Identifier;
import org.hl7.fhir.r4.model.Identifier.IdentifierUse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

class PersonTest {

  @Test
  void toFhir_ValidPerson_ReturnsValidPatient() {
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
    ReflectionTestUtils.setField(person, "internalId", UUID.randomUUID());

    var actual = person.toFhir();
    var expectedIdentifier =
        new Identifier().setValue(person.getInternalId().toString()).setUse(IdentifierUse.USUAL);
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
    assertThat(actual.getIdentifier()).hasSize(1);
    assertThat(actual.getIdentifier().get(0).getSystem()).isEqualTo(expectedIdentifier.getSystem());
    assertThat(actual.getIdentifier().get(0).getValue()).isEqualTo(expectedIdentifier.getValue());

    assertThat(actual.getExtension()).hasSize(1);
  }

  @ParameterizedTest
  @MethodSource("extensionArgs")
  void toFhir_NonStandardFhirFields_ReturnsExtension(
      String extensionUrl,
      String systemUrl,
      String personRaceValue,
      String expectedCode,
      String expectedText) {
    var person =
        new Person(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            personRaceValue,
            null,
            null,
            null,
            false,
            false,
            null,
            null);

    var actual = person.toFhir();
    var raceExtension =
        actual.getExtension().stream()
            .filter(
                ext ->
                    "http://ibm.com/fhir/cdm/StructureDefinition/local-race-cd"
                        .equals(ext.getUrl()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("Unable to find extension based on URL"));
    var codeableConcept = actual.castToCodeableConcept(raceExtension.getValue());
    var code = codeableConcept.getCoding();

    assertThat(raceExtension.getUrl())
        .isEqualTo("http://ibm.com/fhir/cdm/StructureDefinition/local-race-cd");
    assertThat(code).hasSize(1);
    assertThat(code.get(0).getSystem()).isEqualTo("http://terminology.hl7.org/CodeSystem/v3-Race");
    assertThat(code.get(0).getCode()).isEqualTo(expectedCode);
    assertThat(codeableConcept.getText()).isEqualTo(expectedText);
  }

  private static Stream<Arguments> raceArgs() {
    return Stream.of(
        arguments("native", TestEventExport.raceMap.get("native"), "native"),
        arguments(null, "UNK", "unknown"),
        arguments("Fishpeople", "UNK", "unknown"));
  }

  @Test
  void toFhir_EmptyPerson_EmptyPatient() {
    var person = new Person();

    var actual = person.toFhir();
    assertThat(actual.getIdentifier()).isEmpty();
    assertThat(actual.getName()).isEmpty();
    assertThat(actual.getTelecom()).isEmpty();
    assertThat(actual.getGender()).isEqualTo(AdministrativeGender.UNKNOWN);
    assertThat(actual.getBirthDate()).isNull();
    assertThat(actual.getAddress()).isEmpty();
    assertThat(actual.getExtension()).hasSize(1);
  }

  @ParameterizedTest
  @MethodSource("genderArgs")
  void toFhir_Gender_SetsGender(String personGender, AdministrativeGender expected) {
    var realPerson =
        new Person(
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            personGender,
            false,
            false,
            null,
            null);

    var actual = realPerson.toFhir();

    assertThat(actual.getGender()).isEqualTo(expected);
  }

  private static Stream<Arguments> genderArgs() {
    return Stream.of(
        arguments("Female", AdministrativeGender.FEMALE),
        arguments("amphibian parts", AdministrativeGender.UNKNOWN));
  }
}
