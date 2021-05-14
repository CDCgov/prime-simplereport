package gov.cdc.usds.simplereport.db.model;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import java.util.List;
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
}
