package gov.cdc.usds.simplereport.db.model;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.JSONAssert;

class TestOrderTest {

  @Test
  void toFhir() throws IOException {
    var testOrder = new TestOrder();
    testOrder.markComplete();
    testOrder.setDeviceSpecimen(
        new DeviceSpecimenType(new DeviceType(null, null, null, "94533-7", null, 0), null));
    var actual = testOrder.toFhir();

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/serviceRequest.json")),
            StandardCharsets.UTF_8);
    System.out.println(actualSerialized);
    JSONAssert.assertEquals(actualSerialized, expectedSerialized, true);
  }
}
