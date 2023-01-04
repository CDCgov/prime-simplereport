package gov.cdc.usds.simplereport.db.model;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Objects;
import java.util.UUID;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.test.util.ReflectionTestUtils;

class TestEventTest {

  @Test
  void toFhirDiagnosticReport() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var testEvent =
        new TestEvent(
            new TestOrder(
                new Person(),
                new Facility(
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    new DeviceSpecimenType(
                        new DeviceType(null, null, null, "95422-2", null, 0), null),
                    Collections.emptyList())),
            false,
            Collections.emptySet());
    ReflectionTestUtils.setField(testEvent, "internalId", UUID.fromString(internalId));

    var actual = testEvent.toFhirDiagnosticReport();

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/diagnosticReport.json")),
            StandardCharsets.UTF_8);

    JSONAssert.assertEquals(actualSerialized, expectedSerialized, true);
  }
}
