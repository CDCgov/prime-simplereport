package gov.cdc.usds.simplereport.api.model.filerow;

import static gov.cdc.usds.simplereport.service.DiseaseService.FLU_A_AND_B_NAME;
import static gov.cdc.usds.simplereport.service.DiseaseService.FLU_A_NAME;
import static gov.cdc.usds.simplereport.service.DiseaseService.FLU_B_NAME;
import static gov.cdc.usds.simplereport.service.DiseaseService.FLU_RNA_NAME;
import static gov.cdc.usds.simplereport.service.DiseaseService.RSV_NAME;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ITEM_SCOPE;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getGenderValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateClia;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateDateFormat;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateDateTime;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateEmail;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateEthnicity;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateGendersOfSexualPartners;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validatePatientGenderIdentity;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validatePhoneNumber;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateRace;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateRequiredFieldsForPositiveResult;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateResidence;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateSpecimenType;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateState;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateTestResult;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateTestResultStatus;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateYesNoUnknownAnswer;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateZipCode;
import static java.util.Collections.emptyList;

import com.google.common.collect.ImmutableMap;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.db.model.auxiliary.ResultUploadErrorSource;
import gov.cdc.usds.simplereport.db.model.auxiliary.ResultUploadErrorType;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.ResultsUploaderCachingService;
import gov.cdc.usds.simplereport.service.ResultsUploaderDeviceService;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import org.apache.commons.lang3.StringUtils;

@Getter
public class TestResultRow implements FileRow {
  final ValueOrError patientId;
  final ValueOrError patientLastName;
  final ValueOrError patientFirstName;
  final ValueOrError patientMiddleName;
  final ValueOrError patientStreet;
  final ValueOrError patientStreet2;
  final ValueOrError patientCity;
  final ValueOrError patientState;
  final ValueOrError patientZipCode;
  final ValueOrError patientCounty;
  final ValueOrError patientPhoneNumber;
  final ValueOrError patientDob;

  /**
   * This field "patient_gender" refers to the patient's sex assigned at birth. <br>
   *
   * <p>When "patient_gender_identity" was added as a field in 2024, the team decided to keep this
   * current column name of "patient_gender" instead of changing the header to something like
   * "patient_sex_assigned_at_birth". This decision was made to maintain compatibility for existing
   * bulk upload users.
   */
  final ValueOrError patientGender;

  final ValueOrError patientRace;
  final ValueOrError patientEthnicity;
  final ValueOrError patientPreferredLanguage;
  final ValueOrError patientEmail;
  final ValueOrError accessionNumber;
  final ValueOrError equipmentModelName;
  final ValueOrError testPerformedCode;
  final ValueOrError testResult;
  final ValueOrError orderTestDate;
  final ValueOrError specimenCollectionDate;
  final ValueOrError testingLabSpecimenReceivedDate;
  final ValueOrError testResultDate;
  final ValueOrError dateResultReleased;
  final ValueOrError specimenType;
  final ValueOrError orderingProviderId;
  final ValueOrError orderingProviderLastName;
  final ValueOrError orderingProviderFirstName;
  final ValueOrError orderingProviderMiddleName;
  final ValueOrError orderingProviderStreet;
  final ValueOrError orderingProviderStreet2;
  final ValueOrError orderingProviderCity;
  final ValueOrError orderingProviderState;
  final ValueOrError orderingProviderZipCode;
  final ValueOrError orderingProviderPhoneNumber;
  final ValueOrError testingLabClia;
  final ValueOrError testingLabName;
  final ValueOrError testingLabStreet;
  final ValueOrError testingLabStreet2;
  final ValueOrError testingLabCity;
  final ValueOrError testingLabState;
  final ValueOrError testingLabZipCode;
  final ValueOrError testingLabPhoneNumber;
  final ValueOrError pregnant;
  final ValueOrError employedInHealthcare;
  final ValueOrError symptomaticForDisease;
  final ValueOrError illnessOnsetDate;
  final ValueOrError residentCongregateSetting;
  final ValueOrError residenceType;
  final ValueOrError hospitalized;
  final ValueOrError icu;
  final ValueOrError orderingFacilityName;
  final ValueOrError orderingFacilityStreet;
  final ValueOrError orderingFacilityStreet2;
  final ValueOrError orderingFacilityCity;
  final ValueOrError orderingFacilityState;
  final ValueOrError orderingFacilityZipCode;
  final ValueOrError orderingFacilityPhoneNumber;
  final ValueOrError comment;
  final ValueOrError testResultStatus;
  final ValueOrError testOrderedCode;
  final ValueOrError gendersOfSexualPartners;
  final ValueOrError syphilisHistory;
  final ValueOrError patientGenderIdentity;

  static final String PATIENT_LAST_NAME = "patient_last_name";
  static final String PATIENT_FIRST_NAME = "patient_first_name";
  static final String PATIENT_STREET = "patient_street";
  static final String PATIENT_CITY = "patient_city";
  static final String PATIENT_STATE = "patient_state";
  static final String PATIENT_ZIP_CODE = "patient_zip_code";
  static final String PATIENT_COUNTY = "patient_county";
  static final String PATIENT_PHONE_NUMBER = "patient_phone_number";
  static final String PATIENT_DOB = "patient_dob";
  static final String PATIENT_GENDER = "patient_gender";
  static final String PATIENT_SEX = "patient_sex";
  static final String PATIENT_RACE = "patient_race";
  static final String PATIENT_ETHNICITY = "patient_ethnicity";
  static final String ACCESSION_NUMBER = "accession_number";
  public static final String EQUIPMENT_MODEL_NAME = "equipment_model_name";
  public static final String TEST_PERFORMED_CODE = "test_performed_code";
  static final String TEST_RESULT = "test_result";
  static final String ORDER_TEST_DATE = "order_test_date";
  static final String TEST_RESULT_DATE = "test_result_date";
  static final String SPECIMEN_TYPE = "specimen_type";
  static final String ORDERING_PROVIDER_ID = "ordering_provider_id";
  static final String ORDERING_PROVIDER_LAST_NAME = "ordering_provider_last_name";
  static final String ORDERING_PROVIDER_FIRST_NAME = "ordering_provider_first_name";
  static final String ORDERING_PROVIDER_STREET = "ordering_provider_street";
  static final String ORDERING_PROVIDER_CITY = "ordering_provider_city";
  static final String ORDERING_PROVIDER_STATE = "ordering_provider_state";
  static final String ORDERING_PROVIDER_ZIP_CODE = "ordering_provider_zip_code";
  static final String ORDERING_PROVIDER_PHONE_NUMBER = "ordering_provider_phone_number";
  static final String TESTING_LAB_CLIA = "testing_lab_clia";
  public static final String TESTING_LAB_NAME = "testing_lab_name";
  public static final String TESTING_LAB_STREET = "testing_lab_street";
  public static final String TESTING_LAB_STREET2 = "testing_lab_street2";
  public static final String TESTING_LAB_CITY = "testing_lab_city";
  public static final String TESTING_LAB_STATE = "testing_lab_state";
  public static final String TESTING_LAB_ZIP_CODE = "testing_lab_zip_code";
  public static final String TESTING_LAB_PHONE_NUMBER = "testing_lab_phone_number";
  public static final String ORDERING_FACILITY_NAME = "ordering_facility_name";
  public static final String ORDERING_FACILITY_STREET = "ordering_facility_street";
  public static final String ORDERING_FACILITY_STREET2 = "ordering_facility_street2";
  public static final String ORDERING_FACILITY_CITY = "ordering_facility_city";
  public static final String ORDERING_FACILITY_STATE = "ordering_facility_state";
  public static final String ORDERING_FACILITY_ZIP_CODE = "ordering_facility_zip_code";
  public static final String ORDERING_FACILITY_PHONE_NUMBER = "ordering_facility_phone_number";
  public static final String GENDERS_OF_SEXUAL_PARTNERS = "genders_of_sexual_partners";
  public static final String SYPHILIS_HISTORY = "syphilis_history";
  public static final String PATIENT_GENDER_IDENTITY = "patient_gender_identity";

  public static final ImmutableMap<String, String> diseaseSpecificLoincMap =
      new ImmutableMap.Builder<String, String>()
          .put("100973-7", FLU_A_NAME)
          .put("100974-5", FLU_B_NAME)
          .put("17015-9", FLU_B_NAME)
          .put("17016-7", FLU_B_NAME)
          .put("22096-2", FLU_A_NAME)
          .put("22825-4", FLU_A_NAME)
          .put("22827-0", FLU_A_NAME)
          .put("24015-0", FLU_A_AND_B_NAME)
          .put("31437-7", FLU_A_NAME)
          .put("31438-5", FLU_A_NAME)
          .put("31859-2", FLU_A_NAME)
          .put("31864-2", FLU_B_NAME)
          .put("33535-6", FLU_A_AND_B_NAME)
          .put("34487-9", FLU_A_NAME)
          .put("38381-0", FLU_A_NAME)
          .put("38382-8", FLU_B_NAME)
          .put("40982-1", FLU_B_NAME)
          .put("43874-7", FLU_A_NAME)
          .put("43895-2", FLU_B_NAME)
          .put("44558-5", FLU_A_NAME)
          .put("44563-5", FLU_A_NAME)
          .put("44564-3", FLU_A_NAME)
          .put("44567-6", FLU_A_AND_B_NAME)
          .put("44570-0", FLU_B_NAME)
          .put("44571-8", FLU_B_NAME)
          .put("44573-4", FLU_B_NAME)
          .put("44575-9", FLU_B_NAME)
          .put("44577-5", FLU_B_NAME)
          .put("46082-4", FLU_A_NAME)
          .put("46083-2", FLU_B_NAME)
          .put("48310-7", FLU_A_NAME)
          .put("48509-4", FLU_A_AND_B_NAME)
          .put("49521-8", FLU_A_NAME)
          .put("49523-4", FLU_A_NAME)
          .put("49524-2", FLU_A_NAME)
          .put("49531-7", FLU_A_NAME)
          .put("49535-8", FLU_B_NAME)
          .put("50697-2", FLU_A_NAME)
          .put("5229-0", FLU_A_NAME)
          .put("5230-8", FLU_B_NAME)
          .put("54243-1", FLU_RNA_NAME)
          .put("55463-4", FLU_A_NAME)
          .put("55464-2", FLU_A_NAME)
          .put("55465-9", FLU_A_NAME)
          .put("5862-8", FLU_A_NAME)
          .put("5863-6", FLU_A_NAME)
          .put("5866-9", FLU_B_NAME)
          .put("59423-4", FLU_A_NAME)
          .put("62462-7", FLU_A_AND_B_NAME)
          .put("6435-2", FLU_A_AND_B_NAME)
          .put("6437-8", FLU_A_AND_B_NAME)
          .put("6438-6", FLU_A_AND_B_NAME)
          .put("68986-9", FLU_A_NAME)
          .put("68987-7", FLU_A_NAME)
          .put("72356-9", FLU_A_AND_B_NAME)
          .put("72366-8", FLU_A_AND_B_NAME)
          .put("74785-7", FLU_B_NAME)
          .put("74786-5", FLU_B_NAME)
          .put("74787-3", FLU_B_NAME)
          .put("76078-5", FLU_A_NAME)
          .put("76080-1", FLU_B_NAME)
          .put("77026-3", FLU_A_NAME)
          .put("77027-1", FLU_A_NAME)
          .put("77028-9", FLU_A_NAME)
          .put("7920-2", FLU_A_NAME)
          .put("7931-9", FLU_B_NAME)
          .put("80381-7", FLU_A_AND_B_NAME)
          .put("80382-5", FLU_A_NAME)
          .put("80383-3", FLU_B_NAME)
          .put("82166-0", FLU_A_NAME)
          .put("82167-8", FLU_A_NAME)
          .put("82168-6", FLU_A_NAME)
          .put("82169-4", FLU_A_NAME)
          .put("82170-2", FLU_B_NAME)
          .put("85476-0", FLU_A_AND_B_NAME)
          .put("85477-8", FLU_A_NAME)
          .put("85478-6", FLU_B_NAME)
          .put("92141-1", FLU_B_NAME)
          .put("92142-9", FLU_A_NAME)
          .put("92976-0", FLU_B_NAME)
          .put("92977-8", FLU_A_NAME)
          .put("9531-5", FLU_A_NAME)
          .put("9534-9", FLU_B_NAME)
          .put("101298-8", RSV_NAME)
          .put("101425-7", RSV_NAME)
          .put("101426-5", RSV_NAME)
          .put("14129-1", RSV_NAME)
          .put("17517-4", RSV_NAME)
          .put("17518-2", RSV_NAME)
          .put("17519-0", RSV_NAME)
          .put("17520-8", RSV_NAME)
          .put("22466-7", RSV_NAME)
          .put("22467-5", RSV_NAME)
          .put("24224-8", RSV_NAME)
          .put("24225-5", RSV_NAME)
          .put("24298-2", RSV_NAME)
          .put("24299-0", RSV_NAME)
          .put("30075-6", RSV_NAME)
          .put("30076-4", RSV_NAME)
          .put("30147-3", RSV_NAME)
          .put("30148-1", RSV_NAME)
          .put("31583-8", RSV_NAME)
          .put("31949-1", RSV_NAME)
          .put("31950-9", RSV_NAME)
          .put("32040-8", RSV_NAME)
          .put("33045-6", RSV_NAME)
          .put("33382-3", RSV_NAME)
          .put("33390-6", RSV_NAME)
          .put("40987-0", RSV_NAME)
          .put("40988-8", RSV_NAME)
          .put("40989-6", RSV_NAME)
          .put("41012-6", RSV_NAME)
          .put("41456-5", RSV_NAME)
          .put("49037-5", RSV_NAME)
          .put("50329-2", RSV_NAME)
          .put("5294-4", RSV_NAME)
          .put("5295-1", RSV_NAME)
          .put("52975-0", RSV_NAME)
          .put("55100-2", RSV_NAME)
          .put("5874-3", RSV_NAME)
          .put("5875-0", RSV_NAME)
          .put("5876-8", RSV_NAME)
          .put("5877-6", RSV_NAME)
          .put("60271-4", RSV_NAME)
          .put("68966-1", RSV_NAME)
          .put("69929-8", RSV_NAME)
          .put("69962-9", RSV_NAME)
          .put("72885-7", RSV_NAME)
          .put("76088-4", RSV_NAME)
          .put("77389-5", RSV_NAME)
          .put("77390-3", RSV_NAME)
          .put("7990-5", RSV_NAME)
          .put("7991-3", RSV_NAME)
          .put("7992-1", RSV_NAME)
          .put("80597-8", RSV_NAME)
          .put("80598-6", RSV_NAME)
          .put("88202-7", RSV_NAME)
          .put("88204-3", RSV_NAME)
          .put("88527-7", RSV_NAME)
          .put("88528-5", RSV_NAME)
          .put("88595-4", RSV_NAME)
          .put("88597-0", RSV_NAME)
          .put("88909-7", RSV_NAME)
          .put("91133-9", RSV_NAME)
          .put("91782-3", RSV_NAME)
          .put("91785-6", RSV_NAME)
          .put("91794-8", RSV_NAME)
          .put("91795-5", RSV_NAME)
          .put("92957-0", RSV_NAME)
          .put("9573-7", RSV_NAME)
          .put("9574-5", RSV_NAME)
          .build();

  private ResultsUploaderCachingService resultsUploaderCachingService;
  private ResultsUploaderDeviceService resultsUploaderDeviceService;
  private FeatureFlagsConfig featureFlagsConfig;

  private static final List<String> requiredFields =
      List.of(
          PATIENT_LAST_NAME,
          PATIENT_FIRST_NAME,
          PATIENT_STREET,
          PATIENT_CITY,
          PATIENT_STATE,
          PATIENT_ZIP_CODE,
          PATIENT_COUNTY,
          PATIENT_PHONE_NUMBER,
          PATIENT_DOB,
          PATIENT_RACE,
          PATIENT_ETHNICITY,
          ACCESSION_NUMBER,
          EQUIPMENT_MODEL_NAME,
          TEST_PERFORMED_CODE,
          TEST_RESULT,
          ORDER_TEST_DATE,
          TEST_RESULT_DATE,
          SPECIMEN_TYPE,
          ORDERING_PROVIDER_ID,
          ORDERING_PROVIDER_LAST_NAME,
          ORDERING_PROVIDER_FIRST_NAME,
          ORDERING_PROVIDER_STREET,
          ORDERING_PROVIDER_CITY,
          ORDERING_PROVIDER_STATE,
          ORDERING_PROVIDER_ZIP_CODE,
          ORDERING_PROVIDER_PHONE_NUMBER,
          TESTING_LAB_CLIA,
          TESTING_LAB_NAME,
          TESTING_LAB_STREET,
          TESTING_LAB_CITY,
          TESTING_LAB_STATE,
          TESTING_LAB_ZIP_CODE);

  public TestResultRow(
      Map<String, String> rawRow,
      ResultsUploaderCachingService resultsUploaderCachingService,
      FeatureFlagsConfig featureFlagsConfig) {
    this(rawRow);
    this.resultsUploaderCachingService = resultsUploaderCachingService;
    this.resultsUploaderDeviceService =
        new ResultsUploaderDeviceService(resultsUploaderCachingService, featureFlagsConfig);
    this.featureFlagsConfig = featureFlagsConfig;
  }

  public TestResultRow(Map<String, String> rawRow) {
    patientId = getValue(rawRow, "patient_id", isRequired("patient_id"));
    patientLastName = getValue(rawRow, PATIENT_LAST_NAME, isRequired(PATIENT_LAST_NAME));
    patientFirstName = getValue(rawRow, PATIENT_FIRST_NAME, isRequired(PATIENT_FIRST_NAME));
    patientMiddleName = getValue(rawRow, "patient_middle_name", isRequired("patient_middle_name"));
    patientStreet = getValue(rawRow, PATIENT_STREET, isRequired(PATIENT_STREET));
    patientStreet2 = getValue(rawRow, "patient_street2", isRequired("patient_street2"));
    patientCity = getValue(rawRow, PATIENT_CITY, isRequired(PATIENT_CITY));
    patientState = getValue(rawRow, PATIENT_STATE, isRequired(PATIENT_STATE));
    patientZipCode = getValue(rawRow, PATIENT_ZIP_CODE, isRequired(PATIENT_ZIP_CODE));
    patientCounty = getValue(rawRow, PATIENT_COUNTY, isRequired(PATIENT_COUNTY));
    patientPhoneNumber = getValue(rawRow, PATIENT_PHONE_NUMBER, isRequired(PATIENT_PHONE_NUMBER));
    patientDob = getValue(rawRow, PATIENT_DOB, isRequired(PATIENT_DOB));
    patientRace = getValue(rawRow, PATIENT_RACE, isRequired(PATIENT_RACE));
    patientEthnicity = getValue(rawRow, PATIENT_ETHNICITY, isRequired(PATIENT_ETHNICITY));
    patientPreferredLanguage =
        getValue(rawRow, "patient_preferred_language", isRequired("patient_preferred_language"));
    patientEmail = getValue(rawRow, "patient_email", isRequired("patient_email"));
    accessionNumber = getValue(rawRow, ACCESSION_NUMBER, isRequired(ACCESSION_NUMBER));
    equipmentModelName = getValue(rawRow, EQUIPMENT_MODEL_NAME, isRequired(EQUIPMENT_MODEL_NAME));
    testPerformedCode = getValue(rawRow, TEST_PERFORMED_CODE, isRequired(TEST_PERFORMED_CODE));
    testResult = getValue(rawRow, TEST_RESULT, isRequired(TEST_RESULT));
    orderTestDate = getValue(rawRow, ORDER_TEST_DATE, isRequired(ORDER_TEST_DATE));
    specimenCollectionDate =
        getValue(rawRow, "specimen_collection_date", isRequired("specimen_collection_date"));
    testingLabSpecimenReceivedDate =
        getValue(
            rawRow,
            "testing_lab_specimen_received_date",
            isRequired("testing_lab_specimen_received_date"));
    testResultDate = getValue(rawRow, TEST_RESULT_DATE, isRequired(TEST_RESULT_DATE));
    dateResultReleased =
        getValue(rawRow, "date_result_released", isRequired("date_result_released"));
    specimenType = getValue(rawRow, SPECIMEN_TYPE, isRequired(SPECIMEN_TYPE));
    orderingProviderId = getValue(rawRow, ORDERING_PROVIDER_ID, isRequired(ORDERING_PROVIDER_ID));
    orderingProviderLastName =
        getValue(rawRow, ORDERING_PROVIDER_LAST_NAME, isRequired(ORDERING_PROVIDER_LAST_NAME));
    orderingProviderFirstName =
        getValue(rawRow, ORDERING_PROVIDER_FIRST_NAME, isRequired(ORDERING_PROVIDER_FIRST_NAME));
    orderingProviderMiddleName =
        getValue(
            rawRow, "ordering_provider_middle_name", isRequired("ordering_provider_middle_name"));
    orderingProviderStreet =
        getValue(rawRow, ORDERING_PROVIDER_STREET, isRequired(ORDERING_PROVIDER_STREET));
    orderingProviderStreet2 =
        getValue(rawRow, "ordering_provider_street2", isRequired("ordering_provider_street2"));
    orderingProviderCity =
        getValue(rawRow, ORDERING_PROVIDER_CITY, isRequired(ORDERING_PROVIDER_CITY));
    orderingProviderState =
        getValue(rawRow, ORDERING_PROVIDER_STATE, isRequired(ORDERING_PROVIDER_STATE));
    orderingProviderZipCode =
        getValue(rawRow, ORDERING_PROVIDER_ZIP_CODE, isRequired(ORDERING_PROVIDER_ZIP_CODE));
    orderingProviderPhoneNumber =
        getValue(
            rawRow, ORDERING_PROVIDER_PHONE_NUMBER, isRequired(ORDERING_PROVIDER_PHONE_NUMBER));
    testingLabClia = getValue(rawRow, TESTING_LAB_CLIA, isRequired(TESTING_LAB_CLIA));
    testingLabName = getValue(rawRow, TESTING_LAB_NAME, isRequired(TESTING_LAB_NAME));
    testingLabStreet = getValue(rawRow, TESTING_LAB_STREET, isRequired(TESTING_LAB_STREET));
    testingLabStreet2 = getValue(rawRow, TESTING_LAB_STREET2, isRequired(TESTING_LAB_STREET2));
    testingLabCity = getValue(rawRow, TESTING_LAB_CITY, isRequired(TESTING_LAB_CITY));
    testingLabState = getValue(rawRow, TESTING_LAB_STATE, isRequired(TESTING_LAB_STATE));
    testingLabZipCode = getValue(rawRow, TESTING_LAB_ZIP_CODE, isRequired(TESTING_LAB_ZIP_CODE));
    testingLabPhoneNumber =
        getValue(rawRow, TESTING_LAB_PHONE_NUMBER, isRequired(TESTING_LAB_PHONE_NUMBER));
    pregnant = getValue(rawRow, "pregnant", isRequired("pregnant"));
    employedInHealthcare =
        getValue(rawRow, "employed_in_healthcare", isRequired("employed_in_healthcare"));
    symptomaticForDisease =
        getValue(rawRow, "symptomatic_for_disease", isRequired("symptomatic_for_disease"));
    illnessOnsetDate = getValue(rawRow, "illness_onset_date", isRequired("illness_onset_date"));
    residentCongregateSetting =
        getValue(rawRow, "resident_congregate_setting", isRequired("resident_congregate_setting"));
    residenceType = getValue(rawRow, "residence_type", isRequired("residence_type"));
    hospitalized = getValue(rawRow, "hospitalized", isRequired("hospitalized"));
    icu = getValue(rawRow, "icu", isRequired("icu"));
    orderingFacilityName =
        getValue(rawRow, ORDERING_FACILITY_NAME, isRequired(ORDERING_FACILITY_NAME));
    orderingFacilityStreet =
        getValue(rawRow, ORDERING_FACILITY_STREET, isRequired(ORDERING_FACILITY_STREET));
    orderingFacilityStreet2 =
        getValue(rawRow, ORDERING_FACILITY_STREET2, isRequired(ORDERING_FACILITY_STREET2));
    orderingFacilityCity =
        getValue(rawRow, ORDERING_FACILITY_CITY, isRequired(ORDERING_FACILITY_CITY));
    orderingFacilityState =
        getValue(rawRow, ORDERING_FACILITY_STATE, isRequired(ORDERING_FACILITY_STATE));
    orderingFacilityZipCode =
        getValue(rawRow, ORDERING_FACILITY_ZIP_CODE, isRequired(ORDERING_FACILITY_ZIP_CODE));
    orderingFacilityPhoneNumber =
        getValue(
            rawRow, ORDERING_FACILITY_PHONE_NUMBER, isRequired(ORDERING_FACILITY_PHONE_NUMBER));
    comment = getValue(rawRow, "comment", isRequired("comment"));
    testResultStatus = getValue(rawRow, "test_result_status", isRequired("test_result_status"));
    testOrderedCode = getValue(rawRow, "test_ordered_code", isRequired("test_ordered_code"));
    gendersOfSexualPartners =
        getValue(rawRow, GENDERS_OF_SEXUAL_PARTNERS, isRequired(GENDERS_OF_SEXUAL_PARTNERS));
    syphilisHistory = getValue(rawRow, SYPHILIS_HISTORY, isRequired(SYPHILIS_HISTORY));

    boolean isPatientGenderRequired = isRequired(PATIENT_SEX);
    if (rawRow.containsKey(PATIENT_SEX) && !StringUtils.isBlank(rawRow.get(PATIENT_SEX))) {
      patientGender = getGenderValue(rawRow, PATIENT_SEX, isPatientGenderRequired);
    } else {
      patientGender = getGenderValue(rawRow, PATIENT_GENDER, isPatientGenderRequired);
    }

    patientGenderIdentity =
        getValue(rawRow, PATIENT_GENDER_IDENTITY, isRequired(PATIENT_GENDER_IDENTITY));
  }

  private List<FeedbackMessage> validateDeviceModelAndTestPerformedCode(
      String equipmentModelName, String testPerformedCode) {

    if (equipmentModelName == null || testPerformedCode == null) {
      return generateInvalidDataErrorMessages();
    }

    if (!validDeviceInDb(equipmentModelName, testPerformedCode)
        && !validDeviceInAllowList(testPerformedCode)) {
      return generateInvalidDataErrorMessages();
    }

    boolean hasOnlyActiveDiseases =
        resultsUploaderDeviceService.validateResultsOnlyIncludeActiveDiseases(
            equipmentModelName, testPerformedCode);

    if (!hasOnlyActiveDiseases) {
      return generateInactiveDiseaseErrorMessages();
    }
    return emptyList();
  }

  private boolean isHivResult() {
    if (equipmentModelName.getValue() == null || testPerformedCode.getValue() == null) {
      return false;
    }
    return resultsUploaderCachingService
        .getHivEquipmentModelAndTestPerformedCodeSet()
        .contains(
            ResultsUploaderCachingService.getKey(
                equipmentModelName.getValue(), testPerformedCode.getValue()));
  }

  private boolean isSyphilisResult() {
    if (equipmentModelName.getValue() == null || testPerformedCode.getValue() == null) {
      return false;
    }
    return resultsUploaderCachingService
        .getSyphilisEquipmentModelAndTestPerformedCodeSet()
        .contains(
            ResultsUploaderCachingService.getKey(
                equipmentModelName.getValue(), testPerformedCode.getValue()));
  }

  private boolean isHepatitisCResult() {
    if (equipmentModelName.getValue() == null || testPerformedCode.getValue() == null) {
      return false;
    }

    return resultsUploaderCachingService
        .getHepatitisCEquipmentModelAndTestPerformedCodeSet()
        .contains(
            ResultsUploaderCachingService.getKey(
                equipmentModelName.getValue(), testPerformedCode.getValue()));
  }

  private boolean isGonorrheaResult() {
    if (equipmentModelName.getValue() == null || testPerformedCode.getValue() == null) {
      return false;
    }

    return resultsUploaderCachingService
        .getGonorrheaEquipmentModelAndTestPerformedCodeSet()
        .contains(
            ResultsUploaderCachingService.getKey(
                equipmentModelName.getValue(), testPerformedCode.getValue()));
  }

  private boolean isChlamydiaResult() {
    if (equipmentModelName.getValue() == null || testPerformedCode.getValue() == null) {
      return false;
    }

    return resultsUploaderCachingService
        .getChlamydiaEquipmentModelAndTestPerformedCodeSet()
        .contains(
            ResultsUploaderCachingService.getKey(
                equipmentModelName.getValue(), testPerformedCode.getValue()));
  }

  private List<FeedbackMessage> generateInvalidDataErrorMessages() {
    String errorMessage =
        "Invalid " + EQUIPMENT_MODEL_NAME + " and " + TEST_PERFORMED_CODE + " combination";
    return List.of(
        FeedbackMessage.builder()
            .scope(ITEM_SCOPE)
            .message(errorMessage)
            .fieldRequired(true)
            .fieldHeader(EQUIPMENT_MODEL_NAME)
            .errorType(ResultUploadErrorType.INVALID_DATA)
            .source(ResultUploadErrorSource.SIMPLE_REPORT)
            .build());
  }

  private List<FeedbackMessage> generateInactiveDiseaseErrorMessages() {
    String errorMessage =
        EQUIPMENT_MODEL_NAME
            + " and "
            + TEST_PERFORMED_CODE
            + " combination map to a non-active disease in this jurisdiction";
    return List.of(
        FeedbackMessage.builder()
            .scope(ITEM_SCOPE)
            .message(errorMessage)
            .fieldRequired(true)
            .fieldHeader(TEST_PERFORMED_CODE)
            .errorType(ResultUploadErrorType.UNAVAILABLE_DISEASE)
            .source(ResultUploadErrorSource.SIMPLE_REPORT)
            .build());
  }

  private boolean validDeviceInDb(String equipmentModelName, String testPerformedCode) {
    return resultsUploaderDeviceService.validateModelAndTestPerformedCombination(
        equipmentModelName, testPerformedCode);
  }

  private boolean validDeviceInAllowList(String testPerformedCode) {
    String disease = diseaseSpecificLoincMap.get(testPerformedCode);
    return disease != null;
  }

  @Override
  public List<String> getRequiredFields() {
    return getStaticRequiredFields();
  }

  public static List<String> getStaticRequiredFields() {
    return requiredFields;
  }

  @Override
  public List<FeedbackMessage> validateRequiredFields() {
    return getPossibleErrorsFromFields();
  }

  @Override
  public Boolean isRequired(String rowName) {
    return requiredFields.contains(rowName);
  }

  @Override
  public List<FeedbackMessage> validateIndividualValues() {
    var errors = new ArrayList<FeedbackMessage>();
    errors.addAll(validateState(patientState));
    errors.addAll(validateState(orderingProviderState));
    errors.addAll(validateState(testingLabState));
    errors.addAll(validateState(orderingFacilityState));

    errors.addAll(validateZipCode(patientZipCode));
    errors.addAll(validateZipCode(orderingProviderZipCode));
    errors.addAll(validateZipCode(testingLabZipCode));
    errors.addAll(validateZipCode(orderingFacilityZipCode));

    errors.addAll(validatePhoneNumber(patientPhoneNumber));
    errors.addAll(validatePhoneNumber(orderingProviderPhoneNumber));
    errors.addAll(validatePhoneNumber(testingLabPhoneNumber));
    errors.addAll(validatePhoneNumber(orderingFacilityPhoneNumber));

    errors.addAll(validateDateFormat(patientDob));
    errors.addAll(validateDateFormat(illnessOnsetDate));

    errors.addAll(validateDateTime(orderTestDate));
    errors.addAll(validateDateTime(specimenCollectionDate));
    errors.addAll(validateDateTime(testingLabSpecimenReceivedDate));
    errors.addAll(validateDateTime(testResultDate));
    errors.addAll(validateDateTime(dateResultReleased));

    errors.addAll(validateEmail(patientEmail));
    errors.addAll(validateRace(patientRace));
    errors.addAll(validateEthnicity(patientEthnicity));

    errors.addAll(validateYesNoUnknownAnswer(pregnant));
    errors.addAll(validateYesNoUnknownAnswer(employedInHealthcare));
    errors.addAll(validateYesNoUnknownAnswer(symptomaticForDisease));
    errors.addAll(validateYesNoUnknownAnswer(residentCongregateSetting));
    errors.addAll(validateYesNoUnknownAnswer(hospitalized));
    errors.addAll(validateYesNoUnknownAnswer(icu));
    errors.addAll(validateResidence(residenceType));

    errors.addAll(validateTestResult(testResult));
    errors.addAll(validateTestResultStatus(testResultStatus));
    errors.addAll(
        validateSpecimenType(
            specimenType, resultsUploaderCachingService.getSpecimenTypeNameToSNOMEDMap()));

    errors.addAll(validateClia(testingLabClia));

    errors.addAll(
        validateDeviceModelAndTestPerformedCode(
            equipmentModelName.getValue(), testPerformedCode.getValue()));

    errors.addAll(validateGendersOfSexualPartners(gendersOfSexualPartners));

    errors.addAll(validatePatientGenderIdentity(patientGenderIdentity));

    if (isHivResult()) {
      errors.addAll(
          validateRequiredFieldsForPositiveResult(
              testResult, DiseaseService.HIV_NAME, List.of(gendersOfSexualPartners, pregnant)));
    }

    errors.addAll(validateYesNoUnknownAnswer(syphilisHistory));
    if (isSyphilisResult()) {
      errors.addAll(
          validateRequiredFieldsForPositiveResult(
              testResult,
              DiseaseService.SYPHILIS_NAME,
              List.of(gendersOfSexualPartners, pregnant, syphilisHistory, symptomaticForDisease)));
    }

    if (isHepatitisCResult()) {
      errors.addAll(
          validateRequiredFieldsForPositiveResult(
              testResult,
              DiseaseService.HEPATITIS_C_NAME,
              List.of(gendersOfSexualPartners, pregnant, symptomaticForDisease)));
    }

    if (isGonorrheaResult()) {
      errors.addAll(
          validateRequiredFieldsForPositiveResult(
              testResult,
              DiseaseService.GONORRHEA_NAME,
              List.of(gendersOfSexualPartners, pregnant, symptomaticForDisease)));
    }

    if (isChlamydiaResult()) {
      errors.addAll(
          validateRequiredFieldsForPositiveResult(
              testResult,
              DiseaseService.CHLAMYDIA_NAME,
              List.of(gendersOfSexualPartners, pregnant, symptomaticForDisease)));
    }

    return errors;
  }
}
