package gov.cdc.usds.simplereport.api.converter;

import static gov.cdc.usds.simplereport.api.Translators.ABNORMAL_SNOMEDS;
import static gov.cdc.usds.simplereport.api.Translators.FEMALE;
import static gov.cdc.usds.simplereport.api.Translators.GENDER_IDENTITIES;
import static gov.cdc.usds.simplereport.api.Translators.MALE;
import static gov.cdc.usds.simplereport.api.Translators.NON_BINARY;
import static gov.cdc.usds.simplereport.api.Translators.NORMAL_SNOMEDS;
import static gov.cdc.usds.simplereport.api.Translators.OTHER;
import static gov.cdc.usds.simplereport.api.Translators.REFUSED;
import static gov.cdc.usds.simplereport.api.Translators.TRANS_MAN;
import static gov.cdc.usds.simplereport.api.Translators.TRANS_WOMAN;
import static gov.cdc.usds.simplereport.api.Translators.getSymptomName;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ABNORMAL_FLAGS_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ABNORMAL_FLAG_ABNORMAL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ABNORMAL_FLAG_NORMAL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.AOE_EMPLOYED_IN_HEALTHCARE_DISPLAY;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.DATA_ABSENT_REASON_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.DATA_ABSENT_REASON_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.DEFAULT_COUNTRY;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.DIAGNOSTIC_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ETHNICITY_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ETHNICITY_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.EVENT_TYPE_CODE;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.EVENT_TYPE_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.EVENT_TYPE_DISPLAY;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LABORATORY_STRING_LITERAL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LAB_STRING_LITERAL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_AOE_EMPLOYED_IN_HEALTHCARE;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_AOE_IDENTIFIER;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_AOE_PREGNANCY_STATUS;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_AOE_RESIDENCE_TYPE;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_AOE_RESIDENT_CONGREGATE_SETTING;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_AOE_SYMPTOMATIC;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_AOE_SYMPTOM_ONSET;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_GENDER_IDENTITY;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_SYMPTOM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.LOINC_SYMPTOM_TIMING_PANEL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NOTE_TYPE_CODING_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NOTE_TYPE_CODING_SYSTEM_CODE;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NOTE_TYPE_CODING_SYSTEM_CODE_INDEX_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NOTE_TYPE_CODING_SYSTEM_CODE_INDEX_VALUE;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NOTE_TYPE_CODING_SYSTEM_DISPLAY;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NOTE_TYPE_CODING_SYSTEM_VERSION;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NOTE_TYPE_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NPI_PREFIX;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NULL_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.OBSERVATION_CATEGORY_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ORDER_CONTROL_CODE_OBSERVATIONS;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ORDER_CONTROL_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ORDER_CONTROL_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.ORDER_EFFECTIVE_DATE_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.PRACTICIONER_IDENTIFIER_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.PROCESSING_ID_DISPLAY;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.PROCESSING_ID_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.RACE_CODING_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.RACE_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.SIMPLE_REPORT_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.SIMPLE_REPORT_GENDER_OF_SEXUAL_PARTNERS;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.SNOMED_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.TESTKIT_NAME_ID_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.TRIBAL_AFFILIATION_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.TRIBAL_AFFILIATION_EXTENSION_URL;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.TRIBAL_AFFILIATION_STRING;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.UNIVERSAL_ID_SYSTEM;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.YESNO_CODE_SYSTEM;
import static gov.cdc.usds.simplereport.api.model.TestEventExport.DEFAULT_LOCATION_CODE;
import static gov.cdc.usds.simplereport.api.model.TestEventExport.DEFAULT_LOCATION_NAME;
import static gov.cdc.usds.simplereport.api.model.TestEventExport.FALLBACK_DEFAULT_TEST_MINUTES;
import static gov.cdc.usds.simplereport.api.model.TestEventExport.UNKNOWN_ADDRESS_INDICATOR;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.NO_SYPHILIS_HISTORY_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.YES_SYPHILIS_HISTORY_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.genderIdentityDisplaySet;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.genderIdentitySnomedSet;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.getResidenceTypeMap;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.pregnancyStatusDisplayMap;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.pregnancyStatusSnomedMap;

import ca.uhn.fhir.model.api.TemporalPrecisionEnum;
import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.PhoneNumberUtil.PhoneNumberFormat;
import gov.cdc.usds.simplereport.api.MappingConstants;
import gov.cdc.usds.simplereport.api.Translators;
import gov.cdc.usds.simplereport.api.model.universalreporting.FacilityReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.PatientReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.ProviderReportInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.SpecimenInput;
import gov.cdc.usds.simplereport.api.model.universalreporting.TestDetailsInput;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PersonUtils;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.Result;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.SnomedConceptRecord;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.service.TestOrderService;
import gov.cdc.usds.simplereport.utils.DateGenerator;
import gov.cdc.usds.simplereport.utils.DateTimeUtils;
import gov.cdc.usds.simplereport.utils.MultiplexUtils;
import gov.cdc.usds.simplereport.utils.UUIDGenerator;
import jakarta.validation.constraints.NotNull;
import java.time.Duration;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.TimeZone;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;
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
import org.owasp.encoder.Encode;
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

  public Extension convertToRaceExtension(String race) {
    var ext = new Extension();
    ext.setUrl(RACE_EXTENSION_URL);
    var codeable = new CodeableConcept();
    var coding = codeable.addCoding();
    boolean isParseableRace =
        StringUtils.isNotBlank(race) && PersonUtils.raceMap.containsKey(race.toLowerCase());
    if (isParseableRace) {
      if (MappingConstants.UNKNOWN_STRING.equalsIgnoreCase(race)
          || "refused".equalsIgnoreCase(race)) {
        coding.setSystem(NULL_CODE_SYSTEM);
      } else {
        coding.setSystem(RACE_CODING_SYSTEM);
      }
      coding.setCode(PersonUtils.raceMap.get(race.toLowerCase()));
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

  public StreetAddress getPatientAddress(Person person, Facility facility) {
    var personAddress = person.getAddress();
    if (UNKNOWN_ADDRESS_INDICATOR.equalsIgnoreCase(person.getStreet()) && facility != null) {
      var facilityAddress = facility.getAddress();
      personAddress.setCity(facilityAddress.getCity());
      personAddress.setState(facilityAddress.getState());
      personAddress.setPostalCode(facilityAddress.getPostalCode());
      personAddress.setCounty(facilityAddress.getCounty());
    }
    return personAddress;
  }

  public List<PhoneNumber> getPatientPhoneNumbers(Person person, Facility facility) {
    if (person.getPhoneNumbers() == null || person.getPhoneNumbers().isEmpty()) {
      return List.of(new PhoneNumber(PhoneType.LANDLINE, facility.getTelephone()));
    }
    return person.getPhoneNumbers();
  }

  public Patient convertToPatient(Person person, Facility facility) {
    return convertToPatient(
        ConvertToPatientProps.builder()
            .id(person.getInternalId().toString())
            .name(person.getNameInfo())
            .phoneNumbers(getPatientPhoneNumbers(person, facility))
            .emails(person.getEmails())
            .gender(person.getGender())
            .genderIdentity(person.getGenderIdentity())
            .dob(person.getBirthDate())
            .address(getPatientAddress(person, facility))
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

  public Device convertToDevice(
      @NotNull DeviceType deviceType, String equipmentUid, String equipmentUidType) {
    return convertToDevice(
        deviceType.getManufacturer(),
        deviceType.getModel(),
        deviceType.getInternalId().toString(),
        equipmentUid,
        equipmentUidType);
  }

  public Device convertToDevice(
      String manufacturer,
      @NotNull String model,
      String id,
      String equipmentUid,
      String equipmentUidType) {
    var device =
        new Device()
            .addDeviceName(
                new DeviceDeviceNameComponent().setName(model).setType(DeviceNameType.MODELNAME));
    if (StringUtils.isNotBlank(equipmentUid)) {
      device.addIdentifier().setValue(equipmentUid);
    }
    if (StringUtils.isNotBlank(equipmentUidType)) {
      CodeableConcept equipmentUidTypeCodeableConcept = new CodeableConcept();
      Coding equipmentUidTypeCoding = equipmentUidTypeCodeableConcept.addCoding();
      equipmentUidTypeCoding.setCode(equipmentUidType);

      device.addIdentifier().setType(equipmentUidTypeCodeableConcept);
    }
    if (StringUtils.isNotBlank(manufacturer)) {
      device.setManufacturer(manufacturer);
    }

    device.setId(id);
    return device;
  }

  // https://github.com/CDCgov/prime-simplereport/pull/6955#discussion_r1395360817
  private Specimen setCollectionCodingAndName(Specimen specimen, ConvertToSpecimenProps props) {
    boolean collectionCodeProvided = StringUtils.isNotBlank(props.getCollectionCode());
    boolean collectionLocationNameProvided = StringUtils.isNotBlank(props.getCollectionName());

    String collectionCodeToSet = DEFAULT_LOCATION_CODE;
    String collectionLocationNameToSet = null;

    if (collectionCodeProvided && !collectionLocationNameProvided) {
      collectionCodeToSet = props.getCollectionCode();
    } else if (collectionCodeProvided && collectionLocationNameProvided) {
      collectionCodeToSet = props.getCollectionCode();
      collectionLocationNameToSet = props.getCollectionName();
    } else {
      collectionLocationNameToSet = DEFAULT_LOCATION_NAME;
    }

    Specimen.SpecimenCollectionComponent collection = specimen.getCollection();
    CodeableConcept collectionCodeableConcept = collection.getBodySite();
    Coding collectionCoding = collectionCodeableConcept.addCoding();
    collectionCoding.setSystem(SNOMED_CODE_SYSTEM);
    collectionCoding.setCode(collectionCodeToSet);
    collectionCodeableConcept.setText(collectionLocationNameToSet);

    return specimen;
  }

  public Specimen convertToSpecimen(ConvertToSpecimenProps props) {
    Specimen specimen = new Specimen();
    specimen.setId(props.getId());
    specimen.addIdentifier().setValue(props.getIdentifier());

    setCollectionCodingAndName(specimen, props);

    if (StringUtils.isNotBlank(props.getSpecimenCode())) {
      CodeableConcept codeableConcept = specimen.getType();
      Coding coding = codeableConcept.addCoding();
      coding.setSystem(SNOMED_CODE_SYSTEM);
      coding.setCode(props.getSpecimenCode());
      codeableConcept.setText(props.getSpecimenName());
    }
    if (props.getCollectionDate() != null) {
      Specimen.SpecimenCollectionComponent collection = specimen.getCollection();
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
              DeviceTypeDisease deviceTypeDisease =
                  deviceTypeDiseaseEntries.stream().findFirst().orElse(new DeviceTypeDisease());

              String testkitNameId =
                  getCommonDiseaseValue(
                      deviceTypeDiseaseEntries, DeviceTypeDisease::getTestkitNameId);
              return convertToObservation(
                  result,
                  deviceTypeDisease,
                  correctionStatus,
                  correctionReason,
                  testkitNameId,
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
      DeviceTypeDisease deviceTypeDisease,
      TestCorrectionStatus correctionStatus,
      String correctionReason,
      String testkitNameId,
      String deviceModel,
      Date resultDate) {
    if (result != null && result.getDisease() != null) {

      SnomedConceptRecord resultConceptRecord =
          Translators.getSnomedConceptByCode(result.getResultSNOMED());

      return convertToObservation(
          ConvertToObservationProps.builder()
              .testPerformedLoinc(deviceTypeDisease.getTestPerformedLoincCode())
              .diseaseName(result.getDisease().getName())
              .resultCode(result.getResultSNOMED())
              .correctionStatus(correctionStatus)
              .correctionReason(correctionReason)
              .id(result.getInternalId().toString())
              .resultDescription(resultConceptRecord == null ? null : resultConceptRecord.name())
              .testkitNameId(testkitNameId)
              .deviceModel(deviceModel)
              .issued(resultDate)
              .testPerformedLOINCLongName(deviceTypeDisease.getTestPerformedLoincLongName())
              .build());
    }
    return null;
  }

  public Observation convertToObservation(ConvertToObservationProps props) {
    var observation = new Observation();
    observation.setId(props.getId());
    setStatus(observation, props.getCorrectionStatus());
    observation.setCode(
        createLoincConcept(
            props.getTestPerformedLoinc(),
            props.getTestPerformedLOINCLongName(),
            props.getDiseaseName()));
    addSNOMEDValue(props.getResultCode(), observation, props.getResultDescription());
    observation.getMethod().getCodingFirstRep().setDisplay(props.getDeviceModel());
    observation
        .getMethod()
        .addExtension(
            new Extension()
                .setUrl(TESTKIT_NAME_ID_EXTENSION_URL)
                .setValue(new CodeableConcept().addCoding().setCode(props.getTestkitNameId())));

    addCorrectionNote(
        props.getCorrectionStatus() != TestCorrectionStatus.ORIGINAL,
        props.getCorrectionReason(),
        observation);

    Coding abnormalFlagCode = convertToAbnormalFlagInterpretation(props.getResultCode());
    if (abnormalFlagCode != null) {
      observation.addInterpretation().addCoding(abnormalFlagCode);
    }

    observation.setIssued(props.getIssued());
    observation.getIssuedElement().setTimeZoneZulu(true);

    return observation;
  }

  public Coding convertToAbnormalFlagInterpretation(String resultCode) {
    Coding abnormalFlag = new Coding();

    abnormalFlag.setSystem(ABNORMAL_FLAGS_CODE_SYSTEM);

    if (ABNORMAL_SNOMEDS.keySet().contains(resultCode)) {
      abnormalFlag.setCode(ABNORMAL_FLAG_ABNORMAL.code());
      abnormalFlag.setDisplay(ABNORMAL_FLAG_ABNORMAL.displayName());
    } else if (NORMAL_SNOMEDS.keySet().contains(resultCode)) {
      abnormalFlag.setCode(ABNORMAL_FLAG_NORMAL.code());
      abnormalFlag.setDisplay(ABNORMAL_FLAG_NORMAL.displayName());
    } else {
      log.info("Unsupported SNOMED result code: {}", Encode.forJava(resultCode));
      return null;
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

  public Set<Observation> convertToAOESymptomaticObservation(
      String eventId, Boolean symptomatic, LocalDate symptomOnsetDate) {
    var observations = new LinkedHashSet<Observation>();
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

  public Observation createSymptomObservation(CodeableConcept code, Type value) {
    Observation observation =
        new Observation().setStatus(ObservationStatus.FINAL).setCode(code).setValue(value);
    observation.setId(uuidGenerator.randomUUID().toString());
    observation
        .addIdentifier()
        .setUse(IdentifierUse.OFFICIAL)
        .setType(createLoincConcept(LOINC_SYMPTOM_TIMING_PANEL, "Symptom and timing panel", null));
    return observation;
  }

  public Set<Observation> convertToSymptomsObservations(List<String> symptoms) {
    HashSet<Observation> observations = new HashSet<>();

    CodeableConcept symptomStatusCode = createLoincConcept(LOINC_SYMPTOM, "Symptom", "Symptom");

    symptoms.forEach(
        symptom -> {
          String symptomName = getSymptomName(symptom);
          if (symptomName != null && !symptomName.isBlank()) {
            CodeableConcept symptomValueCode = createSNOMEDConcept(symptom, symptomName, null);
            observations.add(createSymptomObservation(symptomStatusCode, symptomValueCode));
          }
        });
    return observations;
  }

  public Set<Observation> convertToAOEGenderOfSexualPartnersObservation(
      Set<String> sexualPartners) {
    HashSet<Observation> observations = new LinkedHashSet<>();

    for (String sexualPartner : sexualPartners) {

      String genderSNOMED = genderIdentitySnomedSet.get(sexualPartner);

      String genderStatusDisplay = genderIdentityDisplaySet.get(sexualPartner);

      CodeableConcept genderOfSexualPartnerStatusCode =
          createSimpleReportConcept(
              SIMPLE_REPORT_GENDER_OF_SEXUAL_PARTNERS,
              "What is the gender of their sexual partners",
              "What is the gender of their sexual partners");

      CodeableConcept genderOfSexualPartnerValueCode =
          createSNOMEDConcept(genderSNOMED, genderStatusDisplay);

      observations.add(
          createAOEObservation(
              uuidGenerator.randomUUID().toString(),
              genderOfSexualPartnerStatusCode,
              genderOfSexualPartnerValueCode));
    }
    return observations;
  }

  public Observation convertToAOEPregnancyObservation(String pregnancyStatusSnomed) {
    String pregnancyStatusDisplay = pregnancyStatusDisplayMap.get(pregnancyStatusSnomed);
    CodeableConcept pregnancyStatusCode =
        createLoincConcept(LOINC_AOE_PREGNANCY_STATUS, "Pregnancy status", "Pregnancy status");
    CodeableConcept pregnancyStatusValueCode =
        createSNOMEDConcept(pregnancyStatusSnomed, pregnancyStatusDisplay);
    return createAOEObservation(
        uuidGenerator.randomUUID() + LOINC_AOE_PREGNANCY_STATUS,
        pregnancyStatusCode,
        pregnancyStatusValueCode);
  }

  public Observation convertToAOESyphilisHistoryObservation(String syphilisHistory) {
    CodeableConcept observationCode =
        createSNOMEDConcept(
            YES_SYPHILIS_HISTORY_SNOMED, "History of syphilis", "History of syphilis");
    Boolean hasHistory = null;
    if (syphilisHistory.equalsIgnoreCase(YES_SYPHILIS_HISTORY_SNOMED)) {
      hasHistory = true;
    } else if (syphilisHistory.equalsIgnoreCase(NO_SYPHILIS_HISTORY_SNOMED)) {
      hasHistory = false;
    }
    return createAOEObservation(
        uuidGenerator.randomUUID().toString(), observationCode, createYesNoUnkConcept(hasHistory));
  }

  public Observation convertToAOEYesNoUnkObservation(
      Boolean isObserved, String observationLoinc, String observationDisplayText) {
    CodeableConcept observationCode =
        createLoincConcept(observationLoinc, observationDisplayText, observationDisplayText);
    return createAOEObservation(
        uuidGenerator.randomUUID() + observationLoinc,
        observationCode,
        createYesNoUnkConcept(isObserved));
  }

  public Set<Observation> convertToAOEResidenceObservation(
      Boolean residesInCongregateSetting, String residenceTypeSnomed) {
    HashSet<Observation> observations = new LinkedHashSet<>();

    observations.add(
        convertToAOEYesNoUnkObservation(
            residesInCongregateSetting,
            LOINC_AOE_RESIDENT_CONGREGATE_SETTING,
            "Resides in a congregate care setting"));

    if (Boolean.TRUE.equals(residesInCongregateSetting)
        && StringUtils.isNotBlank(residenceTypeSnomed)) {

      CodeableConcept residenceTypeCode =
          createLoincConcept(LOINC_AOE_RESIDENCE_TYPE, "Residence", "Residence");
      String residenceTypeTextDisplay = getResidenceTypeMap().get(residenceTypeSnomed);
      observations.add(
          createAOEObservation(
              uuidGenerator.randomUUID() + LOINC_AOE_RESIDENCE_TYPE,
              residenceTypeCode,
              createSNOMEDConcept(residenceTypeSnomed, residenceTypeTextDisplay)));
    }
    return observations;
  }

  public Set<Observation> convertToAOEGenderIdentityObservation(
      String eventId, String genderIdentity) {
    Set<Observation> observations = new LinkedHashSet<>();
    if (StringUtils.isNotBlank(genderIdentity)
        && GENDER_IDENTITIES.contains(genderIdentity.toLowerCase())) {

      String valueCode;
      String valueDisplay;
      String codeSystem;

      switch (genderIdentity.toLowerCase()) {
        case OTHER -> {
          codeSystem = NULL_CODE_SYSTEM;
        }
        case REFUSED -> {
          codeSystem = DATA_ABSENT_REASON_CODE_SYSTEM;
        }
        case FEMALE, MALE, NON_BINARY, TRANS_MAN, TRANS_WOMAN -> {
          codeSystem = SNOMED_CODE_SYSTEM;
        }
        default -> {
          codeSystem = null;
        }
      }

      if (codeSystem != null) {
        CodeableConcept genderIdentityLoincConcept =
            createLoincConcept(LOINC_GENDER_IDENTITY, "Gender identity", "Gender identity");

        valueDisplay = genderIdentityDisplaySet.get(genderIdentity.toLowerCase());
        valueCode = genderIdentitySnomedSet.get(genderIdentity.toLowerCase());

        CodeableConcept valueCodeableConcept = new CodeableConcept();
        valueCodeableConcept
            .addCoding()
            .setSystem(codeSystem)
            .setCode(valueCode)
            .setDisplay(valueDisplay);

        observations.add(
            createAOEObservation(
                eventId + LOINC_GENDER_IDENTITY, genderIdentityLoincConcept, valueCodeableConcept));
      }
    }
    return observations;
  }

  public Set<Observation> convertToAOEObservations(
      String eventId, AskOnEntrySurvey surveyData, Person patientData) {
    HashSet<Observation> observations = new LinkedHashSet<>();
    Boolean symptomatic = null;
    if (Boolean.TRUE.equals(surveyData.getNoSymptoms())) {
      symptomatic = false;
    } else if (surveyData.getSymptoms() != null
        && surveyData.getSymptoms().containsValue(Boolean.TRUE)) {
      symptomatic = true;
      List<String> symptomsPresent = getFilteredSymptomsPresent(surveyData.getSymptoms());
      observations.addAll(convertToSymptomsObservations(symptomsPresent));
    } // implied else: AoE form was not completed. Symptomatic set to null

    var symptomOnsetDate = surveyData.getSymptomOnsetDate();
    observations.addAll(convertToAOESymptomaticObservation(eventId, symptomatic, symptomOnsetDate));

    String pregnancyStatus = surveyData.getPregnancy();
    if (pregnancyStatus != null && pregnancyStatusSnomedMap.values().contains(pregnancyStatus)) {
      observations.add(convertToAOEPregnancyObservation(surveyData.getPregnancy()));
    }

    if (patientData != null) {
      if (patientData.getEmployedInHealthcare() != null) {
        observations.add(
            convertToAOEYesNoUnkObservation(
                patientData.getEmployedInHealthcare(),
                LOINC_AOE_EMPLOYED_IN_HEALTHCARE,
                AOE_EMPLOYED_IN_HEALTHCARE_DISPLAY));
      }

      if (patientData.getResidentCongregateSetting() != null) {
        observations.addAll(
            convertToAOEResidenceObservation(patientData.getResidentCongregateSetting(), null));
      }

      if (StringUtils.isNotBlank(patientData.getGenderIdentity())) {
        observations.addAll(
            convertToAOEGenderIdentityObservation(eventId, patientData.getGenderIdentity()));
      }
    }

    if (surveyData.getGenderOfSexualPartners() != null) {
      Set<String> sexualPartners = new HashSet<>(surveyData.getGenderOfSexualPartners());
      observations.addAll(convertToAOEGenderOfSexualPartnersObservation(sexualPartners));
    }

    if (surveyData.getSyphilisHistory() != null) {
      observations.add(convertToAOESyphilisHistoryObservation(surveyData.getSyphilisHistory()));
    }

    return observations;
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
    var coding = concept.addCoding();

    coding.setSystem(LOINC_CODE_SYSTEM).setCode(codingCode);

    if (StringUtils.isNotBlank(codingDisplay)) {
      coding.setDisplay(codingDisplay);
    }

    return concept;
  }

  private CodeableConcept createSimpleReportConcept(
      String codingCode, String codingDisplay, String text) {
    CodeableConcept concept = new CodeableConcept().setText(text);

    concept
        .addCoding()
        .setSystem(SIMPLE_REPORT_CODE_SYSTEM)
        .setCode(codingCode)
        .setDisplay(codingDisplay);

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

  private CodeableConcept createSNOMEDConcept(String resultCode, String resultDisplay) {
    return createSNOMEDConcept(resultCode, resultDisplay, null);
  }

  private CodeableConcept createSNOMEDConcept(
      String resultCode, String resultDisplay, String resultText) {
    CodeableConcept concept = new CodeableConcept();

    if (StringUtils.isNotBlank(resultText)) {
      concept.setText(resultText);
    }

    Coding coding = concept.addCoding();
    coding.setSystem(SNOMED_CODE_SYSTEM);
    coding.setCode(resultCode);
    if (StringUtils.isNotBlank(resultDisplay)) {
      coding.setDisplay(resultDisplay);
    }
    return concept;
  }

  private void addSNOMEDValue(String resultCode, Observation observation, String resultDisplay) {
    var valueCodeableConcept = createSNOMEDConcept(resultCode, resultDisplay);
    observation.setValue(valueCodeableConcept);
  }

  private static int getTestDuration(TestEvent testEvent) {
    return Optional.ofNullable(testEvent.getDeviceType())
        .map(DeviceType::getTestLength)
        .orElse(FALLBACK_DEFAULT_TEST_MINUTES);
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
        orderTestDate,
        order.getPatient().getNotes());
  }

  public ServiceRequest convertToServiceRequest(
      ServiceRequestStatus status,
      String requestedCode,
      String id,
      ZonedDateTime orderEffectiveDate,
      String notes) {
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

    if (StringUtils.isNotEmpty(notes)) {
      Coding noteTypeCoding =
          new Coding()
              .setSystem(NOTE_TYPE_CODING_SYSTEM)
              .setVersion(NOTE_TYPE_CODING_SYSTEM_VERSION)
              .setCode(NOTE_TYPE_CODING_SYSTEM_CODE)
              .setDisplay(NOTE_TYPE_CODING_SYSTEM_DISPLAY);

      noteTypeCoding
          .addExtension()
          .setUrl(NOTE_TYPE_CODING_SYSTEM_CODE_INDEX_EXTENSION_URL)
          .setValue(new StringType(NOTE_TYPE_CODING_SYSTEM_CODE_INDEX_VALUE));

      serviceRequest
          .addNote()
          .setText(notes)
          .addExtension()
          .setUrl(NOTE_TYPE_EXTENSION_URL)
          .setValue(new CodeableConcept().addCoding(noteTypeCoding));
    }

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
    String id = Objects.toString(testEvent.getInternalId(), "");
    switch (testEvent.getCorrectionStatus()) {
      case ORIGINAL:
        status = (DiagnosticReportStatus.FINAL);
        break;
      case CORRECTED:
        status = (DiagnosticReportStatus.CORRECTED);
        id = testEvent.getPriorCorrectedTestEventId().toString();
        break;
      case REMOVED:
        status = (DiagnosticReportStatus.ENTEREDINERROR);
        id = testEvent.getPriorCorrectedTestEventId().toString();
        break;
    }

    String testOrderLoinc = null;
    String testOrderLoincLongName = null;
    if (testEvent.getDeviceType() != null) {
      testOrderLoinc =
          MultiplexUtils.inferMultiplexTestOrderLoinc(
              testEvent.getDeviceType().getSupportedDiseaseTestPerformed());

      final String finalTestOrderLoinc =
          StringUtils.isNotBlank(testOrderLoinc) ? testOrderLoinc : "";
      var deviceTypeDiseaseFromLoinc =
          testEvent.getDeviceType().getSupportedDiseaseTestPerformed().stream()
              .filter(f -> finalTestOrderLoinc.equalsIgnoreCase(f.getTestOrderedLoincCode()))
              .findFirst()
              .orElse(null);
      if (deviceTypeDiseaseFromLoinc != null) {
        testOrderLoincLongName = deviceTypeDiseaseFromLoinc.getTestOrderedLoincLongName();
      }
    }

    ZonedDateTime dateTested = null;
    if (testEvent.getDateTested() != null) {
      int testDuration = getTestDuration(testEvent);
      // getDateTested returns a Date representing an exact moment of time so
      // finding a specific timezone for the TestEvent is not required to ensure it is accurate
      dateTested =
          ZonedDateTime.ofInstant(
              testEvent.getDateTested().toInstant().minus(Duration.ofMinutes(testDuration)),
              ZoneOffset.UTC);
    }
    ZonedDateTime dateIssued = null;
    if (currentDate != null)
      dateIssued = ZonedDateTime.ofInstant(currentDate.toInstant(), ZoneOffset.UTC);

    return convertToDiagnosticReport(
        status, testOrderLoinc, testOrderLoincLongName, id, dateTested, dateIssued);
  }

  /**
   * @param status Diagnostic report status
   * @param testOrderedLoinc LOINC code
   * @param loincLongName LOINC long name
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
      String testOrderedLoinc,
      String loincLongName,
      String id,
      ZonedDateTime dateTested,
      ZonedDateTime dateIssued) {
    var diagnosticReport =
        new DiagnosticReport()
            .setStatus(status)
            .setEffective(convertToDateTimeType(dateTested))
            .setIssuedElement(convertToInstantType(dateIssued, TemporalPrecisionEnum.SECOND));

    diagnosticReport.setId(id);
    if (StringUtils.isNotBlank(testOrderedLoinc)) {
      var coding = diagnosticReport.getCode().addCoding();
      coding.setSystem(LOINC_CODE_SYSTEM).setCode(testOrderedLoinc);
      if (StringUtils.isNotBlank(loincLongName)) {
        coding.setDisplay(loincLongName);
      }
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

    int testDuration = getTestDuration(testEvent);
    ZonedDateTime specimenCollectionDate =
        dateTested != null ? dateTested.minus(Duration.ofMinutes(testDuration)) : null;

    List<SupportedDisease> resultDiseases =
        testEvent.getResults().stream().map(Result::getDisease).toList();
    List<DeviceTypeDisease> deviceTypeDiseaseEntries =
        testEvent.getDeviceType().getSupportedDiseaseTestPerformed().stream()
            .filter(code -> resultDiseases.contains(code.getSupportedDisease()))
            .toList();
    String equipmentUid =
        getCommonDiseaseValue(deviceTypeDiseaseEntries, DeviceTypeDisease::getEquipmentUid);
    String equipmentUidType =
        getCommonDiseaseValue(deviceTypeDiseaseEntries, DeviceTypeDisease::getEquipmentUidType);
    return createFhirBundle(
        CreateFhirBundleProps.builder()
            .patient(convertToPatient(testEvent.getPatient(), testEvent.getFacility()))
            .testingLab(convertToOrganization(testEvent.getFacility()))
            .orderingFacility(null)
            .practitioner(convertToPractitioner(testEvent.getProviderData()))
            .device(convertToDevice(testEvent.getDeviceType(), equipmentUid, equipmentUidType))
            .specimen(
                convertToSpecimen(
                    testEvent.getSpecimenType(),
                    uuidGenerator.randomUUID(),
                    specimenCollectionDate,
                    specimenCollectionDate))
            .resultObservations(
                convertToObservation(
                    testEvent.getResults(),
                    testEvent.getDeviceType(),
                    testEvent.getCorrectionStatus(),
                    testEvent.getReasonForCorrection(),
                    testEvent.getDateTested()))
            .aoeObservations(
                convertToAOEObservations(
                    testEvent.getInternalId().toString(),
                    testEvent.getSurveyData(),
                    testEvent.getPatientData()))
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

  // This separate bundle method was created during rapdi prototyping of universal reporting
  //
  public Bundle createUniversalFhirBundle(UniversalCreateFhirBundleProps props) {
    var patientFullUrl = ResourceType.Patient + "/" + props.getPatient().getId();
    var orderingFacilityFullUrl =
        props.getOrderingFacility() == null
            ? null
            : ResourceType.Organization + "/" + props.getOrderingFacility().getId();
    var testingLabOrganizationFullUrl =
        ResourceType.Organization + "/" + props.getTestingLab().getId();
    var practitionerFullUrl = ResourceType.Practitioner + "/" + props.getPractitioner().getId();
    var specimenFullUrl = ResourceType.Specimen + "/" + props.getSpecimen().getId();
    var diagnosticReportFullUrl =
        ResourceType.DiagnosticReport + "/" + props.getDiagnosticReport().getId();

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

  public DiagnosticReport convertToDiagnosticReport(String testOrderCode, Date testEffectiveDate) {
    DiagnosticReport diagnosticReport = new DiagnosticReport();
    var categoryCodeableConcept = new CodeableConcept();
    var categoryCoding = categoryCodeableConcept.addCoding();
    categoryCoding.setSystem(DIAGNOSTIC_CODE_SYSTEM);
    categoryCoding.setCode(LAB_STRING_LITERAL);
    diagnosticReport.setCategory(List.of(categoryCodeableConcept));

    var diagnosticCodeableConcept = new CodeableConcept();
    var diagnosticCoding = diagnosticCodeableConcept.addCoding();

    diagnosticCoding.setSystem(LOINC_CODE_SYSTEM).setCode(testOrderCode);
    diagnosticReport.setCode(diagnosticCodeableConcept);

    var effectiveDateTime = ZonedDateTime.ofInstant(testEffectiveDate.toInstant(), ZoneOffset.UTC);
    diagnosticReport.setEffective(convertToDateTimeType(effectiveDateTime));

    String diagnosticReportId = uuidGenerator.randomUUID().toString();
    diagnosticReport.setId(diagnosticReportId);

    return diagnosticReport;
  }

  public Bundle createUniversalFhirBundle(
      PatientReportInput patientInput,
      ProviderReportInput providerInput,
      FacilityReportInput facility,
      SpecimenInput specimenInput,
      List<TestDetailsInput> testDetailsInputList,
      GitProperties gitProperties,
      String processingId) {
    // will have to replace these UUIDs if we pull this data from db
    UUID facilityId = UUID.randomUUID();
    UUID providerId = UUID.randomUUID();
    UUID specimenId = UUID.randomUUID();

    Patient patient =
        convertToPatient(
            ConvertToPatientProps.builder()
                .id(String.valueOf(UUID.randomUUID()))
                .name(
                    new PersonName(
                        patientInput.getFirstName(),
                        patientInput.getMiddleName(),
                        patientInput.getLastName(),
                        patientInput.getSuffix()))
                .phoneNumbers(
                    Collections.singletonList(
                        new PhoneNumber(PhoneType.MOBILE, patientInput.getPhone())))
                .emails(Collections.singletonList(patientInput.getEmail()))
                .gender(patientInput.getSex())
                .dob(patientInput.getDateOfBirth())
                .address(
                    new StreetAddress(
                        Arrays.asList(patientInput.getStreet(), patientInput.getStreetTwo()),
                        patientInput.getCity(),
                        patientInput.getState(),
                        patientInput.getZipCode(),
                        patientInput.getCounty()))
                .country(patientInput.getCountry())
                .race(patientInput.getRace())
                .ethnicity(patientInput.getEthnicity())
                .tribalAffiliations(Collections.singletonList(patientInput.getTribalAffiliation()))
                .build());

    StreetAddress facilityAddress =
        new StreetAddress(
            facility.getStreet(),
            facility.getStreetTwo(),
            facility.getCity(),
            facility.getState(),
            facility.getZipCode(),
            facility.getCounty());

    StreetAddress providerAddress =
        new StreetAddress(
            providerInput.getStreet(),
            providerInput.getStreetTwo(),
            providerInput.getCity(),
            providerInput.getState(),
            providerInput.getZipCode(),
            providerInput.getCounty());

    ZonedDateTime specimenCollectionDate =
        specimenInput.getCollectionDate() == null
            ? null
            : ZonedDateTime.ofInstant(
                specimenInput.getCollectionDate().toInstant(), ZoneOffset.UTC);
    ZonedDateTime specimenReceivedDate =
        specimenInput.getReceivedDate() == null
            ? null
            : ZonedDateTime.ofInstant(specimenInput.getReceivedDate().toInstant(), ZoneOffset.UTC);

    List<Observation> observationList = new ArrayList<>();
    for (var testDetailsInput : testDetailsInputList) {
      observationList.add(convertToObservation(testDetailsInput));
    }

    DiagnosticReport diagnosticReport =
        convertToDiagnosticReport(
            testDetailsInputList.get(0).getTestOrderLoinc(),
            testDetailsInputList.get(0).getResultDate());

    return createUniversalFhirBundle(
        UniversalCreateFhirBundleProps.builder()
            .patient(patient)
            .testingLab(
                convertToOrganization(
                    facilityId.toString(),
                    facility.getName(),
                    facility.getClia(),
                    facility.getPhone(),
                    facility.getEmail(),
                    facilityAddress,
                    facility.getCountry()))
            .orderingFacility(null)
            .practitioner(
                convertToPractitioner(
                    providerId.toString(),
                    new PersonName(
                        providerInput.getFirstName(),
                        providerInput.getMiddleName(),
                        providerInput.getFirstName(),
                        providerInput.getSuffix()),
                    providerInput.getPhone(),
                    providerAddress,
                    providerInput.getCountry(),
                    providerInput.getNpi()))
            .specimen(
                convertToSpecimen(
                    ConvertToSpecimenProps.builder()
                        .specimenCode(specimenInput.getTypeSnomed())
                        .specimenName(null)
                        .collectionCode(specimenInput.getCollectionLocationCode())
                        .collectionName(specimenInput.getCollectionLocationName())
                        .collectionDate(specimenCollectionDate)
                        .receivedTime(specimenReceivedDate)
                        .id(specimenId.toString())
                        .identifier(specimenId.toString())
                        .build()))
            .resultObservations(observationList)
            .serviceRequest(null)
            .diagnosticReport(diagnosticReport)
            .currentDate(dateGenerator.newDate())
            .gitProperties(gitProperties)
            .processingId(processingId)
            .build());
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
    if (!StringUtils.isBlank(organizationUrl)) {
      messageHeader.getSender().setReferenceElement(new StringType(organizationUrl));
    }
    if (!StringUtils.isBlank(provenanceFullUrl)) {
      messageHeader.addFocus(new Reference(provenanceFullUrl));
    }
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
    messageHeader.addFocus(new Reference(mainResourceUrl));

    return messageHeader;
  }

  public DiagnosticReport convertToDiagnosticReport(
      ConditionAgnosticConvertToDiagnosticReportProps props) {
    DiagnosticReport diagnosticReport = new DiagnosticReport();
    var categoryCodeableConcept = new CodeableConcept();
    var categoryCoding = categoryCodeableConcept.addCoding();
    categoryCoding.setSystem(DIAGNOSTIC_CODE_SYSTEM);
    categoryCoding.setCode(LAB_STRING_LITERAL);
    diagnosticReport.setCategory(List.of(categoryCodeableConcept));

    var diagnosticCodeableConcept = new CodeableConcept();
    var diagnosticCoding = diagnosticCodeableConcept.addCoding();

    diagnosticCoding.setSystem(LOINC_CODE_SYSTEM).setCode(props.getTestPerformedCode());
    diagnosticReport.setCode(diagnosticCodeableConcept);

    var effectiveDateTime = DateTimeUtils.convertToZonedDateTime(props.getTestEffectiveDate());
    diagnosticReport.setEffective(convertToDateTimeType(effectiveDateTime));

    String diagnosticReportId = uuidGenerator.randomUUID().toString();
    diagnosticReport.setId(diagnosticReportId);

    return diagnosticReport;
  }

  public Observation convertToObservation(ConditionAgnosticConvertToObservationProps props) {
    Observation observation = new Observation();
    setStatus(observation, props.getCorrectionStatus());

    var labCodeableConcept = new CodeableConcept();
    var labCodeableCoding = labCodeableConcept.addCoding();
    labCodeableCoding.setSystem(OBSERVATION_CATEGORY_CODE_SYSTEM);
    labCodeableCoding.setCode(LABORATORY_STRING_LITERAL);
    observation.setCategory(List.of(labCodeableConcept));

    var observationCodeableConcept = new CodeableConcept();
    var observationCoding = observationCodeableConcept.addCoding();
    observationCoding.setSystem(LOINC_CODE_SYSTEM).setCode(props.getTestPerformedCode());
    observation.setCode(observationCodeableConcept);

    addSNOMEDValue(props.getResultValue(), observation, null);

    String observationId = uuidGenerator.randomUUID().toString();
    observation.setId(observationId);

    return observation;
  }

  public Observation convertToObservation(TestDetailsInput testDetailsInput) {
    var observation = new Observation();
    setStatus(observation, TestCorrectionStatus.ORIGINAL);
    observation.setCode(
        createLoincConcept(
            testDetailsInput.getTestPerformedLoinc(),
            // TODO: need to update this to loinc long name
            testDetailsInput.getTestPerformedLoincShortName(),
            testDetailsInput.getCondition()));
    // TODO: have to convert string to result snomed
    addSNOMEDValue(
        testDetailsInput.getResultValue(), observation, testDetailsInput.getResultInterpretation());
    // TODO: handle different result types

    observation.setIssued(testDetailsInput.getResultDate());
    // TODO: may need to set the issued element to time zone zulu

    String observationId = uuidGenerator.randomUUID().toString();
    observation.setId(observationId);

    return observation;
  }

  public Patient convertToPatient(ConditionAgnosticConvertToPatientProps props) {
    var patient = new Patient();
    patient.setId(props.getId());
    assignPotentiallyAbsentName(
        props.getFirstName(), props.getLastName(), props.getNameAbsentReason(), patient);
    patient.setGender(convertToAdministrativeGender(props.getGender()));
    return patient;
  }

  private Patient assignPotentiallyAbsentName(
      String first, String last, String absentReason, Patient patient) {
    if (StringUtils.isNotBlank(first) || StringUtils.isNotBlank(last)) {
      var humanName = convertToHumanName(first, null, last, null);
      patient.addName(humanName);

    } else {
      patient
          .addName()
          .addExtension(
              new Extension()
                  .setUrl(DATA_ABSENT_REASON_EXTENSION_URL)
                  .setValue(new CodeableConcept().addCoding().setCode(absentReason)));
    }
    return patient;
  }

  private List<String> getFilteredSymptomsPresent(Map<String, Boolean> symptomsMap) {
    return symptomsMap.entrySet().stream()
        .filter(symptom -> Boolean.TRUE.equals(symptom.getValue()))
        .map(Entry::getKey)
        .collect(Collectors.toList());
  }

  public Bundle createFhirBundle(ConditionAgnosticCreateFhirBundleProps props) {

    var patientFullUrl = ResourceType.Patient + "/" + props.getPatient().getId();
    props.getDiagnosticReport().setSubject(new Reference(patientFullUrl));

    var diagnosticReportFullUrl =
        ResourceType.DiagnosticReport + "/" + props.getDiagnosticReport().getId();

    UUID messageHeaderId = uuidGenerator.randomUUID();
    var messageHeader =
        createMessageHeader(
            null,
            diagnosticReportFullUrl,
            null,
            props.getGitProperties(),
            props.getProcessingId(),
            messageHeaderId);
    var messageHeaderFullUrl = ResourceType.MessageHeader + "/" + messageHeader.getId();

    var entryList = new ArrayList<Pair<String, Resource>>();
    entryList.add(Pair.of(messageHeaderFullUrl, messageHeader));
    entryList.add(Pair.of(patientFullUrl, props.getPatient()));
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
              entryList.add(Pair.of(observationFullUrl, observation));
              Reference observationReference = new Reference(observationFullUrl);
              props.getDiagnosticReport().addResult(observationReference);
            });

    entryList.add(Pair.of(diagnosticReportFullUrl, props.getDiagnosticReport()));
    Date currentDate = dateGenerator.newDate();

    var bundle =
        new Bundle()
            .setType(Bundle.BundleType.MESSAGE)
            .setTimestamp(currentDate)
            .setIdentifier(new Identifier().setValue(props.getDiagnosticReport().getId()));

    bundle.getTimestampElement().setTimeZoneZulu(true);

    entryList.forEach(
        pair ->
            bundle.addEntry(
                new Bundle.BundleEntryComponent()
                    .setFullUrl(pair.getFirst())
                    .setResource(pair.getSecond())));

    return bundle;
  }
}
