package gov.cdc.usds.simplereport.db.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;

import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import java.util.List;
import org.junit.jupiter.api.Test;

class PhoneNumberTest {
  PhoneNumber a = new PhoneNumber(PhoneType.MOBILE, "(631) 867-5309");

  @Test
  void equals_sameObject_returnsTrue() {
    assertEquals(a, a);
  }

  @Test
  void equals_isNull_returnsFalse() {
    assertNotEquals(null, a);
  }

  @Test
  void equals_classNotEqual_returnsFalse() {
    assertNotEquals(a, List.of(1));
  }

  @Test
  void equals_typeNotEqual_returnsFalse() {
    assertNotEquals(a, new PhoneNumber(PhoneType.LANDLINE, "(631) 867-5309"));
  }

  @Test
  void equals_numberIsEqual_returnsTrue() {
    assertEquals(a, new PhoneNumber(PhoneType.MOBILE, "(631) 867-5309"));
  }

  @Test
  void equals_numberParseException_returnsFalse() {
    assertNotEquals(a, new PhoneNumber(PhoneType.MOBILE, "invalid"));
  }
}
