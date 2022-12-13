package gov.cdc.usds.simplereport.db.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mockito;
import org.springframework.test.util.ReflectionTestUtils;

class PersonTest {

  public static final String ethnicitySystem = "urn:oid:2.16.840.1.113883.6.238";
  public static final String unknownSystem = "http://terminology.hl7.org/CodeSystem/v3-NullFlavor";
  public static final String raceCodeSystem = "http://terminology.hl7.org/CodeSystem/v3-Race";

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
                "hispanic",
                List.of("123"),
                "Male",
                false,
                false,
                "English",
                null));
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    ReflectionTestUtils.setField(
        person,
        "phoneNumbers",
        List.of(
            new PhoneNumber(PhoneType.MOBILE, "304-555-1234"),
            new PhoneNumber(PhoneType.LANDLINE, "3045551233")));
    ReflectionTestUtils.setField(person, "internalId", UUID.fromString(internalId));

    var actual = person.toFhir();

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    String actualSerialized = parser.encodeResourceToString(actual);
    String expectedSerialized =
        "{\"resourceType\":\"Patient\",\"extension\":[{\"url\":\"http://ibm.com/fhir/cdm/StructureDefinition/local-race-cd\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-Race\",\"code\":\"2054-5\"}],\"text\":\"black\"}},{\"url\":\"http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity\",\"extension\":[{\"url\":\"ombCategory\",\"valueCoding\":{\"system\":\"urn:oid:2.16.840.1.113883.6.238\",\"code\":\"2135-2\",\"display\":\"Hispanic or Latino\"}},{\"url\":\"text\",\"valueString\":\"Hispanic or Latino\"}]},{\"url\":\"http://hl7.org/fhir/us/core/StructureDefinition/us-core-tribal-affiliation\",\"extension\":[{\"url\":\"tribalAffiliation\",\"valueCodeableConcept\":{\"coding\":[{\"system\":\"http://terminology.hl7.org/CodeSystem/v3-TribalEntityUS\",\"code\":\"123\",\"display\":\"Keweenaw Bay Indian Community, Michigan\"}],\"text\":\"Keweenaw Bay Indian Community, Michigan\"}}]}],\"identifier\":[{\"use\":\"usual\",\"value\":\"3c9c7370-e2e3-49ad-bb7a-f6005f41cf29\"}],\"name\":[{\"family\":\"Curtis\",\"given\":[\"Austin\",\"Wingate\"],\"suffix\":[\"Jr\"]}],\"telecom\":[{\"system\":\"phone\",\"value\":\"(304) 555 1234\",\"use\":\"mobile\"},{\"system\":\"phone\",\"value\":\"(304) 555 1233\",\"use\":\"home\"},{\"system\":\"email\",\"value\":\"email1\"},{\"system\":\"email\",\"value\":\"email2\"}],\"gender\":\"male\",\"birthDate\":\""
            + birthDate
            + "\",\"address\":[{\"line\":[\"501 Virginia St E\",\"#1\"],\"city\":\"Charleston\",\"district\":\"Kanawha\",\"state\":\"WV\",\"postalCode\":\"25301\"}]}";
    assertThat(actualSerialized).isEqualTo(expectedSerialized);
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
  @MethodSource("raceArgs")
  void toFhir_PersonRace_ReturnsRaceExtension(
      String personRaceValue, String codeSystem, String expectedCode, String expectedText) {
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
        actual.getExtensionByUrl("http://ibm.com/fhir/cdm/StructureDefinition/local-race-cd");
    var codeableConcept = actual.castToCodeableConcept(raceExtension.getValue());
    var code = codeableConcept.getCoding();

    assertThat(code).hasSize(1);
    assertThat(code.get(0).getSystem()).isEqualTo(codeSystem);
    assertThat(code.get(0).getCode()).isEqualTo(expectedCode);
    assertThat(codeableConcept.getText()).isEqualTo(expectedText);
  }

  private static Stream<Arguments> raceArgs() {
    return Stream.of(
        arguments("native", raceCodeSystem, "1002-5", "native"),
        arguments(null, unknownSystem, "UNK", "unknown"),
        arguments("refused", unknownSystem, "ASKU", "refused"),
        arguments("Fishpeople", unknownSystem, "UNK", "unknown"));
  }

  @ParameterizedTest
  @MethodSource("ethnicityArgs")
  void toFhir_PersonEthnicity_ReturnsEthnicityExtension(
      String ethnicity, String ombSystem, String raceCode, String raceDisplay) {
    var person =
        new Person(
            null, null, null, null, null, null, null, null, null, null, null, null, null, ethnicity,
            null, null, false, false, null, null);

    var actual = person.toFhir();
    var raceExtension =
        actual.getExtensionByUrl(
            "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity");
    var ombExtension = raceExtension.getExtensionByUrl("ombCategory");
    var textExtension = raceExtension.getExtensionByUrl("text");

    var ombCoding = actual.castToCoding(ombExtension.getValue());
    var textValueString = actual.castToString(textExtension.getValue());

    assertThat(raceExtension.getExtension()).hasSize(2);
    assertThat(ombCoding.getSystem()).isEqualTo(ombSystem);
    assertThat(ombCoding.getCode()).isEqualTo(raceCode);
    assertThat(ombCoding.getDisplay()).isEqualTo(raceDisplay);

    assertThat(textValueString.getValue()).isEqualTo(raceDisplay);
  }

  private static Stream<Arguments> ethnicityArgs() {
    return Stream.of(
        arguments("hispanic", ethnicitySystem, "2135-2", "Hispanic or Latino"),
        arguments("not_hispanic", ethnicitySystem, "2186-5", "Not Hispanic or Latino"),
        arguments("refused", unknownSystem, "ASKU", "asked but unknown"),
        arguments("shark", unknownSystem, "UNK", "unknown"));
  }

  @Test
  void toFhir_PersonTribalAffiliation_ReturnsTribalAffiliationExtension() {
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
            null,
            null,
            List.of("1"),
            null,
            false,
            false,
            null,
            null);

    var actual = person.toFhir();
    var coreExtension =
        actual.getExtensionByUrl(
            "http://hl7.org/fhir/us/core/StructureDefinition/us-core-tribal-affiliation");
    var tribalAffiliationExtension = coreExtension.getExtensionByUrl("tribalAffiliation");
    var tribalCodeableConcept = actual.castToCodeableConcept(tribalAffiliationExtension.getValue());
    var tribalCoding = tribalCodeableConcept.getCoding().get(0);

    assertThat(coreExtension.getExtension()).hasSize(1);
    assertThat(tribalCoding.getSystem())
        .isEqualTo("http://terminology.hl7.org/CodeSystem/v3-TribalEntityUS");
    assertThat(tribalCoding.getCode()).isEqualTo("1");
    assertThat(tribalCoding.getDisplay())
        .isEqualTo("Absentee-Shawnee Tribe of Indians of Oklahoma");
  }

  @Test
  void toFhir_PersonTribalAffiliation_ReturnsNoExtension() {
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
            null,
            null,
            List.of("NotATribeCode"),
            null,
            false,
            false,
            null,
            null);

    var actual = person.toFhir();
    var coreExtension =
        actual.getExtensionByUrl(
            "http://hl7.org/fhir/us/core/StructureDefinition/us-core-tribal-affiliation");

    assertThat(coreExtension).isNull();
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
