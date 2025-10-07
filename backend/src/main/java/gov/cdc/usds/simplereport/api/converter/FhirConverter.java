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
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ORDER_EFFECTIVE_DATE_EXTENSION_URL;
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

import ca.uhn.fhir.model.api.TemporalPrecisionEnum;
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
import gov.cdc.usds.simplereport.service.TestOrderService;
import gov.cdc.usds.simplereport.utils.DateGenerator;
import gov.cdc.usds.simplereport.utils.MultiplexUtils;
import gov.cdc.usds.simplereport.utils.UUIDGenerator;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.TimeZone;
import java.util.UUID;
import java.util.function.Function;
import javax.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
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
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

@Component
@Slf4j
@RequiredArgsConstructor
public class FhirConverter {

  private final UUIDGenerator uuidGenerator;
  private final DateGenerator dateGenerator;

  private static final String SIMPLE_REPORT_ORG_ID = "07640c5d-87cd-488b-9343-a226c5166539";

  public HumanName convertToHumanName(@NotNull PersonName personName) {
    return convertToHumanName(
        personName.getFirstName(),
        personName.getMiddleName(),
        personName.getLastName(),
        personName.getSuffix());
  }

  public HumanName convertToHumanName(String first, String middle, String last, String suffix) {
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

  public List<ContactPoint> convertPhoneNumbersToContactPoint(
      @NotNull List<PhoneNumber> phoneNumber) {
    return phoneNumber.stream().map(this::convertToContactPoint).toList();
  }

  public ContactPoint convertToContactPoint(@NotNull PhoneNumber phoneNumber) {
    var contactPointUse = ContactPointUse.HOME;
    if (PhoneType.MOBILE.equals(phoneNumber.getType())) {
      contactPointUse = ContactPointUse.MOBILE;
    }

    return convertToContactPoint(contactPointUse, phoneNumber.getNumber());
  }

  public ContactPoint convertToContactPoint(ContactPointUse contactPointUse, String number) {
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

  public List<ContactPoint> convertEmailsToContactPoint(ContactPointUse use, List<String> emails) {
    return emails.stream().map(email -> convertEmailToContactPoint(use, email)).toList();
  }

  public ContactPoint convertEmailToContactPoint(ContactPointUse use, @NotNull String email) {
    return convertToContactPoint(use, ContactPointSystem.EMAIL, email);
  }

  public ContactPoint convertToContactPoint(
      ContactPointUse use, ContactPointSystem system, String value) {
    return new ContactPoint().setUse(use).setSystem(system).setValue(value);
  }

  public AdministrativeGender convertToAdministrativeGender(String gender) {

    if (gender == null) {
      return AdministrativeGender.UNKNOWN;
    }

    return switch (gender.toLowerCase()) {
      case "male", "m" -> AdministrativeGender.MALE;
      case "female", "f" -> AdministrativeGender.FEMALE;
      default -> AdministrativeGender.UNKNOWN;
    };
  }

  public Date convertToDate(@NotNull LocalDate date) {
    return Date.from(date.atStartOfDay(ZoneId.systemDefault()).toInstant());
  }

  /**
   * @param zonedDateTime the date time with a time zone
   * @return the DateTimeType object created from the ZonedDateTime, it's timezone, and second
   *     temporal precision
   */
  public DateTimeType convertToDateTimeType(ZonedDateTime zonedDateTime) {
    return convertToDateTimeType(zonedDateTime, TemporalPrecisionEnum.SECOND);
  }

  /**
   * @param zonedDateTime the date time with a time zone
   * @param temporalPrecisionEnum precision of the date time, defaults to {@code
   *     TemporalPrecisionEnum.SECOND}
   * @return the DateTimeType object created from the ZonedDateTime and it's timezone
   */
  public DateTimeType convertToDateTimeType(
      ZonedDateTime zonedDateTime, TemporalPrecisionEnum temporalPrecisionEnum) {
    if (zonedDateTime == null) {
      return null;
    }
    if (temporalPrecisionEnum == null) {
      temporalPrecisionEnum = TemporalPrecisionEnum.SECOND;
    }
    return new DateTimeType(
        Date.from(zonedDateTime.toInstant()),
        temporalPrecisionEnum,
        TimeZone.getTimeZone(zonedDateTime.getZone()));
  }

  /**
   * @param zonedDateTime the date time with a time zone
   * @param temporalPrecisionEnum precision of the date time, defaults to {@code
   *     TemporalPrecisionEnum.MILLI}
   * @return the InstantType object created from the Instant of the ZonedDateTime and its time zone
   *     offset
   */
  public InstantType convertToInstantType(
      ZonedDateTime zonedDateTime, TemporalPrecisionEnum temporalPrecisionEnum) {
    if (zonedDateTime == null) return null;
    if (temporalPrecisionEnum == null) temporalPrecisionEnum = TemporalPrecisionEnum.MILLI;
    return new InstantType(
        Date.from(zonedDateTime.toInstant()),
        temporalPrecisionEnum,
        TimeZone.getTimeZone(zonedDateTime.getZone()));
  }

  public Address convertToAddress(@NotNull StreetAddress address, String country) {
    return convertToAddress(
        address.getStreet(),
        address.getCity(),
        address.getCounty(),
        address.getState(),
        address.getPostalCode(),
        country);
  }

  public Address convertToAddress(
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

  public Extension convertToRaceExtension(@NotNull String race) {
    var ext = new Extension();
    ext.setUrl(RACE_EXTENSION_URL);
    var codeable = new CodeableConcept();
    var coding = codeable.addCoding();
    String raceKey = race.toLowerCase();
    if (StringUtils.isNotBlank(race) && PersonUtils.raceMap.containsKey(raceKey)) {
      if (MappingConstants.UNKNOWN_STRING.equalsIgnoreCase(race)
          || "refused".equalsIgnoreCase(race)) {
        coding.setSystem(NULL_CODE_SYSTEM);
      } else {
        coding.setSystem(RACE_CODING_SYSTEM);
      }
      coding.setCode(PersonUtils.raceMap.get(raceKey));
      codeable.setText(race);
    } else {
      coding.setSystem(NULL_CODE_SYSTEM);
      coding.setCode(MappingConstants.UNK_CODE);
      codeable.setText(MappingConstants.UNKNOWN_STRING);
    }
    ext.setValue(codeable);
    return ext;
  }

  public Extension convertToEthnicityExtension(String ethnicity) {
    if (StringUtils.isNotBlank(ethnicity)) {
      var ext = new Extension();
      ext.setUrl(ETHNICITY_EXTENSION_URL);
      var codeableConcept = new CodeableConcept();
      var coding = codeableConcept.addCoding().setSystem(ETHNICITY_CODE_SYSTEM);
      String ethnicityKey = ethnicity.toLowerCase();
      if (PersonUtils.ETHNICITY_MAP.containsKey(ethnicityKey)) {
        coding
            .setCode(PersonUtils.ETHNICITY_MAP.get(ethnicityKey).get(0))
            .setDisplay(PersonUtils.ETHNICITY_MAP.get(ethnicityKey).get(1));
        codeableConcept.setText(PersonUtils.ETHNICITY_MAP.get(ethnicityKey).get(1));
      } else {
        coding.setCode(MappingConstants.U_CODE).setDisplay(MappingConstants.UNKNOWN_STRING);
        codeableConcept.setText(MappingConstants.UNKNOWN_STRING);
      }
      ext.setValue(codeableConcept);
      return ext;
    }
    return null;
  }

  public Optional<Extension> convertToTribalAffiliationExtension(List<String> tribalAffiliations) {
    return CollectionUtils.isEmpty(tribalAffiliations)
        ? Optional.empty()
        : convertToTribalAffiliationExtension(tribalAffiliations.get(0));
  }

  public Optional<Extension> convertToTribalAffiliationExtension(String tribalAffiliation) {
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

  public Practitioner convertToPractitioner(Provider provider) {
    return convertToPractitioner(
        provider.getInternalId().toString(),
        provider.getNameInfo(),
        provider.getTelephone(),
        provider.getAddress(),
        DEFAULT_COUNTRY,
        provider.getProviderId());
  }

  public Practitioner convertToPractitioner(
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

  public Organization convertToOrganization(Facility facility) {
    return convertToOrganization(
        facility.getInternalId().toString(),
        facility.getFacilityName(),
        facility.getCliaNumber(),
        facility.getTelephone(),
        facility.getEmail(),
        facility.getAddress(),
        DEFAULT_COUNTRY);
  }

  public Organization convertToOrganization(
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

  public Patient convertToPatient(Person person) {
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

  public Patient convertToPatient(ConvertToPatientProps props) {
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

    if (!CollectionUtils.isEmpty(props.getPhoneNumbers())) {
      convertPhoneNumbersToContactPoint(props.getPhoneNumbers()).forEach(patient::addTelecom);
    }

    if (!CollectionUtils.isEmpty(props.getEmails())) {
      convertEmailsToContactPoint(ContactPointUse.HOME, props.getEmails())
          .forEach(patient::addTelecom);
    }
    return patient;
  }

  public Device convertToDevice(@NotNull DeviceType deviceType) {
    return convertToDevice(
        deviceType.getManufacturer(), deviceType.getModel(), deviceType.getInternalId().toString());
  }

  public Device convertToDevice(String manufacturer, @NotNull String model, String id) {
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

  public Specimen convertToSpecimen(ConvertToSpecimenProps props) {
    var specimen = new Specimen();
    specimen.setId(props.getId());
    specimen.addIdentifier().setValue(props.getIdentifier());
    if (StringUtils.isNotBlank(props.getSpecimenCode())) {
      var codeableConcept = specimen.getType();
      var coding = codeableConcept.addCoding();
      coding.setSystem(SNOMED_CODE_SYSTEM);
      coding.setCode(props.getSpecimenCode());
      codeableConcept.setText(props.getSpecimenName());
    }
    if (StringUtils.isNotBlank(props.getCollectionCode())) {
      var collection = specimen.getCollection();
      var codeableConcept = collection.getBodySite();
      var coding = codeableConcept.addCoding();
      coding.setSystem(SNOMED_CODE_SYSTEM);
      coding.setCode(props.getCollectionCode());
      codeableConcept.setText(props.getCollectionName());
    }

    if (props.getCollectionDate() != null) {
      var collection = specimen.getCollection();
      collection.setCollected(convertToDateTimeType(props.getCollectionDate()));
    }

    if (props.getReceivedTime() != null) {
      specimen.setReceivedTimeElement(convertToDateTimeType(props.getReceivedTime()));
    }

    return specimen;
  }

  public Specimen convertToSpecimen(
      @NotNull SpecimenType specimenType,
      UUID specimenIdentifier,
      ZonedDateTime collectionDate,
      ZonedDateTime receivedTime) {
    return convertToSpecimen(
        ConvertToSpecimenProps.builder()
            .specimenCode(specimenType.getTypeCode())
            .specimenName(specimenType.getName())
            .collectionCode(specimenType.getCollectionLocationCode())
            .collectionName(specimenType.getCollectionLocationName())
            .id(specimenType.getInternalId().toString())
            .identifier(specimenIdentifier.toString())
            .collectionDate(collectionDate)
            .receivedTime(receivedTime)
            .build());
  }

  public List<Observation> convertToObservation(
      Set<Result> results,
      DeviceType deviceType,
      TestCorrectionStatus correctionStatus,
      String correctionReason,
      Date resultDate) {
    return results.stream()
        .map(
            result -> {
              List<DeviceTypeDisease> deviceTypeDiseaseEntries =
                  deviceType.getSupportedDiseaseTestPerformed().stream()
                      .filter(code -> code.getSupportedDisease().equals(result.getDisease()))
                      .toList();
              String testPerformedLoincCode =
                  deviceTypeDiseaseEntries.stream()
                      .findFirst()
                      .map(DeviceTypeDisease::getTestPerformedLoincCode)
                      .orElse(null);
              String equipmentUid =
                  getCommonDiseaseValue(
                      deviceTypeDiseaseEntries, DeviceTypeDisease::getEquipmentUid);
              String testkitNameId =
                  getCommonDiseaseValue(
                      deviceTypeDiseaseEntries, DeviceTypeDisease::getTestkitNameId);
              return convertToObservation(
                  result,
                  testPerformedLoincCode,
                  correctionStatus,
                  correctionReason,
                  testkitNameId,
                  equipmentUid,
                  deviceType.getModel(),
                  resultDate);
            })
        .toList();
  }

  public String getCommonDiseaseValue(
      List<DeviceTypeDisease> deviceTypeDiseases,
      Function<DeviceTypeDisease, String> diseaseValue) {
    List<String> distinctValues = deviceTypeDiseases.stream().map(diseaseValue).distinct().toList();
    return distinctValues.size() == 1 ? distinctValues.get(0) : null;
  }

  public Observation convertToObservation(
      Result result,
      String testPerformedCode,
      TestCorrectionStatus correctionStatus,
      String correctionReason,
      String testkitNameId,
      String equipmentUid,
      String deviceModel,
      Date resultDate) {
    if (result != null && result.getDisease() != null) {

      return convertToObservation(
          ConvertToObservationProps.builder()
              .diseaseCode(testPerformedCode)
              .diseaseName(result.getDisease().getName())
              .resultCode(result.getResultSNOMED())
              .correctionStatus(correctionStatus)
              .correctionReason(correctionReason)
              .id(result.getInternalId().toString())
              .resultDescription(
                  Translators.convertConceptCodeToConceptName(result.getResultSNOMED()))
              .testkitNameId(testkitNameId)
              .equipmentUid(equipmentUid)
              .deviceModel(deviceModel)
              .issued(resultDate)
              .build());
    }
    return null;
  }

  public Observation convertToObservation(ConvertToObservationProps props) {
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

    observation.setIssued(props.getIssued());
    observation.getIssuedElement().setTimeZoneZulu(true);

    return observation;
  }

  private Coding convertToAbnormalFlagInterpretation(String resultCode) {
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

  private void setStatus(Observation observation, TestCorrectionStatus correctionStatus) {
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

  private void addCorrectionNote(
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

  public Set<Observation> convertToAOEObservation(
      String eventId, Boolean symptomatic, LocalDate symptomOnsetDate) {
    var observations = new HashSet<Observation>();
    var symptomaticCode =
        createLoincConcept(
            LOINC_AOE_SYMPTOMATIC,
            "Has symptoms related to condition of interest",
            "Has symptoms related to condition of interest");
    observations.add(
        createAOEObservation(
            eventId + LOINC_AOE_SYMPTOMATIC, symptomaticCode, createYesNoUnkConcept(symptomatic)));

    if (Boolean.TRUE.equals(symptomatic) && symptomOnsetDate != null) {
      observations.add(
          createAOEObservation(
              eventId + LOINC_AOE_SYMPTOM_ONSET,
              createLoincConcept(
                  LOINC_AOE_SYMPTOM_ONSET,
                  "Illness or injury onset date and time",
                  "Illness or injury onset date and time"),
              new DateTimeType(symptomOnsetDate.toString())));
    }
    return observations;
  }

  public Set<Observation> convertToAOEObservations(String eventId, AskOnEntrySurvey surveyData) {
    Boolean symptomatic = null;
    if (Boolean.TRUE.equals(surveyData.getNoSymptoms())) {
      symptomatic = false;
    } else if (surveyData.getSymptoms().containsValue(Boolean.TRUE)) {
      symptomatic = true;
    } // implied else: AoE form was not completed. Symptomatic set to null

    var symptomOnsetDate = surveyData.getSymptomOnsetDate();

    return convertToAOEObservation(eventId, symptomatic, symptomOnsetDate);
  }

  public Observation createAOEObservation(String uniqueName, CodeableConcept code, Type value) {
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

  private CodeableConcept createLoincConcept(String codingCode, String codingDisplay, String text) {
    var concept = new CodeableConcept().setText(text);

    concept.addCoding().setSystem(LOINC_CODE_SYSTEM).setCode(codingCode).setDisplay(codingDisplay);

    return concept;
  }

  private CodeableConcept createYesNoUnkConcept(Boolean val) {
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

  private void addSNOMEDValue(String resultCode, Observation observation, String resultDisplay) {
    var valueCodeableConcept = new CodeableConcept();
    var valueCoding = valueCodeableConcept.addCoding();
    valueCoding.setSystem(SNOMED_CODE_SYSTEM);
    valueCoding.setCode(resultCode);
    valueCoding.setDisplay(resultDisplay);
    observation.setValue(valueCodeableConcept);
  }

  public ServiceRequest convertToServiceRequest(
      @NotNull TestOrder order, ZonedDateTime orderTestDate) {
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
        serviceRequestStatus,
        deviceLoincCode,
        Objects.toString(order.getInternalId(), ""),
        orderTestDate);
  }

  public ServiceRequest convertToServiceRequest(
      ServiceRequestStatus status,
      String requestedCode,
      String id,
      ZonedDateTime orderEffectiveDate) {
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

    serviceRequest
        .addExtension()
        .setUrl(ORDER_EFFECTIVE_DATE_EXTENSION_URL)
        .setValue(convertToDateTimeType(orderEffectiveDate, TemporalPrecisionEnum.SECOND));

    return serviceRequest;
  }

  /**
   * Used during single entry FHIR conversion
   *
   * @param testEvent Single entry test event.
   * @param currentDate Used to set {@code DiagnosticReport.issued}, the instant this version was *
   *     made.
   * @return DiagnosticReport
   */
  public DiagnosticReport convertToDiagnosticReport(TestEvent testEvent, Date currentDate) {
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

    ZonedDateTime dateTested = null;
    if (testEvent.getDateTested() != null) {
      // getDateTested returns a Date representing an exact moment of time so
      // finding a specific timezone for the TestEvent is not required to ensure it is accurate
      dateTested = ZonedDateTime.ofInstant(testEvent.getDateTested().toInstant(), ZoneOffset.UTC);
    }
    ZonedDateTime dateIssued = null;
    if (currentDate != null)
      dateIssued = ZonedDateTime.ofInstant(currentDate.toInstant(), ZoneOffset.UTC);

    return convertToDiagnosticReport(
        status, code, Objects.toString(testEvent.getInternalId(), ""), dateTested, dateIssued);
  }

  /**
   * @param status Diagnostic report status
   * @param code LOINC code
   * @param id Diagnostic report id
   * @param dateTested Used to set {@code DiagnosticReport.effective}, the clinically relevant
   *     time/time-period for report.
   * @param dateIssued Used to set {@code DiagnosticReport.issued}, the date and time that this
   *     version of the report was made available to providers, typically after the report was
   *     reviewed and verified.
   * @return DiagnosticReport
   */
  public DiagnosticReport convertToDiagnosticReport(
      DiagnosticReportStatus status,
      String code,
      String id,
      ZonedDateTime dateTested,
      ZonedDateTime dateIssued) {
    var diagnosticReport =
        new DiagnosticReport()
            .setStatus(status)
            .setEffective(convertToDateTimeType(dateTested))
            .setIssuedElement(convertToInstantType(dateIssued, TemporalPrecisionEnum.SECOND));

    diagnosticReport.setId(id);
    if (StringUtils.isNotBlank(code)) {
      diagnosticReport.getCode().addCoding().setSystem(LOINC_CODE_SYSTEM).setCode(code);
    }
    diagnosticReport.addIdentifier().setValue(id);
    return diagnosticReport;
  }

  /**
   * @param testEvent The single entry test event created in {@code TestOrderService}
   * @param gitProperties Git properties
   * @param processingId Processing id
   * @return FHIR bundle
   * @see TestOrderService
   */
  public Bundle createFhirBundle(
      @NotNull TestEvent testEvent, GitProperties gitProperties, String processingId) {

    Date currentDate = dateGenerator.newDate();
    ZonedDateTime dateTested =
        testEvent.getDateTested() != null
            ? ZonedDateTime.ofInstant(testEvent.getDateTested().toInstant(), ZoneOffset.UTC)
            : null;

    return createFhirBundle(
        CreateFhirBundleProps.builder()
            .patient(convertToPatient(testEvent.getPatient()))
            .testingLab(convertToOrganization(testEvent.getFacility()))
            .orderingFacility(null)
            .practitioner(convertToPractitioner(testEvent.getProviderData()))
            .device(convertToDevice(testEvent.getDeviceType()))
            .specimen(
                convertToSpecimen(
                    testEvent.getSpecimenType(), uuidGenerator.randomUUID(), null, null))
            .resultObservations(
                convertToObservation(
                    testEvent.getResults(),
                    testEvent.getDeviceType(),
                    testEvent.getCorrectionStatus(),
                    testEvent.getReasonForCorrection(),
                    testEvent.getDateTested()))
            .aoeObservations(
                convertToAOEObservations(
                    testEvent.getInternalId().toString(), testEvent.getSurveyData()))
            .serviceRequest(convertToServiceRequest(testEvent.getOrder(), dateTested))
            .diagnosticReport(convertToDiagnosticReport(testEvent, currentDate))
            .currentDate(currentDate)
            .gitProperties(gitProperties)
            .processingId(processingId)
            .build());
  }

  public Bundle createFhirBundle(CreateFhirBundleProps props) {
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
            practitionerFullUrl,
            uuidGenerator.randomUUID());
    var provenance =
        createProvenance(
            testingLabOrganizationFullUrl, props.getCurrentDate(), uuidGenerator.randomUUID());
    var provenanceFullUrl = ResourceType.Provenance + "/" + provenance.getId();
    var messageHeader =
        createMessageHeader(
            testingLabOrganizationFullUrl,
            diagnosticReportFullUrl,
            provenanceFullUrl,
            props.getGitProperties(),
            props.getProcessingId(),
            uuidGenerator.randomUUID());
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

    bundle.getTimestampElement().setTimeZoneZulu(true);

    entryList.forEach(
        pair ->
            bundle.addEntry(
                new BundleEntryComponent()
                    .setFullUrl(pair.getFirst())
                    .setResource(pair.getSecond())));

    return bundle;
  }

  public Provenance createProvenance(
      String organizationFullUrl, Date dateTested, UUID provenanceId) {
    var provenance = new Provenance();

    provenance.setId(provenanceId.toString());
    provenance
        .getActivity()
        .addCoding()
        .setSystem(EVENT_TYPE_CODE_SYSTEM)
        .setCode(EVENT_TYPE_CODE)
        .setDisplay(EVENT_TYPE_DISPLAY);
    provenance.addAgent().setWho(new Reference().setReference(organizationFullUrl));
    provenance.setRecorded(dateTested);
    provenance.getRecordedElement().setTimeZoneZulu(true);
    return provenance;
  }

  public PractitionerRole createPractitionerRole(
      String organizationUrl, String practitionerUrl, UUID practitionerRoleId) {
    var practitionerRole = new PractitionerRole();
    practitionerRole.setId(practitionerRoleId.toString());
    practitionerRole
        .setPractitioner(new Reference().setReference(practitionerUrl))
        .setOrganization(new Reference().setReference(organizationUrl));
    return practitionerRole;
  }

  public MessageHeader createMessageHeader(
      String organizationUrl,
      String mainResourceUrl,
      String provenanceFullUrl,
      GitProperties gitProperties,
      String processingId,
      UUID messageHeaderId) {
    var messageHeader = new MessageHeader();
    messageHeader.setId(messageHeaderId.toString());
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
