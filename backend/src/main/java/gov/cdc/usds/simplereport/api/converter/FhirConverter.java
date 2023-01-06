package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ETHNICITY_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ETHNICITY_EXTENSION_URL;
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
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.hl7.fhir.r4.model.Address;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Bundle.BundleEntryComponent;
import org.hl7.fhir.r4.model.Bundle.BundleType;
import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.Coding;
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
import org.hl7.fhir.r4.model.MessageHeader;
import org.hl7.fhir.r4.model.Observation;
import org.hl7.fhir.r4.model.Observation.ObservationStatus;
import org.hl7.fhir.r4.model.Organization;
import org.hl7.fhir.r4.model.Patient;
import org.hl7.fhir.r4.model.Practitioner;
import org.hl7.fhir.r4.model.PractitionerRole;
import org.hl7.fhir.r4.model.Reference;
import org.hl7.fhir.r4.model.Resource;
import org.hl7.fhir.r4.model.ResourceType;
import org.hl7.fhir.r4.model.ServiceRequest;
import org.hl7.fhir.r4.model.ServiceRequest.ServiceRequestIntent;
import org.hl7.fhir.r4.model.ServiceRequest.ServiceRequestStatus;
import org.hl7.fhir.r4.model.Specimen;
import org.hl7.fhir.r4.model.StringType;

@Slf4j
public class FhirConverter {
  private FhirConverter() {
    throw new IllegalStateException("Utility class");
  }

  public static HumanName convertToHumanName(PersonName personName) {
    if (personName != null) {
      return convertToHumanName(
          personName.getFirstName(),
          personName.getMiddleName(),
          personName.getLastName(),
          personName.getSuffix());
    }
    return null;
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

  public static List<ContactPoint> phoneNumberToContactPoint(List<PhoneNumber> phoneNumber) {
    if (phoneNumber != null && !phoneNumber.isEmpty()) {
      return phoneNumber.stream()
          .map(FhirConverter::phoneNumberToContactPoint)
          .collect(Collectors.toList());
    }
    return Collections.emptyList();
  }

  public static ContactPoint phoneNumberToContactPoint(PhoneNumber phoneNumber) {
    if (phoneNumber != null) {
      var contactPointUse = ContactPointUse.HOME;
      if (PhoneType.MOBILE.equals(phoneNumber.getType())) {
        contactPointUse = ContactPointUse.MOBILE;
      }

      return phoneNumberToContactPoint(contactPointUse, phoneNumber.getNumber());
    }
    return null;
  }

  public static ContactPoint phoneNumberToContactPoint(
      ContactPointUse contactPointUse, String number) {
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

  public static List<ContactPoint> emailToContactPoint(List<String> emails) {
    if (emails != null) {
      return emails.stream().map(FhirConverter::emailToContactPoint).collect(Collectors.toList());
    }
    return Collections.emptyList();
  }

  public static ContactPoint emailToContactPoint(String email) {
    if (email != null) {
      return convertToContactPoint(null, ContactPointSystem.EMAIL, email);
    }
    return null;
  }

  public static ContactPoint convertToContactPoint(
      ContactPointUse use, ContactPointSystem system, String value) {
    if (value != null) {
      return new ContactPoint().setUse(use).setSystem(system).setValue(value);
    }
    return null;
  }

  public static AdministrativeGender convertToAdministrativeGender(String gender) {
    if ("male".equalsIgnoreCase(gender) || "m".equalsIgnoreCase(gender)) {
      return AdministrativeGender.MALE;
    } else if ("female".equalsIgnoreCase(gender) || "f".equalsIgnoreCase(gender)) {
      return AdministrativeGender.FEMALE;
    } else {
      return AdministrativeGender.UNKNOWN;
    }
  }

  public static Date convertToDate(LocalDate date) {
    if (date != null) {
      return Date.from(date.atStartOfDay(ZoneId.systemDefault()).toInstant());
    }
    return null;
  }

  public static Address convertToAddress(StreetAddress address) {
    if (address != null) {
      return convertToAddress(
          address.getStreet(),
          address.getCity(),
          address.getCounty(),
          address.getState(),
          address.getPostalCode());
    }
    return null;
  }

  public static Address convertToAddress(
      List<String> street, String city, String county, String state, String postalCode) {
    var address =
        new Address().setCity(city).setDistrict(county).setState(state).setPostalCode(postalCode);
    if (street != null) {
      street.forEach(address::addLine);
    }
    return address;
  }

  public static Extension convertToRaceExtension(String race) {
    if (StringUtils.isNotBlank(race)) {
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
    return null;
  }

  public static Extension convertToEthnicityExtension(String ethnicity) {
    if (StringUtils.isNotBlank(ethnicity)) {
      var ext = new Extension();
      ext.setUrl(ETHNICITY_EXTENSION_URL);
      var ombExtension = ext.addExtension();
      ombExtension.setUrl("ombCategory");
      var ombCoding = new Coding();
      if (PersonUtils.ETHNICITY_MAP.containsKey(ethnicity)) {
        if ("refused".equalsIgnoreCase(ethnicity)) {
          ombCoding.setSystem(NULL_CODE_SYSTEM);
        } else {
          ombCoding.setSystem(ETHNICITY_CODE_SYSTEM);
        }
        ombCoding.setCode(PersonUtils.ETHNICITY_MAP.get(ethnicity).get(0));
        ombCoding.setDisplay(PersonUtils.ETHNICITY_MAP.get(ethnicity).get(1));

        var text = ext.addExtension();
        text.setUrl("text");
        text.setValue(new StringType(PersonUtils.ETHNICITY_MAP.get(ethnicity).get(1)));
      } else {
        ombCoding.setSystem(NULL_CODE_SYSTEM);
        ombCoding.setCode(MappingConstants.UNK_CODE);
        ombCoding.setDisplay(MappingConstants.UNKNOWN_STRING);

        var text = ext.addExtension();
        text.setUrl("text");
        text.setValue(new StringType(MappingConstants.UNKNOWN_STRING));
      }
      ombExtension.setValue(ombCoding);
      return ext;
    }
    return null;
  }

  public static Extension convertToTribalAffiliationExtension(List<String> tribalAffiliations) {
    if (tribalAffiliations != null && !tribalAffiliations.isEmpty()) {
      return convertToTribalAffiliationExtension(tribalAffiliations.get(0));
    }
    return null;
  }

  public static Extension convertToTribalAffiliationExtension(String tribalAffiliation) {
    if (StringUtils.isNotBlank(tribalAffiliation)
        && PersonUtils.tribalMap().containsKey(tribalAffiliation)) {
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
    return null;
  }

  public static Practitioner convertToPractitioner(Provider provider) {
    var practitioner = new Practitioner();
    practitioner.setId(provider.getInternalId().toString());
    practitioner.addName(convertToHumanName(provider.getNameInfo()));
    practitioner.addAddress(convertToAddress(provider.getAddress()));
    practitioner.addTelecom(
        phoneNumberToContactPoint(ContactPointUse.WORK, provider.getTelephone()));
    return practitioner;
  }

  public static Organization convertToOrganization(Facility facility) {
    var org = new Organization();
    org.setId(facility.getInternalId().toString());
    org.setName(facility.getFacilityName());
    org.addTelecom(phoneNumberToContactPoint(ContactPointUse.WORK, facility.getTelephone()));
    org.addTelecom(emailToContactPoint(facility.getEmail()));
    org.addAddress(convertToAddress(facility.getAddress()));
    return org;
  }

  public static Patient convertToPatient(Person person) {
    var patient = new Patient();
    patient.setId(person.getInternalId().toString());
    patient.addName(convertToHumanName(person.getNameInfo()));
    phoneNumberToContactPoint(person.getPhoneNumbers()).forEach(patient::addTelecom);
    emailToContactPoint(person.getEmails()).forEach(patient::addTelecom);
    patient.setGender(convertToAdministrativeGender(person.getGender()));
    patient.setBirthDate(convertToDate(person.getBirthDate()));
    patient.addAddress(convertToAddress(person.getAddress()));
    patient.addExtension(convertToRaceExtension(person.getRace()));
    patient.addExtension(convertToEthnicityExtension(person.getEthnicity()));
    patient.addExtension(convertToTribalAffiliationExtension(person.getTribalAffiliation()));
    return patient;
  }

  public static Device convertToDevice(DeviceType deviceType) {
    if (deviceType != null) {
      return convertToDevice(
          deviceType.getManufacturer(),
          deviceType.getModel(),
          deviceType.getInternalId().toString());
    }
    return null;
  }

  public static Device convertToDevice(String manufacturer, String model, String id) {
    if (StringUtils.isNotBlank(manufacturer) || StringUtils.isNotBlank(model)) {
      var device =
          new Device()
              .setManufacturer(manufacturer)
              .addDeviceName(
                  new DeviceDeviceNameComponent().setName(model).setType(DeviceNameType.MODELNAME));
      device.setId(id);
      return device;
    }
    return null;
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

  public static Specimen convertToSpecimen(SpecimenType specimenType) {
    if (specimenType != null) {
      return convertToSpecimen(
          specimenType.getTypeCode(),
          specimenType.getName(),
          specimenType.getCollectionLocationCode(),
          specimenType.getCollectionLocationName(),
          specimenType.getInternalId().toString());
    }
    return null;
  }

  public static List<Observation> convertToObservation(
      Set<Result> results, TestCorrectionStatus correctionStatus, String correctionReason) {
    return results.stream()
        .map(result -> convertToObservation(result, correctionStatus, correctionReason))
        .collect(Collectors.toList());
  }

  public static Observation convertToObservation(
      Result result, TestCorrectionStatus correctionStatus, String correctionReason) {
    if (result != null && result.getDisease() != null) {
      return convertToObservation(
          result.getDisease().getLoinc(),
          result.getDisease().getName(),
          result.getResultLOINC(),
          correctionStatus,
          correctionReason,
          result.getInternalId().toString());
    }
    return null;
  }

  public static Observation convertToObservation(
      String diseaseCode,
      String diseaseName,
      String resultCode,
      TestCorrectionStatus correctionStatus,
      String correctionReason,
      String id) {
    var observation = new Observation();
    observation.setId(id);
    setStatus(observation, correctionStatus);
    addCode(diseaseCode, diseaseName, observation);
    addValue(resultCode, observation);
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

  private static void addValue(String resultCode, Observation observation) {
    var valueCodeableConcept = new CodeableConcept();
    var valueCoding = valueCodeableConcept.addCoding();
    valueCoding.setSystem(SNOMED_CODE_SYSTEM);
    valueCoding.setCode(resultCode);
    observation.setValue(valueCodeableConcept);
  }

  private static void addCode(String diseaseCode, String diseaseName, Observation observation) {
    var codeCodeableConcept = observation.getCode();
    var codeCoding = codeCodeableConcept.addCoding();
    codeCoding.setSystem(LOINC_CODE_SYSTEM);
    codeCoding.setCode(diseaseCode);
    codeCodeableConcept.setText(diseaseName);
  }

  public static ServiceRequest convertToServiceRequest(TestOrder order) {
    if (order != null) {
      ServiceRequestStatus serviceRequestStatus = null;
      switch (order.getOrderStatus()) {
        case PENDING:
          serviceRequestStatus = ServiceRequestStatus.ACTIVE;
          break;
        case COMPLETED:
          serviceRequestStatus = ServiceRequestStatus.COMPLETED;
          break;
        case CANCELED:
          serviceRequestStatus = (ServiceRequestStatus.REVOKED);
          break;
      }

      String deviceLoincCode = null;
      if (order.getDeviceType() != null) {
        deviceLoincCode = order.getDeviceType().getLoincCode();
      }
      return convertToServiceRequest(
          serviceRequestStatus, deviceLoincCode, Objects.toString(order.getInternalId(), ""));
    }

    return null;
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
    if (testEvent != null) {
      DiagnosticReportStatus status = null;
      switch (testEvent.getCorrectionStatus()) {
        case ORIGINAL:
          status = (DiagnosticReportStatus.FINAL);
          break;
        case CORRECTED:
          status = (DiagnosticReportStatus.CORRECTED);
          break;
        case REMOVED:
          status = (DiagnosticReportStatus.CANCELLED);
          break;
      }

      String code = null;
      if (testEvent.getDeviceType() != null) {
        code = testEvent.getDeviceType().getLoincCode();
      }

      return convertToDiagnosticReport(
          status, code, Objects.toString(testEvent.getInternalId(), ""));
    }
    return null;
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

  public static Bundle createFhirBundle(TestEvent testEvent) {
    return createFhirBundle(
        convertToPatient(testEvent.getPatient()),
        convertToOrganization(testEvent.getFacility()),
        convertToPractitioner(testEvent.getProviderData()),
        convertToDevice(testEvent.getDeviceType()),
        convertToSpecimen(testEvent.getSpecimenType()),
        convertToObservation(
            testEvent.getResults(),
            testEvent.getCorrectionStatus(),
            testEvent.getReasonForCorrection()),
        convertToServiceRequest(testEvent.getOrder()),
        convertToDiagnosticReport(testEvent));
  }

  public static Bundle createFhirBundle(
      Patient patient,
      Organization organization,
      Practitioner practitioner,
      Device device,
      Specimen specimen,
      List<Observation> observations,
      ServiceRequest serviceRequest,
      DiagnosticReport diagnosticReport) {
    var patientFullUrl = ResourceType.Patient + "/" + patient.getId();
    var organizationFullUrl = ResourceType.Organization + "/" + organization.getId();
    var practitionerFullUrl = ResourceType.Practitioner + "/" + practitioner.getId();
    var specimenFullUrl = ResourceType.Specimen + "/" + specimen.getId();
    var serviceRequestFullUrl = ResourceType.ServiceRequest + "/" + serviceRequest.getId();
    var diagnosticReportFullUrl = ResourceType.DiagnosticReport + "/" + diagnosticReport.getId();
    var deviceFullUrl = ResourceType.Device + "/" + device.getId();

    var practitionerRole = getPractitionerRole(organizationFullUrl, practitionerFullUrl);
    var messageHeader = getMessageHeader(organizationFullUrl);
    var practitionerRoleFullUrl = ResourceType.PractitionerRole + "/" + practitionerRole.getId();
    var messageHeaderFullUrl = ResourceType.MessageHeader + "/" + messageHeader.getId();

    patient.setManagingOrganization(new Reference(organizationFullUrl));
    specimen.setSubject(new Reference(patientFullUrl));

    serviceRequest.setSubject(new Reference(patientFullUrl));
    serviceRequest.addPerformer(new Reference(organizationFullUrl));
    diagnosticReport.addBasedOn(new Reference(serviceRequestFullUrl));
    diagnosticReport.setSubject(new Reference(patientFullUrl));
    diagnosticReport.addSpecimen(new Reference(specimenFullUrl));

    var entryMap = new HashMap<String, Resource>();
    entryMap.put(patientFullUrl, patient);
    entryMap.put(organizationFullUrl, organization);
    entryMap.put(practitionerFullUrl, practitioner);
    entryMap.put(specimenFullUrl, specimen);
    entryMap.put(serviceRequestFullUrl, serviceRequest);
    entryMap.put(diagnosticReportFullUrl, diagnosticReport);
    entryMap.put(deviceFullUrl, device);
    entryMap.put(practitionerRoleFullUrl, practitionerRole);
    entryMap.put(messageHeaderFullUrl, messageHeader);

    observations.forEach(
        observation -> {
          var observationFullUrl = ResourceType.Observation + "/" + observation.getId();

          observation.setSubject(new Reference(patientFullUrl));
          observation.addPerformer(new Reference(organizationFullUrl));
          observation.setSpecimen(new Reference(specimenFullUrl));
          observation.setDevice(new Reference(deviceFullUrl));

          diagnosticReport.addResult(new Reference(observationFullUrl));
          entryMap.put(observationFullUrl, observation);
        });

    var bundle = new Bundle().setType(BundleType.MESSAGE);
    entryMap.forEach(
        (url, resource) ->
            bundle.addEntry(new BundleEntryComponent().setFullUrl(url).setResource(resource)));

    return bundle;
  }

  public static PractitionerRole getPractitionerRole(
      String organizationUrl, String practitionerUrl) {
    var practitionerRole = new PractitionerRole();
    practitionerRole.setId(UUID.randomUUID().toString());
    practitionerRole
        .setPractitioner(new Reference().setReference(practitionerUrl))
        .setOrganization(new Reference().setReference(organizationUrl));
    return practitionerRole;
  }

  public static MessageHeader getMessageHeader(String organizationUrl) {
    var messageHeader = new MessageHeader();
    messageHeader.setId(UUID.randomUUID().toString());
    messageHeader
        .getEventCoding()
        .setSystem("http://terminology.hl7.org/CodeSystem/v2-0003")
        .setCode("R01")
        .setDisplay("ORU/ACK - Unsolicited transmission of an observation message");
    messageHeader.getSource().setSoftware("PRIME SimpleReport");
    messageHeader
        .addDestination()
        .setName("PRIME ReportStream")
        .setEndpoint("https://prime.cdc.gov/api/reports?option=SkipInvalidItems");
    messageHeader.getSender().setReferenceElement(new StringType(organizationUrl));
    return messageHeader;
  }
}
