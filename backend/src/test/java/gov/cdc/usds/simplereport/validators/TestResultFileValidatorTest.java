package gov.cdc.usds.simplereport.validators;

import static org.assertj.core.api.Assertions.assertThat;

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
    assertThat(errors).hasSize(42);

    List<String> errorMessages =
        errors.stream().map(FeedbackMessage::getMessage).collect(Collectors.toList());
    assertThat(errorMessages)
        .contains(
            "patient_last_name is required.",
            "patient_first_name is required.",
            "patient_street is required.",
            "patient_city is required.",
            "patient_state is required.",
            "patient_zip_code is required.",
            "patient_county is required.",
            "patient_phone_number is required.",
            "patient_dob is required.",
            "patient_gender is required.",
            "patient_race is required.",
            "patient_ethnicity is required.",
            "accession_number is required.",
            "equipment_model_name is required.",
            "test_performed_code is required.",
            "test_result is required.",
            "order_test_date is required.",
            "specimen_collection_date is required.",
            "testing_lab_specimen_received_date is required.",
            "test_result_date is required.",
            "date_result_released is required.",
            "specimen_type is required.",
            "ordering_provider_id is required.",
            "ordering_provider_last_name is required.",
            "ordering_provider_first_name is required.",
            "ordering_provider_street is required.",
            "ordering_provider_city is required.",
            "ordering_provider_state is required.",
            "ordering_provider_zip_code is required.",
            "ordering_provider_phone_number is required.",
            "testing_lab_clia is required.",
            "testing_lab_name is required.",
            "testing_lab_street is required.",
            "testing_lab_city is required.",
            "testing_lab_state is required.",
            "testing_lab_zip_code is required.",
            "ordering_facility_name is required.",
            "ordering_facility_street is required.",
            "ordering_facility_city is required.",
            "ordering_facility_state is required.",
            "ordering_facility_zip_code is required.",
            "ordering_facility_phone_number is required.");
  }

  @Test
  void testResultsFile_InvalidValues() {
    // GIVEN
    InputStream input = loadCsv("test-results-upload-invalid-values.csv");
    // WHEN
    List<FeedbackMessage> errors = testResultFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(33);

    List<String> errorMessages =
        errors.stream().map(FeedbackMessage::getMessage).collect(Collectors.toList());
    assertThat(errorMessages)
        .contains(
            "x is not a recognized state",
            "x is not a recognized state",
            "x is not a recognized state",
            "x is not a recognized state",
            "x is not a recognized zipcode",
            "x is not a recognized zipcode",
            "x is not a recognized zipcode",
            "x is not a recognized zipcode",
            "x is not a recognized phone number",
            "x is not a recognized phone number",
            "x is not a recognized phone number",
            "x is not a recognized phone number",
            "x is not a recognized date",
            "x is not a recognized date",
            "x is not a recognized date or datetime",
            "x is not a recognized date or datetime",
            "x is not a recognized date or datetime",
            "x is not a recognized date or datetime",
            "x is not a recognized date or datetime",
            "x is not a recognized email",
            "x is not a recognized race",
            "x is not a recognized gender",
            "x is not a recognized race",
            "x is not a recognized value",
            "x is not a recognized value",
            "x is not a recognized value",
            "x is not a recognized value",
            "x is not a recognized value",
            "x is not a recognized value",
            "x is not a recognized residence type",
            "x is not a recognized test result",
            "x is not a recognized test result status",
            "x is not a recognized specimen type");
  }

  private InputStream loadCsv(String csvFile) {
    return TestResultFileValidatorTest.class.getClassLoader().getResourceAsStream(csvFile);
  }
}
