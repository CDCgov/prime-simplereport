package gov.cdc.usds.simplereport.api.model;

import static gov.cdc.usds.simplereport.service.DiseaseService.COVID19_NAME;
import static java.lang.Boolean.TRUE;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.ImmutableMap;
import gov.cdc.usds.simplereport.api.MappingConstants;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.PersonUtils;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
import java.util.function.Function;
import org.jetbrains.annotations.Nullable;

/**
 * For latest supported values, see:
 * https://github.com/CDCgov/prime-data-hub/blob/production/prime-router/docs/schema_documentation/primedatainput-pdi-covid-19.md
 *
 * <p>And significant changes to these constants should be accompanied by a version bump of
 * DataHubUploaderService.CSV_API_VERSION. This is only used for debugging issues, but it's a good
 * practice.
 */
public class TestEventExport {
  public static final int FALLBACK_DEFAULT_TEST_MINUTES = 15;
  public static final String USA = "USA";
  public static final String UNKNOWN_ADDRESS_INDICATOR = "** Unknown / Not Given **";
  private String processingModeCode = "P";
  private final TestEvent testEvent;
  private final Optional<Person> patient;
  private final Optional<AskOnEntrySurvey> survey;
  private final Optional<Provider> provider;
  private final Optional<Facility> facility;
  private final Optional<Organization> organization;
  private final Optional<DeviceType> deviceType;
  private final Optional<SpecimenType> specimenType;

  public TestEventExport(TestEvent testEvent) {
    this.testEvent = testEvent;
    this.patient = Optional.ofNullable(testEvent.getPatientData());
    this.survey = Optional.ofNullable(testEvent.getSurveyData());
    this.provider = Optional.ofNullable(testEvent.getProviderData());
    this.facility = Optional.ofNullable(testEvent.getFacility());
    this.organization = Optional.ofNullable(testEvent.getOrganization());

    this.deviceType = Optional.ofNullable(testEvent.getDeviceType());
    this.specimenType = Optional.ofNullable(testEvent.getSpecimenType());
  }

  public TestEventExport(TestEvent testEvent, String processingModeCode) {
    this(testEvent);
    this.processingModeCode = processingModeCode;
  }

  private String genderUnknown = "U";
  public static final String DEFAULT_LOCATION_CODE = "87100004"; // http://snomed.info/id/87100004
  // Topography unknown (body structure)
  // https://github.com/CDCgov/prime-data-hub/blob/master/prime-router/metadata/valuesets/common.valuesets

  public static final String DEFAULT_LOCATION_NAME =
      "Topography unknown (body structure)"; // http://snomed.info/id/87100004

  private final Map<String, String> genderMap =
      Map.of(
          "male", "M",
          "female", "F",
          "other", "O",
          "ambiguous", "A",
          "unknown", genderUnknown,
          "unk", genderUnknown,
          "refused", genderUnknown,
          "notapplicable", "N");

  private final Map<String, String> ethnicityMap =
      Map.of(
          "hispanic", "H",
          "not_hispanic", "N",
          "refused", "U");

  private final Map<TestResult, String> testResultMap =
      Map.of(
          TestResult.POSITIVE, "260373001",
          TestResult.NEGATIVE, "260415000",
          TestResult.UNDETERMINED, "419984006");

  private Map<String, String> preferredLanguageMap =
      ImmutableMap.<String, String>builder()
          .put("English", "eng")
          .put("Spanish", "spa")
          .put("Unknown", "zxx")
          .put("Afrikaans", "afr")
          .put("Amaric", "amh")
          .put("American Sign Language", "sgn")
          .put("Arabic", "ara")
          .put("Armenian", "arm")
          .put("Aromanian; Arumanian; Macedo-Romanian", "rup")
          .put("Bantu (other)", "bnt")
          .put("Bengali", "ben")
          .put("Burmese", "bur")
          .put("Cantonese", "yue")
          .put("Caucasian (other)", "cau")
          .put("Cherokee", "chr")
          .put("Chinese", "yue")
          .put("Creoles and pidgins, French-based (Other)", "cpf")
          .put("Cushitic (other)", "cus")
          .put("Dakota", "dak")
          .put("Fiji", "fij")
          .put("Filipino; Pilipino", "fil")
          .put("French", "fre")
          .put("German", "ger")
          .put("Gujarati", "guj")
          .put("Hebrew", "heb")
          .put("Hindi", "hin")
          .put("Hmong", "hmn")
          .put("Indonesian", "ind")
          .put("Italian", "ita")
          .put("Japanese", "jpn")
          .put("Kannada", "kan")
          .put("Korean", "kor")
          .put("Kru languages", "kro")
          .put("Kurdish", "kur")
          .put("Laotian", "lao")
          .put("Latin", "lat")
          .put("Malayalam", "mal")
          .put("Mandar", "mdr")
          .put("Mandarin", "cmn")
          .put("Marathi", "mar")
          .put("Marshallese", "mah")
          .put("Mon-Khmer (Other)", "mkh")
          .put("Cambodian", "khm")
          .put("Mongolian", "mon")
          .put("Navajo", "nav")
          .put("Nepali", "nep")
          .put("Not Specified", "zxx")
          .put("Pashto", "pus")
          .put("Portuguese", "por")
          .put("Punjabi", "pan")
          .put("Rarotongan; Cook Islands Maori", "rar")
          .put("Russian", "rus")
          .put("Samoan", "smo")
          .put("Sign Languages", "sgn")
          .put("Somali", "som")
          .put("Swahili", "swa")
          .put("Tagalog", "tgl")
          .put("Tahitian", "tah")
          .put("Tamil", "tam")
          .put("Tegulu", "tel")
          .put("Thai", "tha")
          .put("Tigrinya", "tir")
          .put("Ukrainian", "ukr")
          .put("Urdu", "urd")
          .put("Vietnamese", "vie")
          .put("Yiddish", "yid")
          .put("Zapotec", "zap")
          .put("Chaochow", "tws")
          .put("Luganda", "lug")
          .put("Mien", "ium")
          .put("Morrocan Arabic", "ary")
          .put("Sebuano", "ceb")
          .put("Singhalese", "sin")
          .put("Taiwanese", "oan")
          .build();

  private static Optional<? extends DeviceTypeDisease> getFirstCovidDiseaseInfo(
      List<DeviceTypeDisease> deviceTypeDiseases) {
    return deviceTypeDiseases.stream()
        .filter(s -> COVID19_NAME.equals(s.getSupportedDisease().getName()))
        .findFirst();
  }

  private static List<DeviceTypeDisease> getCovidDiseaseInfo(
      List<DeviceTypeDisease> deviceTypeDiseases) {
    return deviceTypeDiseases.stream()
        .filter(s -> "COVID-19".equals(s.getSupportedDisease().getName()))
        .toList();
  }

  @Nullable
  private String getCommonCovidDiseaseValue(Function<DeviceTypeDisease, String> diseaseValue) {
    if (deviceType.isPresent()) {
      List<DeviceTypeDisease> covidDiseaseInfo =
          getCovidDiseaseInfo(deviceType.get().getSupportedDiseaseTestPerformed());
      List<String> distinctValues = covidDiseaseInfo.stream().map(diseaseValue).distinct().toList();
      if (distinctValues.size() == 1) {
        return distinctValues.get(0);
      }
    }
    return null;
  }

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

  private String dateToHealthCareString(LocalDateTime value) {
    if (value == null) {
      return "";
    }
    return value.format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
  }

  private LocalDateTime convertToLocalDateTime(Date dateToConvert) {
    return dateToConvert.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime();
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
    return patient
        .map(Person::getRace)
        .map(PersonUtils.raceMap::get)
        .orElse(MappingConstants.UNK_CODE);
  }

  @JsonProperty("Patient_DOB")
  public String getPatientBirthDate() {
    return dateToHealthCareString(patient.map(Person::getBirthDate).orElse(null));
  }

  @JsonProperty("Patient_gender")
  public String getPatientGender() {
    return patient.map(Person::getGender).map(genderMap::get).orElse(genderUnknown);
  }

  @JsonProperty("Patient_ethnicity")
  public String getPatientEthnicity() {
    return patient.map(Person::getEthnicity).map(ethnicityMap::get).orElse(MappingConstants.U_CODE);
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
    var street = patient.map(Person::getStreet).orElse(null);
    if (UNKNOWN_ADDRESS_INDICATOR.equalsIgnoreCase(street)) {
      return getOrderingFacilityCity();
    }
    return patient.map(Person::getCity).orElse(null);
  }

  @JsonProperty("Patient_county")
  public String getPatientCounty() {
    var street = patient.map(Person::getStreet).orElse(null);
    if (UNKNOWN_ADDRESS_INDICATOR.equalsIgnoreCase(street)) {
      return getOrderingFacilityCounty();
    }
    return patient.map(Person::getCounty).orElse(null);
  }

  @JsonProperty("Patient_state")
  public String getPatientState() {
    var street = patient.map(Person::getStreet).orElse(null);
    if (UNKNOWN_ADDRESS_INDICATOR.equalsIgnoreCase(street)) {
      return getOrderingFacilityState();
    }
    return patient.map(Person::getState).orElse(null);
  }

  @JsonProperty("Patient_zip_code")
  public String getPatientZipCode() {
    var street = patient.map(Person::getStreet).orElse(null);
    if (UNKNOWN_ADDRESS_INDICATOR.equalsIgnoreCase(street)) {
      return getOrderingFacilityZipCode();
    }
    return patient.map(Person::getZipCode).orElse(null);
  }

  @JsonProperty("Patient_country")
  public String getPatientCountry() {
    return patient.map(Person::getCountry).orElse(USA);
  }

  @JsonProperty("Patient_phone_number")
  public String getPatientPhoneNumber() {
    var phone = patient.map(Person::getTelephone).orElse(null);
    if (phone == null || phone.isBlank()) {
      return getOrderingFacilityPhoneNumber();
    }
    return phone;
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

  @JsonProperty("Patient_tribal_affiliation")
  public String getPatientTribalAffiliation() {
    return patient
        .map(Person::getTribalAffiliation)
        .map(
            affiliationList -> {
              if (affiliationList.isEmpty()) {
                return "";
              }
              return Objects.requireNonNullElse(affiliationList.get(0), "");
            })
        .orElse("");
  }

  @JsonProperty("Patient_preferred_language")
  public String getPatientPreferredLanguage() {
    String defaultLanguage = patient.isPresent() ? patient.get().getPreferredLanguage() : "";
    return patient
        .map(Person::getPreferredLanguage)
        .map(preferredLanguageMap::get)
        .orElse(defaultLanguage);
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

  @JsonProperty("Test_correction_reason")
  public String getCorrectionReason() {
    if (testEvent.getCorrectionStatus() != TestCorrectionStatus.ORIGINAL) {
      return Optional.ofNullable(testEvent.getReasonForCorrection()).orElse("");
    }
    return "";
  }

  // 27Jan2021 Updated to handle deleted tests
  @JsonProperty("Test_result_status")
  public String getTestResultStatus() {
    // F Final results
    // W Post original as wrong, e.g., transmitted for wrong patient
    // C Corrected, final
    switch (testEvent.getCorrectionStatus()) {
      case REMOVED:
        return "W";
      case CORRECTED:
        return "C";
      case ORIGINAL:
      default:
        return "F";
    }
  }

  @JsonProperty("Order_result_status")
  public String getOrderResultStatus() {
    // F Final results
    // C Corrected to results (includes removal)
    switch (testEvent.getCorrectionStatus()) {
      case REMOVED:
      case CORRECTED:
        return "C";
      case ORIGINAL:
      default:
        return "F";
    }
  }

  @JsonProperty("Observation_result_status")
  public String getObservationResultStatus() {
    // F Final results
    // W Post original as wrong, e.g., transmitted for wrong patient
    // C Corrected, final
    switch (testEvent.getCorrectionStatus()) {
      case REMOVED:
        return "W";
      case CORRECTED:
        return "C";
      case ORIGINAL:
      default:
        return "F";
    }
  }

  @JsonProperty("Test_result_code")
  public String getTestResult() {
    return testResultMap.get(testEvent.getCovidTestResult().orElseThrow());
  }

  @JsonProperty("Specimen_collection_date_time")
  public String getSpecimenCollectionDateTime() {
    var testDuration =
        deviceType.map(DeviceType::getTestLength).orElse(FALLBACK_DEFAULT_TEST_MINUTES);
    return dateToHealthCareString(
        convertToLocalDateTime(
            Date.from(
                testEvent.getDateTested().toInstant().minus(Duration.ofMinutes(testDuration)))));
  }

  @JsonProperty("Ordering_provider_ID")
  public String getOrderingProviderID() {
    return provider.map(Provider::getProviderId).orElse(null);
  }

  @JsonProperty("First_test")
  public String getFirstTest() {
    return TRUE.equals(testEvent.getPatientHasPriorTests()) ? "N" : "UNK";
  }

  @JsonProperty("Symptomatic_for_disease")
  public String getSymptomaticForDisease() {
    return boolToYesNoUnk(survey.map(AskOnEntrySurvey::getNoSymptoms).map(b -> !b));
  }

  @JsonProperty("Illness_onset_date")
  public String getSymptomOnsetDate() {
    return dateToHealthCareString(survey.map(AskOnEntrySurvey::getSymptomOnsetDate).orElse(null));
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
    return processingModeCode; // D:Debugging P:Production T:Training
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
    return provider.map(Provider::getZipCode).orElse(null);
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
    // This field is mapped to the testPerformedLoinc but was mistakenly named ordered_test_code
    return deviceType
        .map(DeviceType::getSupportedDiseaseTestPerformed)
        .flatMap(TestEventExport::getFirstCovidDiseaseInfo)
        .map(DeviceTypeDisease::getTestPerformedLoincCode)
        .orElse(null);
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
    return deviceType.map(d -> d.getInternalId().toString()).orElse(null);
  }

  @JsonProperty("Device_ID")
  public String getDeviceID() {
    return deviceType.map(DeviceType::getModel).orElse(null);
  }

  @JsonProperty("Test_Kit_Name_ID")
  public String getTestKitNameId() {
    return getCommonCovidDiseaseValue(DeviceTypeDisease::getTestkitNameId);
  }

  @JsonProperty("Equipment_Model_ID")
  public String getEquipmentModelId() {
    return getCommonCovidDiseaseValue(DeviceTypeDisease::getEquipmentUid);
  }

  @JsonProperty("Test_date")
  public String getTestDate() {
    return dateToHealthCareString(
        Optional.ofNullable(testEvent.getDateTested())
            .map(this::convertToLocalDateTime)
            .orElse(null));
  }

  @JsonProperty("Date_result_released")
  public String getDateResultReleased() {
    return dateToHealthCareString(LocalDateTime.now());
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
