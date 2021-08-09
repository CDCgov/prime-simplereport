package gov.cdc.usds.simplereport.api.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * For latest supported values, see:
 * https://github.com/CDCgov/prime-data-hub/blob/production/prime-router/docs/schema_documentation/primedatainput-pdi-covid-19.md
 *
 * <p>And significant changes to these constants should be accompanied by a version bump of
 * DataHubUploaderService.CSV_API_VERSION. This is only used for debugging issues, but it's a good
 * practice.
 */
public class TestEventExport {
  public static final String CSV_API_VERSION = "05Aug2021"; // last time we changed something
  private final TestEvent testEvent;
  private final Optional<Person> patient;
  private final Optional<AskOnEntrySurvey> survey;
  private final Optional<Provider> provider;
  private final Optional<Facility> facility;
  private final Optional<Organization> organization;
  private final Optional<SpecimenType> specimenType;
  private final Optional<DeviceType> device;

  public TestEventExport(TestEvent testEvent) {
    this.testEvent = testEvent;
    this.patient = Optional.ofNullable(testEvent.getPatientData());
    this.survey = Optional.ofNullable(testEvent.getSurveyData());
    this.provider = Optional.ofNullable(testEvent.getProviderData());
    this.facility = Optional.ofNullable(testEvent.getFacility());
    this.organization = Optional.ofNullable(testEvent.getOrganization());
    this.specimenType =
        Optional.ofNullable(testEvent.getDeviceSpecimen()).map(DeviceSpecimenType::getSpecimenType);
    this.device =
        Optional.ofNullable(testEvent.getDeviceSpecimen()).map(DeviceSpecimenType::getDeviceType);
  }

  private String genderUnknown = "U";
  private String ethnicityUnknown = "U";
  private String raceUnknown = "UNK";
  private static final String DEFAULT_LOCATION_CODE = "53342003"; // http://snomed.info/id/53342003
  // "Internal nose structure"
  // values pulled from
  // https://github.com/CDCgov/prime-data-hub/blob/master/prime-router/metadata/valuesets/common.valuesets
  private Map<String, String> genderMap =
      Map.of(
          "male", "M",
          "female", "F",
          "other", "O",
          "ambiguous", "A",
          "unknown", genderUnknown,
          "unk", genderUnknown,
          "refused", genderUnknown,
          "notapplicable", "N");

  private Map<String, String> ethnicityMap =
      Map.of(
          "hispanic", "H",
          "not_hispanic", "N",
          "refused", "U");

  private Map<TestResult, String> testResultMap =
      Map.of(
          TestResult.POSITIVE, "260373001",
          TestResult.NEGATIVE, "260415000",
          TestResult.UNDETERMINED, "419984006");

  private Map<String, String> raceMap =
      Map.of(
          "native", "1002-5",
          "asian", "2028-9",
          "black", "2054-5",
          "pacific", "2076-8",
          "white", "2106-3",
          "other", "2131-1",
          "unknown", raceUnknown,
          "refused", "ASKU" // Asked, but unknown
          );

  private String boolToYesNoUnk(Boolean value) {
    if (value == null) {
      return "UNK";
    } else if (value) {
      return "Y";
    } else {
      return "N";
    }
  }

  private String boolToYesNoUnk(Optional<Boolean> value) {
    return boolToYesNoUnk(value.orElse(null));
  }

  private String dateToHealthCareString(LocalDate value) {
    if (value == null) {
      return "";
    }
    return value.format(DateTimeFormatter.ofPattern("yyyyMMdd"));
  }

  private String dateToHealthCareString(Optional<LocalDate> value) {
    return dateToHealthCareString(value.orElse(null));
  }

  private LocalDate convertToLocalDate(Date dateToConvert) {
    return dateToConvert.toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
  }

  @JsonProperty("Patient_last_name")
  public String getPatientLastName() {
    return patient.map(Person::getLastName).orElse(null);
  }

  @JsonProperty("Patient_first_name")
  public String getPatientFirstName() {
    return patient.map(Person::getFirstName).orElse(null);
  }

  @JsonProperty("Patient_middle_name")
  public String getPatientMiddleName() {
    return patient.map(Person::getMiddleName).orElse(null);
  }

  @JsonProperty("Patient_suffix")
  public String getPatientSuffix() {
    return patient.map(Person::getSuffix).orElse(null);
  }

  @JsonProperty("Patient_race")
  public String getPatientRace() {
    return patient.map(Person::getRace).map(raceMap::get).orElse(raceUnknown);
  }

  @JsonProperty("Patient_DOB")
  public String getPatientBirthDate() {
    return dateToHealthCareString(patient.map(Person::getBirthDate));
  }

  @JsonProperty("Patient_gender")
  public String getPatientGender() {
    return patient.map(Person::getGender).map(genderMap::get).orElse(genderUnknown);
  }

  @JsonProperty("Patient_ethnicity")
  public String getPatientEthnicity() {
    return patient.map(Person::getEthnicity).map(ethnicityMap::get).orElse(ethnicityUnknown);
  }

  @JsonProperty("Patient_street")
  public String getPatientStreet() {
    return patient.map(Person::getStreet).orElse(null);
  }

  @JsonProperty("Patient_street_2")
  public String getPatientStreetTwo() {
    return patient.map(Person::getStreetTwo).orElse(null);
  }

  @JsonProperty("Patient_city")
  public String getPatientCity() {
    return patient.map(Person::getCity).orElse(null);
  }

  @JsonProperty("Patient_county")
  public String getPatientCounty() {
    return patient.map(Person::getCounty).orElse(null);
  }

  @JsonProperty("Patient_state")
  public String getPatientState() {
    return patient.map(Person::getState).orElse(null);
  }

  @JsonProperty("Patient_zip_code")
  public String getPatientZipCode() {
    return patient.map(Person::getZipCode).orElse(null);
  }

  @JsonProperty("Patient_phone_number")
  public String getPatientPhoneNumber() {
    return patient.map(Person::getTelephone).orElse(null);
  }

  @JsonProperty("Patient_email")
  public String getPatientEmail() {
    return patient.map(Person::getEmail).orElse(null);
  }

  @JsonProperty("Patient_ID")
  public String getPatientId() {
    return patient.map(Person::getInternalId).map(UUID::toString).orElse(null);
  }

  @JsonProperty("Patient_role")
  public String getPatientRole() {
    return patient.map(Person::getRole).map(PersonRole::toString).orElse("");
  }

  @JsonProperty("Employed_in_healthcare")
  public String getPatientEmployedInHealthcare() {
    return boolToYesNoUnk(patient.map(Person::getEmployedInHealthcare));
  }

  @JsonProperty("Resident_congregate_setting")
  public String getPatientResidentCongregateSetting() {
    return boolToYesNoUnk(patient.map(Person::getResidentCongregateSetting));
  }

  @JsonProperty("Result_ID")
  public String getResultID() {
    return testEvent.getInternalId().toString();
  }

  // 27Jan2021 Added
  @JsonProperty("Corrected_result_ID")
  public String getCorrectedResultId() {
    if (testEvent.getCorrectionStatus() != TestCorrectionStatus.ORIGINAL) {
      return testEvent.getPriorCorrectedTestEventId().toString();
    }
    return "";
  }

  // 27Jan2021 Updated to handle deleted tests
  @JsonProperty("Test_result_status")
  public String getTestResultStatus() {
    // F Final results
    // X No results available; Order canceled
    // C Corrected, final (not yet supported
    switch (testEvent.getCorrectionStatus()) {
      case REMOVED:
        return "X";
      case CORRECTED:
        return "C";
      case ORIGINAL:
      default:
        return "F";
    }
  }

  @JsonProperty("Test_result_code")
  public String getTestResult() {
    return testResultMap.get(testEvent.getResult());
  }

  @JsonProperty("Specimen_collection_date_time")
  public String getSpecimenCollectionDateTime() {
    return dateToHealthCareString(convertToLocalDate(testEvent.getDateTested()));
  }

  @JsonProperty("Ordering_provider_ID")
  public String getOrderingProviderID() {
    return provider.map(Provider::getProviderId).orElse(null);
  }

  @JsonProperty("First_test")
  public String getFirstTest() {
    return boolToYesNoUnk(survey.map(AskOnEntrySurvey::getFirstTest));
  }

  @JsonProperty("Symptomatic_for_disease")
  public String getSymptomaticForDisease() {
    return boolToYesNoUnk(survey.map(AskOnEntrySurvey::getNoSymptoms).map(b -> !b));
  }

  @JsonProperty("Illness_onset_date")
  public String getSymptomOnsetDate() {
    return dateToHealthCareString(survey.map(AskOnEntrySurvey::getSymptomOnsetDate));
  }

  @JsonProperty("Testing_lab_name")
  public String getTestingLabName() {
    return getOrderingFacilityName();
  }

  @JsonProperty("Testing_lab_CLIA")
  public String getTestingLabID() {
    return facility.map(Facility::getCliaNumber).orElse(null);
  }

  @JsonProperty("Testing_lab_state")
  public String getTestingLabState() {
    return getOrderingFacilityState();
  }

  @JsonProperty("Testing_lab_street")
  public String getTestingLabStreet() {
    return getOrderingFacilityStreet();
  }

  @JsonProperty("Testing_lab_street_2")
  public String getTestingLabStreetTwo() {
    return getOrderingFacilityStreetTwo();
  }

  @JsonProperty("Testing_lab_zip_code")
  public String getTestingLabZipCode() {
    return getOrderingFacilityZipCode();
  }

  @JsonProperty("Testing_lab_county")
  public String getTestingLabCounty() {
    return getOrderingFacilityCounty();
  }

  @JsonProperty("Testing_lab_phone_number")
  public String getTestingLabPhoneNumber() {
    return getOrderingFacilityPhoneNumber();
  }

  @JsonProperty("Testing_lab_city")
  public String getTestingLabCity() {
    return getOrderingFacilityCity();
  }

  @JsonProperty("Processing_mode_code")
  public String getFacilityProcessingModeCode() {
    // todo: this should check a facility attribute to see what mode it's in. (or a separate table
    // of prod-ready fac)
    return "P"; // D:Debugging P:Production T:Training
  }

  @JsonProperty("Ordering_facility_city")
  public String getOrderingFacilityCity() {
    return facility.map(Facility::getAddress).map(StreetAddress::getCity).orElse(null);
  }

  @JsonProperty("Ordering_facility_county")
  public String getOrderingFacilityCounty() {
    return facility.map(Facility::getAddress).map(StreetAddress::getCounty).orElse(null);
  }

  @JsonProperty("Ordering_facility_name")
  public String getOrderingFacilityName() {
    return facility.map(Facility::getFacilityName).orElse(null);
  }

  @JsonProperty("Organization_name")
  public String getOrganizationName() {
    return organization.map(Organization::getOrganizationName).orElse(null);
  }

  @JsonProperty("Ordering_facility_phone_number")
  public String getOrderingFacilityPhoneNumber() {
    return facility.map(Facility::getTelephone).orElse(null);
  }

  @JsonProperty("Ordering_facility_email")
  public String getOrderingFacilityEmail() {
    return facility.map(Facility::getEmail).orElse(null);
  }

  @JsonProperty("Ordering_facility_state")
  public String getOrderingFacilityState() {
    return facility.map(Facility::getAddress).map(StreetAddress::getState).orElse(null);
  }

  @JsonProperty("Ordering_facility_street")
  public String getOrderingFacilityStreet() {
    return facility.map(Facility::getAddress).map(StreetAddress::getStreetOne).orElse(null);
  }

  @JsonProperty("Ordering_facility_street_2")
  public String getOrderingFacilityStreetTwo() {
    return facility.map(Facility::getAddress).map(StreetAddress::getStreetTwo).orElse(null);
  }

  @JsonProperty("Ordering_facility_zip_code")
  public String getOrderingFacilityZipCode() {
    return facility.map(Facility::getAddress).map(StreetAddress::getPostalCode).orElse(null);
  }

  @JsonProperty("Ordering_provider_last_name")
  public String getOrderingProviderLastName() {
    return provider.map(Provider::getNameInfo).map(PersonName::getLastName).orElse(null);
  }

  @JsonProperty("Ordering_provider_first_name")
  public String getOrderingProviderFirstName() {
    return provider.map(Provider::getNameInfo).map(PersonName::getFirstName).orElse(null);
  }

  @JsonProperty("Ordering_provider_street")
  public String getOrderingProviderStreet() {
    return provider.map(Provider::getStreet).orElse(null);
  }

  @JsonProperty("Ordering_provider_street_2")
  public String getOrderingProviderStreetTwo() {
    return provider.map(Provider::getStreetTwo).orElse(null);
  }

  @JsonProperty("Ordering_provider_city")
  public String getOrderingProviderCity() {
    return provider.map(Provider::getCity).orElse(null);
  }

  @JsonProperty("Ordering_provider_state")
  public String getOrderingProviderState() {
    return provider.map(Provider::getState).orElse(null);
  }

  @JsonProperty("Ordering_provider_zip_code")
  public String getOrderingProviderZipCode() {
    return this.getTestingLabZipCode();
  }

  @JsonProperty("Ordering_provider_county")
  public String getOrderingProviderCounty() {
    return provider.map(Provider::getCounty).orElse(null);
  }

  @JsonProperty("Ordering_provider_phone_number")
  public String getOrderingProviderPhoneNumber() {
    return provider.map(Provider::getTelephone).orElse(null);
  }

  @JsonProperty("Ordered_test_code")
  public String getOrderedTestCode() {
    return device.map(DeviceType::getLoincCode).orElse(null);
  }

  @JsonProperty("Specimen_source_site_code")
  public String getSpecimenSourceSiteCode() {
    return specimenType.map(SpecimenType::getCollectionLocationCode).orElse(DEFAULT_LOCATION_CODE);
  }

  @JsonProperty("Specimen_type_code")
  public String getSpecimenTypeCode() {
    return specimenType.map(SpecimenType::getTypeCode).orElse(null);
  }

  @JsonProperty("Instrument_ID")
  public String getInstrumentID() {
    return device.map(DeviceType::getInternalId).map(UUID::toString).orElse(null);
  }

  @JsonProperty("Device_ID")
  public String getDeviceID() {
    return device.map(DeviceType::getModel).orElse(null);
  }

  @JsonProperty("Test_date")
  public String getTestDate() {
    return dateToHealthCareString(
        Optional.ofNullable(testEvent.getDateTested()).map(this::convertToLocalDate));
  }

  @JsonProperty("Date_result_released")
  public String getDateResultReleased() {
    return dateToHealthCareString(LocalDate.now());
  }

  @JsonProperty("Order_test_date")
  public String getOrderTestDate() {
    // order_test_date = test_date for antigen testing
    return getTestDate();
  }

  @JsonProperty("Site_of_care")
  public String getSiteOfCare() {
    return organization.map(Organization::getOrganizationType).orElse(null);
  }
}
