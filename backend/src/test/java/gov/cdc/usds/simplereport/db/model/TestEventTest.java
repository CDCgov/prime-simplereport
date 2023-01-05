package gov.cdc.usds.simplereport.db.model;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
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

  void valid_toFhirBundle() throws IOException {
    var address = new StreetAddress(List.of("1 Main St"), "Chicago", "IL", "60614", "");
    var deviceType = new DeviceType("name", "manufacturer", "model", "loinc", "nasal", 0);
    var specimenType = new SpecimenType("name", "typeCode");
    var deviceSpecimenType = new DeviceSpecimenType(deviceType, specimenType);
    var provider =
        new Provider(new PersonName("Michaela", null, "Quinn", ""), "1", address, "7735551235");
    var organization = new Organization("District", "school", "1", true);
    var facility =
        new Facility(
            organization,
            "School",
            "1",
            address,
            "7735551234",
            "school@example.com",
            provider,
            deviceSpecimenType,
            Collections.emptyList());
    var patient =
        new Person(
            organization,
            null,
            "Tracy",
            null,
            "Jordan",
            null,
            LocalDate.MIN,
            address,
            "USA",
            PersonRole.STUDENT,
            List.of("tj@example.com"),
            "black",
            "not hispanic",
            Collections.emptyList(),
            "male",
            false,
            false,
            "",
            null);
    var testOrder = new TestOrder(patient, facility);
    var covidResult = new Result(testOrder, new SupportedDisease(), TestResult.POSITIVE);
    var fluAResult = new Result(testOrder, new SupportedDisease(), TestResult.NEGATIVE);
    var fluBResult = new Result(testOrder, new SupportedDisease(), TestResult.UNDETERMINED);
    var testEvent = new TestEvent(testOrder, false, Set.of(covidResult, fluAResult, fluBResult));
    //    ReflectionTestUtils.setField(provider, "internalId", providerId);

    var actual = testEvent.toFhirBundle();

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/bundle.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(actualSerialized, expectedSerialized, true);
  }
}
