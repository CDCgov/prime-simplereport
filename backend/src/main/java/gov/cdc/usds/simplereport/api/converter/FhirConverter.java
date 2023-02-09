package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.converter.FhirConstants.DEFAULT_COUNTRY;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ETHNICITY_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ETHNICITY_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.EVENT_TYPE_CODE;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.EVENT_TYPE_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.EVENT_TYPE_DISPLAY;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NULL_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.RACE_CODING_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.RACE_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.SNOMED_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.TRIBAL_AFFILIATION_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.TRIBAL_AFFILIATION_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.TRIBAL_AFFILIATION_STRING;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat;
import gov.cdc.usds.simplereport.api.MappingConstants;
import gov.cdc.usds.simplereport.db.model.DeviceTestPerformedLoincCode;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PersonUtils;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.hl7.fhir.r4.model.Address;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Bundle.BundleEntryComponent;
import org.hl7.fhir.r4.model.Bundle.BundleType;
import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointUse;
import org.hl7.fhir.r4.model.Device;
import org.hl7.fhir.r4.model.Device.DeviceDeviceNameComponent;
import org.hl7.fhir.r4.model.Device.DeviceNameType;
import org.hl7.fhir.r4.model.DiagnosticReport;
import org.hl7.fhir.r4.model.DiagnosticReport.DiagnosticReportStatus;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.hl7.fhir.r4.model.Extension;
import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.Identifier;
import org.hl7.fhir.r4.model.InstantType;
import org.hl7.fhir.r4.model.MessageHeader;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.Observation.ObservationStatus;
import org.hl7.fhir.r4.model.Organization;
import org.hl7.fhir.r4.model.Patient;
import org.hl7.fhir.r4.model.Practitioner;
import org.hl7.fhir.r4.model.PractitionerRole;
import org.hl7.fhir.r4.model.Provenance;
import org.hl7.fhir.r4.model.Reference;
import org.hl7.fhir.r4.model.Resource;
import org.hl7.fhir.r4.model.ResourceType;
import org.hl7.fhir.r4.model.ServiceRequest;
import org.hl7.fhir.r4.model.ServiceRequest.ServiceRequestIntent;
import org.hl7.fhir.r4.model.ServiceRequest.ServiceRequestStatus;
import org.hl7.fhir.r4.model.Specimen;
import org.hl7.fhir.r4.model.StringType;
import org.springframework.boot.info.GitProperties;
import org.springframework.data.util.Pair;
import org.springframework.util.CollectionUtils;

@Slf4j
public class FhirConverter {
  private FhirConverter() {
    throw new IllegalStateException("Utility class");
  }

  private static final String SIMPLE_REPORT_ORG_ID = "07640c5d-87cd-488b-9343-a226c5166539";

  public static HumanName convertToHumanName(@NotNull PersonName personName) {
    return convertToHumanName(
        personName.getFirstName(),
        personName.getMiddleName(),
        personName.getLastName(),
        personName.getSuffix());
  }

  public static HumanName convertToHumanName(
      String first, String middle, String last, String suffix) {
    var humanName = new HumanName();
    if (StringUtils.isNotBlank(first)) {
      humanName.addGiven(first);
    }
    if (StringUtils.isNotBlank(middle)) {
      humanName.addGiven(middle);
    }
    if (StringUtils.isNotBlank(last)) {
      humanName.setFamily(last);
    }
    if (StringUtils.isNotBlank(suffix)) {
      humanName.addSuffix(suffix);
    }
    return humanName;
  }

  public static List<ContactPoint> convertPhoneNumbersToContactPoint(
      @NotNull List<PhoneNumber> phoneNumber) {
    return phoneNumber.stream()
        .map(FhirConverter::convertToContactPoint)
        .collect(Collectors.toList());
  }

  public static ContactPoint convertToContactPoint(@NotNull PhoneNumber phoneNumber) {
    var contactPointUse = ContactPointUse.HOME;
    if (PhoneType.MOBILE.equals(phoneNumber.getType())) {
      contactPointUse = ContactPointUse.MOBILE;
    }

    return convertToContactPoint(contactPointUse, phoneNumber.getNumber());
  }

  public static ContactPoint convertToContactPoint(ContactPointUse contactPointUse, String number) {
    // converting string to phone format as recommended by the fhir format.
    // https://www.hl7.org/fhir/datatypes.html#ContactPoint
    try {
      var phoneUtil = PhoneNumberUtil.getInstance();
      var parsedNumber = phoneUtil.parse(number, "US");
      var formattedWithDash = phoneUtil.format(parsedNumber, PhoneNumberFormat.NATIONAL);

      number = formattedWithDash.replace("-", " ");
    } catch (NumberParseException exception) {
      log.debug("Error parsing number: " + exception);
    }

    return convertToContactPoint(contactPointUse, ContactPointSystem.PHONE, number);
  }

  public static List<ContactPoint> convertEmailsToContactPoint(
      ContactPointUse use, List<String> emails) {
    return emails.stream()
        .map(email -> convertEmailToContactPoint(use, email))
        .collect(Collectors.toList());
  }

  public static ContactPoint convertEmailToContactPoint(
      ContactPointUse use, @NotNull String email) {
    return convertToContactPoint(use, ContactPointSystem.EMAIL, email);
  }

  public static ContactPoint convertToContactPoint(
      ContactPointUse use, ContactPointSystem system, String value) {
    return new ContactPoint().setUse(use).setSystem(system).setValue(value);
  }

  public static AdministrativeGender convertToAdministrativeGender(@NotNull String gender) {
    switch (gender.toLowerCase()) {
      case "male":
      case "m":
        return AdministrativeGender.MALE;
      case "female":
      case "f":
        return AdministrativeGender.FEMALE;
      default:
        return AdministrativeGender.UNKNOWN;
    }
  }

  public static Date convertToDate(@NotNull LocalDate date) {
    return Date.from(date.atStartOfDay(ZoneId.systemDefault()).toInstant());
  }

  public static Address convertToAddress(@NotNull StreetAddress address, String country) {
    return convertToAddress(
        address.getStreet(),
        address.getCity(),
        address.getCounty(),
        address.getState(),
        address.getPostalCode(),
        country);
  }

  public static Address convertToAddress(
      List<String> street,
      String city,
      String county,
      String state,
      String postalCode,
      String country) {
    var address =
        new Address()
            .setCity(city)
            .setDistrict(county)
            .setState(state)
            .setPostalCode(postalCode)
            .setCountry(country);
    if (street != null) {
      street.forEach(address::addLine);
    }
    return address;
  }

  public static Extension convertToRaceExtension(@NotNull String race) {
    var ext = new Extension();
    ext.setUrl(RACE_EXTENSION_URL);
    var codeable = new CodeableConcept();
    var coding = codeable.addCoding();
    if (PersonUtils.raceMap.containsKey(race)) {
      if (MappingConstants.UNKNOWN_STRING.equalsIgnoreCase(race)
          || "refused".equalsIgnoreCase(race)) {
        coding.setSystem(NULL_CODE_SYSTEM);
      } else {
        coding.setSystem(RACE_CODING_SYSTEM);
      }
      coding.setCode(PersonUtils.raceMap.get(race));
      codeable.setText(race);
    } else {
      coding.setSystem(NULL_CODE_SYSTEM);
      coding.setCode(MappingConstants.UNK_CODE);
      codeable.setText(MappingConstants.UNKNOWN_STRING);
    }
    ext.setValue(codeable);
    return ext;
  }

  public static Extension convertToEthnicityExtension(String ethnicity) {
    if (StringUtils.isNotBlank(ethnicity)) {
      var ext = new Extension();
      ext.setUrl(ETHNICITY_EXTENSION_URL);
      var codeableConcept = new CodeableConcept();
      var coding = codeableConcept.addCoding();
      if (PersonUtils.ETHNICITY_MAP.containsKey(ethnicity)) {
        if ("refused".equalsIgnoreCase(ethnicity)) {
          coding.setSystem(NULL_CODE_SYSTEM);
        } else {
          coding.setSystem(ETHNICITY_CODE_SYSTEM);
        }
        coding.setCode(PersonUtils.ETHNICITY_MAP.get(ethnicity).get(0));
        coding.setDisplay(PersonUtils.ETHNICITY_MAP.get(ethnicity).get(1));

        codeableConcept.setText(PersonUtils.ETHNICITY_MAP.get(ethnicity).get(1));
      } else {
        coding.setSystem(NULL_CODE_SYSTEM);
        coding.setCode(MappingConstants.U_CODE);
        coding.setDisplay(MappingConstants.UNKNOWN_STRING);

        codeableConcept.setText(MappingConstants.UNKNOWN_STRING);
      }
      ext.setValue(codeableConcept);
      return ext;
    }
    return null;
  }

  public static Extension convertToTribalAffiliationExtension(List<String> tribalAffiliations) {
    return CollectionUtils.isEmpty(tribalAffiliations)
        ? null
        : convertToTribalAffiliationExtension(tribalAffiliations.get(0));
  }

  public static Extension convertToTribalAffiliationExtension(@NotNull String tribalAffiliation) {
    var ext = new Extension();
    ext.setUrl(TRIBAL_AFFILIATION_EXTENSION_URL);
    var tribeExtension = ext.addExtension();
    tribeExtension.setUrl(TRIBAL_AFFILIATION_STRING);
    var tribeCodeableConcept = new CodeableConcept();
    var tribeCoding = tribeCodeableConcept.addCoding();
    tribeCoding.setSystem(TRIBAL_AFFILIATION_CODE_SYSTEM);
    tribeCoding.setCode(tribalAffiliation);
    tribeCoding.setDisplay(PersonUtils.tribalMap().get(tribalAffiliation));
    tribeCodeableConcept.setText(PersonUtils.tribalMap().get(tribalAffiliation));
    tribeExtension.setValue(tribeCodeableConcept);
    return ext;
  }

  public static Practitioner convertToPractitioner(Provider provider) {
    var practitioner = new Practitioner();
    practitioner.setId(provider.getInternalId().toString());
    practitioner.addName(convertToHumanName(provider.getNameInfo()));
    practitioner.addAddress(convertToAddress(provider.getAddress(), DEFAULT_COUNTRY));
    practitioner.addTelecom(convertToContactPoint(ContactPointUse.WORK, provider.getTelephone()));
    return practitioner;
  }

  public static Organization convertToOrganization(Facility facility) {
    var org = new Organization();
    org.setId(facility.getInternalId().toString());
    org.setName(facility.getFacilityName());
    org.addTelecom(convertToContactPoint(ContactPointUse.WORK, facility.getTelephone()));
    org.addTelecom(convertEmailToContactPoint(ContactPointUse.WORK, facility.getEmail()));
    org.addAddress(convertToAddress(facility.getAddress(), DEFAULT_COUNTRY));
    return org;
  }

  public static Patient convertToPatient(Person person) {
    var patient = new Patient();
    patient.setId(person.getInternalId().toString());
    patient.addIdentifier().setValue(person.getInternalId().toString());
    patient.addName(convertToHumanName(person.getNameInfo()));
    convertPhoneNumbersToContactPoint(person.getPhoneNumbers()).forEach(patient::addTelecom);
    convertEmailsToContactPoint(ContactPointUse.HOME, person.getEmails())
        .forEach(patient::addTelecom);
    patient.setGender(convertToAdministrativeGender(person.getGender()));
    patient.setBirthDate(convertToDate(person.getBirthDate()));
    patient.addAddress(convertToAddress(person.getAddress(), person.getCountry()));
    patient.addExtension(convertToRaceExtension(person.getRace()));
    patient.addExtension(convertToEthnicityExtension(person.getEthnicity()));
    patient.addExtension(convertToTribalAffiliationExtension(person.getTribalAffiliation()));
    return patient;
  }

  public static Device convertToDevice(@NotNull DeviceType deviceType) {
    return convertToDevice(
        deviceType.getManufacturer(), deviceType.getModel(), deviceType.getInternalId().toString());
  }

  public static Device convertToDevice(
      @NotNull String manufacturer, @NotNull String model, String id) {
    var device =
        new Device()
            .setManufacturer(manufacturer)
            .addDeviceName(
                new DeviceDeviceNameComponent().setName(model).setType(DeviceNameType.MODELNAME));
    device.setId(id);
    return device;
  }

  public static Specimen convertToSpecimen(
      String specimenCode,
      String specimenName,
      String collectionCode,
      String collectionName,
      String id) {
    var specimen = new Specimen();
    specimen.setId(id);
    if (StringUtils.isNotBlank(specimenCode)) {
      var codeableConcept = specimen.getType();
      var coding = codeableConcept.addCoding();
      coding.setSystem(SNOMED_CODE_SYSTEM);
      coding.setCode(specimenCode);
      codeableConcept.setText(specimenName);
    }
    if (StringUtils.isNotBlank(collectionCode)) {
      var collection = specimen.getCollection();
      var codeableConcept = collection.getBodySite();
      var coding = codeableConcept.addCoding();
      coding.setSystem(SNOMED_CODE_SYSTEM);
      coding.setCode(collectionCode);
      codeableConcept.setText(collectionName);
    }

    return specimen;
  }

  public static Specimen convertToSpecimen(@NotNull SpecimenType specimenType) {
    return convertToSpecimen(
        specimenType.getTypeCode(),
        specimenType.getName(),
        specimenType.getCollectionLocationCode(),
        specimenType.getCollectionLocationName(),
        specimenType.getInternalId().toString());
  }

  public static List<Observation> convertToObservation(
      Set<Result> results,
      List<DeviceTestPerformedLoincCode> deviceTestPerformedLoincCode,
      TestCorrectionStatus correctionStatus,
      String correctionReason) {
    return results.stream()
        .map(
            result -> {
              String testPerformedLoincCode =
                  getTestPerformedLoincCode(deviceTestPerformedLoincCode, result);
              return convertToObservation(
                  result, testPerformedLoincCode, correctionStatus, correctionReason);
            })
        .collect(Collectors.toList());
  }

  private static String getTestPerformedLoincCode(
      List<DeviceTestPerformedLoincCode> deviceTestPerformedLoincCode, Result result) {
    return deviceTestPerformedLoincCode.stream()
        .filter(code -> code.getSupportedDisease() == result.getDisease())
        .findFirst()
        .map(DeviceTestPerformedLoincCode::getTestPerformedLoincCode)
        .orElse(result.getTestOrder().getDeviceType().getLoincCode());
  }

  public static Observation convertToObservation(
      Result result,
      String testPerformedCode,
      TestCorrectionStatus correctionStatus,
      String correctionReason) {
    if (result != null && result.getDisease() != null) {
      return convertToObservation(
          testPerformedCode,
          result.getDisease().getName(),
          result.getResultLOINC(),
          correctionStatus,
          correctionReason,
          result.getInternalId().toString(),
          result.getTestResult().toString());
    }
    return null;
  }

  public static Observation convertToObservation(
      String diseaseCode,
      String diseaseName,
      String resultCode,
      TestCorrectionStatus correctionStatus,
      String correctionReason,
      String id,
      String resultDescription) {
    var observation = new Observation();
    observation.setId(id);
    setStatus(observation, correctionStatus);
    addCode(diseaseCode, diseaseName, observation);
    addValue(resultCode, observation, resultDescription);
    addCorrectionNote(
        correctionStatus != TestCorrectionStatus.ORIGINAL, correctionReason, observation);
    return observation;
  }

  private static void setStatus(Observation observation, TestCorrectionStatus correctionStatus) {
    switch (correctionStatus) {
      case ORIGINAL:
        observation.setStatus(ObservationStatus.FINAL);
        break;
      case CORRECTED:
        observation.setStatus(ObservationStatus.CORRECTED);
        break;
      case REMOVED:
        observation.setStatus(ObservationStatus.ENTEREDINERROR);
        break;
    }
  }

  private static void addCorrectionNote(
      boolean corrected, String correctionReason, Observation observation) {
    if (corrected) {
      var annotation = observation.addNote();
      var correctedNote = "Corrected Result";
      if (StringUtils.isNotBlank(correctionReason)) {
        correctedNote += ": " + correctionReason;
      }
      annotation.setText(correctedNote);
    }
  }

  private static void addValue(String resultCode, Observation observation, String resultDisplay) {
    var valueCodeableConcept = new CodeableConcept();
    var valueCoding = valueCodeableConcept.addCoding();
    valueCoding.setSystem(SNOMED_CODE_SYSTEM);
    valueCoding.setCode(resultCode);
    valueCoding.setDisplay(resultDisplay);
    observation.setValue(valueCodeableConcept);
  }

  private static void addCode(String diseaseCode, String diseaseName, Observation observation) {
    var codeCodeableConcept = observation.getCode();
    var codeCoding = codeCodeableConcept.addCoding();
    codeCoding.setSystem(LOINC_CODE_SYSTEM);
    codeCoding.setCode(diseaseCode);
    codeCodeableConcept.setText(diseaseName);
  }

  public static ServiceRequest convertToServiceRequest(@NotNull TestOrder order) {
    ServiceRequestStatus serviceRequestStatus = null;
    switch (order.getOrderStatus()) {
      case PENDING:
        serviceRequestStatus = ServiceRequestStatus.ACTIVE;
        break;
      case COMPLETED:
        serviceRequestStatus = ServiceRequestStatus.COMPLETED;
        break;
      case CANCELED:
        serviceRequestStatus = ServiceRequestStatus.REVOKED;
        break;
    }

    String deviceLoincCode = null;
    if (order.getDeviceType() != null) {
      deviceLoincCode = order.getDeviceType().getLoincCode();
    }
    return convertToServiceRequest(
        serviceRequestStatus, deviceLoincCode, Objects.toString(order.getInternalId(), ""));
  }

  public static ServiceRequest convertToServiceRequest(
      ServiceRequestStatus status, String requestedCode, String id) {
    var serviceRequest = new ServiceRequest();
    serviceRequest.setId(id);
    serviceRequest.setIntent(ServiceRequestIntent.ORDER);
    serviceRequest.setStatus(status);
    if (StringUtils.isNotBlank(requestedCode)) {
      serviceRequest.getCode().addCoding().setSystem(LOINC_CODE_SYSTEM).setCode(requestedCode);
    }
    return serviceRequest;
  }

  public static DiagnosticReport convertToDiagnosticReport(TestEvent testEvent) {
    DiagnosticReportStatus status = null;
    switch (testEvent.getCorrectionStatus()) {
      case ORIGINAL:
        status = (DiagnosticReportStatus.FINAL);
        break;
      case CORRECTED:
        status = (DiagnosticReportStatus.CORRECTED);
        break;
      case REMOVED:
        status = (DiagnosticReportStatus.ENTEREDINERROR);
        break;
    }

    String code = null;
    if (testEvent.getDeviceType() != null) {
      code = testEvent.getDeviceType().getLoincCode();
    }

    return convertToDiagnosticReport(status, code, Objects.toString(testEvent.getInternalId(), ""));
  }

  public static DiagnosticReport convertToDiagnosticReport(
      DiagnosticReportStatus status, String code, String id) {
    var diagnosticReport = new DiagnosticReport();
    diagnosticReport.setId(id);
    diagnosticReport.setStatus(status);
    if (StringUtils.isNotBlank(code)) {
      diagnosticReport.getCode().addCoding().setSystem(LOINC_CODE_SYSTEM).setCode(code);
    }
    return diagnosticReport;
  }

  public static Bundle createFhirBundle(
      @NotNull TestEvent testEvent, GitProperties gitProperties, Instant instant) {
    return createFhirBundle(
        convertToPatient(testEvent.getPatient()),
        convertToOrganization(testEvent.getFacility()),
        convertToPractitioner(testEvent.getProviderData()),
        convertToDevice(testEvent.getDeviceType()),
        convertToSpecimen(testEvent.getSpecimenType()),
        convertToObservation(
            testEvent.getResults(),
            testEvent.getDeviceType().getSupportedDiseaseTestPerformed(),
            testEvent.getCorrectionStatus(),
            testEvent.getReasonForCorrection()),
        convertToServiceRequest(testEvent.getOrder()),
        convertToDiagnosticReport(testEvent),
        testEvent.getDateTested(),
        instant,
        gitProperties);
  }

  public static Bundle createFhirBundle(
      Patient patient,
      Organization organization,
      Practitioner practitioner,
      Device device,
      Specimen specimen,
      List<Observation> observations,
      ServiceRequest serviceRequest,
      DiagnosticReport diagnosticReport,
      Date dateTested,
      Instant instant,
      GitProperties gitProperties) {
    var patientFullUrl = ResourceType.Patient + "/" + patient.getId();
    var organizationFullUrl = ResourceType.Organization + "/" + organization.getId();
    var practitionerFullUrl = ResourceType.Practitioner + "/" + practitioner.getId();
    var specimenFullUrl = ResourceType.Specimen + "/" + specimen.getId();
    var serviceRequestFullUrl = ResourceType.ServiceRequest + "/" + serviceRequest.getId();
    var diagnosticReportFullUrl = ResourceType.DiagnosticReport + "/" + diagnosticReport.getId();
    var deviceFullUrl = ResourceType.Device + "/" + device.getId();

    var practitionerRole = createPractitionerRole(organizationFullUrl, practitionerFullUrl);
    var provenance = createProvenance(organizationFullUrl, dateTested);
    var provenanceFullUrl = ResourceType.Provenance + "/" + provenance.getId();
    var messageHeader =
        createMessageHeader(
            organizationFullUrl, diagnosticReportFullUrl, provenanceFullUrl, gitProperties);
    var practitionerRoleFullUrl = ResourceType.PractitionerRole + "/" + practitionerRole.getId();
    var messageHeaderFullUrl = ResourceType.MessageHeader + "/" + messageHeader.getId();

    patient.setManagingOrganization(new Reference(organizationFullUrl));
    specimen.setSubject(new Reference(patientFullUrl));

    serviceRequest.setSubject(new Reference(patientFullUrl));
    serviceRequest.addPerformer(new Reference(organizationFullUrl));
    serviceRequest.setRequester(new Reference(organizationFullUrl));
    diagnosticReport.addBasedOn(new Reference(serviceRequestFullUrl));
    diagnosticReport.setSubject(new Reference(patientFullUrl));
    diagnosticReport.addSpecimen(new Reference(specimenFullUrl));

    var entryList = new ArrayList<Pair<String, Resource>>();
    entryList.add(Pair.of(messageHeaderFullUrl, messageHeader));
    entryList.add(Pair.of(provenanceFullUrl, provenance));
    entryList.add(Pair.of(diagnosticReportFullUrl, diagnosticReport));
    entryList.add(Pair.of(patientFullUrl, patient));
    entryList.add(Pair.of(organizationFullUrl, organization));
    entryList.add(Pair.of(practitionerFullUrl, practitioner));
    entryList.add(Pair.of(specimenFullUrl, specimen));
    entryList.add(Pair.of(serviceRequestFullUrl, serviceRequest));
    entryList.add(Pair.of(deviceFullUrl, device));
    entryList.add(Pair.of(practitionerRoleFullUrl, practitionerRole));
    entryList.add(
        Pair.of(
            ResourceType.Organization + "/" + SIMPLE_REPORT_ORG_ID,
            new Organization().setName("SimpleReport").setId(SIMPLE_REPORT_ORG_ID)));

    observations.forEach(
        observation -> {
          var observationFullUrl = ResourceType.Observation + "/" + observation.getId();

          observation.setSubject(new Reference(patientFullUrl));
          observation.addPerformer(new Reference(organizationFullUrl));
          observation.setSpecimen(new Reference(specimenFullUrl));
          observation.setDevice(new Reference(deviceFullUrl));

          diagnosticReport.addResult(new Reference(observationFullUrl));
          entryList.add(Pair.of(observationFullUrl, observation));
        });

    var bundle =
        new Bundle()
            .setType(BundleType.MESSAGE)
            .setTimestampElement(new InstantType(instant.toString()))
            .setIdentifier(new Identifier().setValue(diagnosticReport.getId()));
    entryList.forEach(
        pair ->
            bundle.addEntry(
                new BundleEntryComponent()
                    .setFullUrl(pair.getFirst())
                    .setResource(pair.getSecond())));

    return bundle;
  }

  public static Provenance createProvenance(String organizationFullUrl, Date dateTested) {
    var provenance = new Provenance();
    provenance.setId(UUID.randomUUID().toString());
    provenance
        .getActivity()
        .addCoding()
        .setSystem(EVENT_TYPE_CODE_SYSTEM)
        .setCode(EVENT_TYPE_CODE)
        .setDisplay(EVENT_TYPE_DISPLAY);
    provenance.addAgent().setWho(new Reference().setReference(organizationFullUrl));
    provenance.setRecorded(dateTested);
    return provenance;
  }

  public static PractitionerRole createPractitionerRole(
      String organizationUrl, String practitionerUrl) {
    var practitionerRole = new PractitionerRole();
    practitionerRole.setId(UUID.randomUUID().toString());
    practitionerRole
        .setPractitioner(new Reference().setReference(practitionerUrl))
        .setOrganization(new Reference().setReference(organizationUrl));
    return practitionerRole;
  }

  public static MessageHeader createMessageHeader(
      String organizationUrl,
      String mainResourceUrl,
      String provenanceFullUrl,
      GitProperties gitProperties) {
    var messageHeader = new MessageHeader();
    messageHeader.setId(UUID.randomUUID().toString());
    messageHeader
        .getEventCoding()
        .setSystem(EVENT_TYPE_CODE_SYSTEM)
        .setCode(EVENT_TYPE_CODE)
        .setDisplay(EVENT_TYPE_DISPLAY);
    messageHeader
        .getSource()
        .setSoftware("PRIME SimpleReport")
        .setEndpoint("https://simplereport.gov");
    messageHeader
        .addDestination()
        .setName("PRIME ReportStream")
        .setEndpoint("https://prime.cdc.gov/api/reports?option=SkipInvalidItems");
    messageHeader.getSender().setReferenceElement(new StringType(organizationUrl));
    messageHeader.addFocus(new Reference(provenanceFullUrl));
    messageHeader.addFocus(new Reference(mainResourceUrl));
    messageHeader
        .getSource()
        .addExtension()
        .setUrl("https://reportstream.cdc.gov/fhir/StructureDefinition/software-binary-id")
        .setValue(new StringType(gitProperties.getShortCommitId()));
    messageHeader
        .getSource()
        .addExtension()
        .setUrl("https://reportstream.cdc.gov/fhir/StructureDefinition/software-install-date")
        .setValue(new InstantType(gitProperties.getCommitTime().toString()));
    messageHeader
        .getSource()
        .addExtension()
        .setUrl("https://reportstream.cdc.gov/fhir/StructureDefinition/software-vendor-org")
        .setValue(new Reference(ResourceType.Organization + "/" + SIMPLE_REPORT_ORG_ID));
    return messageHeader;
  }
}
