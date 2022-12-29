package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToAddress;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToAdministrativeGender;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToContactPoint;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToDate;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToEthnicityExtension;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToHumanName;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToIdentifier;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToObservation;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToRaceExtension;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToTribalAffiliationExtension;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.emailToContactPoint;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.phoneNumberToContactPoint;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.from;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;
import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointUse;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.hl7.fhir.r4.model.Identifier.IdentifierUse;
import org.hl7.fhir.r4.model.PrimitiveType;
import org.hl7.fhir.r4.model.codesystems.ObservationStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;

class FhirConverterTest {
  private static final String unknownSystem = "http://terminology.hl7.org/CodeSystem/v3-NullFlavor";
  private static final String raceCodeSystem = "http://terminology.hl7.org/CodeSystem/v3-Race";
  private static final String ethnicitySystem = "urn:oid:2.16.840.1.113883.6.238";
  private static final String tribalSystemUrl =
      "http://terminology.hl7.org/CodeSystem/v3-TribalEntityUS";

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
  void phoneNumberList_phoneNumberToContactPoint() {
    var phoneNumber = new PhoneNumber(PhoneType.LANDLINE, "2485551234");
    var phoneNumber2 = new PhoneNumber(PhoneType.LANDLINE, "2485551233");

    var actual = phoneNumberToContactPoint(List.of(phoneNumber, phoneNumber2));
    assertThat(actual).hasSize(2);

    assertThat(actual.stream().map(ContactPoint::getValue))
        .containsOnly("(248) 555 1234", "(248) 555 1233");
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
    assertThat(phoneNumberToContactPoint((PhoneNumber) null)).isNull();
    assertThat(phoneNumberToContactPoint((List<PhoneNumber>) null)).isEmpty();
  }

  @Test
  void null_emailToContactPoint() {
    assertThat(emailToContactPoint((String) null)).isNull();
    assertThat(emailToContactPoint((List<String>) null)).isEmpty();
  }

  @Test
  void string_emailToContactPoint() {
    var actual = emailToContactPoint("example@example.com");
    assertThat(actual.getUse()).isNull();
    assertThat(actual.getSystem()).isEqualTo(ContactPointSystem.EMAIL);
    assertThat(actual.getValue()).isEqualTo("example@example.com");
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

  @ParameterizedTest
  @MethodSource("genderArgs")
  void test_convertToAdministrativeGender(String personGender, AdministrativeGender expected) {
    var actual = convertToAdministrativeGender(personGender);

    assertThat(actual).isEqualTo(expected);
  }

  private static Stream<Arguments> genderArgs() {
    return Stream.of(
        arguments("f", AdministrativeGender.FEMALE),
        arguments("Female", AdministrativeGender.FEMALE),
        arguments("MALE", AdministrativeGender.MALE),
        arguments("M", AdministrativeGender.MALE),
        arguments(null, AdministrativeGender.UNKNOWN),
        arguments("fishperson", AdministrativeGender.UNKNOWN));
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
  void test_convertToRaceExtension(
      String personRaceValue, String codeSystem, String expectedCode, String expectedText) {
    var actual = convertToRaceExtension(personRaceValue);
    assert actual != null;
    var codeableConcept = actual.castToCodeableConcept(actual.getValue());
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

  @ParameterizedTest
  @MethodSource("ethnicityArgs")
  void test_convertToEthnicityExtension(
      String ethnicity, String ombSystem, String raceCode, String ethnicityDisplay) {
    var actual = FhirConverter.convertToEthnicityExtension(ethnicity);
    assert actual != null;
    var ombExtension = actual.getExtensionByUrl("ombCategory");
    var textExtension = actual.getExtensionByUrl("text");
    var ombCoding = actual.castToCoding(ombExtension.getValue());
    var textValueString = actual.castToString(textExtension.getValue());

    assertThat(actual.getExtension()).hasSize(2);
    assertThat(ombCoding.getSystem()).isEqualTo(ombSystem);
    assertThat(ombCoding.getCode()).isEqualTo(raceCode);
    assertThat(ombCoding.getDisplay()).isEqualTo(ethnicityDisplay);
    assertThat(textValueString.getValue()).isEqualTo(ethnicityDisplay);
  }

  private static Stream<Arguments> ethnicityArgs() {
    return Stream.of(
        arguments("hispanic", ethnicitySystem, "2135-2", "Hispanic or Latino"),
        arguments("not_hispanic", ethnicitySystem, "2186-5", "Not Hispanic or Latino"),
        arguments("refused", unknownSystem, "ASKU", "asked but unknown"),
        arguments("shark", unknownSystem, "UNK", "unknown"));
  }

  @Test
  void null_convertToEthnicityExtension() {
    assertThat(convertToEthnicityExtension(null)).isNull();
  }

  @Test
  void string_convertToTribalAffiliation() {
    var actual = convertToTribalAffiliationExtension("1");
    assert actual != null;
    var tribalAffiliationExtension = actual.getExtensionByUrl("tribalAffiliation");
    var tribalCodeableConcept = actual.castToCodeableConcept(tribalAffiliationExtension.getValue());
    var tribalCoding = tribalCodeableConcept.getCoding().get(0);

    assertThat(actual.getExtension()).hasSize(1);
    assertThat(tribalCoding.getSystem()).isEqualTo(tribalSystemUrl);
    assertThat(tribalCoding.getCode()).isEqualTo("1");
    assertThat(tribalCoding.getDisplay())
        .isEqualTo("Absentee-Shawnee Tribe of Indians of Oklahoma");
  }

  @Test
  void emptyList_convertToTribalAffiliation() {
    var actual = convertToTribalAffiliationExtension(Collections.emptyList());
    assertThat(actual).isNull();
  }

  @Test
  void null_convertToTribalAffiliation() {
    assertThat(convertToTribalAffiliationExtension((String) null)).isNull();
    assertThat(convertToTribalAffiliationExtension((List<String>) null)).isNull();
  }

  @Test
  void string_convertToObservation() {
    var actual =
        convertToObservation("diseaseCode", "diseaseName", "resultCode", false, null, "id-123");

    assertThat(actual.getId()).isEqualTo("id-123");
    assertThat(actual.getStatus().getDisplay()).isEqualTo(ObservationStatus.FINAL.getDisplay());
    assertThat(actual.getCode().getText()).isEqualTo("diseaseName");
    assertThat(actual.getCode().getCoding()).hasSize(1);
    assertThat(actual.getCode().getCodingFirstRep().getSystem()).isEqualTo("http://loinc.org");
    assertThat(actual.getCode().getCodingFirstRep().getCode()).isEqualTo("diseaseCode");
    assertThat(actual.getValueCodeableConcept().getCoding()).hasSize(1);
    assertThat(actual.getValueCodeableConcept().getCodingFirstRep().getSystem())
        .isEqualTo("http://snomed.info/sct");
    assertThat(actual.getValueCodeableConcept().getCodingFirstRep().getCode())
        .isEqualTo("resultCode");
    assertThat(actual.getNote()).isEmpty();
  }

  @Test
  void result_convertToObservation() {
    var result =
        new Result(null, null, new SupportedDisease("covid-19", "96741-4"), TestResult.POSITIVE);

    var actual = convertToObservation(result, false, null);

    assertThat(actual.getStatus().getDisplay()).isEqualTo(ObservationStatus.FINAL.getDisplay());
    assertThat(actual.getCode().getText()).isEqualTo("covid-19");
    assertThat(actual.getCode().getCoding()).hasSize(1);
    assertThat(actual.getCode().getCodingFirstRep().getSystem()).isEqualTo("http://loinc.org");
    assertThat(actual.getCode().getCodingFirstRep().getCode()).isEqualTo("96741-4");
    assertThat(actual.getValueCodeableConcept().getCoding()).hasSize(1);
    assertThat(actual.getValueCodeableConcept().getCodingFirstRep().getSystem())
        .isEqualTo("http://snomed.info/sct");
    assertThat(actual.getValueCodeableConcept().getCodingFirstRep().getCode())
        .isEqualTo("260373001");
    assertThat(actual.getNote()).isEmpty();
  }

  @Test
  void correctedResult_convertToObservation() {
    var result =
        new Result(null, null, new SupportedDisease("covid-19", "96741-4"), TestResult.POSITIVE);

    var actual = convertToObservation(result, true, "Oopsy Daisy");

    assertThat(actual.getStatus().getDisplay()).isEqualTo(ObservationStatus.CORRECTED.getDisplay());
    assertThat(actual.getNote()).hasSize(1);
    assertThat(actual.getNoteFirstRep().getText()).isEqualTo("Corrected Result: Oopsy Daisy");
  }

  @Test
  void correctedResultNoReason_convertToObservation() {
    var result =
        new Result(null, null, new SupportedDisease("covid-19", "96741-4"), TestResult.POSITIVE);

    var actual = convertToObservation(result, true, null);

    assertThat(actual.getStatus().getDisplay()).isEqualTo(ObservationStatus.CORRECTED.getDisplay());
    assertThat(actual.getNote()).hasSize(1);
    assertThat(actual.getNoteFirstRep().getText()).isEqualTo("Corrected Result");
  }

  @Test
  void nullResult_convertToObservation() {
    var actual = convertToObservation(null, false, null);

    assertThat(actual).isNull();
  }

  @Test
  void nullDisease_convertToObservation() {
    var actual =
        convertToObservation(new Result(null, null, null, TestResult.POSITIVE), false, null);

    assertThat(actual).isNull();
  }
}
