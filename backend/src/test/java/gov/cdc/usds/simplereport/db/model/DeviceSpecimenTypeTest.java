package gov.cdc.usds.simplereport.db.model;

import static org.assertj.core.api.Assertions.assertThat;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.skyscreamer.jsonassert.JSONAssert;

class DeviceSpecimenTypeTest {
  @Test
  void validDeviceSpecimenType_toFhir() throws IOException {
    var deviceSpecimenType =
        Mockito.spy(
            new DeviceSpecimenType(
                new DeviceType("name", "biotech", "m9001", "loinc", "swab type", 15),
                new SpecimenType("nasal", "40001", "nose", "10101")));

    var actual = deviceSpecimenType.getFhirDevice();

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/device.json")),
            StandardCharsets.UTF_8);
    System.out.println(actualSerialized);
    JSONAssert.assertEquals(actualSerialized, expectedSerialized, true);
  }

  @Test
  void empty_toFhir() {
    var facility = new Facility();

    var actual = facility.toFhir();

    assertThat(actual.getIdentifier()).isEmpty();
    assertThat(actual.getName()).isNull();
    assertThat(actual.getTelecom()).isEmpty();
    assertThat(actual.getAddress()).isEmpty();
  }
}
