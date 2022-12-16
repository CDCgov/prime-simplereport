package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToAddress;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToAdministrativeGender;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToContactPoint;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToDate;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToHumanName;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToIdentifier;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToRaceExtension;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.phoneNumberToContactPoint;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.from;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;
import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointUse;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.hl7.fhir.r4.model.Identifier.IdentifierUse;
import org.hl7.fhir.r4.model.PrimitiveType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

public class FhirConverterTest {
  public static final String unknownSystem = "http://terminology.hl7.org/CodeSystem/v3-NullFlavor";
  public static final String raceCodeSystem = "http://terminology.hl7.org/CodeSystem/v3-Race";

  @Test
  void allFields_convertToHumanName() {
    var actual = convertToHumanName("first", "middle", "last", "jr");
    assertThat(actual.getGiven().stream().map(PrimitiveType::getValue))
        .containsExactly("first", "middle");
    assertThat(actual.getFamily()).isEqualTo("last");
    assertThat(actual.getSuffix().stream().map(PrimitiveType::getValue)).containsOnly("jr");
  }

  @Test
  void noMiddleName_convertToHumanName() {
    var actual = convertToHumanName("first", null, "last", "jr");

    assertThat(actual.getGiven().stream().map(PrimitiveType::getValue)).containsExactly("first");
  }

  @Test
  void emptyPersonName_convertToHumanName() {
    var actual = convertToHumanName(null, null, null, null);

    assertThat(actual.getGiven()).isEmpty();
    assertThat(actual.getFamily()).isNull();
    assertThat(actual.getSuffix()).isEmpty();
  }

  @Test
  void null_convertToHumanName() {
    assertThat(convertToHumanName(null)).isNull();
  }

  @Test
  void uuid_convertToIdentifier() {
    var uuid = UUID.randomUUID();
    var actual = convertToIdentifier(uuid);

    assertThat(actual.getUse()).isEqualTo(IdentifierUse.USUAL);
    assertThat(actual.getValue()).isEqualTo(uuid.toString());
  }

  @Test
  void string_convertToIdentifier() {
    var actual = convertToIdentifier("someId");

    assertThat(actual.getUse()).isEqualTo(IdentifierUse.USUAL);
    assertThat(actual.getValue()).isEqualTo("someId");
  }

  @Test
  void null_convertToIdentifier() {
    assertThat(convertToIdentifier((String) null)).isNull();
    assertThat(convertToIdentifier((UUID) null)).isNull();
  }

  @Test
  void phoneNumberModel_phoneNumberToContactPoint() {
    var phoneNumber = new PhoneNumber(PhoneType.LANDLINE, "2485551234");

    var actual = phoneNumberToContactPoint(phoneNumber);

    assertThat(actual.getSystem()).isEqualTo(ContactPointSystem.PHONE);
    assertThat(actual.getUse().toCode()).isEqualTo(ContactPointUse.HOME.toCode());
    assertThat(actual.getValue()).isEqualTo("(248) 555 1234");
  }

  @Test
  void mobileNumber_phoneNumberToContactPoint() {
    var actual = phoneNumberToContactPoint(ContactPoint.ContactPointUse.MOBILE, "2485551234");

    assertThat(actual.getSystem()).isEqualTo(ContactPointSystem.PHONE);
    assertThat(actual.getUse().toCode()).isEqualTo(ContactPointUse.MOBILE.toCode());
    assertThat(actual.getValue()).isEqualTo("(248) 555 1234");
  }

  @Test
  void invalidNumber_phoneNumberToContactPoint() {
    var actual = phoneNumberToContactPoint(ContactPoint.ContactPointUse.HOME, "+0333");

    assertThat(actual)
        .returns(ContactPointSystem.PHONE, from(ContactPoint::getSystem))
        .returns("+0333", from(ContactPoint::getValue))
        .returns(
            ContactPointUse.HOME.toCode(),
            from(ContactPoint::getUse).andThen(ContactPoint.ContactPointUse::toCode));
  }

  @Test
  void null_phoneNumberToContactPoint() {
    assertThat(phoneNumberToContactPoint(null)).isNull();
  }

  @Test
  void email_convertToContactPoint() {
    var actual = convertToContactPoint(null, ContactPointSystem.EMAIL, "example@example.com");
    assertThat(actual.getUse()).isNull();
    assertThat(actual.getSystem()).isEqualTo(ContactPointSystem.EMAIL);
    assertThat(actual.getValue()).isEqualTo("example@example.com");
  }

  @Test
  void null_convertToContactPoint() {
    assertThat(convertToContactPoint(ContactPointUse.HOME, ContactPointSystem.PHONE, null))
        .isNull();
  }

  @Test
  void f_convertToAdministrativeGender_returnsFemale() {
    assertThat(convertToAdministrativeGender("f")).isEqualTo(AdministrativeGender.FEMALE);
  }

  @Test
  void female_convertToAdministrativeGender_returnsFemale() {
    assertThat(convertToAdministrativeGender("FEMALE")).isEqualTo(AdministrativeGender.FEMALE);
  }

  @Test
  void m_convertToAdministrativeGender_returnsMale() {
    assertThat(convertToAdministrativeGender("M")).isEqualTo(AdministrativeGender.MALE);
  }

  @Test
  void male_convertToAdministrativeGender_returnsMale() {
    assertThat(convertToAdministrativeGender("MALE")).isEqualTo(AdministrativeGender.MALE);
  }

  @Test
  void unknownGender_convertToAdministrativeGender_returnsUnknown() {
    assertThat(convertToAdministrativeGender("fishperson")).isEqualTo(AdministrativeGender.UNKNOWN);
  }

  @Test
  void null_convertToDate() {
    assertThat(convertToDate(null)).isNull();
  }

  @Test
  void address_convertToAddress() {
    var actual =
        convertToAddress(List.of("1234 Main", "Apartment #1"), "MyCity", "MyCounty", "PA", "15025");
    assertThat(actual.getLine().stream().map(PrimitiveType::getValue))
        .containsExactly("1234 Main", "Apartment #1");
    assertThat(actual.getCity()).isEqualTo("MyCity");
    assertThat(actual.getDistrict()).isEqualTo("MyCounty");
    assertThat(actual.getState()).isEqualTo("PA");
    assertThat(actual.getPostalCode()).isEqualTo("15025");
  }

  @Test
  void emptyAddress_convertToAddress() {
    var actual = convertToAddress(null, null, null, null, null);
    assertThat(actual.getLine()).isEmpty();
    assertThat(actual.getCity()).isNull();
    assertThat(actual.getDistrict()).isNull();
    assertThat(actual.getState()).isNull();
    assertThat(actual.getPostalCode()).isNull();
  }

  @Test
  void null_convertToAddress() {
    assertThat(convertToAddress(null)).isNull();
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
        arguments("refused", unknownSystem, "ASKU", "refused"),
        arguments("Fishpeople", unknownSystem, "UNK", "unknown"));
  }

  @Test
  void null_convertToRaceExtension() {
    assertThat(convertToRaceExtension(null)).isNull();
  }
}
