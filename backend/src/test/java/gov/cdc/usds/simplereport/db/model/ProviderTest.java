package gov.cdc.usds.simplereport.db.model;

import static org.assertj.core.api.Assertions.assertThat;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.test.util.ReflectionTestUtils;

class ProviderTest {

  @Test
  void toFhir() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var provider =
        Mockito.spy(
            new Provider(
                new PersonName("Amelia", "Mary", "Earhart", null),
                null,
                new StreetAddress(List.of("223 N Terrace St"), "Atchison", "KS", "66002", null),
                "248 555 1234"));
    ReflectionTestUtils.setField(provider, "internalId", UUID.fromString(internalId));

    var actual = provider.toFhir();

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                ProviderTest.class.getClassLoader().getResourceAsStream("fhir/practitioner.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(actualSerialized, expectedSerialized, true);
  }

  @Test
  void emptyPractitioner_toFhir() {
    var provider = new Provider();

    var actual = provider.toFhir();

    assertThat(actual.getIdentifier()).isEmpty();
    assertThat(actual.getName()).isEmpty();
    assertThat(actual.getTelecom()).isEmpty();
    assertThat(actual.getAddress()).isEmpty();
  }
}
