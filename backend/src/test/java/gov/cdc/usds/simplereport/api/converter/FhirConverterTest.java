package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToAddress;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToAdministrativeGender;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToContactPoint;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToDate;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToEthnicityExtension;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToHumanName;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToRaceExtension;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.convertToTribalAffiliationExtension;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.createFhirBundle;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.emailToContactPoint;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.getMessageHeader;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.getPractitionerRole;
import static gov.cdc.usds.simplereport.api.converter.FhirConverter.phoneNumberToContactPoint;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.from;
import static org.junit.jupiter.params.provider.Arguments.arguments;

import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import org.hl7.fhir.r4.model.Bundle.BundleEntryComponent;
import org.hl7.fhir.r4.model.Bundle.BundleType;
import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointUse;
import org.hl7.fhir.r4.model.DiagnosticReport;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.PractitionerRole;
import org.hl7.fhir.r4.model.PrimitiveType;
import org.hl7.fhir.r4.model.ServiceRequest;
import org.hl7.fhir.r4.model.Specimen;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.test.util.ReflectionTestUtils;

class FhirConverterTest {
  private static final String unknownSystem = "http://terminology.hl7.org/CodeSystem/v3-NullFlavor";
  private static final String raceCodeSystem = "http://terminology.hl7.org/CodeSystem/v3-Race";
  private static final String ethnicitySystem = "urn:oid:2.16.840.1.113883.6.238";
  private static final String tribalSystemUrl =
      "http://terminology.hl7.org/CodeSystem/v3-TribalEntityUS";

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
    var person =
        new Person(
            null, null, "Julia", "Fiona", "Roberts", null, null, null, null, null, null, null, null,
            null, null, "female", null, null, null, null);
    var deviceType = new DeviceType("", "", null, null, null, 0);
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
            person.toFhir(), facility.toFhir(), provider.toFhir(), null, null, null, null, null);

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
            "ServiceRequest/" + testEventId,
            "DiagnosticReport/" + testOrderId,
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
        .isEqualTo("Result/" + resultId);
  }
}
