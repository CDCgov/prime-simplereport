package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertEmailsToContactPoint;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToAOEObservations;
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
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.createMessageHeader;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.createPractitionerRole;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.createProvenance;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.from;
import static org.junit.jupiter.params.provider.Arguments.arguments;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import ca.uhn.fhir.context.FhirContext;
import ca.uhn.fhir.parser.IParser;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientAnswers;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Map;
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
import org.hl7.fhir.r4.model.DateTimeType;
import org.hl7.fhir.r4.model.Device;
import org.hl7.fhir.r4.model.Device.DeviceNameType;
import org.hl7.fhir.r4.model.DiagnosticReport;
import org.hl7.fhir.r4.model.DiagnosticReport.DiagnosticReportStatus;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.Patient;
import org.hl7.fhir.r4.model.Practitioner;
import org.hl7.fhir.r4.model.PractitionerRole;
import org.hl7.fhir.r4.model.PrimitiveType;
import org.hl7.fhir.r4.model.Reference;
import org.hl7.fhir.r4.model.ServiceRequest;
import org.hl7.fhir.r4.model.ServiceRequest.ServiceRequestIntent;
import org.hl7.fhir.r4.model.ServiceRequest.ServiceRequestStatus;
import org.hl7.fhir.r4.model.Specimen;
import org.hl7.fhir.r4.model.codesystems.ObservationStatus;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.skyscreamer.jsonassert.JSONAssert;
import org.skyscreamer.jsonassert.JSONCompareMode;
import org.springframework.boot.info.GitProperties;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.util.ReflectionTestUtils;

@SpringBootTest
class FhirConverterTest {
  private static final String unknownSystem = "http://terminology.hl7.org/CodeSystem/v3-NullFlavor";
  private static final String raceCodeSystem = "http://terminology.hl7.org/CodeSystem/v3-Race";
  private static final String ethnicitySystem = "http://terminology.hl7.org/CodeSystem/v2-0189";
  private static final String tribalSystemUrl =
      "http://terminology.hl7.org/CodeSystem/v3-TribalEntityUS";
  public static final String snomedCode = "http://snomed.info/sct";
  final FhirContext ctx = FhirContext.forR4();
  final IParser parser = ctx.newJsonParser();

  private static final Instant instant = (new Date(1675891986000L)).toInstant();
  private static GitProperties gitProperties;

  @BeforeAll
  public static void init() {
    gitProperties = mock(GitProperties.class);
    when(gitProperties.getCommitTime()).thenReturn(instant);
    when(gitProperties.getShortCommitId()).thenReturn("FRIDAY");
  }

  @Test
  void convertToHumanName_String_allFields() {
    var actual = convertToHumanName("first", "middle", "last", "jr");
    assertThat(actual.getGiven().stream().map(PrimitiveType::getValue))
        .containsExactly("first", "middle");
    assertThat(actual.getFamily()).isEqualTo("last");
    assertThat(actual.getSuffix().stream().map(PrimitiveType::getValue)).containsOnly("jr");
  }

  @Test
  void convertToHumanName_Strings_nullMiddleName() {
    var actual = convertToHumanName("first", null, "last", "jr");

    assertThat(actual.getGiven().stream().map(PrimitiveType::getValue)).containsExactly("first");
  }

  @Test
  void convertToHumanName_Strings_null() {
    var actual = convertToHumanName(null, null, null, null);

    assertThat(actual.getGiven()).isEmpty();
    assertThat(actual.getFamily()).isNull();
    assertThat(actual.getSuffix()).isEmpty();
  }

  @Test
  void convertPhoneNumbersToContactPoint_ListPhoneNumbers_validList() {
    var phoneNumber = new PhoneNumber(PhoneType.LANDLINE, "2485551234");
    var phoneNumber2 = new PhoneNumber(PhoneType.LANDLINE, "2485551233");

    var actual =
        FhirConverter.convertPhoneNumbersToContactPoint(List.of(phoneNumber, phoneNumber2));
    assertThat(actual).hasSize(2);

    assertThat(actual.stream().map(ContactPoint::getValue))
        .containsOnly("(248) 555 1234", "(248) 555 1233");
  }

  @Test
  void convertToContactPoint_PhoneNumber_validLandline() {
    var phoneNumber = new PhoneNumber(PhoneType.LANDLINE, "2485551234");

    var actual = convertToContactPoint(phoneNumber);

    assertThat(actual.getSystem()).isEqualTo(ContactPointSystem.PHONE);
    assertThat(actual.getUse().toCode()).isEqualTo(ContactPointUse.HOME.toCode());
    assertThat(actual.getValue()).isEqualTo("(248) 555 1234");
  }

  @Test
  void convertToContactPoint_PhoneNumber_validMobile() {
    var actual = convertToContactPoint(ContactPoint.ContactPointUse.MOBILE, "2485551234");

    assertThat(actual.getSystem()).isEqualTo(ContactPointSystem.PHONE);
    assertThat(actual.getUse().toCode()).isEqualTo(ContactPointUse.MOBILE.toCode());
    assertThat(actual.getValue()).isEqualTo("(248) 555 1234");
  }

  @Test
  void convertToContactPoint_ContactPointAndString_invalidNumber() {
    var actual = convertToContactPoint(ContactPoint.ContactPointUse.HOME, "+0333");

    assertThat(actual)
        .returns(ContactPointSystem.PHONE, from(ContactPoint::getSystem))
        .returns("+0333", from(ContactPoint::getValue))
        .returns(
            ContactPointUse.HOME.toCode(),
            from(ContactPoint::getUse).andThen(ContactPoint.ContactPointUse::toCode));
  }

  @Test
  void convertEmailsToContactPoint_valid() {
    var actual =
        convertEmailsToContactPoint(
            ContactPointUse.HOME, List.of("email1@example.com", "email2@example.com"));

    assertThat(actual).hasSize(2);
    assertThat(
            actual.stream()
                .filter(contactPoint -> "email1@example.com".equals(contactPoint.getValue())))
        .hasSize(1);
    assertThat(
            actual.stream()
                .filter(contactPoint -> "email2@example.com".equals(contactPoint.getValue())))
        .hasSize(1);
  }

  @Test
  void convertEmailToContactPoint_valid() {
    var actual =
        FhirConverter.convertEmailToContactPoint(ContactPointUse.WORK, "example@example.com");
    assertThat(actual.getSystem()).isEqualTo(ContactPointSystem.EMAIL);
    assertThat(actual.getValue()).isEqualTo("example@example.com");
    assertThat(actual.getUse()).isEqualTo(ContactPointUse.WORK);
  }

  @Test
  void convertToContactPoint_CodePointUseAndCodePointSystemAndString_valid() {
    var actual = convertToContactPoint(null, ContactPointSystem.EMAIL, "example@example.com");
    assertThat(actual.getUse()).isNull();
    assertThat(actual.getSystem()).isEqualTo(ContactPointSystem.EMAIL);
    assertThat(actual.getValue()).isEqualTo("example@example.com");
  }

  @ParameterizedTest
  @MethodSource("genderArgs")
  void convertToAdministrativeGender_matches(String personGender, AdministrativeGender expected) {
    var actual = convertToAdministrativeGender(personGender);

    assertThat(actual).isEqualTo(expected);
  }

  private static Stream<Arguments> genderArgs() {
    return Stream.of(
        arguments("f", AdministrativeGender.FEMALE),
        arguments("Female", AdministrativeGender.FEMALE),
        arguments("MALE", AdministrativeGender.MALE),
        arguments("M", AdministrativeGender.MALE),
        arguments("fishperson", AdministrativeGender.UNKNOWN));
  }

  @Test
  void convertToAddress_Address_valid() {
    var address =
        new StreetAddress(
            List.of("1234 Main", "Apartment #1"), "MyCity", "MyCounty", "PA", "15025");
    var actual = convertToAddress(address, "USA");
    assertThat(actual.getLine().stream().map(PrimitiveType::getValue))
        .containsExactly("1234 Main", "Apartment #1");
    assertThat(actual.getCity()).isEqualTo(address.getCity());
    assertThat(actual.getDistrict()).isEqualTo(address.getCounty());
    assertThat(actual.getState()).isEqualTo(address.getState());
    assertThat(actual.getPostalCode()).isEqualTo(address.getPostalCode());
  }

  @Test
  void convertToAddress_Strings_valid() {
    var actual =
        convertToAddress(
            List.of("1234 Main", "Apartment #1"), "MyCity", "MyCounty", "PA", "15025", "Canada");
    assertThat(actual.getLine().stream().map(PrimitiveType::getValue))
        .containsExactly("1234 Main", "Apartment #1");
    assertThat(actual.getCity()).isEqualTo("MyCity");
    assertThat(actual.getDistrict()).isEqualTo("MyCounty");
    assertThat(actual.getState()).isEqualTo("PA");
    assertThat(actual.getPostalCode()).isEqualTo("15025");
  }

  @Test
  void convertToAddress_Strings_null() {
    var actual = convertToAddress(null, null, null, null, null, null);
    assertThat(actual.getLine()).isEmpty();
    assertThat(actual.getCity()).isNull();
    assertThat(actual.getDistrict()).isNull();
    assertThat(actual.getState()).isNull();
    assertThat(actual.getPostalCode()).isNull();
  }

  @Test
  void convertToDate_valid() {
    var actual = convertToDate(LocalDate.of(2022, 12, 13));

    assertThat(actual).isEqualToIgnoringHours(new Date(1670936400000L));
  }

  @ParameterizedTest
  @MethodSource("raceArgs")
  void convertToRaceArgs_matches(
      String personRaceValue, String codeSystem, String expectedCode, String expectedText) {
    var actual = convertToRaceExtension(personRaceValue);
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

  @ParameterizedTest
  @MethodSource("ethnicityArgs")
  void convertToEthnicityExtension_matches(
      String ethnicity, String system, String ethnicityCode, String ethnicityDisplay) {

    var actual = convertToEthnicityExtension(ethnicity);
    assert actual != null;
    var codeableConcept = actual.castToCodeableConcept(actual.getValue());
    var coding = codeableConcept.getCoding();
    var text = codeableConcept.getText();

    assertThat(coding).hasSize(1);
    assertThat(coding.get(0).getSystem()).isEqualTo(system);
    assertThat(coding.get(0).getCode()).isEqualTo(ethnicityCode);
    assertThat(coding.get(0).getDisplay()).isEqualTo(ethnicityDisplay);
    assertThat(text).isEqualTo(ethnicityDisplay);
  }

  private static Stream<Arguments> ethnicityArgs() {
    return Stream.of(
        arguments("hispanic", ethnicitySystem, "H", "Hispanic or Latino"),
        arguments("not_hispanic", ethnicitySystem, "N", "Not Hispanic or Latino"),
        arguments("refused", ethnicitySystem, "U", "unknown"),
        arguments("shark", ethnicitySystem, "U", "unknown"));
  }

  @Test
  void convertToEthnicityExtension_String_returnsNullIfEmpty() {
    var actual = convertToEthnicityExtension(null);
    assertThat(actual).isNull();
  }

  @Test
  void convertToTribalAffiliation_String() {
    var actual = convertToTribalAffiliationExtension("1").get();
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
  void convertToTribalAffiliation_List_empty() {
    var actual = convertToTribalAffiliationExtension(Collections.emptyList());
    assertThat(actual).isEmpty();
  }

  @Test
  void convertToTribalAffiliation_List_nullElement() {
    var list = new ArrayList<String>();
    list.add(null);
    var actual = convertToTribalAffiliationExtension(list);
    assertThat(actual).isEmpty();
  }

  @Test
  void convertToPractitioner_Provider_matchesJson() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var provider =
        new Provider(
            new PersonName("Amelia", "Mary", "Earhart", null),
            null,
            new StreetAddress(List.of("223 N Terrace St"), "Atchison", "KS", "66002", null),
            "248 555 1234");
    ReflectionTestUtils.setField(provider, "internalId", UUID.fromString(internalId));

    var actual = convertToPractitioner(provider);

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/practitioner.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(expectedSerialized, actualSerialized, true);
  }

  @Test
  void convertToOrganization_Facility_matchesJson() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var facility =
        new Facility(
            null,
            "Elron",
            "123D456789",
            new StreetAddress(List.of("12 Main Street", "Unit 4"), "Lakewood", "FL", "21037", null),
            "248 555 1234",
            "email@example.com",
            null,
            Collections.emptyList());
    ReflectionTestUtils.setField(facility, "internalId", UUID.fromString(internalId));

    var actual = convertToOrganization(facility);

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/organization.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(expectedSerialized, actualSerialized, true);
  }

  @Test
  void convertToPatient_Person_matchesJson() throws IOException {
    var birthDate = LocalDate.of(2022, 12, 13);
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var person =
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
            null);
    ReflectionTestUtils.setField(
        person,
        "phoneNumbers",
        List.of(
            new PhoneNumber(PhoneType.MOBILE, "304-555-1234"),
            new PhoneNumber(PhoneType.LANDLINE, "3045551233")));
    ReflectionTestUtils.setField(person, "internalId", UUID.fromString(internalId));

    var actual = convertToPatient(person);

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/patient.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(expectedSerialized, actualSerialized, true);
  }

  @Test
  void convertToDevice_Strings_valid() {
    var actual =
        convertToDevice(
            "PHASE Scientific International, Ltd.\n",
            "INDICAID COVID-19 Rapid Antigen Test*",
            "id-123");

    assertThat(actual.getId()).isEqualTo("id-123");
    assertThat(actual.getManufacturer()).isEqualTo("PHASE Scientific International, Ltd.\n");
    assertThat(actual.getDeviceName()).hasSize(1);
    assertThat(actual.getDeviceNameFirstRep().getName())
        .isEqualTo("INDICAID COVID-19 Rapid Antigen Test*");
    assertThat(actual.getDeviceNameFirstRep().getType()).isEqualTo(DeviceNameType.MODELNAME);
  }

  @Test
  void convertToDevice_DeviceType_valid() {
    var internalId = UUID.randomUUID();
    var deviceType = new DeviceType("name", "manufacturer", "model", 15);
    ReflectionTestUtils.setField(deviceType, "internalId", internalId);

    var actual = convertToDevice(deviceType);

    assertThat(actual.getId()).isEqualTo(internalId.toString());
    assertThat(actual.getManufacturer()).isEqualTo("manufacturer");
    assertThat(actual.getDeviceName()).hasSize(1);
    assertThat(actual.getDeviceNameFirstRep().getName()).isEqualTo("model");
    assertThat(actual.getDeviceNameFirstRep().getType()).isEqualTo(DeviceNameType.MODELNAME);
  }

  @Test
  void convertToDevice_DeviceType_matchesJson() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    DeviceType deviceType =
        new DeviceType(
            "name", "BioFire Diagnostics", "BioFire Respiratory Panel 2.1 (RP2.1)*@", 15);
    ReflectionTestUtils.setField(deviceType, "internalId", UUID.fromString(internalId));

    var actual = convertToDevice(deviceType);

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/device.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(expectedSerialized, actualSerialized, true);
  }

  @Test
  void convertToSpecimen_Strings_valid() {
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
  void convertToSpecimen_Strings_null() {
    var actual = convertToSpecimen(null, null, null, null, null);

    assertThat(actual.getId()).isNull();
    assertThat(actual.getType().getText()).isNull();
    assertThat(actual.getType().getCoding()).isEmpty();
    assertThat(actual.getCollection().getBodySite().getText()).isNull();
    assertThat(actual.getCollection().getBodySite().getCoding()).isEmpty();
  }

  @Test
  void convertToSpecimen_SpecimenType_valid() {
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
  void convertToSpecimen_SpecimenType_matchesJson() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    SpecimenType specimenType = new SpecimenType("nasal", "40001", "nose", "10101");
    ReflectionTestUtils.setField(specimenType, "internalId", UUID.fromString(internalId));

    var actual = convertToSpecimen(specimenType);

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/specimen.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(expectedSerialized, actualSerialized, true);
  }

  @Test
  void convertToObservation_Strings_valid() {
    var actual =
        convertToObservation(
            "diseaseCode",
            "diseaseName",
            "resultCode",
            TestCorrectionStatus.ORIGINAL,
            null,
            "id-123",
            TestResult.POSITIVE.toString(),
            "testKitName",
            "equipmentUid",
            "modelName");

    assertThat(actual.getId()).isEqualTo("id-123");
    assertThat(actual.getStatus().getDisplay()).isEqualTo(ObservationStatus.FINAL.getDisplay());
    assertThat(actual.getCode().getText()).isEqualTo("diseaseName");
    assertThat(actual.getCode().getCoding()).hasSize(1);
    assertThat(actual.getCode().getCodingFirstRep().getSystem()).isEqualTo("http://loinc.org");
    assertThat(actual.getCode().getCodingFirstRep().getCode()).isEqualTo("diseaseCode");
    assertThat(actual.getMethod().getExtension()).hasSize(2);
    assertThat(actual.getValueCodeableConcept().getCoding()).hasSize(1);
    assertThat(actual.getValueCodeableConcept().getCodingFirstRep().getSystem())
        .isEqualTo("http://snomed.info/sct");
    assertThat(actual.getValueCodeableConcept().getCodingFirstRep().getCode())
        .isEqualTo("resultCode");
    assertThat(actual.getNote()).isEmpty();
    assertThat(actual.getMethod().getCodingFirstRep().getDisplay()).isEqualTo("modelName");
  }

  @Test
  void convertToObservation_Result_valid() {
    var result =
        new Result(null, null, new SupportedDisease("covid-19", "96741-4"), TestResult.POSITIVE);
    var internalId = UUID.randomUUID();
    ReflectionTestUtils.setField(result, "internalId", internalId);

    var actual =
        convertToObservation(
            result,
            "loinc",
            TestCorrectionStatus.ORIGINAL,
            null,
            "testkitName",
            "equipmentUid",
            "modelName");

    assertThat(actual.getId()).isEqualTo(internalId.toString());
    assertThat(actual.getStatus().getDisplay()).isEqualTo(ObservationStatus.FINAL.getDisplay());
    assertThat(actual.getCode().getText()).isEqualTo("covid-19");
    assertThat(actual.getCode().getCoding()).hasSize(1);
    assertThat(actual.getCode().getCodingFirstRep().getSystem()).isEqualTo("http://loinc.org");
    assertThat(actual.getCode().getCodingFirstRep().getCode()).isEqualTo("loinc");
    assertThat(actual.getValueCodeableConcept().getCoding()).hasSize(1);
    assertThat(actual.getValueCodeableConcept().getCodingFirstRep().getSystem())
        .isEqualTo("http://snomed.info/sct");
    assertThat(actual.getValueCodeableConcept().getCodingFirstRep().getCode())
        .isEqualTo("260373001");
    assertThat(actual.getNote()).isEmpty();
    assertThat(actual.getMethod().getCodingFirstRep().getDisplay()).isEqualTo("modelName");
  }

  @Test
  void convertToObservation_Result_correction() {
    var result =
        new Result(null, null, new SupportedDisease("covid-19", "96741-4"), TestResult.POSITIVE);
    var internalId = UUID.randomUUID();
    ReflectionTestUtils.setField(result, "internalId", internalId);

    var actual =
        convertToObservation(
            result,
            "loinc",
            TestCorrectionStatus.CORRECTED,
            "Oopsy Daisy",
            "testkitName",
            "equipmentUid",
            "modelName");

    assertThat(actual.getId()).isEqualTo(internalId.toString());
    assertThat(actual.getStatus().getDisplay()).isEqualTo(ObservationStatus.CORRECTED.getDisplay());
    assertThat(actual.getNote()).hasSize(1);
    assertThat(actual.getNoteFirstRep().getText()).isEqualTo("Corrected Result: Oopsy Daisy");
  }

  @Test
  void convertToObservation_Result_removeWithoutReason() {
    var result =
        new Result(null, null, new SupportedDisease("covid-19", "96741-4"), TestResult.POSITIVE);
    var internalId = UUID.randomUUID();
    ReflectionTestUtils.setField(result, "internalId", internalId);

    var actual =
        convertToObservation(
            result,
            "loinc",
            TestCorrectionStatus.REMOVED,
            null,
            "testkitName",
            "equipmentUid",
            "modelName");

    assertThat(actual.getId()).isEqualTo(internalId.toString());
    assertThat(actual.getStatus().getDisplay())
        .isEqualTo(ObservationStatus.ENTEREDINERROR.getDisplay());
    assertThat(actual.getNote()).hasSize(1);
    assertThat(actual.getNoteFirstRep().getText()).isEqualTo("Corrected Result");
  }

  @Test
  void convertToObservation_Result_null() {
    var actual =
        convertToObservation(
            null,
            "",
            TestCorrectionStatus.ORIGINAL,
            null,
            "testkitName",
            "equipmentUid",
            "modelName");

    assertThat(actual).isNull();
  }

  @Test
  void convertToObservation_Result_nullDisease() {
    var actual =
        convertToObservation(
            new Result(null, null, null, TestResult.POSITIVE),
            "",
            TestCorrectionStatus.ORIGINAL,
            null,
            "testkitName",
            "equipmentUid",
            "modelName");

    assertThat(actual).isNull();
  }

  @Test
  void convertToObservation_Result_matchesJson() throws IOException {
    var covidId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var fluId = "302a7919-b699-4e0d-95ca-5fd2e3fcaf7a";
    var covidDisease = new SupportedDisease("COVID-19", "96741-4");
    var fluDisease = new SupportedDisease("FLU A", "LP14239-5");
    var testOrder = TestDataBuilder.createTestOrderWithDevice();
    var covidResult = new Result(testOrder, covidDisease, TestResult.POSITIVE);
    var fluResult = new Result(testOrder, fluDisease, TestResult.NEGATIVE);
    ReflectionTestUtils.setField(covidResult, "internalId", UUID.fromString(covidId));
    ReflectionTestUtils.setField(fluResult, "internalId", UUID.fromString(fluId));
    var device = DeviceType.builder().build();
    var covidDiseaseTestPerformedCode =
        new DeviceTypeDisease(
            null, covidDisease, "94500-6", "covidEquipmentUID", "covidTestkitNameId", "94500-0");
    var fluDiseaseTestPerformedCode =
        new DeviceTypeDisease(
            null, fluDisease, "85477-8", "fluEquipmentUID", "fluTestkitNameId", "85477-0");
    ReflectionTestUtils.setField(
        device,
        "supportedDiseaseTestPerformed",
        List.of(covidDiseaseTestPerformedCode, fluDiseaseTestPerformedCode));
    ReflectionTestUtils.setField(device, "model", "deviceModel");

    var actual =
        convertToObservation(
            Set.of(covidResult, fluResult), device, TestCorrectionStatus.ORIGINAL, null);

    assertThat(actual).hasSize(2);
    String covidSerialized =
        parser.encodeResourceToString(
            actual.stream()
                .filter(
                    observation ->
                        observation.getCode().getCodingFirstRep().is("http://loinc.org", "94500-6"))
                .findFirst()
                .orElse(null));
    String fluSerialized =
        parser.encodeResourceToString(
            actual.stream()
                .filter(
                    observation ->
                        observation.getCode().getCodingFirstRep().is("http://loinc.org", "85477-8"))
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
  void convertToObservation_Result_correctionMatchesJson() throws IOException {
    var covidDisease = new SupportedDisease("COVID-19", "96741-4");
    var id = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var testOrder = TestDataBuilder.createTestOrderWithDevice();
    var result = new Result(testOrder, covidDisease, TestResult.NEGATIVE);
    var device = DeviceType.builder().build();
    var covidDiseaseTestPerformedCode =
        new DeviceTypeDisease(
            null, covidDisease, "94500-6", "covidEquipmentUID", "covidTestkitNameId", "94500-0");

    ReflectionTestUtils.setField(result, "internalId", UUID.fromString(id));
    ReflectionTestUtils.setField(
        device, "supportedDiseaseTestPerformed", List.of(covidDiseaseTestPerformedCode));

    var actual =
        convertToObservation(Set.of(result), device, TestCorrectionStatus.CORRECTED, "woops");

    String actualSerialized = parser.encodeResourceToString(actual.get(0));
    var expectedSerialized1 =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/observationCorrection.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(expectedSerialized1, actualSerialized, true);
  }

  @Test
  void convertToAoeObservation_noSymptoms_matchesJson() throws IOException {
    var answers = new AskOnEntrySurvey(null, Map.of("fake", false), true, null);
    String testId = "fakeId";

    var actual = convertToAOEObservations(testId, answers);

    String actualSerialized =
        actual.stream().map(parser::encodeResourceToString).collect(Collectors.toSet()).toString();
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/observationNoSymptoms.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(expectedSerialized, actualSerialized, true);
  }

  @Test
  void convertToAoeObservation_symptomatic_matchesJson() throws IOException {
    var answers = new AskOnEntrySurvey(null, Map.of("fake", true), false, LocalDate.of(2023, 3, 4));
    String testId = "fakeId";

    var actual = convertToAOEObservations(testId, answers);

    String actualSerialized =
        actual.stream().map(parser::encodeResourceToString).collect(Collectors.toSet()).toString();
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass()
                    .getClassLoader()
                    .getResourceAsStream("fhir/observationSymptomatic.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(expectedSerialized, actualSerialized, true);
  }

  @Test
  void convertToAoeObservation_noAnswer_matchesJson() throws IOException {
    var answers = new AskOnEntrySurvey(null, Map.of("fake", false), false, null);
    String testId = "fakeId";

    var actual = convertToAOEObservations(testId, answers);

    String actualSerialized =
        actual.stream().map(parser::encodeResourceToString).collect(Collectors.toSet()).toString();
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass()
                    .getClassLoader()
                    .getResourceAsStream("fhir/observationNoAoeAnswer.json")),
            StandardCharsets.UTF_8);
    JSONAssert.assertEquals(expectedSerialized, actualSerialized, true);
  }

  @Test
  void convertToDiagnosticReport_TestEvent_valid() {
    var testEvent = TestDataBuilder.createEmptyTestEventWithValidDevice();
    ReflectionTestUtils.setField(
        testEvent, "deviceType", TestDataBuilder.createDeviceTypeForMultiplex());
    var actual = convertToDiagnosticReport(testEvent);

    assertThat(actual.getStatus()).isEqualTo(DiagnosticReportStatus.FINAL);
    assertThat(actual.getCode().getCoding()).hasSize(1);
    assertThat(actual.getCode().getCodingFirstRep().getSystem()).isEqualTo("http://loinc.org");
    assertThat(actual.getCode().getCodingFirstRep().getCode()).isEqualTo("95422-2");
  }

  @Test
  void convertToDiagnosticReport_TestEvent_correctedTestEvent() {
    var invalidTestEvent = TestDataBuilder.createEmptyTestEvent();
    var correctedTestEvent =
        new TestEvent(
            invalidTestEvent, TestCorrectionStatus.CORRECTED, "typo", Collections.emptySet());

    var actual = convertToDiagnosticReport(correctedTestEvent);

    assertThat(actual.getStatus()).isEqualTo(DiagnosticReportStatus.CORRECTED);
  }

  @Test
  void convertToDiagnosticReport_TestEvent_removedTestEvent() {
    var invalidTestEvent = TestDataBuilder.createEmptyTestEvent();
    var correctedTestEvent =
        new TestEvent(
            invalidTestEvent, TestCorrectionStatus.REMOVED, "wrong person", Collections.emptySet());

    var actual = convertToDiagnosticReport(correctedTestEvent);

    assertThat(actual.getStatus()).isEqualTo(DiagnosticReportStatus.ENTEREDINERROR);
  }

  @Test
  void convertToDiagnosticReport_TestEvent_matchesJson() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var testEvent = TestDataBuilder.createEmptyTestEventWithValidDevice();
    var date = new Date();
    ReflectionTestUtils.setField(testEvent, "internalId", UUID.fromString(internalId));
    ReflectionTestUtils.setField(testEvent, "createdAt", date);
    ReflectionTestUtils.setField(
        testEvent, "deviceType", TestDataBuilder.createDeviceTypeForMultiplex());

    var actual = convertToDiagnosticReport(testEvent);

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/diagnosticReport.json")),
            StandardCharsets.UTF_8);
    expectedSerialized =
        expectedSerialized.replace(
            "$EFFECTIVE_DATE_TIME_TESTED", new DateTimeType(date).getValueAsString());

    JSONAssert.assertEquals(expectedSerialized, actualSerialized, true);
  }

  @Test
  void convertToDiagnosticReport_Strings_valid() {
    var date = new Date();
    var actual =
        convertToDiagnosticReport(DiagnosticReportStatus.FINAL, "95422-2", "id-123", date, date);

    assertThat(actual.getId()).isEqualTo("id-123");
    assertThat(actual.getStatus()).isEqualTo(DiagnosticReportStatus.FINAL);
    assertThat(actual.getCode().getCoding()).hasSize(1);
    assertThat(actual.getCode().getCodingFirstRep().getSystem()).isEqualTo("http://loinc.org");
    assertThat(actual.getCode().getCodingFirstRep().getCode()).isEqualTo("95422-2");
    assertThat(((DateTimeType) actual.getEffective()).getAsV3())
        .isEqualTo(new DateTimeType(date).getAsV3());
    assertThat((actual.getIssued())).isEqualTo(date);
  }

  @Test
  void convertToDiagnosticReport_Strings_null() {
    var actual = convertToDiagnosticReport(null, null, null, null, null);

    assertThat(actual.getId()).isNull();
    assertThat(actual.getStatus()).isNull();
    assertThat(actual.getCode().getCoding()).isEmpty();
  }

  @Test
  void convertToServiceRequest_TestOrder_valid() {
    var testOrder = TestDataBuilder.createTestOrderWithMultiplexDevice();
    var actual = convertToServiceRequest(testOrder);

    assertThat(actual.getStatus()).isEqualTo(ServiceRequestStatus.ACTIVE);
    assertThat(actual.getIntent()).isEqualTo(ServiceRequestIntent.ORDER);
    assertThat(actual.getCode().getCoding()).hasSize(1);
    assertThat(actual.getCode().getCodingFirstRep().getSystem()).isEqualTo("http://loinc.org");
    assertThat(actual.getCode().getCodingFirstRep().getCode()).isEqualTo("95422-2");
    assertThat(actual.getExtension()).hasSize(1);
    assertThat(
            actual
                .castToCodeableConcept(
                    actual
                        .getExtensionByUrl(
                            "https://reportstream.cdc.gov/fhir/StructureDefinition/order-control")
                        .getValue())
                .getCoding()
                .get(0)
                .getCode())
        .isEqualTo("RE");
    assertThat(
            actual
                .castToCodeableConcept(
                    actual
                        .getExtensionByUrl(
                            "https://reportstream.cdc.gov/fhir/StructureDefinition/order-control")
                        .getValue())
                .getCoding()
                .get(0)
                .getSystem())
        .isEqualTo("http://terminology.hl7.org/CodeSystem/v2-0119");
  }

  @Test
  void convertToServiceRequest_TestOrder_complete() {
    var testOrder =
        new TestOrder(
            TestDataBuilder.createEmptyPerson(true), TestDataBuilder.createEmptyFacility(true));
    testOrder.markComplete();
    var actual = convertToServiceRequest(testOrder);

    assertThat(actual.getStatus()).isEqualTo(ServiceRequestStatus.COMPLETED);
  }

  @Test
  void convertToServiceRequest_TestOrder_cancelled() {
    var testOrder =
        new TestOrder(
            TestDataBuilder.createEmptyPerson(true), TestDataBuilder.createEmptyFacility(true));
    testOrder.cancelOrder();
    var actual = convertToServiceRequest(testOrder);

    assertThat(actual.getStatus()).isEqualTo(ServiceRequestStatus.REVOKED);
  }

  @Test
  void convertToServiceRequest_TestOrder_nullDeviceType() {
    var testOrder =
        new TestOrder(
            TestDataBuilder.createEmptyPerson(true), TestDataBuilder.createEmptyFacility(false));
    testOrder.cancelOrder();
    var actual = convertToServiceRequest(testOrder);

    assertThat(actual.getCode().getCoding()).isEmpty();
  }

  @Test
  void convertToServiceRequest_Strings_valid() {
    var actual = convertToServiceRequest(ServiceRequestStatus.COMPLETED, "94533-7", "id-123");
    assertThat(actual.getId()).isEqualTo("id-123");
    assertThat(actual.getStatus()).isEqualTo(ServiceRequestStatus.COMPLETED);
    assertThat(actual.getCode().getCoding()).hasSize(1);
    assertThat(actual.getCode().getCodingFirstRep().getSystem()).isEqualTo("http://loinc.org");
    assertThat(actual.getCode().getCodingFirstRep().getCode()).isEqualTo("94533-7");
  }

  @Test
  void convertToServiceRequest_Strings_null() {
    var actual = convertToServiceRequest(null, null, null);
    assertThat(actual.getId()).isNull();
    assertThat(actual.getStatus()).isNull();
    assertThat(actual.getCode().getCoding()).isEmpty();
  }

  @Test
  void convertToServiceRequest_TestOrder_matchesJson() throws IOException {
    var internalId = "3c9c7370-e2e3-49ad-bb7a-f6005f41cf29";
    var testOrder = TestDataBuilder.createTestOrderWithMultiplexDevice();
    testOrder.markComplete();
    ReflectionTestUtils.setField(testOrder, "internalId", UUID.fromString(internalId));

    var actual = convertToServiceRequest(testOrder);

    String actualSerialized = parser.encodeResourceToString(actual);
    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/serviceRequest.json")),
            StandardCharsets.UTF_8);

    JSONAssert.assertEquals(expectedSerialized, actualSerialized, true);
  }

  @Test
  void createPractitionerRole_valid() {
    var practitionerRole =
        createPractitionerRole("Organization/org-id", "Practitioner/practitioner-id");

    assertThat(practitionerRole.getOrganization().getReference()).isEqualTo("Organization/org-id");
    assertThat(practitionerRole.getPractitioner().getReference())
        .isEqualTo("Practitioner/practitioner-id");
  }

  @Test
  void createMessageHeader_valid() {
    var messageHeader =
        createMessageHeader(
            "Organization/org-id", "mainResource", "provenance", gitProperties, "P");

    assertThat(messageHeader.getEventCoding().getSystem())
        .isEqualTo("http://terminology.hl7.org/CodeSystem/v2-0003");
    assertThat(messageHeader.getEventCoding().getCode()).isEqualTo("R01");
    assertThat(messageHeader.getEventCoding().getDisplay())
        .isEqualTo("ORU/ACK - Unsolicited transmission of an observation message");
    assertThat(messageHeader.getSource().getSoftware()).isEqualTo("PRIME SimpleReport");
    assertThat(messageHeader.getSource().getEndpoint()).isEqualTo("https://simplereport.gov");
    assertThat(messageHeader.getSource().getVersion()).isEqualTo("FRIDAY");
    assertThat(messageHeader.getSender().getReference()).isEqualTo("Organization/org-id");
    assertThat(messageHeader.getFocus()).hasSize(2);
    assertThat(messageHeader.getFocus().stream().map(Reference::getReference))
        .contains("mainResource", "provenance");
    assertThat(messageHeader.getSource().getExtension()).hasSize(3);
    assertThat(
            ((Reference)
                    messageHeader
                        .getSource()
                        .getExtensionByUrl(
                            "https://reportstream.cdc.gov/fhir/StructureDefinition/software-vendor-org")
                        .getValue())
                .getReference())
        .isEqualTo("Organization/07640c5d-87cd-488b-9343-a226c5166539");
    assertThat(
            messageHeader
                .getSource()
                .getExtensionByUrl(
                    "https://reportstream.cdc.gov/fhir/StructureDefinition/software-install-date")
                .getValueAsPrimitive()
                .getValue())
        .isEqualTo(Date.from(instant.truncatedTo(ChronoUnit.MILLIS)));
    assertThat(
            messageHeader
                .getSource()
                .getExtensionByUrl(
                    "https://reportstream.cdc.gov/fhir/StructureDefinition/software-binary-id")
                .getValueAsPrimitive()
                .getValueAsString())
        .isEqualTo("FRIDAY");
    assertThat(messageHeader.getMeta().getTag()).hasSize(1);
    assertThat(messageHeader.getMeta().getTag().get(0).getCode()).isEqualTo("P");
    assertThat(messageHeader.getMeta().getTag().get(0).getDisplay()).isEqualTo("Production");
    assertThat(messageHeader.getMeta().getTag().get(0).getSystem())
        .isEqualTo("http://terminology.hl7.org/CodeSystem/v2-0103");
  }

  @Test
  void createProvenance_valid() {
    var date = new Date();
    var provenance = createProvenance("Organization/org-id", date);

    assertThat(provenance.getActivity().getCoding()).hasSize(1);
    assertThat(provenance.getActivity().getCodingFirstRep().getCode()).isEqualTo("R01");
    assertThat(provenance.getActivity().getCodingFirstRep().getSystem())
        .isEqualTo("http://terminology.hl7.org/CodeSystem/v2-0003");
    assertThat(provenance.getActivity().getCodingFirstRep().getDisplay())
        .isEqualTo("ORU/ACK - Unsolicited transmission of an observation message");
    assertThat(provenance.getAgentFirstRep().getWho().getReference())
        .isEqualTo("Organization/org-id");
    assertThat(provenance.getRecorded()).isEqualTo(date);
  }

  @Test
  void createFhirBundle_TestEvent_valid() {
    var patient = new Patient();
    var organization = new org.hl7.fhir.r4.model.Organization();
    var practitioner = new Practitioner();
    var device = new Device();
    var specimen = new Specimen();
    var observation = new Observation();
    var aoeobservation1 = new Observation();
    var aoeobservation2 = new Observation();
    var serviceRequest = new ServiceRequest();
    var diagnosticReport = new DiagnosticReport();
    var date = new Date();
    patient.setId(UUID.randomUUID().toString());
    organization.setId(UUID.randomUUID().toString());
    practitioner.setId(UUID.randomUUID().toString());
    device.setId(UUID.randomUUID().toString());
    specimen.setId(UUID.randomUUID().toString());
    observation.setId(UUID.randomUUID().toString());
    aoeobservation1.setId(UUID.randomUUID().toString());
    aoeobservation2.setId(UUID.randomUUID().toString());
    serviceRequest.setId(UUID.randomUUID().toString());
    diagnosticReport.setId(UUID.randomUUID().toString());

    var actual =
        createFhirBundle(
            patient,
            organization,
            null,
            practitioner,
            device,
            specimen,
            List.of(observation),
            Set.of(aoeobservation1, aoeobservation2),
            serviceRequest,
            diagnosticReport,
            date,
            gitProperties,
            "P");

    var resourceUrls =
        actual.getEntry().stream()
            .map(BundleEntryComponent::getFullUrl)
            .collect(Collectors.toList());

    assertThat(actual.getTimestamp()).isEqualTo(date);
    assertThat(actual.getType()).isEqualTo(BundleType.MESSAGE);
    assertThat(actual.getIdentifier().getValue()).isEqualTo(diagnosticReport.getId());
    assertThat(actual.getEntry()).hasSize(14);
    assertThat(resourceUrls)
        .hasSize(14)
        .contains(
            "Patient/" + patient.getId(),
            "Organization/" + organization.getId(),
            "Practitioner/" + practitioner.getId(),
            "Specimen/" + specimen.getId(),
            "Observation/" + observation.getId(),
            "Observation/" + aoeobservation1.getId(),
            "Observation/" + aoeobservation2.getId(),
            "ServiceRequest/" + serviceRequest.getId(),
            "DiagnosticReport/" + diagnosticReport.getId(),
            "Device/" + device.getId(),
            "Organization/07640c5d-87cd-488b-9343-a226c5166539");

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
        .isEqualTo("Practitioner/" + practitioner.getId());
    assertThat(
            ((PractitionerRole) practitionerRoleEntry.getResource())
                .getOrganization()
                .getReference())
        .isEqualTo("Organization/" + organization.getId());

    var specimenEntry =
        actual.getEntry().stream()
            .filter(entry -> entry.getFullUrl().contains("Specimen/"))
            .findFirst()
            .orElseThrow(() -> new AssertionError("Expected to find Specimen, but not found"));
    assertThat(((Specimen) specimenEntry.getResource()).getSubject().getReference())
        .isEqualTo("Patient/" + patient.getId());

    var observationEntry =
        actual.getEntry().stream()
            .filter(entry -> entry.getFullUrl().contains("Observation/" + observation.getId()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("Expected to find Observation, but not found"));
    assertThat(((Observation) observationEntry.getResource()).getSubject().getReference())
        .isEqualTo("Patient/" + patient.getId());
    assertThat(((Observation) observationEntry.getResource()).getPerformer()).hasSize(1);
    assertThat(((Observation) observationEntry.getResource()).getPerformerFirstRep().getReference())
        .isEqualTo("Organization/" + organization.getId());
    assertThat(((Observation) observationEntry.getResource()).getSpecimen().getReference())
        .isEqualTo("Specimen/" + specimen.getId());
    assertThat(((Observation) observationEntry.getResource()).getDevice().getReference())
        .isEqualTo("Device/" + device.getId());

    var aoeObservationEntry1 =
        actual.getEntry().stream()
            .filter(entry -> entry.getFullUrl().contains("Observation/" + aoeobservation1.getId()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("Expected to find Observation, but not found"));
    assertThat(((Observation) aoeObservationEntry1.getResource()).getSubject().getReference())
        .isEqualTo("Patient/" + patient.getId());

    var aoeObservationEntry2 =
        actual.getEntry().stream()
            .filter(entry -> entry.getFullUrl().contains("Observation/" + aoeobservation2.getId()))
            .findFirst()
            .orElseThrow(() -> new AssertionError("Expected to find Observation, but not found"));
    assertThat(((Observation) aoeObservationEntry2.getResource()).getSubject().getReference())
        .isEqualTo("Patient/" + patient.getId());

    var serviceRequestEntry =
        actual.getEntry().stream()
            .filter(entry -> entry.getFullUrl().contains("ServiceRequest/"))
            .findFirst()
            .orElseThrow(
                () -> new AssertionError("Expected to find ServiceRequest, but not found"));
    assertThat(((ServiceRequest) serviceRequestEntry.getResource()).getSubject().getReference())
        .isEqualTo("Patient/" + patient.getId());
    assertThat(((ServiceRequest) serviceRequestEntry.getResource()).getPerformer()).hasSize(1);
    assertThat(
            ((ServiceRequest) serviceRequestEntry.getResource())
                .getPerformerFirstRep()
                .getReference())
        .isEqualTo("Organization/" + organization.getId());
    assertThat(((ServiceRequest) serviceRequestEntry.getResource()).getRequester().getReference())
        .contains("PractitionerRole/");
    assertThat(
            ((ServiceRequest) serviceRequestEntry.getResource())
                .getSupportingInfo().stream()
                    .allMatch(r -> r.getReference().contains("Observation/")))
        .isTrue();
    assertThat(((ServiceRequest) serviceRequestEntry.getResource()).getSupportingInfo().size())
        .isEqualTo(2);

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
        .isEqualTo("ServiceRequest/" + serviceRequest.getId());
    assertThat(((DiagnosticReport) diagnosticReportEntry.getResource()).getSubject().getReference())
        .isEqualTo("Patient/" + patient.getId());
    assertThat(((DiagnosticReport) diagnosticReportEntry.getResource()).getSpecimen()).hasSize(1);
    assertThat(
            ((DiagnosticReport) diagnosticReportEntry.getResource())
                .getSpecimenFirstRep()
                .getReference())
        .isEqualTo("Specimen/" + specimen.getId());
    assertThat(((DiagnosticReport) diagnosticReportEntry.getResource()).getResult()).hasSize(1);
    assertThat(
            ((DiagnosticReport) diagnosticReportEntry.getResource())
                .getResultFirstRep()
                .getReference())
        .isEqualTo("Observation/" + observation.getId());
  }

  @Test
  void createFhirBundle_TestEvent_matchesJson() throws IOException {
    var covidDisease = new SupportedDisease("COVID-19", "987-1");
    var fluADisease = new SupportedDisease("FLU A", "LP 123");
    var fluBDisease = new SupportedDisease("FLU B", "LP 456");
    var address = new StreetAddress(List.of("1 Main St"), "Chicago", "IL", "60614", "");
    List<DeviceTypeDisease> supportedTestOrders = new ArrayList<>();
    supportedTestOrders.add(TestDataBuilder.createDeviceTypeDisease(covidDisease));
    supportedTestOrders.add(TestDataBuilder.createDeviceTypeDisease(fluADisease));
    supportedTestOrders.add(TestDataBuilder.createDeviceTypeDisease(fluBDisease));
    var deviceType =
        new DeviceType("name", "manufacturer", "model", 0, new ArrayList<>(), supportedTestOrders);

    var specimenType = new SpecimenType("name", "typeCode");
    var provider =
        new Provider(new PersonName("Michaela", null, "Quinn", ""), "1", address, "7735551235");
    var organization = new Organization("District", "school", "1", true);
    var facility =
        new Facility(
            organization,
            "School",
            "123D456789",
            address,
            "7735551234",
            "school@example.com",
            provider,
            deviceType,
            specimenType,
            Collections.emptyList());
    var person =
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
    var testOrder = new TestOrder(person, facility);
    var answers =
        new PatientAnswers(new AskOnEntrySurvey(null, Map.of("fake", false), false, null));
    testOrder.setAskOnEntrySurvey(answers);

    var covidResult = new Result(testOrder, covidDisease, TestResult.POSITIVE);
    var fluAResult = new Result(testOrder, fluADisease, TestResult.NEGATIVE);
    var fluBResult = new Result(testOrder, fluBDisease, TestResult.UNDETERMINED);
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
    var testPerformedCodesList =
        List.of(
            new DeviceTypeDisease(
                deviceTypeId, covidDisease, "333-123", "equipmentUID1", "testkitNameId1", null),
            new DeviceTypeDisease(
                deviceTypeId, fluADisease, "444-123", "equipmentUID2", "testkitNameId2", "95422-2"),
            new DeviceTypeDisease(
                deviceTypeId,
                fluBDisease,
                "444-456",
                "equipmentUID3",
                "testkitNameId3",
                "95422-2"));
    var date = new Date();
    var dateTested = new Date();
    ReflectionTestUtils.setField(provider, "internalId", providerId);
    ReflectionTestUtils.setField(facility, "internalId", facilityId);
    ReflectionTestUtils.setField(person, "internalId", personId);
    ReflectionTestUtils.setField(specimenType, "internalId", specimenTypeId);
    ReflectionTestUtils.setField(deviceType, "internalId", deviceTypeId);
    ReflectionTestUtils.setField(
        deviceType, "supportedDiseaseTestPerformed", testPerformedCodesList);
    ReflectionTestUtils.setField(covidResult, "internalId", covidResultId);
    ReflectionTestUtils.setField(fluAResult, "internalId", fluAResultId);
    ReflectionTestUtils.setField(fluBResult, "internalId", fluBResultId);
    ReflectionTestUtils.setField(testOrder, "internalId", testOrderId);
    ReflectionTestUtils.setField(testEvent, "internalId", testEventId);
    ReflectionTestUtils.setField(testEvent, "createdAt", dateTested);
    ReflectionTestUtils.setField(
        person, "phoneNumbers", List.of(new PhoneNumber(PhoneType.LANDLINE, "7735551234")));

    var actual = createFhirBundle(testEvent, gitProperties, date, "P");

    String actualSerialized = parser.encodeResourceToString(actual);

    var messageHeaderStart = actualSerialized.indexOf("MessageHeader/") + 14;
    var practitionerRoleStart = actualSerialized.indexOf("PractitionerRole/") + 17;
    var provenanceStart = actualSerialized.indexOf("Provenance/") + 11;
    var messageHeaderId = actualSerialized.substring(messageHeaderStart, messageHeaderStart + 36);
    var practitionerRoleId =
        actualSerialized.substring(practitionerRoleStart, practitionerRoleStart + 36);
    var provenanceId = actualSerialized.substring(provenanceStart, provenanceStart + 36);

    var expectedSerialized =
        IOUtils.toString(
            Objects.requireNonNull(
                getClass().getClassLoader().getResourceAsStream("fhir/bundle.json")),
            StandardCharsets.UTF_8);

    expectedSerialized = expectedSerialized.replace("$MESSAGE_HEADER_ID", messageHeaderId);
    expectedSerialized = expectedSerialized.replace("$PRACTITIONER_ROLE_ID", practitionerRoleId);
    expectedSerialized = expectedSerialized.replace("$PROVENANCE_ID", provenanceId);
    expectedSerialized =
        expectedSerialized.replace(
            "$EFFECTIVE_DATE_TIME_TESTED", new DateTimeType(dateTested).getValueAsString());
    expectedSerialized =
        expectedSerialized.replace(
            "$PROVENANCE_RECORDED_DATE",
            OffsetDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault())
                .format(DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm:ss.SSSxxx")));
    expectedSerialized =
        expectedSerialized.replace(
            "$BUNDLE_TIMESTAMP",
            OffsetDateTime.ofInstant(date.toInstant(), ZoneId.systemDefault())
                .format(DateTimeFormatter.ofPattern("uuuu-MM-dd'T'HH:mm:ss.SSSxxx")));
    JSONAssert.assertEquals(expectedSerialized, actualSerialized, JSONCompareMode.NON_EXTENSIBLE);
  }
}
