package gov.cdc.usds.simplereport.db.model;

import static org.assertj.core.api.Assertions.assertThat;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Objects;
import java.util.UUID;
import org.apache.commons.io.IOUtils;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.test.util.ReflectionTestUtils;

class DeviceSpecimenTypeTest {
  @Test
  void validDeviceSpecimenType_getFhirDevice() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    DeviceType deviceType =
        new DeviceType(
            "name",
            "BioFire Diagnostics",
            "BioFire Respiratory Panel 2.1 (RP2.1)*@",
            "loinc",
            "swab type",
            15);
    var deviceSpecimenType =
        new DeviceSpecimenType(deviceType, new SpecimenType("nasal", "40001", "nose", "10101"));
    ReflectionTestUtils.setField(deviceType, "internalId", UUID.fromString(internalId));

    var actual = deviceSpecimenType.getFhirDevice();

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/device.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(actualSerialized, expectedSerialized, true);
  }

  @Test
  void empty_getDeviceFhir() {
    var deviceSpecimenType = new DeviceSpecimenType();
    assertThat(deviceSpecimenType.getFhirDevice()).isNull();
  }

  @Test
  void validDeviceSpecimenType_getFhirSpecimen() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    SpecimenType specimenType = new SpecimenType("nasal", "40001", "nose", "10101");
    var deviceSpecimenType =
        new DeviceSpecimenType(
            new DeviceType("name", "biotech", "m9001", "loinc", "swab type", 15), specimenType);
    ReflectionTestUtils.setField(specimenType, "internalId", UUID.fromString(internalId));

    var actual = deviceSpecimenType.getFhirSpecimen();

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/specimen.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(actualSerialized, expectedSerialized, true);
  }

  @Test
  void empty_getFhirSpecimen() {
    var deviceSpecimenType = new DeviceSpecimenType();
    assertThat(deviceSpecimenType.getFhirSpecimen()).isNull();
  }
}
