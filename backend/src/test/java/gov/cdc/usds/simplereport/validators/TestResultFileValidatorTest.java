package gov.cdc.usds.simplereport.validators;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

class TestResultFileValidatorTest {

  TestResultFileValidator testResultFileValidator = new TestResultFileValidator();

  @Test
  void testValidFile() {
    // GIVEN
    InputStream input = loadCsv("test-results-upload-valid.csv");
    // WHEN
    List<FeedbackMessage> errors = testResultFileValidator.validate(input);
    // THEN
    assertThat(errors).isEmpty();
  }

  @Test
  void testResultsFile_InvalidHeaders() {
    // GIVEN
    InputStream input = new ByteArrayInputStream("invalid\nyes".getBytes());
    // WHEN
    List<FeedbackMessage> errors = testResultFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(33);

    List<String> errorMessages =
        errors.stream().map(FeedbackMessage::getMessage).collect(Collectors.toList());
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
  }

  @Test
  void testResultsFile_InvalidValues() {
    // GIVEN
    InputStream input = loadCsv("test-results-upload-invalid-values.csv");
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
    indices.forEach(i -> assertThat(i).isEqualTo(List.of(1)));
  }

  @Test
  void testResultsFile_InvalidFormat1() {
    // GIVEN
    InputStream input = loadCsv("test-results-upload-invalid-format1.csv");
    // WHEN
    List<FeedbackMessage> errors = testResultFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(1);

    List<String> errorMessages =
        errors.stream().map(FeedbackMessage::getMessage).collect(Collectors.toList());
    assertThat(errorMessages)
        .contains(
            "File has the incorrect number of columns or empty rows. Please make sure all columns match the data template, and delete any empty rows.");

    assertEquals(3, errors.get(0).getIndices().get(0));
  }

  @Test
  void testResultsFile_InvalidFormat2() {
    // GIVEN
    InputStream input = loadCsv("test-results-upload-invalid-format2.csv");
    // WHEN
    List<FeedbackMessage> errors = testResultFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(1);

    List<String> errorMessages =
        errors.stream().map(FeedbackMessage::getMessage).collect(Collectors.toList());
    assertThat(errorMessages)
        .contains(
            "File has the incorrect number of columns or empty rows. Please make sure all columns match the data template, and delete any empty rows.");

    assertEquals(2, errors.get(0).getIndices().get(0));
  }

  private InputStream loadCsv(String csvFile) {
    return TestResultFileValidatorTest.class.getClassLoader().getResourceAsStream(csvFile);
  }
}
