package gov.cdc.usds.simplereport.validators;

import static gov.cdc.usds.simplereport.api.model.filerow.ConditionAgnosticResultRow.PATIENT_ADMIN_GENDER;
import static gov.cdc.usds.simplereport.api.model.filerow.ConditionAgnosticResultRow.PATIENT_FIRST_NAME;
import static gov.cdc.usds.simplereport.api.model.filerow.ConditionAgnosticResultRow.PATIENT_ID;
import static gov.cdc.usds.simplereport.api.model.filerow.ConditionAgnosticResultRow.PATIENT_LAST_NAME;
import static gov.cdc.usds.simplereport.api.model.filerow.ConditionAgnosticResultRow.PATIENT_NAME_ABSENT_REASON;
import static gov.cdc.usds.simplereport.api.model.filerow.ConditionAgnosticResultRow.TEST_PERFORMED_CODE;
import static gov.cdc.usds.simplereport.api.model.filerow.ConditionAgnosticResultRow.TEST_RESULT_EFFECTIVE_DATE;
import static gov.cdc.usds.simplereport.api.model.filerow.ConditionAgnosticResultRow.TEST_RESULT_STATUS;
import static gov.cdc.usds.simplereport.api.model.filerow.ConditionAgnosticResultRow.TEST_RESULT_VALUE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.from;
import static org.mockito.Mockito.mock;

import gov.cdc.usds.simplereport.api.model.filerow.ConditionAgnosticResultRow;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.test_util.TestErrorMessageUtil;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class ConditionAgnosticResultRowTest {
  Map<String, String> validRowMap;
  final List<String> requiredFields =
      List.of(
          TEST_RESULT_STATUS,
          TEST_RESULT_EFFECTIVE_DATE,
          TEST_PERFORMED_CODE,
          TEST_RESULT_VALUE,
          PATIENT_ID,
          PATIENT_ADMIN_GENDER);
  final List<String> individualFields =
      List.of(
          TEST_RESULT_STATUS,
          TEST_RESULT_EFFECTIVE_DATE,
          TEST_PERFORMED_CODE,
          TEST_RESULT_VALUE,
          PATIENT_ADMIN_GENDER,
          PATIENT_NAME_ABSENT_REASON);

  @BeforeEach
  public void init() {
    validRowMap = new HashMap<>();

    validRowMap.put(PATIENT_ID, "1234");
    validRowMap.put(PATIENT_LAST_NAME, "Doe");
    validRowMap.put(PATIENT_FIRST_NAME, "Jane");
    validRowMap.put(PATIENT_ADMIN_GENDER, "F");
    validRowMap.put(PATIENT_NAME_ABSENT_REASON, "");

    validRowMap.put(TEST_PERFORMED_CODE, "94534-5");
    validRowMap.put(TEST_RESULT_VALUE, "Detected");
    validRowMap.put(TEST_RESULT_EFFECTIVE_DATE, "12/20/2021 14:00");
    validRowMap.put(TEST_RESULT_STATUS, "F");
  }

  @Test
  void processRowSetsAllValues() {
    var conditionAgnosticResultRow = new ConditionAgnosticResultRow(validRowMap);

    assertThat(conditionAgnosticResultRow)
        .returns(
            validRowMap.get(PATIENT_ID),
            from(ConditionAgnosticResultRow::getPatientId).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get(PATIENT_LAST_NAME),
            from(ConditionAgnosticResultRow::getPatientLastName).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get(PATIENT_FIRST_NAME),
            from(ConditionAgnosticResultRow::getPatientFirstName).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get(PATIENT_ADMIN_GENDER),
            from(ConditionAgnosticResultRow::getPatientAdminGender).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get(PATIENT_NAME_ABSENT_REASON),
            from(ConditionAgnosticResultRow::getPatientNameAbsentReason)
                .andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get(TEST_PERFORMED_CODE),
            from(ConditionAgnosticResultRow::getTestPerformedCode).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get(TEST_RESULT_VALUE),
            from(ConditionAgnosticResultRow::getTestResultValue).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get(TEST_RESULT_EFFECTIVE_DATE),
            from(ConditionAgnosticResultRow::getTestResultEffectiveDate)
                .andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get(TEST_RESULT_STATUS),
            from(ConditionAgnosticResultRow::getTestResultStatus).andThen(ValueOrError::getValue));
  }

  @Test
  void validateRequiredFieldsReturnsErrorsForAllEmptyRequiredFields() {
    var conditionAgnosticRow = new ConditionAgnosticResultRow(new HashMap<>());

    var actual = conditionAgnosticRow.validateRequiredFields();

    var messages = actual.stream().map(FeedbackMessage::getMessage).collect(Collectors.toSet());

    assertThat(actual).hasSize(requiredFields.size() + 1);
    requiredFields.forEach(
        fieldName ->
            assertThat(messages).contains("File is missing data in the " + fieldName + " column."));
  }

  @Test
  void validateIndividualFields() {
    var invalidIndividualFields = validRowMap;

    invalidIndividualFields.put(PATIENT_ADMIN_GENDER, "not a valid one");
    invalidIndividualFields.put(PATIENT_NAME_ABSENT_REASON, "not a valid one");
    invalidIndividualFields.put(TEST_RESULT_STATUS, "complete");
    invalidIndividualFields.put(TEST_RESULT_EFFECTIVE_DATE, "0/0/00");
    invalidIndividualFields.put(TEST_PERFORMED_CODE, "not a valid one");
    invalidIndividualFields.put(TEST_RESULT_VALUE, "not a valid one");

    var conditionAgnosticRow =
        new ConditionAgnosticResultRow(invalidIndividualFields, mock(FeatureFlagsConfig.class));

    var actual = conditionAgnosticRow.validateIndividualValues();

    var messages =
        actual.stream()
            .map(
                message ->
                    TestErrorMessageUtil.getColumnNameFromInvalidErrorMessage(message.getMessage()))
            .collect(Collectors.toSet());
    assertThat(actual).hasSize(individualFields.size());
    individualFields.forEach(fieldName -> assertThat(messages).contains(fieldName));
  }

  @Test
  void validateRowWithPresentNameAndAbsentNameAbsentReason() {
    var rowToCheck = validRowMap;
    rowToCheck.remove(PATIENT_NAME_ABSENT_REASON);

    var conditionAgnosticRow =
        new ConditionAgnosticResultRow(rowToCheck, mock(FeatureFlagsConfig.class));

    var shouldHaveNoErrors = conditionAgnosticRow.validateRequiredFields();
    assertThat(shouldHaveNoErrors).hasSize(0);
  }

  @Test
  void validateRowWithPresentNameAbsentReasonAndAbsentName() {
    var rowToCheck = validRowMap;
    rowToCheck.remove(PATIENT_LAST_NAME);
    rowToCheck.remove(PATIENT_FIRST_NAME);
    rowToCheck.put(PATIENT_NAME_ABSENT_REASON, "Unknown");

    var conditionAgnosticRow =
        new ConditionAgnosticResultRow(rowToCheck, mock(FeatureFlagsConfig.class));

    var shouldHaveNoRequiredErrors = conditionAgnosticRow.validateRequiredFields();
    var shouldHaveNoValueErrors = conditionAgnosticRow.validateIndividualValues();

    assertThat(shouldHaveNoRequiredErrors).hasSize(0);
    assertThat(shouldHaveNoValueErrors).hasSize(0);
  }

  @Test
  void validateRowWithoutNameOrNameAbsentReasonReturnsErrorForPatientNameAbsentReason() {
    var rowToCheck = validRowMap;
    rowToCheck.remove(PATIENT_NAME_ABSENT_REASON);
    rowToCheck.remove(PATIENT_FIRST_NAME);
    rowToCheck.remove(PATIENT_LAST_NAME);

    var conditionAgnosticRow =
        new ConditionAgnosticResultRow(rowToCheck, mock(FeatureFlagsConfig.class));

    var actual = conditionAgnosticRow.validateRequiredFields();

    var messages = actual.stream().map(FeedbackMessage::getMessage).collect(Collectors.toSet());

    assertThat(actual).hasSize(1);
    assertThat(messages)
        .contains("File is missing data in the " + PATIENT_NAME_ABSENT_REASON + " column.");
  }
}
