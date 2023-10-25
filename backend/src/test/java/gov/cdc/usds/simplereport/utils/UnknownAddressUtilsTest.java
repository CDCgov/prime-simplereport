package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.utils.UnknownAddressUtils.isAddressUnknown;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import gov.cdc.usds.simplereport.db.repository.BaseRepositoryTest;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

class UnknownAddressUtilsTest extends BaseRepositoryTest {
  @ParameterizedTest
  @CsvSource({
    ",,,",
    "MN, 55407, 123 Blue Street",
    "NA, 55407, 123 Blue Street",
    "NA, 00000, 123 Blue Street",
    "MN, 00000, 123 Blue Street",
    "MN, 00000, ** Unknown / not given",
    "NA, 55407, ** Unknown / not given",
  })
  void nonUnknownAddress_returnsFalse(String state, String zip, String street) {
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
