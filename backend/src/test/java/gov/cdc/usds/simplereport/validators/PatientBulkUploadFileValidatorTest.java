package gov.cdc.usds.simplereport.validators;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

class PatientBulkUploadFileValidatorTest {

  PatientBulkUploadFileValidator patientBulkUploadFileValidator =
      new PatientBulkUploadFileValidator();

  @Test
  void validFile() {
    // GIVEN
    InputStream input = loadCsv("patientBulkUpload/valid.csv");
    // WHEN
    List<FeedbackMessage> errors = patientBulkUploadFileValidator.validate(input);
    // THEN
    assertThat(errors).isEmpty();
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
  }

  @Test
  void missingOptionalFields_isValid() {
    // GIVEN
    InputStream input = loadCsv("patientBulkUpload/missingOptionalFields.csv");
    // WHEN
    List<FeedbackMessage> errors = patientBulkUploadFileValidator.validate(input);
    // THEN
    assertThat(errors).isEmpty();
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
    assertThat(errorMessages)
        .contains("race is a required column.", "ethnicity is a required column.");
  }

  @Test
  void extraColumns_isValid() {
    // GIVEN
    InputStream input = loadCsv("patientBulkUpload/extraColumns.csv");
    // WHEN
    List<FeedbackMessage> errors = patientBulkUploadFileValidator.validate(input);
    // THEN
    assertThat(errors).isEmpty();
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
    assertThat(errorMessages)
        .contains(
            "11/3/80 is not a valid value for column date_of_birth",
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
  }

  @Test
  void emptyFile_returnsError() {
    // GIVEN
    InputStream input = loadCsv("patientBulkUpload/empty.csv");
    // WHEN
    Exception exception =
        assertThrows(
            IllegalArgumentException.class,
            () -> {
              patientBulkUploadFileValidator.validate(input);
            });
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
  }

  private InputStream loadCsv(String csvFile) {
    return PatientBulkUploadFileValidatorTest.class.getClassLoader().getResourceAsStream(csvFile);
  }
}
