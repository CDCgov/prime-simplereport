package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToAdministrativeGender;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToContactPoint;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToDate;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToHumanName;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToIdentifier;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.phoneNumberToContactPoint;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.from;

import java.util.List;
import java.util.stream.Collectors;
import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointUse;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.hl7.fhir.r4.model.Identifier.IdentifierUse;
import org.hl7.fhir.r4.model.PrimitiveType;
import org.hl7.fhir.r4.model.StringType;
import org.junit.jupiter.api.Test;

public class FhirConverterTest {
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
  void string_convertToIdentifier() {
    var actual = convertToIdentifier("someId");

    assertThat(actual.getUse()).isEqualTo(IdentifierUse.USUAL);
    assertThat(actual.getValue()).isEqualTo("someId");
  }

  @Test
  void null_convertToIdentifier() {
    assertThat(convertToIdentifier(null)).isNull();
  }
  // note: getGiven and getSuffix return array lists of StringType which are difficult to compare
  public static void assertStringTypeListEqualsStringList(
      List<String> actual, List<StringType> expected) {
    var e = expected.stream().map(StringType::toString).collect(Collectors.toList());
    assertThat(actual).isEqualTo(e);
  }

  @Test
  void mobileNumber_phoneNumberToContactPoint() {
    var actual = phoneNumberToContactPoint(ContactPoint.ContactPointUse.MOBILE, "2485551234");

    assertThat(actual)
        .returns(ContactPointSystem.PHONE, from(ContactPoint::getSystem))
        .returns("(248) 555 1234", from(ContactPoint::getValue))
        .returns(
            ContactPointUse.MOBILE.toCode(),
            from(ContactPoint::getUse).andThen(ContactPoint.ContactPointUse::toCode));
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
}
