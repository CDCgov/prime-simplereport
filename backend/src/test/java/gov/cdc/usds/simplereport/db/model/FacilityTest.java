package gov.cdc.usds.simplereport.db.model;

import static org.assertj.core.api.Assertions.assertThat;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.test.util.ReflectionTestUtils;

class FacilityTest {

  @Test
  void validFacility_toFhir() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var facility =
        Mockito.spy(
            new Facility(
                null,
                "Elron",
                null,
                new StreetAddress(
                    List.of("12 Main Street", "Unit 4"), "Lakewood", "FL", "21037", null),
                "248 555 1234",
                "email@example.com",
                null,
                Collections.emptyList()));
    ReflectionTestUtils.setField(facility, "internalId", UUID.fromString(internalId));

    var actual = facility.toFhir();

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                FacilityTest.class.getClassLoader().getResourceAsStream("fhir/organization.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(actualSerialized, expectedSerialized, true);
  }

  @Test
  void emptyFacility_toFhir() {
    var facility = new Facility();

    var actual = facility.toFhir();

    assertThat(actual.getIdentifier()).isEmpty();
    assertThat(actual.getName()).isNull();
    assertThat(actual.getTelecom()).isEmpty();
    assertThat(actual.getAddress()).isEmpty();
  }
}
