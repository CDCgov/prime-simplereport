package gov.cdc.usds.simplereport.api.model.filerow;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ITEM_SCOPE;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateBiologicalSex;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateClia;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateDateFormat;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateDateTime;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateEmail;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateEthnicity;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validatePhoneNumber;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateRace;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateResidence;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateSpecimenType;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateState;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateTestResult;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateTestResultStatus;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateYesNoAnswer;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateZipCode;
import static java.util.Collections.emptyList;

import gov.cdc.usds.simplereport.service.ResultsUploaderDeviceValidationService;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import lombok.Getter;

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
  static final String PATIENT_RACE = "patient_race";
  static final String PATIENT_ETHNICITY = "patient_ethnicity";
  static final String ACCESSION_NUMBER = "accession_number";
  static final String EQUIPMENT_MODEL_NAME = "equipment_model_name";
  static final String TEST_PERFORMED_CODE = "test_performed_code";
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
  static final String TESTING_LAB_NAME = "testing_lab_name";
  static final String TESTING_LAB_STREET = "testing_lab_street";
  static final String TESTING_LAB_CITY = "testing_lab_city";
  static final String TESTING_LAB_STATE = "testing_lab_state";
  static final String TESTING_LAB_ZIP_CODE_FIELD = "testing_lab_zip_code";
  static Set<String> fluOnlyTestPerformedLoinc =
      Set.of(
          "100973-7",
          "100974-5",
          "17015-9",
          "17016-7",
          "22096-2",
          "22825-4",
          "22827-0",
          "24015-0",
          "31437-7",
          "31438-5",
          "31859-2",
          "31864-2",
          "33535-6",
          "34487-9",
          "38381-0",
          "38382-8",
          "40982-1",
          "43874-7",
          "43895-2",
          "44558-5",
          "44563-5",
          "44564-3",
          "44567-6",
          "44570-0",
          "44571-8",
          "44573-4",
          "44575-9",
          "44577-5",
          "46082-4",
          "46083-2",
          "48310-7",
          "48509-4",
          "49521-8",
          "49523-4",
          "49524-2",
          "49531-7",
          "49535-8",
          "50697-2",
          "5229-0",
          "5230-8",
          "54243-1",
          "55463-4",
          "55464-2",
          "55465-9",
          "5862-8",
          "5863-6",
          "5866-9",
          "59423-4",
          "62462-7",
          "6435-2",
          "6437-8",
          "6438-6",
          "68986-9",
          "68987-7",
          "72356-9",
          "72366-8",
          "74785-7",
          "74786-5",
          "74787-3",
          "76078-5",
          "76080-1",
          "77026-3",
          "77027-1",
          "77028-9",
          "7920-2",
          "7931-9",
          "80381-7",
          "80382-5",
          "80383-3",
          "82166-0",
          "82167-8",
          "82168-6",
          "82169-4",
          "82170-2",
          "85476-0",
          "85477-8",
          "85478-6",
          "92141-1",
          "92142-9",
          "92976-0",
          "92977-8",
          "9531-5",
          "9534-9");
  private ResultsUploaderDeviceValidationService resultsUploaderDeviceValidationService;

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
          PATIENT_GENDER,
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
          TESTING_LAB_ZIP_CODE_FIELD);

  public TestResultRow(
      Map<String, String> rawRow,
      ResultsUploaderDeviceValidationService resultsUploaderDeviceValidationService) {
    this(rawRow);
    this.resultsUploaderDeviceValidationService = resultsUploaderDeviceValidationService;
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
    patientGender = getValue(rawRow, PATIENT_GENDER, isRequired(PATIENT_GENDER));
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
    testingLabStreet2 = getValue(rawRow, "testing_lab_street2", isRequired("testing_lab_street2"));
    testingLabCity = getValue(rawRow, TESTING_LAB_CITY, isRequired(TESTING_LAB_CITY));
    testingLabState = getValue(rawRow, TESTING_LAB_STATE, isRequired(TESTING_LAB_STATE));
    testingLabZipCode =
        getValue(rawRow, TESTING_LAB_ZIP_CODE_FIELD, isRequired(TESTING_LAB_ZIP_CODE_FIELD));
    testingLabPhoneNumber =
        getValue(rawRow, "testing_lab_phone_number", isRequired("testing_lab_phone_number"));
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
        getValue(rawRow, "ordering_facility_name", isRequired("ordering_facility_name"));
    orderingFacilityStreet =
        getValue(rawRow, "ordering_facility_street", isRequired("ordering_facility_street"));
    orderingFacilityStreet2 =
        getValue(rawRow, "ordering_facility_street2", isRequired("ordering_facility_street2"));
    orderingFacilityCity =
        getValue(rawRow, "ordering_facility_city", isRequired("ordering_facility_city"));
    orderingFacilityState =
        getValue(rawRow, "ordering_facility_state", isRequired("ordering_facility_state"));
    orderingFacilityZipCode =
        getValue(rawRow, "ordering_facility_zip_code", isRequired("ordering_facility_zip_code"));
    orderingFacilityPhoneNumber =
        getValue(
            rawRow, "ordering_facility_phone_number", isRequired("ordering_facility_phone_number"));
    comment = getValue(rawRow, "comment", isRequired("comment"));
    testResultStatus = getValue(rawRow, "test_result_status", isRequired("test_result_status"));
  }

  private List<FeedbackMessage> validateDeviceModelAndTestPerformedCode(
      String equipmentModelName, String testPerformedCode) {

    if (validModelTestPerformedCombination(equipmentModelName, testPerformedCode)
        || validFluOnlyTestPerformedLoinc(testPerformedCode)) {
      return emptyList();
    }

    String errorMessage =
        "Invalid " + EQUIPMENT_MODEL_NAME + " and " + TEST_PERFORMED_CODE + " combination";
    return List.of(new FeedbackMessage(ITEM_SCOPE, errorMessage));
  }

  private boolean validFluOnlyTestPerformedLoinc(String testPerformedCode) {
    return testPerformedCode != null && fluOnlyTestPerformedLoinc.contains(testPerformedCode);
  }

  private boolean validModelTestPerformedCombination(
      String equipmentModelName, String testPerformedCode) {
    return equipmentModelName != null
        && testPerformedCode != null
        && resultsUploaderDeviceValidationService
            .getModelAndTestPerformedCodeToDeviceMap()
            .containsKey(
                ResultsUploaderDeviceValidationService.getMapKey(
                    equipmentModelName, testPerformedCode));
  }

  @Override
  public List<String> getRequiredFields() {
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
    errors.addAll(validateBiologicalSex(patientGender));
    errors.addAll(validateEthnicity(patientEthnicity));

    errors.addAll(validateYesNoAnswer(pregnant));
    errors.addAll(validateYesNoAnswer(employedInHealthcare));
    errors.addAll(validateYesNoAnswer(symptomaticForDisease));
    errors.addAll(validateYesNoAnswer(residentCongregateSetting));
    errors.addAll(validateYesNoAnswer(hospitalized));
    errors.addAll(validateYesNoAnswer(icu));
    errors.addAll(validateResidence(residenceType));

    errors.addAll(validateTestResult(testResult));
    errors.addAll(validateTestResultStatus(testResultStatus));
    errors.addAll(validateSpecimenType(specimenType));

    errors.addAll(validateClia(testingLabClia));

    errors.addAll(
        validateDeviceModelAndTestPerformedCode(
            equipmentModelName.getValue(), testPerformedCode.getValue()));

    return errors;
  }
}
