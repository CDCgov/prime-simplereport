package gov.cdc.usds.simplereport.db.model.auxiliary;

import static gov.cdc.usds.simplereport.api.converter.FhirConverterTest.assertStringTypeListEqualsStringList;
import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;

class StreetAddressTest {

  @Test
  void fullAddress_toFhir() {
    var streetAddress =
        new StreetAddress(List.of("1 Main Street", "Unit 1"), "city", "OK", "12345", "county");

    var actual = streetAddress.toFhir();

    assertStringTypeListEqualsStringList(streetAddress.getStreet(), actual.getLine());
    assertThat(actual.getCity()).isEqualTo(streetAddress.getCity());
    assertThat(actual.getDistrict()).isEqualTo(streetAddress.getCounty());
    assertThat(actual.getState()).isEqualTo(streetAddress.getState());
    assertThat(actual.getPostalCode()).isEqualTo(streetAddress.getPostalCode());
  }
}
