package gov.cdc.usds.simplereport.db.model;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.from;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import java.util.List;
import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem;
import org.hl7.fhir.r4.model.codesystems.ContactPointUse;
import org.junit.jupiter.api.Test;

class PhoneNumberTest {
  PhoneNumber a = new PhoneNumber(PhoneType.MOBILE, "(631) 867-5309");

  @Test
  void equals_sameObject_returnsTrue() {
    assertTrue(a.equals(a));
  }

  @Test
  void equals_isNull_returnsFalse() {
    assertFalse(a.equals(null));
  }

  @Test
  void equals_classNotEqual_returnsFalse() {
    assertFalse(a.equals(List.of(1)));
  }

  @Test
  void equals_typeNotEqual_returnsFalse() {
    assertFalse(a.equals(new PhoneNumber(PhoneType.LANDLINE, "(631) 867-5309")));
  }

  @Test
  void equals_numberIsEqual_returnsTrue() {
    assertTrue(a.equals(new PhoneNumber(PhoneType.MOBILE, "(631) 867-5309")));
  }

  @Test
  void equals_numberParseException_returnsFalse() {
    assertFalse(a.equals(new PhoneNumber(PhoneType.MOBILE, "invalid")));
  }

  @Test
  void validMobile_toFhir() {
    var phoneNumber = new PhoneNumber(PhoneType.MOBILE, "2485551234");

    var actual = phoneNumber.toFhir();

    assertThat(actual)
        .returns(ContactPointSystem.PHONE, from(ContactPoint::getSystem))
        .returns("(248) 555 1234", from(ContactPoint::getValue))
        .returns(
            ContactPointUse.MOBILE.toCode(),
            from(ContactPoint::getUse).andThen(ContactPoint.ContactPointUse::toCode));
  }

  @Test
  void validHome_toFhir() {
    var phoneNumber = new PhoneNumber(PhoneType.LANDLINE, "2485551234");

    var actual = phoneNumber.toFhir();

    assertThat(actual)
        .returns(ContactPointSystem.PHONE, from(ContactPoint::getSystem))
        .returns("(248) 555 1234", from(ContactPoint::getValue))
        .returns(
            ContactPointUse.HOME.toCode(),
            from(ContactPoint::getUse).andThen(ContactPoint.ContactPointUse::toCode));
  }

  @Test
  void invalidNumber_toFhir_doesNotFormatNumber() {
    var phoneNumber = new PhoneNumber(PhoneType.LANDLINE, "+0333");

    var actual = phoneNumber.toFhir();

    assertThat(actual)
        .returns(ContactPointSystem.PHONE, from(ContactPoint::getSystem))
        .returns("+0333", from(ContactPoint::getValue))
        .returns(
            ContactPointUse.HOME.toCode(),
            from(ContactPoint::getUse).andThen(ContactPoint.ContactPointUse::toCode));
  }
}
