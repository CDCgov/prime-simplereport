package gov.cdc.usds.simplereport.db.model.auxiliary;

import static gov.cdc.usds.simplereport.db.model.auxiliary.PersonNameTest.assertStringTypeListEqualsStringList;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;
import org.junit.jupiter.api.Test;

class StreetAddressTest {

  @Test
  void fullAddress_toFhir() {
    var streetAddress =
        new StreetAddress(List.of("1 Main Street", "Unit 1"), "city", "OK", "12345", "county");

    var actual = streetAddress.toFhir();

    assertStringTypeListEqualsStringList(streetAddress.getStreet(), actual.getLine());
    assertEquals(streetAddress.getCity(), actual.getCity());
    assertEquals(streetAddress.getCounty(), actual.getDistrict());
    assertEquals(streetAddress.getState(), actual.getState());
    assertEquals(streetAddress.getPostalCode(), actual.getPostalCode());
    assertEquals(streetAddress.getState(), actual.getState());
  }

  @Test
  void null_toFhir() {
    var streetAddress = new StreetAddress(null, null, null, null, null, null);

    var actual = streetAddress.toFhir();

    assertStringTypeListEqualsStringList(streetAddress.getStreet(), actual.getLine());
    assertEquals(streetAddress.getCity(), actual.getCity());
    assertEquals(streetAddress.getCounty(), actual.getDistrict());
    assertEquals(streetAddress.getState(), actual.getState());
    assertEquals(streetAddress.getPostalCode(), actual.getPostalCode());
    assertEquals(streetAddress.getState(), actual.getState());
  }
}
