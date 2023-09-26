package gov.cdc.usds.simplereport.api.model.filerow;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.*;

import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.service.ResultsUploaderCachingService;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.Getter;

@Getter
public class ConditionAgnosticResultRow implements FileRow {
  final ValueOrError testResultStatus;
  final ValueOrError testResultEffectiveDate;
  final ValueOrError testPerformedCode;
  final ValueOrError testResultValue;
  final ValueOrError patientId;
  final ValueOrError patientFirstName;
  final ValueOrError patientLastName;
  final ValueOrError patientNameAbsentReason;
  final ValueOrError patientAdminGender;

  static final String TEST_RESULT_STATUS = "test_result_status";
  static final String TEST_RESULT_EFFECTIVE_DATE = "test_result_effective_date";
  static final String TEST_PERFORMED_CODE = "test_performed_code";
  static final String TEST_RESULT_VALUE = "test_result_value";
  static final String PATIENT_ID = "patient_id";
  static final String PATIENT_LAST_NAME = "patient_last_name";
  static final String PATIENT_FIRST_NAME = "patient_first_name";
  static final String PATIENT_NAME_ABSENT_REASON = "patient_name_absent_reason";
  static final String PATIENT_ADMIN_GENDER = "patient_admin_gender";

  private static List<String> requiredFields =
      List.of(
          TEST_RESULT_STATUS,
          TEST_RESULT_EFFECTIVE_DATE,
          TEST_PERFORMED_CODE,
          TEST_RESULT_VALUE,
          PATIENT_ID,
          PATIENT_ADMIN_GENDER);

  public enum PatientNameRelatedField {
    PATIENT_FIRST_NAME,
    PATIENT_LAST_NAME,
    PATIENT_NAME_ABSENT_REASON
  }

  @Override
  public Boolean isRequired(String rowName) {
    return requiredFields.contains(rowName);
  }

  //  overload for patient name related validations
  private boolean isRequired(Map<String, String> rawRow, PatientNameRelatedField fieldToCheck) {
    Map<String, Boolean> nameMap = new HashMap<>();
    nameMap.put(PATIENT_FIRST_NAME, getValue(rawRow, PATIENT_FIRST_NAME, false).getValue() != null);
    nameMap.put(PATIENT_LAST_NAME, getValue(rawRow, PATIENT_LAST_NAME, false).getValue() != null);
    nameMap.put(
        PATIENT_NAME_ABSENT_REASON,
        getValue(rawRow, PATIENT_NAME_ABSENT_REASON, false).getValue() != null);

    return switch (fieldToCheck) {
        // required if data absent value is defined, not required otherwise
      case PATIENT_FIRST_NAME, PATIENT_LAST_NAME -> nameMap.get(PATIENT_NAME_ABSENT_REASON);

        // if both name fields are present, not required. Required otherwise.
      case PATIENT_NAME_ABSENT_REASON -> !(nameMap.get(PATIENT_LAST_NAME)
          && nameMap.get(PATIENT_LAST_NAME));
    };
  }

  @Override
  public List<FeedbackMessage> validateRequiredFields() {
    return getPossibleErrorsFromFields();
  }

  @Override
  public List<String> getRequiredFields() {
    return requiredFields;
  }

  private ResultsUploaderCachingService resultsUploaderCachingService;
  private FeatureFlagsConfig featureFlagsConfig;

  public ConditionAgnosticResultRow(
      Map<String, String> rawRow,
      ResultsUploaderCachingService resultsUploaderCachingService,
      FeatureFlagsConfig featureFlagsConfig) {
    this(rawRow);
    this.resultsUploaderCachingService = resultsUploaderCachingService;
    this.featureFlagsConfig = featureFlagsConfig;
  }

  public ConditionAgnosticResultRow(Map<String, String> rawRow) {
    testResultStatus = getValue(rawRow, TEST_RESULT_STATUS, isRequired(TEST_RESULT_STATUS));
    testResultEffectiveDate =
        getValue(rawRow, TEST_RESULT_EFFECTIVE_DATE, isRequired(TEST_RESULT_EFFECTIVE_DATE));
    testPerformedCode = getValue(rawRow, TEST_PERFORMED_CODE, isRequired(TEST_PERFORMED_CODE));
    testResultValue = getValue(rawRow, TEST_RESULT_VALUE, isRequired(TEST_RESULT_VALUE));
    patientId = getValue(rawRow, PATIENT_ID, isRequired(PATIENT_ID));
    patientFirstName =
        getValue(
            rawRow,
            PATIENT_FIRST_NAME,
            isRequired(rawRow, PatientNameRelatedField.valueOf(PATIENT_FIRST_NAME)));
    patientLastName =
        getValue(
            rawRow,
            PATIENT_LAST_NAME,
            isRequired(rawRow, PatientNameRelatedField.valueOf(PATIENT_LAST_NAME)));
    patientNameAbsentReason =
        getValue(
            rawRow,
            PATIENT_NAME_ABSENT_REASON,
            isRequired(rawRow, PatientNameRelatedField.valueOf(PATIENT_NAME_ABSENT_REASON)));
    patientAdminGender = getValue(rawRow, PATIENT_ADMIN_GENDER, isRequired(PATIENT_ADMIN_GENDER));
  }

  @Override
  public List<FeedbackMessage> validateIndividualValues() {
    var errors = new ArrayList<FeedbackMessage>();
    errors.addAll(validateDateTime(testResultEffectiveDate));
    errors.addAll(validateDataAbsentReason(patientNameAbsentReason));
    errors.addAll(validateTestResultStatus(testResultStatus));
    errors.addAll(validateBiologicalSex(patientAdminGender));
    return errors;
  }
}
