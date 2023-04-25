package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.Translators.DETECTED_SNOMED_CONCEPT;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ABNORMAL_FLAGS_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ABNORMAL_FLAG_ABNORMAL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ABNORMAL_FLAG_NORMAL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.DEFAULT_COUNTRY;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.EQUIPMENT_UID_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ETHNICITY_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ETHNICITY_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.EVENT_TYPE_CODE;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.EVENT_TYPE_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.EVENT_TYPE_DISPLAY;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_AOE_IDENTIFIER;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_AOE_SYMPTOMATIC;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_AOE_SYMPTOM_ONSET;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NPI_PREFIX;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NULL_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ORDER_CONTROL_CODE_OBSERVATIONS;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ORDER_CONTROL_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ORDER_CONTROL_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.PRACTICIONER_IDENTIFIER_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.PROCESSING_ID_DISPLAY;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.PROCESSING_ID_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.RACE_CODING_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.RACE_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.SNOMED_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.TESTKIT_NAME_ID_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.TRIBAL_AFFILIATION_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.TRIBAL_AFFILIATION_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.TRIBAL_AFFILIATION_STRING;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.UNIVERSAL_ID_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.YESNO_CODE_SYSTEM;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat;
import gov.cdc.usds.simplereport.api.MappingConstants;
import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PersonUtils;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.utils.MultiplexUtils;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import javax.validation.constraints.NotNull;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.validator.routines.checkdigit.LuhnCheckDigit;
import org.hl7.fhir.r4.model.Address;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Bundle.BundleEntryComponent;
import org.hl7.fhir.r4.model.Bundle.BundleType;
import org.hl7.fhir.r4.model.CodeableConcept;
import org.hl7.fhir.r4.model.Coding;
import org.hl7.fhir.r4.model.ContactPoint;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointSystem;
import org.hl7.fhir.r4.model.ContactPoint.ContactPointUse;
import org.hl7.fhir.r4.model.DateTimeType;
import org.hl7.fhir.r4.model.Device;
import org.hl7.fhir.r4.model.Device.DeviceDeviceNameComponent;
import org.hl7.fhir.r4.model.Device.DeviceNameType;
import org.hl7.fhir.r4.model.DiagnosticReport;
import org.hl7.fhir.r4.model.DiagnosticReport.DiagnosticReportStatus;
import org.hl7.fhir.r4.model.Enumerations.AdministrativeGender;
import org.hl7.fhir.r4.model.Extension;
import org.hl7.fhir.r4.model.HumanName;
import org.hl7.fhir.r4.model.Identifier;
import org.hl7.fhir.r4.model.Identifier.IdentifierUse;
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
import org.hl7.fhir.r4.model.Type;
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
      var coding = codeableConcept.addCoding().setSystem(ETHNICITY_CODE_SYSTEM);
      if (PersonUtils.ETHNICITY_MAP.containsKey(ethnicity)) {
        coding
            .setCode(PersonUtils.ETHNICITY_MAP.get(ethnicity).get(0))
            .setDisplay(PersonUtils.ETHNICITY_MAP.get(ethnicity).get(1));
        codeableConcept.setText(PersonUtils.ETHNICITY_MAP.get(ethnicity).get(1));
      } else {
        coding.setCode(MappingConstants.U_CODE).setDisplay(MappingConstants.UNKNOWN_STRING);
        codeableConcept.setText(MappingConstants.UNKNOWN_STRING);
      }
      ext.setValue(codeableConcept);
      return ext;
    }
    return null;
  }

  public static Optional<Extension> convertToTribalAffiliationExtension(
      List<String> tribalAffiliations) {
    return CollectionUtils.isEmpty(tribalAffiliations)
        ? Optional.empty()
        : convertToTribalAffiliationExtension(tribalAffiliations.get(0));
  }

  public static Optional<Extension> convertToTribalAffiliationExtension(String tribalAffiliation) {
    if (StringUtils.isNotBlank(tribalAffiliation)) {
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
      return Optional.of(ext);
    }
    return Optional.empty();
  }

  public static Practitioner convertToPractitioner(Provider provider) {
    return convertToPractitioner(
        provider.getInternalId().toString(),
        provider.getNameInfo(),
        provider.getTelephone(),
        provider.getAddress(),
        DEFAULT_COUNTRY,
        provider.getProviderId());
  }

  public static Practitioner convertToPractitioner(
      String id,
      PersonName name,
      String telephone,
      StreetAddress addr,
      String country,
      String npi) {
    var practitioner =
        new Practitioner()
            .addName(convertToHumanName(name))
            .addAddress(convertToAddress(addr, country))
            .addTelecom(convertToContactPoint(ContactPointUse.WORK, telephone));
    practitioner.setId(id);

    LuhnCheckDigit npiValidator = new LuhnCheckDigit();
    if (StringUtils.isNotEmpty(npi) && npiValidator.isValid(NPI_PREFIX.concat(npi))) {
      practitioner.addIdentifier().setSystem(PRACTICIONER_IDENTIFIER_SYSTEM).setValue(npi);
    }

    return practitioner;
  }

  public static Organization convertToOrganization(Facility facility) {
    return convertToOrganization(
        facility.getInternalId().toString(),
        facility.getFacilityName(),
        facility.getCliaNumber(),
        facility.getTelephone(),
        facility.getEmail(),
        facility.getAddress(),
        DEFAULT_COUNTRY);
  }

  public static Organization convertToOrganization(
      String id,
      String name,
      String clia,
      String telephone,
      String email,
      StreetAddress addr,
      String country) {
    var org =
        new Organization()
            .setName(name)
            .addAddress(convertToAddress(addr, country))
            .addTelecom(convertToContactPoint(ContactPointUse.WORK, telephone));

    org.addIdentifier()
        .setUse(IdentifierUse.OFFICIAL)
        .setValue(clia)
        .getType()
        .addCoding()
        .setSystem(UNIVERSAL_ID_SYSTEM)
        .setCode("CLIA");

    if (email != null && !email.isBlank()) {
      org.addTelecom(convertEmailToContactPoint(ContactPointUse.WORK, email));
    }
    org.setId(id);
    return org;
  }

  public static Patient convertToPatient(Person person) {
    return convertToPatient(
        ConvertToPatientProps.builder()
            .id(person.getInternalId().toString())
            .name(person.getNameInfo())
            .phoneNumbers(person.getPhoneNumbers())
            .emails(person.getEmails())
            .gender(person.getGender())
            .dob(person.getBirthDate())
            .address(person.getAddress())
            .country(person.getCountry())
            .race(person.getRace())
            .ethnicity(person.getEthnicity())
            .tribalAffiliations(person.getTribalAffiliation())
            .build());
  }

  public static Patient convertToPatient(ConvertToPatientProps props) {
    var patient =
        new Patient()
            .addName(convertToHumanName(props.getName()))
            .setGender(convertToAdministrativeGender(props.getGender()))
            .setBirthDate(convertToDate(props.getDob()))
            .addAddress(convertToAddress(props.getAddress(), props.getCountry()));

    patient.addExtension(convertToRaceExtension(props.getRace()));
    patient.addExtension(convertToEthnicityExtension(props.getEthnicity()));
    patient.addExtension(
        convertToTribalAffiliationExtension(props.getTribalAffiliations()).orElse(null));

    patient.setId(props.getId());
    patient.addIdentifier().setValue(props.getId());
    convertPhoneNumbersToContactPoint(props.getPhoneNumbers()).forEach(patient::addTelecom);
    convertEmailsToContactPoint(ContactPointUse.HOME, props.getEmails())
        .forEach(patient::addTelecom);
    return patient;
  }

  public static Device convertToDevice(@NotNull DeviceType deviceType) {
    return convertToDevice(
        deviceType.getManufacturer(), deviceType.getModel(), deviceType.getInternalId().toString());
  }

  public static Device convertToDevice(String manufacturer, @NotNull String model, String id) {
    var device =
        new Device()
            .addDeviceName(
                new DeviceDeviceNameComponent().setName(model).setType(DeviceNameType.MODELNAME));
    if (manufacturer != null) {
      device.setManufacturer(manufacturer);
    }

    device.setId(id);
    return device;
  }

  public static Specimen convertToSpecimen(
      String specimenCode,
      String specimenName,
      String collectionCode,
      String collectionName,
      String id,
      String identifier) {
    var specimen = new Specimen();
    specimen.setId(id);
    specimen.addIdentifier().setValue(identifier);
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
        specimenType.getInternalId().toString(),
        UUID.randomUUID().toString());
  }

  public static List<Observation> convertToObservation(
      Set<Result> results,
      DeviceType deviceType,
      TestCorrectionStatus correctionStatus,
      String correctionReason) {
    return results.stream()
        .map(
            result -> {
              Optional<DeviceTypeDisease> deviceTypeDisease =
                  deviceType.getSupportedDiseaseTestPerformed().stream()
                      .filter(code -> code.getSupportedDisease() == result.getDisease())
                      .findFirst();
              String testPerformedLoincCode = getTestPerformedLoincCode(deviceTypeDisease);
              String equipmentUid = getEquipmentUid(deviceTypeDisease);
              String testkitNameId = getTestkitNameId(deviceTypeDisease);
              return convertToObservation(
                  result,
                  testPerformedLoincCode,
                  correctionStatus,
                  correctionReason,
                  testkitNameId,
                  equipmentUid,
                  deviceType.getModel());
            })
        .collect(Collectors.toList());
  }

  private static String getTestkitNameId(Optional<DeviceTypeDisease> deviceTypeDisease) {
    return deviceTypeDisease.map(DeviceTypeDisease::getTestkitNameId).orElse(null);
  }

  private static String getEquipmentUid(Optional<DeviceTypeDisease> deviceTypeDisease) {
    return deviceTypeDisease.map(DeviceTypeDisease::getEquipmentUid).orElse(null);
  }

  private static String getTestPerformedLoincCode(Optional<DeviceTypeDisease> deviceTypeDisease) {
    return deviceTypeDisease.map(DeviceTypeDisease::getTestPerformedLoincCode).orElse(null);
  }

  public static Observation convertToObservation(
      Result result,
      String testPerformedCode,
      TestCorrectionStatus correctionStatus,
      String correctionReason,
      String testkitNameId,
      String equipmentUid,
      String deviceModel) {
    if (result != null && result.getDisease() != null) {

      return convertToObservation(
          ConvertToObservationProps.builder()
              .diseaseCode(testPerformedCode)
              .diseaseName(result.getDisease().getName())
              .resultCode(result.getResultLOINC())
              .correctionStatus(correctionStatus)
              .correctionReason(correctionReason)
              .id(result.getInternalId().toString())
              .resultDescription(
                  Translators.convertConceptCodeToConceptName(result.getResultLOINC()))
              .testkitNameId(testkitNameId)
              .equipmentUid(equipmentUid)
              .deviceModel(deviceModel)
              .build());
    }
    return null;
  }

  public static Observation convertToObservation(ConvertToObservationProps props) {
    var observation = new Observation();
    observation.setId(props.getId());
    setStatus(observation, props.getCorrectionStatus());
    observation.setCode(createLoincConcept(props.getDiseaseCode(), "", props.getDiseaseName()));
    addSNOMEDValue(props.getResultCode(), observation, props.getResultDescription());
    observation.getMethod().getCodingFirstRep().setDisplay(props.getDeviceModel());
    observation
        .getMethod()
        .addExtension(
            new Extension()
                .setUrl(TESTKIT_NAME_ID_EXTENSION_URL)
                .setValue(new CodeableConcept().addCoding().setCode(props.getTestkitNameId())))
        .addExtension(
            new Extension()
                .setUrl(EQUIPMENT_UID_EXTENSION_URL)
                .setValue(new CodeableConcept().addCoding().setCode(props.getEquipmentUid())));

    addCorrectionNote(
        props.getCorrectionStatus() != TestCorrectionStatus.ORIGINAL,
        props.getCorrectionReason(),
        observation);

    observation
        .addInterpretation()
        .addCoding(convertToAbnormalFlagInterpretation(props.getResultCode()));

    return observation;
  }

  private static Coding convertToAbnormalFlagInterpretation(String resultCode) {
    Coding abnormalFlag = new Coding();

    abnormalFlag.setSystem(ABNORMAL_FLAGS_CODE_SYSTEM);

    if (resultCode.equals(DETECTED_SNOMED_CONCEPT.code())) {
      abnormalFlag.setCode(ABNORMAL_FLAG_ABNORMAL.code());
      abnormalFlag.setDisplay(ABNORMAL_FLAG_ABNORMAL.displayName());
    } else {
      abnormalFlag.setCode(ABNORMAL_FLAG_NORMAL.code());
      abnormalFlag.setDisplay(ABNORMAL_FLAG_NORMAL.displayName());
    }

    return abnormalFlag;
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

  public static Set<Observation> convertToAOEObservations(
      String eventId, AskOnEntrySurvey surveyData) {
    var observations = new HashSet<Observation>();
    var symptomaticCode =
        createLoincConcept(
            LOINC_AOE_SYMPTOMATIC,
            "Has symptoms related to condition of interest",
            "Has symptoms related to condition of interest");
    if (surveyData.getNoSymptoms()) {
      // user reported as not symptomatic
      observations.add(
          createAOEObservation(
              eventId + LOINC_AOE_SYMPTOMATIC, symptomaticCode, createYesNoUnkConcept(false)));
    } else if (surveyData.getSymptoms().containsValue(Boolean.TRUE)) {
      // user reported as symptomatic
      observations.add(
          createAOEObservation(
              eventId + LOINC_AOE_SYMPTOMATIC, symptomaticCode, createYesNoUnkConcept(true)));
      if (surveyData.getSymptomOnsetDate() != null) {
        observations.add(
            createAOEObservation(
                eventId + LOINC_AOE_SYMPTOM_ONSET,
                createLoincConcept(
                    LOINC_AOE_SYMPTOM_ONSET,
                    "Illness or injury onset date and time",
                    "Illness or injury onset date and time"),
                new DateTimeType(surveyData.getSymptomOnsetDate().toString())));
      }
    } else {
      // if neither no symptoms nor any symptoms checked, AoE form was not completed
      observations.add(
          createAOEObservation(
              eventId + LOINC_AOE_SYMPTOMATIC, symptomaticCode, createYesNoUnkConcept(null)));
    }
    return observations;
  }

  public static Observation createAOEObservation(
      String uniqueName, CodeableConcept code, Type value) {
    var observation =
        new Observation().setStatus(ObservationStatus.FINAL).setCode(code).setValue(value);
    observation.setId(UUID.nameUUIDFromBytes(uniqueName.getBytes()).toString());

    observation
        .addIdentifier()
        .setUse(IdentifierUse.OFFICIAL)
        .setType(
            createLoincConcept(
                LOINC_AOE_IDENTIFIER, "Public health laboratory ask at order entry panel", null));

    return observation;
  }

  private static CodeableConcept createLoincConcept(
      String codingCode, String codingDisplay, String text) {
    var concept = new CodeableConcept().setText(text);

    concept.addCoding().setSystem(LOINC_CODE_SYSTEM).setCode(codingCode).setDisplay(codingDisplay);

    return concept;
  }

  private static CodeableConcept createYesNoUnkConcept(Boolean val) {
    var concept = new CodeableConcept();
    var coding = concept.addCoding();
    if (val == null) {
      coding
          .setSystem(NULL_CODE_SYSTEM)
          .setCode(MappingConstants.UNK_CODE)
          .setDisplay(MappingConstants.UNKNOWN_STRING);
    } else {
      coding.setSystem(YESNO_CODE_SYSTEM).setCode(val ? "Y" : "N").setDisplay(val ? "Yes" : "No");
    }
    return concept;
  }

  private static void addSNOMEDValue(
      String resultCode, Observation observation, String resultDisplay) {
    var valueCodeableConcept = new CodeableConcept();
    var valueCoding = valueCodeableConcept.addCoding();
    valueCoding.setSystem(SNOMED_CODE_SYSTEM);
    valueCoding.setCode(resultCode);
    valueCoding.setDisplay(resultDisplay);
    observation.setValue(valueCodeableConcept);
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
    if (order.getDeviceType() != null
        && !order.getDeviceType().getSupportedDiseaseTestPerformed().isEmpty()) {
      deviceLoincCode =
          MultiplexUtils.inferMultiplexTestOrderLoinc(
              order.getDeviceType().getSupportedDiseaseTestPerformed());
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

    serviceRequest
        .addExtension()
        .setUrl(ORDER_CONTROL_EXTENSION_URL)
        .setValue(
            new CodeableConcept()
                .addCoding(
                    new Coding()
                        .setSystem(ORDER_CONTROL_CODE_SYSTEM)
                        .setCode(ORDER_CONTROL_CODE_OBSERVATIONS)));
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
      code =
          MultiplexUtils.inferMultiplexTestOrderLoinc(
              testEvent.getDeviceType().getSupportedDiseaseTestPerformed());
    }

    return convertToDiagnosticReport(
        status,
        code,
        Objects.toString(testEvent.getInternalId(), ""),
        testEvent.getDateTested(),
        testEvent.getUpdatedAt());
  }

  public static DiagnosticReport convertToDiagnosticReport(
      DiagnosticReportStatus status, String code, String id, Date dateTested, Date dateUpdated) {
    var diagnosticReport =
        new DiagnosticReport()
            .setStatus(status)
            .setEffective(new DateTimeType(dateTested))
            .setIssued(dateUpdated);
    diagnosticReport.setId(id);
    if (StringUtils.isNotBlank(code)) {
      diagnosticReport.getCode().addCoding().setSystem(LOINC_CODE_SYSTEM).setCode(code);
    }
    diagnosticReport.addIdentifier().setValue(id);
    return diagnosticReport;
  }

  public static Bundle createFhirBundle(
      @NotNull TestEvent testEvent,
      GitProperties gitProperties,
      Date currentDate,
      String processingId) {

    return createFhirBundle(
        CreateFhirBundleProps.builder()
            .patient(convertToPatient(testEvent.getPatient()))
            .testingLab(convertToOrganization(testEvent.getFacility()))
            .orderingFacility(null)
            .practitioner(convertToPractitioner(testEvent.getProviderData()))
            .device(convertToDevice(testEvent.getDeviceType()))
            .specimen(convertToSpecimen(testEvent.getSpecimenType()))
            .resultObservations(
                convertToObservation(
                    testEvent.getResults(),
                    testEvent.getDeviceType(),
                    testEvent.getCorrectionStatus(),
                    testEvent.getReasonForCorrection()))
            .aoeObservations(
                convertToAOEObservations(
                    testEvent.getInternalId().toString(), testEvent.getSurveyData()))
            .serviceRequest(convertToServiceRequest(testEvent.getOrder()))
            .diagnosticReport(convertToDiagnosticReport(testEvent))
            .currentDate(currentDate)
            .gitProperties(gitProperties)
            .processingId(processingId)
            .build());
  }

  public static Bundle createFhirBundle(CreateFhirBundleProps props) {
    var patientFullUrl = ResourceType.Patient + "/" + props.getPatient().getId();
    var orderingFacilityFullUrl =
        props.getOrderingFacility() == null
            ? null
            : ResourceType.Organization + "/" + props.getOrderingFacility().getId();
    var testingLabOrganizationFullUrl =
        ResourceType.Organization + "/" + props.getTestingLab().getId();
    var practitionerFullUrl = ResourceType.Practitioner + "/" + props.getPractitioner().getId();
    var specimenFullUrl = ResourceType.Specimen + "/" + props.getSpecimen().getId();
    var serviceRequestFullUrl =
        ResourceType.ServiceRequest + "/" + props.getServiceRequest().getId();
    var diagnosticReportFullUrl =
        ResourceType.DiagnosticReport + "/" + props.getDiagnosticReport().getId();
    var deviceFullUrl = ResourceType.Device + "/" + props.getDevice().getId();

    var practitionerRole =
        createPractitionerRole(
            orderingFacilityFullUrl == null
                ? testingLabOrganizationFullUrl
                : orderingFacilityFullUrl,
            practitionerFullUrl);
    var provenance = createProvenance(testingLabOrganizationFullUrl, props.getCurrentDate());
    var provenanceFullUrl = ResourceType.Provenance + "/" + provenance.getId();
    var messageHeader =
        createMessageHeader(
            testingLabOrganizationFullUrl,
            diagnosticReportFullUrl,
            provenanceFullUrl,
            props.getGitProperties(),
            props.getProcessingId());
    var practitionerRoleFullUrl = ResourceType.PractitionerRole + "/" + practitionerRole.getId();
    var messageHeaderFullUrl = ResourceType.MessageHeader + "/" + messageHeader.getId();

    props.getPatient().setManagingOrganization(new Reference(testingLabOrganizationFullUrl));
    props.getSpecimen().setSubject(new Reference(patientFullUrl));

    props.getServiceRequest().setSubject(new Reference(patientFullUrl));
    props.getServiceRequest().addPerformer(new Reference(testingLabOrganizationFullUrl));
    props.getServiceRequest().setRequester(new Reference(practitionerRoleFullUrl));
    props.getDiagnosticReport().addBasedOn(new Reference(serviceRequestFullUrl));
    props.getDiagnosticReport().setSubject(new Reference(patientFullUrl));
    props.getDiagnosticReport().addSpecimen(new Reference(specimenFullUrl));

    var entryList = new ArrayList<Pair<String, Resource>>();
    entryList.add(Pair.of(messageHeaderFullUrl, messageHeader));
    entryList.add(Pair.of(provenanceFullUrl, provenance));
    entryList.add(Pair.of(diagnosticReportFullUrl, props.getDiagnosticReport()));
    entryList.add(Pair.of(patientFullUrl, props.getPatient()));
    entryList.add(Pair.of(testingLabOrganizationFullUrl, props.getTestingLab()));
    if (orderingFacilityFullUrl != null) {
      entryList.add(Pair.of(orderingFacilityFullUrl, props.getOrderingFacility()));
    }
    entryList.add(Pair.of(practitionerFullUrl, props.getPractitioner()));
    entryList.add(Pair.of(specimenFullUrl, props.getSpecimen()));
    entryList.add(Pair.of(serviceRequestFullUrl, props.getServiceRequest()));
    entryList.add(Pair.of(deviceFullUrl, props.getDevice()));
    entryList.add(Pair.of(practitionerRoleFullUrl, practitionerRole));
    entryList.add(
        Pair.of(
            ResourceType.Organization + "/" + SIMPLE_REPORT_ORG_ID,
            new Organization().setName("SimpleReport").setId(SIMPLE_REPORT_ORG_ID)));

    props
        .getResultObservations()
        .forEach(
            observation -> {
              var observationFullUrl = ResourceType.Observation + "/" + observation.getId();

              observation.setSubject(new Reference(patientFullUrl));
              observation.addPerformer(new Reference(testingLabOrganizationFullUrl));
              observation.setSpecimen(new Reference(specimenFullUrl));
              observation.setDevice(new Reference(deviceFullUrl));

              props.getDiagnosticReport().addResult(new Reference(observationFullUrl));
              entryList.add(Pair.of(observationFullUrl, observation));
            });

    if (props.getAoeObservations() != null) {
      props
          .getAoeObservations()
          .forEach(
              observation -> {
                var observationFullUrl = ResourceType.Observation + "/" + observation.getId();

                observation.setSubject(new Reference(patientFullUrl));

                props.getServiceRequest().addSupportingInfo(new Reference(observationFullUrl));
                entryList.add(Pair.of(observationFullUrl, observation));
              });
    }

    var bundle =
        new Bundle()
            .setType(BundleType.MESSAGE)
            .setTimestamp(props.getCurrentDate())
            .setIdentifier(new Identifier().setValue(props.getDiagnosticReport().getId()));
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
      GitProperties gitProperties,
      String processingId) {
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
        .setEndpoint("https://simplereport.gov")
        .setVersion(gitProperties.getShortCommitId());
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
    messageHeader
        .getMeta()
        .addTag(PROCESSING_ID_SYSTEM, processingId, PROCESSING_ID_DISPLAY.get(processingId));
    return messageHeader;
  }
}
