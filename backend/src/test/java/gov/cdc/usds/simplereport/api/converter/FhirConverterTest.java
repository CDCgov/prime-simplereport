package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToAddress;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToAdministrativeGender;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToContactPoint;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToDate;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToDevice;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToDiagnosticReport;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToEthnicityExtension;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToHumanName;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToIdentifier;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToRaceExtension;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToSpecimen;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToTribalAffiliationExtension;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.emailToContactPoint;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.phoneNumberToContactPoint;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.from;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Stream;
import org.apache.commons.io.IOUtils;
import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointUse;
import org.hl7.fhir.r4.model.Device.DeviceNameType;
import org.hl7.fhir.r4.model.DiagnosticReport.DiagnosticReportStatus;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.hl7.fhir.r4.model.Identifier.IdentifierUse;
import org.hl7.fhir.r4.model.PrimitiveType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.test.util.ReflectionTestUtils;

class FhirConverterTest {

  private static final String unknownSystem = "http://terminology.hl7.org/CodeSystem/v3-NullFlavor";
  private static final String raceCodeSystem = "http://terminology.hl7.org/CodeSystem/v3-Race";
  private static final String ethnicitySystem = "urn:oid:2.16.840.1.113883.6.238";
  private static final String tribalSystemUrl =
      "http://terminology.hl7.org/CodeSystem/v3-TribalEntityUS";
  public static final String snomedCode = "http://snomed.info/sct";

  @Test
  void allFields_convertToHumanName() {
    var actual = convertToHumanName("first", "middle", "last", "jr");
    assertThat(actual.getGiven().stream().map(PrimitiveType::getValue))
        .containsExactly("first", "middle");
    assertThat(actual.getFamily()).isEqualTo("last");
    assertThat(actual.getSuffix().stream().map(PrimitiveType::getValue)).containsOnly("jr");
  }

  @Test
  void noMiddleName_convertToHumanName() {
    var actual = convertToHumanName("first", null, "last", "jr");

    assertThat(actual.getGiven().stream().map(PrimitiveType::getValue)).containsExactly("first");
  }

  @Test
  void emptyPersonName_convertToHumanName() {
    var actual = convertToHumanName(null, null, null, null);

    assertThat(actual.getGiven()).isEmpty();
    assertThat(actual.getFamily()).isNull();
    assertThat(actual.getSuffix()).isEmpty();
  }

  @Test
  void null_convertToHumanName() {
    assertThat(convertToHumanName(null)).isNull();
  }

  @Test
  void uuid_convertToIdentifier() {
    var uuid = UUID.randomUUID();
    var actual = convertToIdentifier(uuid);

    assertThat(actual.getUse()).isEqualTo(IdentifierUse.USUAL);
    assertThat(actual.getValue()).isEqualTo(uuid.toString());
  }

  @Test
  void string_convertToIdentifier() {
    var actual = convertToIdentifier("someId");

    assertThat(actual.getUse()).isEqualTo(IdentifierUse.USUAL);
    assertThat(actual.getValue()).isEqualTo("someId");
  }

  @Test
  void null_convertToIdentifier() {
    assertThat(convertToIdentifier((String) null)).isNull();
    assertThat(convertToIdentifier((UUID) null)).isNull();
  }

  @Test
  void phoneNumberList_phoneNumberToContactPoint() {
    var phoneNumber = new PhoneNumber(PhoneType.LANDLINE, "2485551234");
    var phoneNumber2 = new PhoneNumber(PhoneType.LANDLINE, "2485551233");

    var actual = phoneNumberToContactPoint(List.of(phoneNumber, phoneNumber2));
    assertThat(actual).hasSize(2);

    assertThat(actual.stream().map(ContactPoint::getValue))
        .containsOnly("(248) 555 1234", "(248) 555 1233");
  }

  @Test
  void phoneNumberModel_phoneNumberToContactPoint() {
    var phoneNumber = new PhoneNumber(PhoneType.LANDLINE, "2485551234");

    var actual = phoneNumberToContactPoint(phoneNumber);

    assertThat(actual.getSystem()).isEqualTo(ContactPointSystem.PHONE);
    assertThat(actual.getUse().toCode()).isEqualTo(ContactPointUse.HOME.toCode());
    assertThat(actual.getValue()).isEqualTo("(248) 555 1234");
  }

  @Test
  void mobileNumber_phoneNumberToContactPoint() {
    var actual = phoneNumberToContactPoint(ContactPoint.ContactPointUse.MOBILE, "2485551234");

    assertThat(actual.getSystem()).isEqualTo(ContactPointSystem.PHONE);
    assertThat(actual.getUse().toCode()).isEqualTo(ContactPointUse.MOBILE.toCode());
    assertThat(actual.getValue()).isEqualTo("(248) 555 1234");
  }

  @Test
  void invalidNumber_phoneNumberToContactPoint() {
    var actual = phoneNumberToContactPoint(ContactPoint.ContactPointUse.HOME, "+0333");

    assertThat(actual)
        .returns(ContactPointSystem.PHONE, from(ContactPoint::getSystem))
        .returns("+0333", from(ContactPoint::getValue))
        .returns(
            ContactPointUse.HOME.toCode(),
            from(ContactPoint::getUse).andThen(ContactPoint.ContactPointUse::toCode));
  }

  @Test
  void null_phoneNumberToContactPoint() {
    assertThat(phoneNumberToContactPoint((PhoneNumber) null)).isNull();
    assertThat(phoneNumberToContactPoint((List<PhoneNumber>) null)).isEmpty();
  }

  @Test
  void null_emailToContactPoint() {
    assertThat(emailToContactPoint((String) null)).isNull();
    assertThat(emailToContactPoint((List<String>) null)).isEmpty();
  }

  @Test
  void string_emailToContactPoint() {
    var actual = emailToContactPoint("example@example.com");
    assertThat(actual.getUse()).isNull();
    assertThat(actual.getSystem()).isEqualTo(ContactPointSystem.EMAIL);
    assertThat(actual.getValue()).isEqualTo("example@example.com");
  }

  @Test
  void email_convertToContactPoint() {
    var actual = convertToContactPoint(null, ContactPointSystem.EMAIL, "example@example.com");
    assertThat(actual.getUse()).isNull();
    assertThat(actual.getSystem()).isEqualTo(ContactPointSystem.EMAIL);
    assertThat(actual.getValue()).isEqualTo("example@example.com");
  }

  @Test
  void null_convertToContactPoint() {
    assertThat(convertToContactPoint(ContactPointUse.HOME, ContactPointSystem.PHONE, null))
        .isNull();
  }

  @ParameterizedTest
  @MethodSource("genderArgs")
  void test_convertToAdministrativeGender(String personGender, AdministrativeGender expected) {
    var actual = convertToAdministrativeGender(personGender);

    assertThat(actual).isEqualTo(expected);
  }

  private static Stream<Arguments> genderArgs() {
    return Stream.of(
        arguments("f", AdministrativeGender.FEMALE),
        arguments("Female", AdministrativeGender.FEMALE),
        arguments("MALE", AdministrativeGender.MALE),
        arguments("M", AdministrativeGender.MALE),
        arguments(null, AdministrativeGender.UNKNOWN),
        arguments("fishperson", AdministrativeGender.UNKNOWN));
  }

  @Test
  void null_convertToDate() {
    assertThat(convertToDate(null)).isNull();
  }

  @Test
  void address_convertToAddress() {
    var actual =
        convertToAddress(List.of("1234 Main", "Apartment #1"), "MyCity", "MyCounty", "PA", "15025");
    assertThat(actual.getLine().stream().map(PrimitiveType::getValue))
        .containsExactly("1234 Main", "Apartment #1");
    assertThat(actual.getCity()).isEqualTo("MyCity");
    assertThat(actual.getDistrict()).isEqualTo("MyCounty");
    assertThat(actual.getState()).isEqualTo("PA");
    assertThat(actual.getPostalCode()).isEqualTo("15025");
  }

  @Test
  void emptyAddress_convertToAddress() {
    var actual = convertToAddress(null, null, null, null, null);
    assertThat(actual.getLine()).isEmpty();
    assertThat(actual.getCity()).isNull();
    assertThat(actual.getDistrict()).isNull();
    assertThat(actual.getState()).isNull();
    assertThat(actual.getPostalCode()).isNull();
  }

  @Test
  void null_convertToAddress() {
    assertThat(convertToAddress(null)).isNull();
  }

  @ParameterizedTest
  @MethodSource("raceArgs")
  void test_convertToRaceExtension(
      String personRaceValue, String codeSystem, String expectedCode, String expectedText) {
    var actual = convertToRaceExtension(personRaceValue);
    assert actual != null;
    var codeableConcept = actual.castToCodeableConcept(actual.getValue());
    var code = codeableConcept.getCoding();

    assertThat(code).hasSize(1);
    assertThat(code.get(0).getSystem()).isEqualTo(codeSystem);
    assertThat(code.get(0).getCode()).isEqualTo(expectedCode);
    assertThat(codeableConcept.getText()).isEqualTo(expectedText);
  }

  private static Stream<Arguments> raceArgs() {
    return Stream.of(
        arguments("native", raceCodeSystem, "1002-5", "native"),
        arguments("refused", unknownSystem, "ASKU", "refused"),
        arguments("Fishpeople", unknownSystem, "UNK", "unknown"));
  }

  @Test
  void null_convertToRaceExtension() {
    assertThat(convertToRaceExtension(null)).isNull();
  }

  @ParameterizedTest
  @MethodSource("ethnicityArgs")
  void test_convertToEthnicityExtension(
      String ethnicity, String ombSystem, String raceCode, String ethnicityDisplay) {
    var actual = FhirConverter.convertToEthnicityExtension(ethnicity);
    assert actual != null;
    var ombExtension = actual.getExtensionByUrl("ombCategory");
    var textExtension = actual.getExtensionByUrl("text");
    var ombCoding = actual.castToCoding(ombExtension.getValue());
    var textValueString = actual.castToString(textExtension.getValue());

    assertThat(actual.getExtension()).hasSize(2);
    assertThat(ombCoding.getSystem()).isEqualTo(ombSystem);
    assertThat(ombCoding.getCode()).isEqualTo(raceCode);
    assertThat(ombCoding.getDisplay()).isEqualTo(ethnicityDisplay);
    assertThat(textValueString.getValue()).isEqualTo(ethnicityDisplay);
  }

  private static Stream<Arguments> ethnicityArgs() {
    return Stream.of(
        arguments("hispanic", ethnicitySystem, "2135-2", "Hispanic or Latino"),
        arguments("not_hispanic", ethnicitySystem, "2186-5", "Not Hispanic or Latino"),
        arguments("refused", unknownSystem, "ASKU", "asked but unknown"),
        arguments("shark", unknownSystem, "UNK", "unknown"));
  }

  @Test
  void null_convertToEthnicityExtension() {
    assertThat(convertToEthnicityExtension(null)).isNull();
  }

  @Test
  void string_convertToTribalAffiliation() {
    var actual = convertToTribalAffiliationExtension("1");
    assert actual != null;
    var tribalAffiliationExtension = actual.getExtensionByUrl("tribalAffiliation");
    var tribalCodeableConcept = actual.castToCodeableConcept(tribalAffiliationExtension.getValue());
    var tribalCoding = tribalCodeableConcept.getCoding().get(0);

    assertThat(actual.getExtension()).hasSize(1);
    assertThat(tribalCoding.getSystem()).isEqualTo(tribalSystemUrl);
    assertThat(tribalCoding.getCode()).isEqualTo("1");
    assertThat(tribalCoding.getDisplay())
        .isEqualTo("Absentee-Shawnee Tribe of Indians of Oklahoma");
  }

  @Test
  void emptyList_convertToTribalAffiliation() {
    var actual = convertToTribalAffiliationExtension(Collections.emptyList());
    assertThat(actual).isNull();
  }

  @Test
  void null_convertToTribalAffiliation() {
    assertThat(convertToTribalAffiliationExtension((String) null)).isNull();
    assertThat(convertToTribalAffiliationExtension((List<String>) null)).isNull();
  }

  @Test
  void string_convertToDevice() {
    var actual =
        convertToDevice(
            "PHASE Scientific International, Ltd.\n",
            "INDICAID COVID-19 Rapid Antigen Test*",
            "id-123");

    assert actual != null;
    assertThat(actual.getId()).isEqualTo("id-123");
    assertThat(actual.getManufacturer()).isEqualTo("PHASE Scientific International, Ltd.\n");
    assertThat(actual.getDeviceName()).hasSize(1);
    assertThat(actual.getDeviceNameFirstRep().getName())
        .isEqualTo("INDICAID COVID-19 Rapid Antigen Test*");
    assertThat(actual.getDeviceNameFirstRep().getType()).isEqualTo(DeviceNameType.MODELNAME);
  }

  @Test
  void nullString_convertToDevice() {
    assertThat(convertToDevice(null, null, null)).isNull();
  }

  @Test
  void deviceSpecimenType_convertToDevice() {
    var internalId = UUID.randomUUID();
    var deviceType = new DeviceType("name", "manufacturer", "model", "loinc", "swab type", 15);
    ReflectionTestUtils.setField(deviceType, "internalId", internalId);

    var actual = convertToDevice(deviceType);

    assertThat(actual.getId()).isEqualTo(internalId.toString());
    assertThat(actual.getManufacturer()).isEqualTo("manufacturer");
    assertThat(actual.getDeviceName()).hasSize(1);
    assertThat(actual.getDeviceNameFirstRep().getName()).isEqualTo("model");
    assertThat(actual.getDeviceNameFirstRep().getType()).isEqualTo(DeviceNameType.MODELNAME);
  }

  @Test
  void nullDeviceType_convertToDevice() {
    assertThat(convertToDevice(null)).isNull();
  }

  @Test
  void validDeviceType_convertToDevice_matchesJson() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    DeviceType deviceType =
        new DeviceType(
            "name",
            "BioFire Diagnostics",
            "BioFire Respiratory Panel 2.1 (RP2.1)*@",
            "loinc",
            "swab type",
            15);
    ReflectionTestUtils.setField(deviceType, "internalId", UUID.fromString(internalId));

    var actual = convertToDevice(deviceType);

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
  void string_convertToSpecimen() {
    var actual =
        convertToSpecimen(
            "258500001",
            "Nasopharyngeal swab",
            "53342003",
            "Internal nose structure (body structure)",
            "id-123");

    assertThat(actual.getId()).isEqualTo("id-123");
    assertThat(actual.getType().getCoding()).hasSize(1);
    assertThat(actual.getType().getCodingFirstRep().getSystem()).isEqualTo(snomedCode);
    assertThat(actual.getType().getCodingFirstRep().getCode()).isEqualTo("258500001");
    assertThat(actual.getType().getText()).isEqualTo("Nasopharyngeal swab");

    assertThat(actual.getCollection().getBodySite().getCoding()).hasSize(1);
    assertThat(actual.getCollection().getBodySite().getCodingFirstRep().getSystem())
        .isEqualTo(snomedCode);
    assertThat(actual.getCollection().getBodySite().getCodingFirstRep().getCode())
        .isEqualTo("53342003");
    assertThat(actual.getCollection().getBodySite().getText())
        .isEqualTo("Internal nose structure (body structure)");
  }

  @Test
  void null_convertToSpecimen() {
    var actual = convertToSpecimen(null, null, null, null, null);

    assertThat(actual.getId()).isNull();
    assertThat(actual.getType().getText()).isNull();
    assertThat(actual.getType().getCoding()).isEmpty();
    assertThat(actual.getCollection().getBodySite().getText()).isNull();
    assertThat(actual.getCollection().getBodySite().getCoding()).isEmpty();
  }

  @Test
  void specimenType_convertToSpecimen() {
    var specimenType =
        new SpecimenType(
            "Nasopharyngeal swab",
            "258500001",
            "Internal nose structure (body structure)",
            "53342003");
    var internalId = UUID.randomUUID();
    ReflectionTestUtils.setField(specimenType, "internalId", internalId);

    var actual = convertToSpecimen(specimenType);

    assertThat(actual.getId()).isEqualTo(internalId.toString());
    assertThat(actual.getType().getCoding()).hasSize(1);
    assertThat(actual.getType().getCodingFirstRep().getSystem()).isEqualTo(snomedCode);
    assertThat(actual.getType().getCodingFirstRep().getCode()).isEqualTo("258500001");
    assertThat(actual.getType().getText()).isEqualTo("Nasopharyngeal swab");

    assertThat(actual.getCollection().getBodySite().getCoding()).hasSize(1);
    assertThat(actual.getCollection().getBodySite().getCodingFirstRep().getSystem())
        .isEqualTo(snomedCode);
    assertThat(actual.getCollection().getBodySite().getCodingFirstRep().getCode())
        .isEqualTo("53342003");
    assertThat(actual.getCollection().getBodySite().getText())
        .isEqualTo("Internal nose structure (body structure)");
  }

  @Test
  void nullSpecimenType_convertToSpecimen() {
    assertThat(convertToSpecimen(null)).isNull();
  }

  @Test
  void validSpecimenType_convertToSpecimen_matchesJson() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    SpecimenType specimenType = new SpecimenType("nasal", "40001", "nose", "10101");
    ReflectionTestUtils.setField(specimenType, "internalId", UUID.fromString(internalId));

    var actual = convertToSpecimen(specimenType);

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
  void testEvent_convertToDiagnosticReport() {
    var testEvent =
        new TestEvent(
            new TestOrder(
                new Person(null, null, null, null, null),
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

    var actual = convertToDiagnosticReport(testEvent);

    assertThat(actual.getStatus()).isEqualTo(DiagnosticReportStatus.FINAL);
    assertThat(actual.getCode().getCoding()).hasSize(1);
    assertThat(actual.getCode().getCodingFirstRep().getSystem()).isEqualTo("http://loinc.org");
    assertThat(actual.getCode().getCodingFirstRep().getCode()).isEqualTo("95422-2");
  }

  @Test
  void testEventOriginal_convertToDiagnosticReport() {
    var testEvent =
        new TestEvent(
            new TestOrder(
                new Person(null, null, null, null, null),
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
    var actual = convertToDiagnosticReport(testEvent);

    assertThat(actual.getStatus()).isEqualTo(DiagnosticReportStatus.FINAL);
    assertThat(actual.getCode().getCoding()).hasSize(1);
    assertThat(actual.getCode().getCodingFirstRep().getSystem()).isEqualTo("http://loinc.org");
    assertThat(actual.getCode().getCodingFirstRep().getCode()).isEqualTo("95422-2");
  }

  @Test
  void testEventCorrected_convertToDiagnosticReport() {
    var invalidTestEvent =
        new TestEvent(
            new TestOrder(
                new Person(null, null, null, null, null),
                new Facility(
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    new DeviceSpecimenType(null, null),
                    Collections.emptyList())),
            false,
            Collections.emptySet());
    var correctedTestEvent =
        new TestEvent(
            invalidTestEvent, TestCorrectionStatus.CORRECTED, "typo", Collections.emptySet());

    var actual = convertToDiagnosticReport(correctedTestEvent);

    assertThat(actual.getStatus()).isEqualTo(DiagnosticReportStatus.CORRECTED);
  }

  @Test
  void testEventRemoved_convertToDiagnosticReport() {
    var invalidTestEvent =
        new TestEvent(
            new TestOrder(
                new Person(null, null, null, null, null),
                new Facility(
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    new DeviceSpecimenType(null, null),
                    Collections.emptyList())),
            false,
            Collections.emptySet());
    var correctedTestEvent =
        new TestEvent(
            invalidTestEvent, TestCorrectionStatus.REMOVED, "wrong person", Collections.emptySet());

    var actual = convertToDiagnosticReport(correctedTestEvent);

    assertThat(actual.getStatus()).isEqualTo(DiagnosticReportStatus.CANCELLED);
  }

  @Test
  void testEventNullDeviceType_convertToDiagnosticReport() {
    var testEvent =
        new TestEvent(
            new TestOrder(
                new Person(null, null, null, null, null),
                new Facility(
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    null,
                    new DeviceSpecimenType(null, null),
                    Collections.emptyList())),
            false,
            Collections.emptySet());

    var actual = convertToDiagnosticReport(testEvent);

    assertThat(actual.getStatus()).isEqualTo(DiagnosticReportStatus.FINAL);
    assertThat(actual.getCode().getCoding()).isEmpty();
  }

  @Test
  void nullTestEvent_convertToDiagnosticReport() {
    var actual = convertToDiagnosticReport(null);

    assertThat(actual).isNull();
  }

  @Test
  void string_convertToDiagnosticReport() {
    var actual = convertToDiagnosticReport(DiagnosticReportStatus.FINAL, "95422-2", "id-123");

    assertThat(actual.getId()).isEqualTo("id-123");
    assertThat(actual.getStatus()).isEqualTo(DiagnosticReportStatus.FINAL);
    assertThat(actual.getCode().getCoding()).hasSize(1);
    assertThat(actual.getCode().getCodingFirstRep().getSystem()).isEqualTo("http://loinc.org");
    assertThat(actual.getCode().getCodingFirstRep().getCode()).isEqualTo("95422-2");
  }

  @Test
  void nullString_convertToDiagnosticReport() {
    var actual = convertToDiagnosticReport(null, null, null);

    assertThat(actual.getId()).isNull();
    assertThat(actual.getStatus()).isNull();
    assertThat(actual.getCode().getCoding()).isEmpty();
  }
}
