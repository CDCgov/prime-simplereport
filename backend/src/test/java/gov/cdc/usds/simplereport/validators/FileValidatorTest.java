package gov.cdc.usds.simplereport.validators;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.api.model.filerow.PatientUploadRow;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

class FileValidatorTest {

  FileValidator<PatientUploadRow> patientBulkUploadFileValidator =
      new FileValidator<>(PatientUploadRow::new);
  FileValidator<TestResultRow> testResultFileValidator = new FileValidator<>(TestResultRow::new);

  @Test
  void emptyFile_returnsError() {
    // GIVEN
    InputStream input = loadCsv("patientBulkUpload/empty.csv");
    // WHEN
    Exception exception =
        assertThrows(
            IllegalArgumentException.class, () -> patientBulkUploadFileValidator.validate(input));
    // THEN
    assertThat(exception).hasMessage("Empty or invalid CSV submitted");
  }

  @Test
  void malformedCsv_returnsError() {
    // GIVEN
    InputStream input = loadCsv("patientBulkUpload/malformed.csv");
    // WHEN
    List<FeedbackMessage> errors = patientBulkUploadFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(1);
    List<String> errorMessages =
        errors.stream().map(FeedbackMessage::getMessage).collect(Collectors.toList());
    assertThat(errorMessages)
        .contains(
            "File has the incorrect number of columns or empty rows. Please make sure all columns match the data template, and delete any empty rows.");
    assertThat(errors.get(0).getIndices()).isEqualTo(List.of(2, 4));
  }

  @Test
  void missingHeaders_returnsErrors() {
    // GIVEN
    InputStream input = loadCsv("patientBulkUpload/missingHeaders.csv");
    // WHEN
    List<FeedbackMessage> errors = patientBulkUploadFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(12);
    List<String> errorMessages =
        errors.stream().map(FeedbackMessage::getMessage).collect(Collectors.toList());
    List<List<Integer>> indices =
        errors.stream().map(FeedbackMessage::getIndices).collect(Collectors.toList());
    assertThat(errorMessages)
        .contains(
            "first_name is a required column.",
            "last_name is a required column.",
            "race is a required column.",
            "date_of_birth is a required column.",
            "biological_sex is a required column.",
            "ethnicity is a required column.",
            "street is a required column.",
            "state is a required column.",
            "zip_code is a required column.",
            "phone_number is a required column.",
            "employed_in_healthcare is a required column.",
            "resident_congregate_setting is a required column.");
    indices.forEach(i -> assertThat(i).isEqualTo(List.of(2)));
  }

  @Test
  void missingRequiredFields_returnsErrors() {
    // GIVEN
    InputStream input = loadCsv("patientBulkUpload/missingRequiredFields.csv");
    // WHEN
    List<FeedbackMessage> errors = patientBulkUploadFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(2);
    List<String> errorMessages =
        errors.stream().map(FeedbackMessage::getMessage).collect(Collectors.toList());
    List<List<Integer>> indices =
        errors.stream().map(FeedbackMessage::getIndices).collect(Collectors.toList());
    assertThat(errorMessages)
        .contains("race is a required column.", "ethnicity is a required column.");
    indices.forEach(i -> assertThat(i).isEqualTo(List.of(2)));
  }

  @Test
  void invalidValues_returnError() {
    // GIVEN
    InputStream input = loadCsv("patientBulkUpload/invalidValues.csv");
    // WHEN
    List<FeedbackMessage> errors = patientBulkUploadFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(13);
    List<String> errorMessages =
        errors.stream().map(FeedbackMessage::getMessage).collect(Collectors.toList());
    List<List<Integer>> indices =
        errors.stream().map(FeedbackMessage::getIndices).collect(Collectors.toList());
    assertThat(errorMessages)
        .contains(
            "11/3/8 is not an acceptable value for column date_of_birth",
            "african american is not an acceptable value for column race",
            "androgynous is not an acceptable value for column biological_sex",
            "latinx is not an acceptable value for column ethnicity",
            "group home is not an acceptable value for column resident_congregate_setting",
            "n/a is not an acceptable value for column employed_in_healthcare",
            "doctor is not an acceptable value for column role",
            "Alaska is not an acceptable value for column state",
            "1234 is not a valid value for column zip_code",
            "America is not an acceptable value for column country",
            "4108675309 is not a valid value for column phone_number",
            "cell is not an acceptable value for column phone_number_type",
            "janedoe.com is not a valid value for column email");
    indices.forEach(i -> assertThat(i).isEqualTo(List.of(2)));
  }

  @Test
  void invalidValuesAndMissingFieldsInMultipleRows_returnError() {
    // GIVEN
    InputStream input =
        loadCsv("patientBulkUpload/invalidValuesAndMissingFieldsInMultipleRows.csv");
    // WHEN
    List<FeedbackMessage> errors = patientBulkUploadFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(3);
    assertThat(errors.get(0).getScope()).isEqualTo("item");
    assertThat(errors.get(0).getMessage())
        .isEqualTo("african american is not an acceptable value for column race");
    assertThat(errors.get(0).getIndices()).isEqualTo(List.of(2, 3));
    assertThat(errors.get(1).getScope()).isEqualTo("item");
    assertThat(errors.get(1).getMessage()).isEqualTo("ethnicity is a required column.");
    assertThat(errors.get(1).getIndices()).isEqualTo(List.of(4, 5));
    assertThat(errors.get(2).getScope()).isEqualTo("item");
    assertThat(errors.get(2).getMessage()).isEqualTo("race is a required column.");
    assertThat(errors.get(2).getIndices()).isEqualTo(List.of(4, 5));
  }

  @Test
  void emptyRow_returnsError() {
    // GIVEN
    InputStream input = loadCsv("patientBulkUpload/emptyRow.csv");
    // WHEN
    List<FeedbackMessage> errors = patientBulkUploadFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(12);
    List<String> errorMessages =
        errors.stream().map(FeedbackMessage::getMessage).collect(Collectors.toList());
    List<List<Integer>> indices =
        errors.stream().map(FeedbackMessage::getIndices).collect(Collectors.toList());
    assertThat(errorMessages)
        .contains(
            "first_name is a required column.",
            "last_name is a required column.",
            "race is a required column.",
            "date_of_birth is a required column.",
            "biological_sex is a required column.",
            "ethnicity is a required column.",
            "street is a required column.",
            "state is a required column.",
            "zip_code is a required column.",
            "phone_number is a required column.",
            "employed_in_healthcare is a required column.",
            "resident_congregate_setting is a required column.");
    indices.forEach(i -> assertThat(i).isEqualTo(List.of(4)));
  }

  @ParameterizedTest
  @ValueSource(
      strings = {
        "patientBulkUpload/missingOptionalFields.csv",
        "patientBulkUpload/extraColumns.csv",
        "patientBulkUpload/valid.csv"
      })
  void file_isValid(String csvFile) {
    // GIVEN
    InputStream input = loadCsv(csvFile);
    // WHEN
    List<FeedbackMessage> errors = patientBulkUploadFileValidator.validate(input);
    // THEN
    assertThat(errors).isEmpty();
  }

  @Test
  void testResults_validFile() {
    // GIVEN
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid.csv");
    // WHEN
    List<FeedbackMessage> errors = testResultFileValidator.validate(input);
    // THEN
    assertThat(errors).isEmpty();
  }

  @Test
  void testResultsFile_invalidHeaders() {
    // GIVEN
    InputStream input = new ByteArrayInputStream("invalid\nyes".getBytes());
    // WHEN
    List<FeedbackMessage> errors = testResultFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(33);

    List<String> errorMessages =
        errors.stream().map(FeedbackMessage::getMessage).collect(Collectors.toList());
    List<List<Integer>> indices =
        errors.stream().map(FeedbackMessage::getIndices).collect(Collectors.toList());
    assertThat(errorMessages)
        .contains(
            "patient_last_name is a required column.",
            "patient_first_name is a required column.",
            "patient_street is a required column.",
            "patient_city is a required column.",
            "patient_state is a required column.",
            "patient_zip_code is a required column.",
            "patient_county is a required column.",
            "patient_phone_number is a required column.",
            "patient_dob is a required column.",
            "patient_gender is a required column.",
            "patient_race is a required column.",
            "patient_ethnicity is a required column.",
            "accession_number is a required column.",
            "equipment_model_name is a required column.",
            "test_performed_code is a required column.",
            "test_result is a required column.",
            "order_test_date is a required column.",
            "test_result_date is a required column.",
            "specimen_type is a required column.",
            "ordering_provider_id is a required column.",
            "ordering_provider_last_name is a required column.",
            "ordering_provider_first_name is a required column.",
            "ordering_provider_street is a required column.",
            "ordering_provider_city is a required column.",
            "ordering_provider_state is a required column.",
            "ordering_provider_zip_code is a required column.",
            "ordering_provider_phone_number is a required column.",
            "testing_lab_clia is a required column.",
            "testing_lab_name is a required column.",
            "testing_lab_street is a required column.",
            "testing_lab_city is a required column.",
            "testing_lab_state is a required column.",
            "testing_lab_zip_code is a required column.");
    indices.forEach(i -> assertThat(i).isEqualTo(List.of(2)));
  }

  @Test
  void testResultsFile_invalidValues() {
    // GIVEN
    InputStream input = loadCsv("testResultUpload/test-results-upload-invalid-values.csv");
    // WHEN
    List<FeedbackMessage> errors = testResultFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(34);

    List<String> errorMessages =
        errors.stream().map(FeedbackMessage::getMessage).collect(Collectors.toList());
    List<List<Integer>> indices =
        errors.stream().map(FeedbackMessage::getIndices).collect(Collectors.toList());
    assertThat(errorMessages)
        .contains(
            "x is not an acceptable value for column patient_state",
            "x is not an acceptable value for column ordering_provider_state",
            "x is not an acceptable value for column testing_lab_state",
            "x is not an acceptable value for column ordering_facility_state",
            "x is not a valid value for column patient_zip_code",
            "x is not a valid value for column ordering_provider_zip_code",
            "x is not a valid value for column testing_lab_zip_code",
            "x is not a valid value for column ordering_facility_zip_code",
            "x is not a valid value for column patient_phone_number",
            "x is not a valid value for column ordering_provider_phone_number",
            "x is not a valid value for column testing_lab_phone_number",
            "x is not a valid value for column ordering_facility_phone_number",
            "x is not a valid value for column patient_dob",
            "x is not a valid value for column illness_onset_date",
            "x is not a valid value for column order_test_date",
            "x is not a valid value for column specimen_collection_date",
            "x is not a valid value for column testing_lab_specimen_received_date",
            "x is not a valid value for column test_result_date",
            "x is not a valid value for column date_result_released",
            "x is not a valid value for column patient_email",
            "x is not a valid value for column testing_lab_clia",
            "x is not an acceptable value for column patient_race",
            "x is not an acceptable value for column patient_gender",
            "x is not an acceptable value for column patient_ethnicity",
            "x is not an acceptable value for column pregnant",
            "x is not an acceptable value for column employed_in_healthcare",
            "x is not an acceptable value for column symptomatic_for_disease",
            "x is not an acceptable value for column resident_congregate_setting",
            "x is not an acceptable value for column hospitalized",
            "x is not an acceptable value for column icu",
            "x is not an acceptable value for column residence_type",
            "x is not an acceptable value for column test_result",
            "x is not an acceptable value for column test_result_status",
            "x is not an acceptable value for column specimen_type");
    indices.forEach(i -> assertThat(i).isEqualTo(List.of(2)));
  }

  private InputStream loadCsv(String csvFile) {
    return FileValidatorTest.class.getClassLoader().getResourceAsStream(csvFile);
  }
}
