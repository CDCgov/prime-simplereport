package gov.cdc.usds.simplereport.api.model.filerow;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateBiologicalSex;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateDataAbsentReason;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateDateTime;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateTestPerformedCode;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateTestResult;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateTestResultStatus;

import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import org.apache.commons.lang3.StringUtils;

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

  public static final String TEST_RESULT_STATUS = "test_result_status";
  public static final String TEST_RESULT_EFFECTIVE_DATE = "test_result_effective_date";
  public static final String TEST_PERFORMED_CODE = "test_performed_code";
  public static final String TEST_RESULT_VALUE = "test_result_value";
  public static final String PATIENT_ID = "patient_id";
  public static final String PATIENT_LAST_NAME = "patient_last_name";
  public static final String PATIENT_FIRST_NAME = "patient_first_name";
  public static final String PATIENT_NAME_ABSENT_REASON = "patient_name_absent_reason";
  public static final String PATIENT_ADMIN_GENDER = "patient_admin_gender";

  private static List<String> initialRequiredFields =
      List.of(
          TEST_RESULT_STATUS,
          TEST_RESULT_EFFECTIVE_DATE,
          TEST_PERFORMED_CODE,
          TEST_RESULT_VALUE,
          PATIENT_ID,
          PATIENT_ADMIN_GENDER);

  private List<String> requiredFields;

  public ConditionAgnosticResultRow(Map<String, String> rawRow) {
    this.requiredFields = generateRequiredFields(rawRow);
    testResultStatus = getValue(rawRow, TEST_RESULT_STATUS, isRequired(TEST_RESULT_STATUS));
    testResultEffectiveDate =
        getValue(rawRow, TEST_RESULT_EFFECTIVE_DATE, isRequired(TEST_RESULT_EFFECTIVE_DATE));
    testPerformedCode = getValue(rawRow, TEST_PERFORMED_CODE, isRequired(TEST_PERFORMED_CODE));
    testResultValue = getValue(rawRow, TEST_RESULT_VALUE, isRequired(TEST_RESULT_VALUE));
    patientId = getValue(rawRow, PATIENT_ID, isRequired(PATIENT_ID));
    patientNameAbsentReason =
        getValue(rawRow, PATIENT_NAME_ABSENT_REASON, isRequired(PATIENT_NAME_ABSENT_REASON));
    patientFirstName = getValue(rawRow, PATIENT_FIRST_NAME, isRequired(PATIENT_FIRST_NAME));
    patientLastName = getValue(rawRow, PATIENT_LAST_NAME, isRequired(PATIENT_LAST_NAME));
    patientAdminGender = getValue(rawRow, PATIENT_ADMIN_GENDER, isRequired(PATIENT_ADMIN_GENDER));
  }

  // The schema expects that (first_name || last_name) XOR name_absent_reason be present, so add the
  // name-related fields to the required fields list accordingly
  private static List<String> generateRequiredFields(Map<String, String> rawRow) {
    String firstNameVal = getValue(rawRow, PATIENT_FIRST_NAME, false).getValue();
    String lastNameVal = getValue(rawRow, PATIENT_LAST_NAME, false).getValue();

    boolean firstNameAbsent = StringUtils.isBlank(firstNameVal);
    boolean lastNameAbsent = StringUtils.isBlank(lastNameVal);

    List<String> requiredFields = new ArrayList<>(initialRequiredFields);

    if (firstNameAbsent ^ lastNameAbsent) {
      if (firstNameAbsent) requiredFields.add(PATIENT_LAST_NAME);
      else requiredFields.add(PATIENT_FIRST_NAME);
    } else if (firstNameAbsent && lastNameAbsent) {
      requiredFields.add(PATIENT_NAME_ABSENT_REASON);
    } else {
      requiredFields.add(PATIENT_LAST_NAME);
      requiredFields.add(PATIENT_FIRST_NAME);
    }

    return requiredFields;
  }

  @Override
  public Boolean isRequired(String rowName) {
    return requiredFields.contains(rowName);
  }

  @Override
  public List<FeedbackMessage> validateRequiredFields() {
    return getPossibleErrorsFromFields();
  }

  @Override
  public List<String> getRequiredFields() {
    return requiredFields;
  }

  @Override
  public List<FeedbackMessage> validateIndividualValues() {
    var errors = new ArrayList<FeedbackMessage>();
    errors.addAll(validateBiologicalSex(patientAdminGender));
    errors.addAll(validateDataAbsentReason(patientNameAbsentReason));
    errors.addAll(validateTestResultStatus(testResultStatus));
    errors.addAll(validateDateTime(testResultEffectiveDate));
    errors.addAll(validateTestPerformedCode(testPerformedCode));
    errors.addAll(validateTestResult(testResultValue));
    return errors;
  }
}
