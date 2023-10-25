package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.utils.AddressUtils.isAddressUnknown;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.db.repository.BaseRepositoryTest;
import org.junit.jupiter.api.Test;

class AddressUtilsTest extends BaseRepositoryTest {

  @Test
  void validKnownAddress_returnsFalse() {
    String state = "NJ";
    String zip = "55116";
    String street = "123 Blue Street";
    assertFalse(isAddressUnknown(state, zip, street));
  }

  @Test
  void partialKnownAddress_returnsFalse() {
    String state = "CA";
    String zip = "00000";
    String street = "";
    assertFalse(isAddressUnknown(state, zip, street));
  }

  @Test
  void nullAddress_returnsFalse() {
    assertFalse(isAddressUnknown(null, null, null));
  }

  @Test
  void validUnknownAddress_returnsTrue() {
    String state = "NA";
    String zip = "00000";
    String street = "** Unknown / Not Given **";
    assertTrue(isAddressUnknown(state, zip, street));
  }

  @Test
  void validUnknownAddressWithWhiteSpaceCaseInsensitive_returnsTrue() {
    String state = "n a ";
    String zip = "  0 0000 ";
    String street = " * * unKnown/ Not  given**  ";
    assertTrue(isAddressUnknown(state, zip, street));
  }
}
