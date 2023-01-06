package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToAddress;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToAdministrativeGender;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToContactPoint;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToDate;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToDevice;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToDiagnosticReport;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToEthnicityExtension;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToHumanName;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToObservation;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToOrganization;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToPatient;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToPractitioner;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToRaceExtension;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToServiceRequest;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToSpecimen;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToTribalAffiliationExtension;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.createFhirBundle;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.emailToContactPoint;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.getMessageHeader;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.getPractitionerRole;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.phoneNumberToContactPoint;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.from;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.apache.commons.io.IOUtils;
import org.hl7.fhir.r4.model.Bundle.BundleEntryComponent;
import org.hl7.fhir.r4.model.Bundle.BundleType;
import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointUse;
import org.hl7.fhir.r4.model.Device.DeviceNameType;
import org.hl7.fhir.r4.model.DiagnosticReport;
import org.hl7.fhir.r4.model.DiagnosticReport.DiagnosticReportStatus;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.PractitionerRole;
import org.hl7.fhir.r4.model.PrimitiveType;
import org.hl7.fhir.r4.model.ServiceRequest;
import org.hl7.fhir.r4.model.ServiceRequest.ServiceRequestIntent;
import org.hl7.fhir.r4.model.ServiceRequest.ServiceRequestStatus;
import org.hl7.fhir.r4.model.Specimen;
import org.hl7.fhir.r4.model.codesystems.ObservationStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.mockito.Mockito;
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
  void provider_convertToPractitioner_matchesJson() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var provider =
        new Provider(
            new PersonName("Amelia", "Mary", "Earhart", null),
            null,
            new StreetAddress(List.of("223 N Terrace St"), "Atchison", "KS", "66002", null),
            "248 555 1234");
    ReflectionTestUtils.setField(provider, "internalId", UUID.fromString(internalId));

    var actual = convertToPractitioner(provider);

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/practitioner.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(actualSerialized, expectedSerialized, true);
  }

  @Test
  void validFacility_toFhir() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var facility =
        new Facility(
            null,
            "Elron",
            null,
            new StreetAddress(List.of("12 Main Street", "Unit 4"), "Lakewood", "FL", "21037", null),
            "248 555 1234",
            "email@example.com",
            null,
            Collections.emptyList());
    ReflectionTestUtils.setField(facility, "internalId", UUID.fromString(internalId));

    var actual = convertToOrganization(facility);

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/organization.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(actualSerialized, expectedSerialized, true);
  }

  @Test
  void toFhir_ValidPerson_ReturnsValidPatient() throws IOException {
    var birthDate = LocalDate.of(2022, 12, 13);
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var person =
        Mockito.spy(
            new Person(
                null,
                null,
                null,
                "Austin",
                "Wingate",
                "Curtis",
                "Jr",
                birthDate,
                new StreetAddress(
                    List.of("501 Virginia St E", "#1"), "Charleston", "WV", "25301", "Kanawha"),
                "USA",
                null,
                List.of("email1", "email2"),
                "black",
                "hispanic",
                List.of("123"),
                "Male",
                false,
                false,
                "English",
                null));
    ReflectionTestUtils.setField(
        person,
        "phoneNumbers",
        List.of(
            new PhoneNumber(PhoneType.MOBILE, "304-555-1234"),
            new PhoneNumber(PhoneType.LANDLINE, "3045551233")));
    ReflectionTestUtils.setField(person, "internalId", UUID.fromString(internalId));

    var actual = convertToPatient(person);

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/patient.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(actualSerialized, expectedSerialized, true);
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
  void string_convertToObservation() {
    var actual =
        convertToObservation(
            "diseaseCode",
            "diseaseName",
            "resultCode",
            TestCorrectionStatus.ORIGINAL,
            null,
            "id-123");

    assertThat(actual.getId()).isEqualTo("id-123");
    assertThat(actual.getStatus().getDisplay()).isEqualTo(ObservationStatus.FINAL.getDisplay());
    assertThat(actual.getCode().getText()).isEqualTo("diseaseName");
    assertThat(actual.getCode().getCoding()).hasSize(1);
    assertThat(actual.getCode().getCodingFirstRep().getSystem()).isEqualTo("http://loinc.org");
    assertThat(actual.getCode().getCodingFirstRep().getCode()).isEqualTo("diseaseCode");
    assertThat(actual.getValueCodeableConcept().getCoding()).hasSize(1);
    assertThat(actual.getValueCodeableConcept().getCodingFirstRep().getSystem())
        .isEqualTo("http://snomed.info/sct");
    assertThat(actual.getValueCodeableConcept().getCodingFirstRep().getCode())
        .isEqualTo("resultCode");
    assertThat(actual.getNote()).isEmpty();
  }

  @Test
  void result_convertToObservation() {
    var result =
        new Result(null, null, new SupportedDisease("covid-19", "96741-4"), TestResult.POSITIVE);
    var internalId = UUID.randomUUID();
    ReflectionTestUtils.setField(result, "internalId", internalId);

    var actual = convertToObservation(result, TestCorrectionStatus.ORIGINAL, null);

    assertThat(actual.getId()).isEqualTo(internalId.toString());
    assertThat(actual.getStatus().getDisplay()).isEqualTo(ObservationStatus.FINAL.getDisplay());
    assertThat(actual.getCode().getText()).isEqualTo("covid-19");
    assertThat(actual.getCode().getCoding()).hasSize(1);
    assertThat(actual.getCode().getCodingFirstRep().getSystem()).isEqualTo("http://loinc.org");
    assertThat(actual.getCode().getCodingFirstRep().getCode()).isEqualTo("96741-4");
    assertThat(actual.getValueCodeableConcept().getCoding()).hasSize(1);
    assertThat(actual.getValueCodeableConcept().getCodingFirstRep().getSystem())
        .isEqualTo("http://snomed.info/sct");
    assertThat(actual.getValueCodeableConcept().getCodingFirstRep().getCode())
        .isEqualTo("260373001");
    assertThat(actual.getNote()).isEmpty();
  }

  @Test
  void correctedResult_convertToObservation() {
    var result =
        new Result(null, null, new SupportedDisease("covid-19", "96741-4"), TestResult.POSITIVE);
    var internalId = UUID.randomUUID();
    ReflectionTestUtils.setField(result, "internalId", internalId);

    var actual = convertToObservation(result, TestCorrectionStatus.CORRECTED, "Oopsy Daisy");

    assertThat(actual.getId()).isEqualTo(internalId.toString());
    assertThat(actual.getStatus().getDisplay()).isEqualTo(ObservationStatus.CORRECTED.getDisplay());
    assertThat(actual.getNote()).hasSize(1);
    assertThat(actual.getNoteFirstRep().getText()).isEqualTo("Corrected Result: Oopsy Daisy");
  }

  @Test
  void removedResultNoReason_convertToObservation() {
    var result =
        new Result(null, null, new SupportedDisease("covid-19", "96741-4"), TestResult.POSITIVE);
    var internalId = UUID.randomUUID();
    ReflectionTestUtils.setField(result, "internalId", internalId);

    var actual = convertToObservation(result, TestCorrectionStatus.REMOVED, null);

    assertThat(actual.getId()).isEqualTo(internalId.toString());
    assertThat(actual.getStatus().getDisplay())
        .isEqualTo(ObservationStatus.ENTEREDINERROR.getDisplay());
    assertThat(actual.getNote()).hasSize(1);
    assertThat(actual.getNoteFirstRep().getText()).isEqualTo("Corrected Result");
  }

  @Test
  void nullResult_convertToObservation() {
    var actual = convertToObservation((Result) null, TestCorrectionStatus.ORIGINAL, null);

    assertThat(actual).isNull();
  }

  @Test
  void nullDisease_convertToObservation() {
    var actual =
        convertToObservation(
            new Result(null, null, null, TestResult.POSITIVE), TestCorrectionStatus.ORIGINAL, null);

    assertThat(actual).isNull();
  }

  @Test
  void multipleResults_toFhirObservation() throws IOException {
    var covidId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var fluId = "302a7919-b699-4e0d-95ca-5fd2e3fcaf7a";
    var covidResult =
        new Result(null, new SupportedDisease("COVID-19", "96741-4"), TestResult.POSITIVE);
    var fluResult =
        new Result(null, new SupportedDisease("FLU A", "LP14239-5"), TestResult.NEGATIVE);
    ReflectionTestUtils.setField(covidResult, "internalId", UUID.fromString(covidId));
    ReflectionTestUtils.setField(fluResult, "internalId", UUID.fromString(fluId));

    var actual =
        convertToObservation(Set.of(covidResult, fluResult), TestCorrectionStatus.ORIGINAL, null);

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
    var result = new Result(null, new SupportedDisease("COVID-19", "96741-4"), TestResult.NEGATIVE);
    ReflectionTestUtils.setField(result, "internalId", UUID.fromString(id));

    var actual = convertToObservation(Set.of(result), TestCorrectionStatus.CORRECTED, "woops");

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
  void testEvent_convertToDiagnosticReport_matchesJson() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
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
    ReflectionTestUtils.setField(testEvent, "internalId", UUID.fromString(internalId));

    var actual = convertToDiagnosticReport(testEvent);

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

  @Test
  void testOrder_convertToServiceRequest() {
    var testOrder =
        new TestOrder(
            new Person(null, null, null, null, new Organization(null, null, null, true)),
            new Facility(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                new DeviceSpecimenType(new DeviceType(null, null, null, "95422-2", null, 0), null),
                Collections.emptyList()));

    var actual = convertToServiceRequest(testOrder);

    assertThat(actual.getStatus()).isEqualTo(ServiceRequestStatus.ACTIVE);
    assertThat(actual.getIntent()).isEqualTo(ServiceRequestIntent.ORDER);
    assertThat(actual.getCode().getCoding()).hasSize(1);
    assertThat(actual.getCode().getCodingFirstRep().getSystem()).isEqualTo("http://loinc.org");
    assertThat(actual.getCode().getCodingFirstRep().getCode()).isEqualTo("95422-2");
  }

  @Test
  void testOrderComplete_convertToServiceRequest() {
    var testOrder =
        new TestOrder(
            new Person(null, null, null, null, new Organization(null, null, null, true)),
            new Facility(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                new DeviceSpecimenType(new DeviceType(null, null, null, "95422-2", null, 0), null),
                Collections.emptyList()));
    testOrder.markComplete();
    var actual = convertToServiceRequest(testOrder);

    assertThat(actual.getStatus()).isEqualTo(ServiceRequestStatus.COMPLETED);
  }

  @Test
  void testOrderCancelled_convertToServiceRequest() {
    var testOrder =
        new TestOrder(
            new Person(null, null, null, null, new Organization(null, null, null, true)),
            new Facility(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                new DeviceSpecimenType(new DeviceType(null, null, null, "95422-2", null, 0), null),
                Collections.emptyList()));
    testOrder.cancelOrder();
    var actual = convertToServiceRequest(testOrder);

    assertThat(actual.getStatus()).isEqualTo(ServiceRequestStatus.REVOKED);
  }

  @Test
  void testOrderNullDeviceType_convertToServiceRequest() {
    var testOrder =
        new TestOrder(
            new Person(null, null, null, null, new Organization(null, null, null, true)),
            new Facility(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                new DeviceSpecimenType(null, null),
                Collections.emptyList()));
    testOrder.cancelOrder();
    var actual = convertToServiceRequest(testOrder);

    assertThat(actual.getCode().getCoding()).isEmpty();
  }

  @Test
  void nullTestOrder_convertToServiceRequest() {
    var actual = convertToServiceRequest(null);

    assertThat(actual).isNull();
  }

  @Test
  void string_convertToServiceRequest() {
    var actual = convertToServiceRequest(ServiceRequestStatus.COMPLETED, "94533-7", "id-123");
    assertThat(actual.getId()).isEqualTo("id-123");
    assertThat(actual.getStatus()).isEqualTo(ServiceRequestStatus.COMPLETED);
    assertThat(actual.getCode().getCoding()).hasSize(1);
    assertThat(actual.getCode().getCodingFirstRep().getSystem()).isEqualTo("http://loinc.org");
    assertThat(actual.getCode().getCodingFirstRep().getCode()).isEqualTo("94533-7");
  }

  @Test
  void nullString_convertToServiceRequest() {
    var actual = convertToServiceRequest(null, null, null);
    assertThat(actual.getId()).isNull();
    assertThat(actual.getStatus()).isNull();
    assertThat(actual.getCode().getCoding()).isEmpty();
  }

  @Test
  void testOrder_convertToServiceRequest_matchesJson() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var testOrder =
        new TestOrder(
            null,
            new Facility(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                new DeviceSpecimenType(null, null),
                Collections.emptyList()));
    testOrder.markComplete();
    testOrder.setDeviceSpecimen(
        new DeviceSpecimenType(new DeviceType(null, null, null, "94533-7", null, 0), null));
    ReflectionTestUtils.setField(testOrder, "internalId", UUID.fromString(internalId));

    var actual = convertToServiceRequest(testOrder);

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/serviceRequest.json")),
            StandardCharsets.UTF_8);

    JSONAssert.assertEquals(actualSerialized, expectedSerialized, true);
  }

  @Test
  void valid_getPractitionerRole() {
    var practitionerRole =
        getPractitionerRole("Organization/org-id", "Practitioner/practitioner-id");

    assertThat(practitionerRole.getOrganization().getReference()).isEqualTo("Organization/org-id");
    assertThat(practitionerRole.getPractitioner().getReference())
        .isEqualTo("Practitioner/practitioner-id");
  }

  @Test
  void valid_getMessageHeader() {
    var messageHeader = getMessageHeader("Organization/org-id");

    assertThat(messageHeader.getEventCoding().getSystem())
        .isEqualTo("http://terminology.hl7.org/CodeSystem/v2-0003");
    assertThat(messageHeader.getEventCoding().getCode()).isEqualTo("R01");
    assertThat(messageHeader.getEventCoding().getDisplay())
        .isEqualTo("ORU/ACK - Unsolicited transmission of an observation message");
    assertThat(messageHeader.getSource().getSoftware()).isEqualTo("PRIME SimpleReport");
    assertThat(messageHeader.getSender().getReference()).isEqualTo("Organization/org-id");
  }

  @Test
  void valid_toFhirBundle() {
    var deviceType = new DeviceType("device", "manufacturer", "model", null, null, 0);
    var specimenType = new SpecimenType(null, null);
    var deviceSpecimenType = new DeviceSpecimenType(deviceType, specimenType);

    var facility =
        new Facility(
            null,
            "TAOS MIDDLE SCHOOL",
            null,
            new StreetAddress(List.of("235 Paseo Del Cañon E"), "Taos", "NM", "87571", null),
            "5755551234",
            "school@example.com",
            null,
            deviceSpecimenType,
            Collections.emptyList());

    var person =
        new Person(
            null, facility, null, "Shrek", "The", "Ogre", null, null, null, null, null, null, null,
            null, null, "female", null, null, null, null);

    var provider =
        new Provider(
            "Jean",
            "M",
            "Byington",
            null,
            "123",
            new StreetAddress(List.of("236 Paseo Del Cañon E"), "Taos", "NM", "87571", null),
            "5755551234");

    var testOrder = new TestOrder(person, facility);
    var result = new Result(testOrder, new SupportedDisease(), TestResult.POSITIVE);
    var testEvent = new TestEvent(testOrder, false, Set.of(result));

    var providerId = UUID.randomUUID();
    var facilityId = UUID.randomUUID();
    var personId = UUID.randomUUID();
    var specimenTypeId = UUID.randomUUID();
    var deviceTypeId = UUID.randomUUID();
    var resultId = UUID.randomUUID();
    var testOrderId = UUID.randomUUID();
    var testEventId = UUID.randomUUID();
    ReflectionTestUtils.setField(provider, "internalId", providerId);
    ReflectionTestUtils.setField(facility, "internalId", facilityId);
    ReflectionTestUtils.setField(person, "internalId", personId);
    ReflectionTestUtils.setField(specimenType, "internalId", specimenTypeId);
    ReflectionTestUtils.setField(deviceType, "internalId", deviceTypeId);
    ReflectionTestUtils.setField(result, "internalId", resultId);
    ReflectionTestUtils.setField(testOrder, "internalId", testOrderId);
    ReflectionTestUtils.setField(testEvent, "internalId", testEventId);

    var actual =
        createFhirBundle(
            convertToPatient(person),
            convertToOrganization(facility),
            convertToPractitioner(provider),
            convertToDevice(deviceType),
            convertToSpecimen(specimenType),
            convertToObservation(Set.of(result), TestCorrectionStatus.ORIGINAL, null),
            convertToServiceRequest(testOrder),
            convertToDiagnosticReport(testEvent));

    var resourceUrls =
        actual.getEntry().stream()
            .map(BundleEntryComponent::getFullUrl)
            .collect(Collectors.toList());

    assertThat(actual.getType()).isEqualTo(BundleType.MESSAGE);
    assertThat(actual.getEntry()).hasSize(10);
    assertThat(resourceUrls).hasSize(10);
    assertThat(resourceUrls)
        .contains(
            "Patient/" + personId,
            "Organization/" + facilityId,
            "Practitioner/" + providerId,
            "Specimen/" + specimenTypeId,
            "Observation/" + resultId,
            "ServiceRequest/" + testOrderId,
            "DiagnosticReport/" + testEventId,
            "Device/" + deviceTypeId);

    var practitionerRoleEntry =
        actual.getEntry().stream()
            .filter(entry -> entry.getFullUrl().contains("PractitionerRole/"))
            .findFirst()
            .orElseThrow(
                () -> new AssertionError("Expected to find Practitioner Role, but not found"));
    assertThat(
            ((PractitionerRole) practitionerRoleEntry.getResource())
                .getPractitioner()
                .getReference())
        .isEqualTo("Practitioner/" + providerId);
    assertThat(
            ((PractitionerRole) practitionerRoleEntry.getResource())
                .getOrganization()
                .getReference())
        .isEqualTo("Organization/" + facilityId);

    var specimenEntry =
        actual.getEntry().stream()
            .filter(entry -> entry.getFullUrl().contains("Specimen/"))
            .findFirst()
            .orElseThrow(() -> new AssertionError("Expected to find Specimen, but not found"));
    assertThat(((Specimen) specimenEntry.getResource()).getSubject().getReference())
        .isEqualTo("Patient/" + personId);

    var observationEntry =
        actual.getEntry().stream()
            .filter(entry -> entry.getFullUrl().contains("Observation/"))
            .findFirst()
            .orElseThrow(() -> new AssertionError("Expected to find Observation, but not found"));
    assertThat(((Observation) observationEntry.getResource()).getSubject().getReference())
        .isEqualTo("Patient/" + personId);
    assertThat(((Observation) observationEntry.getResource()).getPerformer()).hasSize(1);
    assertThat(((Observation) observationEntry.getResource()).getPerformerFirstRep().getReference())
        .isEqualTo("Organization/" + facilityId);
    assertThat(((Observation) observationEntry.getResource()).getSpecimen().getReference())
        .isEqualTo("Specimen/" + specimenTypeId);
    assertThat(((Observation) observationEntry.getResource()).getDevice().getReference())
        .isEqualTo("Device/" + deviceTypeId);

    var serviceRequestEntry =
        actual.getEntry().stream()
            .filter(entry -> entry.getFullUrl().contains("ServiceRequest/"))
            .findFirst()
            .orElseThrow(
                () -> new AssertionError("Expected to find ServiceRequest, but not found"));
    assertThat(((ServiceRequest) serviceRequestEntry.getResource()).getSubject().getReference())
        .isEqualTo("Patient/" + personId);
    assertThat(((ServiceRequest) serviceRequestEntry.getResource()).getPerformer()).hasSize(1);
    assertThat(
            ((ServiceRequest) serviceRequestEntry.getResource())
                .getPerformerFirstRep()
                .getReference())
        .isEqualTo("Organization/" + facilityId);

    var diagnosticReportEntry =
        actual.getEntry().stream()
            .filter(entry -> entry.getFullUrl().contains("DiagnosticReport/"))
            .findFirst()
            .orElseThrow(
                () -> new AssertionError("Expected to find DiagnosticReport, but not found"));
    assertThat(((DiagnosticReport) diagnosticReportEntry.getResource()).getBasedOn()).hasSize(1);
    assertThat(
            ((DiagnosticReport) diagnosticReportEntry.getResource())
                .getBasedOnFirstRep()
                .getReference())
        .isEqualTo("ServiceRequest/" + testOrderId);
    assertThat(((DiagnosticReport) diagnosticReportEntry.getResource()).getSubject().getReference())
        .isEqualTo("Patient/" + personId);
    assertThat(((DiagnosticReport) diagnosticReportEntry.getResource()).getSpecimen()).hasSize(1);
    assertThat(
            ((DiagnosticReport) diagnosticReportEntry.getResource())
                .getSpecimenFirstRep()
                .getReference())
        .isEqualTo("Specimen/" + specimenTypeId);
    assertThat(((DiagnosticReport) diagnosticReportEntry.getResource()).getResult()).hasSize(1);
    assertThat(
            ((DiagnosticReport) diagnosticReportEntry.getResource())
                .getResultFirstRep()
                .getReference())
        .isEqualTo("Observation/" + resultId);
  }

  @Test
  void testEvent_createFhirBundle_matchesJson() throws IOException {
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
            LocalDate.of(2022, 12, 13),
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

    var providerId = UUID.fromString("ffc07f31-f2af-4728-a247-8cb3aa05ccd0");
    var facilityId = UUID.fromString("1c3d14b9-e222-4a16-9fb2-d9f173034a6a");
    var personId = UUID.fromString("55c53ed2-add5-47fb-884e-b4542ee64589");
    var specimenTypeId = UUID.fromString("725252ea-50ef-46bd-ae79-c70e1d04b949");
    var deviceTypeId = UUID.fromString("48aabd5f-a591-4e0e-9fa2-301d3d5a6df4");
    var covidResultId = UUID.fromString("4163abc1-0a54-4aff-badb-87bb96a89470");
    var fluAResultId = UUID.fromString("f7184a68-c54e-4209-8cc6-5bf5b253e4bd");
    var fluBResultId = UUID.fromString("6db25889-09cb-4127-9330-cc7e7459c1cd");
    var testOrderId = UUID.fromString("cae01b8c-37dc-4c09-a6d4-ae7bcafc9720");
    var testEventId = UUID.fromString("45e9539f-c9a4-4c86-b79d-4ba2c43f9ee0");

    ReflectionTestUtils.setField(provider, "internalId", providerId);
    ReflectionTestUtils.setField(facility, "internalId", facilityId);
    ReflectionTestUtils.setField(patient, "internalId", personId);
    ReflectionTestUtils.setField(specimenType, "internalId", specimenTypeId);
    ReflectionTestUtils.setField(deviceType, "internalId", deviceTypeId);
    ReflectionTestUtils.setField(covidResult, "internalId", covidResultId);
    ReflectionTestUtils.setField(fluAResult, "internalId", fluAResultId);
    ReflectionTestUtils.setField(fluBResult, "internalId", fluBResultId);
    ReflectionTestUtils.setField(testOrder, "internalId", testOrderId);
    ReflectionTestUtils.setField(testEvent, "internalId", testEventId);

    var actual = createFhirBundle(testEvent);

    FhirContext ctx = FhirContext.forR4();
    IParser parser = ctx.newJsonParser();

    String actualSerialized = parser.encodeResourceToString(actual);

    var messageHeaderStart = actualSerialized.indexOf("MessageHeader/") + 14;
    var practitionerRoleStart = actualSerialized.indexOf("PractitionerRole/") + 17;
    var messageHeaderId = actualSerialized.substring(messageHeaderStart, messageHeaderStart + 36);
    var practitionerRoleId =
        actualSerialized.substring(practitionerRoleStart, practitionerRoleStart + 36);

    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/bundle.json")),
            StandardCharsets.UTF_8);

    expectedSerialized = expectedSerialized.replace("$MESSAGE_HEADER_ID", messageHeaderId);
    expectedSerialized = expectedSerialized.replace("$PRACTITIONER_ROLE_ID", practitionerRoleId);

    JSONAssert.assertEquals(actualSerialized, expectedSerialized, false);
  }
}
