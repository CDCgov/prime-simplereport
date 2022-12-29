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
import java.util.UUID;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.test.util.ReflectionTestUtils;

class TestEventTest {

  @Test
  void multipleResults_toFhirObservation() throws IOException {
    var covidId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var fluId = "302a7919-b699-4e0d-95ca-5fd2e3fcaf7a";
    var covidResult =
        new Result(null, new SupportedDisease("COVID-19", "96741-4"), TestResult.POSITIVE);
    var fluResult =
        new Result(null, new SupportedDisease("FLU A", "LP14239-5"), TestResult.NEGATIVE);
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
            Set.of(covidResult, fluResult));
    ReflectionTestUtils.setField(covidResult, "internalId", UUID.fromString(covidId));
    ReflectionTestUtils.setField(fluResult, "internalId", UUID.fromString(fluId));

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
    var id = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
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
    var result = new Result(null, new SupportedDisease("COVID-19", "96741-4"), TestResult.NEGATIVE);
    var testEvent =
        new TestEvent(wrongTestEvent, TestCorrectionStatus.CORRECTED, "woops", Set.of(result));
    ReflectionTestUtils.setField(result, "internalId", UUID.fromString(id));

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
