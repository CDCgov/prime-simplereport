package gov.cdc.usds.simplereport.db.model;

import static org.assertj.core.api.Assertions.assertThat;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.Objects;
import java.util.Set;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.JSONAssert;

class TestEventTest {

  @Test
  void multipleResults_toFhirObservation() throws IOException {
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
                    new DeviceSpecimenType(),
                    Collections.emptyList())),
            false,
            Set.of(
                new Result(null, new SupportedDisease("COVID-19", "96741-4"), TestResult.POSITIVE),
                new Result(null, new SupportedDisease("FLU A", "LP14239-5"), TestResult.NEGATIVE)));

    var actual = testEvent.toFhirObservation();

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    assertThat(actual).hasSize(2);
    String covidSerialized =
        parser.encodeResourceToString(
            actual.stream()
                .filter(
                    observation ->
                        observation.getCode().getCodingFirstRep().is("http://loinc.org", "96741-4"))
                .findFirst()
                .orElse(null));
    String fluSerialized =
        parser.encodeResourceToString(
            actual.stream()
                .filter(
                    observation ->
                        observation
                            .getCode()
                            .getCodingFirstRep()
                            .is("http://loinc.org", "LP14239-5"))
                .findFirst()
                .orElse(null));
    var expectedSerialized1 =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/observationCovid.json")),
            StandardCharsets.UTF_8);
    var expectedSerialized2 =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/observationFlu.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(covidSerialized, expectedSerialized1, true);
    JSONAssert.assertEquals(fluSerialized, expectedSerialized2, true);
  }

  @Test
  void correction_toFhirObservation() throws IOException {
    var wrongTestEvent =
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
                    new DeviceSpecimenType(),
                    Collections.emptyList())),
            false,
            Set.of(
                new Result(
                    null, new SupportedDisease("COVID-19", "96741-4"), TestResult.POSITIVE)));
    var testEvent =
        new TestEvent(
            wrongTestEvent,
            TestCorrectionStatus.CORRECTED,
            "woops",
            Set.of(
                new Result(
                    null, new SupportedDisease("COVID-19", "96741-4"), TestResult.NEGATIVE)));

    var actual = testEvent.toFhirObservation();

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    String actualSerialized = parser.encodeResourceToString(actual.get(0));
    var expectedSerialized1 =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/observationCorrection.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(actualSerialized, expectedSerialized1, true);
  }
}
