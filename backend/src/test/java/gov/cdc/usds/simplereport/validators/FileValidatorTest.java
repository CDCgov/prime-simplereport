package gov.cdc.usds.simplereport.validators;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.filerow.PatientUploadRow;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.service.ResultsUploaderCachingService;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
class FileValidatorTest {

  List<String> patientBulkUploadRequiredFields =
      List.of(
          "first_name",
          "last_name",
          "race",
          "date_of_birth",
          "biological_sex",
          "ethnicity",
          "street",
          "state",
          "zip_code",
          "phone_number",
          "phone_number_type",
          "employed_in_healthcare",
          "resident_congregate_setting");
  List<String> testResultsUploadRequiredFields =
      List.of(
          "patient_last_name",
          "patient_first_name",
          "patient_street",
          "patient_city",
          "patient_state",
          "patient_zip_code",
          "patient_county",
          "patient_phone_number",
          "patient_dob",
          "patient_race",
          "patient_ethnicity",
          "accession_number",
          "equipment_model_name",
          "test_performed_code",
          "test_result",
          "order_test_date",
          "test_result_date",
          "specimen_type",
          "ordering_provider_id",
          "ordering_provider_last_name",
          "ordering_provider_first_name",
          "ordering_provider_street",
          "ordering_provider_city",
          "ordering_provider_state",
          "ordering_provider_zip_code",
          "ordering_provider_phone_number",
          "testing_lab_clia",
          "testing_lab_name",
          "testing_lab_street",
          "testing_lab_city",
          "testing_lab_state",
          "testing_lab_zip_code");
  FileValidator<PatientUploadRow> patientBulkUploadFileValidator =
      new FileValidator<>(PatientUploadRow::new);
  FileValidator<TestResultRow> testResultFileValidator;
  @Mock FeatureFlagsConfig featureFlagsConfig;

  @Mock ResultsUploaderCachingService resultsUploaderCachingService;

  @BeforeEach
  public void setup() {
    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(
            Map.of(
                // key/val of device in COVID CSV
                "id now|94534-5", TestDataBuilder.createDeviceType(),
                // key/val of device Flu CSV
                "model3|5229-0", TestDataBuilder.createDeviceTypeForMultiplex(),
                // key/val of device in RSV CSV
                "model3|14129-1", TestDataBuilder.createDeviceTypeForRSV()));

    when(resultsUploaderCachingService.getSpecimenTypeNameToSNOMEDMap())
        .thenReturn(Map.of("nasal swab", "000111222"));
    testResultFileValidator =
        new FileValidator<>(
            row -> new TestResultRow(row, resultsUploaderCachingService, featureFlagsConfig));
  }

  @Test
  void patientBulkUpload_emptyFile_returnsError() {
    // GIVEN
    InputStream input = loadCsv("patientBulkUpload/empty.csv");
    // WHEN
    List<FeedbackMessage> errors = patientBulkUploadFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(1);
    List<String> errorMessages = errors.stream().map(FeedbackMessage::getMessage).toList();
    assertThat(errorMessages).contains("File is missing headers and other required data");
    assertThat(errors.get(0).getIndices()).isNull();
  }

  @Test
  void patientBulkUpload_malformedCsv_returnsError() {
    // GIVEN
    InputStream input = loadCsv("patientBulkUpload/malformed.csv");
    // WHEN
    List<FeedbackMessage> errors = patientBulkUploadFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(1);
    List<String> errorMessages = errors.stream().map(FeedbackMessage::getMessage).toList();
    assertThat(errorMessages)
        .contains(
            "File has the incorrect number of columns or empty rows. Please make sure all columns match the data template, and delete any empty rows.");
    assertThat(errors.get(0).getIndices()).isEqualTo(List.of(2, 4, 5));
  }

  @Test
  void patientBulkUpload_missingHeaders_returnsErrors() {
    // GIVEN
    InputStream input = loadCsv("patientBulkUpload/missingHeaders.csv");
    // WHEN
    List<FeedbackMessage> errors = patientBulkUploadFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(26);
    List<String> errorMessages = errors.stream().map(FeedbackMessage::getMessage).toList();
    errors.forEach(
        error -> {
          String errorMessage = error.getMessage();
          if (errorMessage.contains("File is missing data in the")) {
            assertThat(error.getIndices()).isEqualTo(List.of(2));
          } else if (errorMessage.contains("The header for column")) {
            assertThat(error.getIndices()).isNull();
          }
        });
    patientBulkUploadRequiredFields.forEach(
        fieldName ->
            assertThat(errorMessages)
                .contains("File is missing data in the " + fieldName + " column."));
    patientBulkUploadRequiredFields.forEach(
        fieldName ->
            assertThat(errorMessages)
                .contains("The header for column " + fieldName + " is missing or invalid."));
  }

  @Test
  void missingRequiredFields_returnsErrors() {
    // GIVEN
    InputStream input = loadCsv("patientBulkUpload/missingRequiredFields.csv");
    // WHEN
    List<FeedbackMessage> errors = patientBulkUploadFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(2);
    List<String> errorMessages = errors.stream().map(FeedbackMessage::getMessage).toList();
    List<List<Integer>> indices = errors.stream().map(FeedbackMessage::getIndices).toList();
    assertThat(errorMessages)
        .contains(
            "File is missing data in the race column.",
            "File is missing data in the ethnicity column.");
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
    List<String> errorMessages = errors.stream().map(FeedbackMessage::getMessage).toList();
    List<List<Integer>> indices = errors.stream().map(FeedbackMessage::getIndices).toList();
    assertThat(errorMessages)
        .contains(
            "11/3/8 is not an acceptable value for the date_of_birth column.",
            "african american is not an acceptable value for the race column.",
            "androgynous is not an acceptable value for the biological_sex column.",
            "latinx is not an acceptable value for the ethnicity column.",
            "group home is not an acceptable value for the resident_congregate_setting column.",
            "n/a is not an acceptable value for the employed_in_healthcare column.",
            "doctor is not an acceptable value for the role column.",
            "Alaska is not an acceptable value for the state column.",
            "1234 is not an acceptable value for the zip_code column.",
            "America is not an acceptable value for the country column.",
            "4108675309 is not an acceptable value for the phone_number column.",
            "cell is not an acceptable value for the phone_number_type column.",
            "janedoe.com is not an acceptable value for the email column.");
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
        .isEqualTo("african american is not an acceptable value for the race column.");
    assertThat(errors.get(0).getIndices()).isEqualTo(List.of(2, 3));
    assertThat(errors.get(1).getScope()).isEqualTo("item");
    assertThat(errors.get(1).getMessage()).isEqualTo("File is missing data in the race column.");
    assertThat(errors.get(1).getIndices()).isEqualTo(List.of(4, 5));
    assertThat(errors.get(2).getScope()).isEqualTo("item");
    assertThat(errors.get(2).getMessage())
        .isEqualTo("File is missing data in the ethnicity column.");
    assertThat(errors.get(2).getIndices()).isEqualTo(List.of(4, 5));
  }

  @Test
  void patientBulkUpload_emptyRow_returnsError() {
    // GIVEN
    InputStream input = loadCsv("patientBulkUpload/emptyRow.csv");
    // WHEN
    List<FeedbackMessage> errors = patientBulkUploadFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(13);
    List<String> errorMessages = errors.stream().map(FeedbackMessage::getMessage).toList();
    List<List<Integer>> indices = errors.stream().map(FeedbackMessage::getIndices).toList();
    patientBulkUploadRequiredFields.forEach(
        fieldName ->
            assertThat(errorMessages)
                .contains("File is missing data in the " + fieldName + " column."));
    assertThat(errorMessages).hasSameSizeAs(patientBulkUploadRequiredFields);
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
  void testResults_validFile_fluOnly() {
    // GIVEN
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-flu-only.csv");
    // WHEN
    List<FeedbackMessage> errors = testResultFileValidator.validate(input);
    // THEN
    assertThat(errors).isEmpty();
  }

  @Test
  void testResults_validFile_hivOnlyWhenHivFeatureFlagIsTrue() {
    when(featureFlagsConfig.isHivEnabled()).thenReturn(true);
    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        // key/val of device in HIV CS
        .thenReturn(Map.of("modelhiv|16249-0", TestDataBuilder.createDeviceTypeForHIV()));
    // GIVEN
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-hiv-only.csv");
    // WHEN
    List<FeedbackMessage> errors = testResultFileValidator.validate(input);
    // THEN
    assertThat(errors).isEmpty();
  }

  @Test
  void testResults_validFile_gonorrheaOnlyWhenGonorrheaFeatureFlagIsFalse() {

    when(featureFlagsConfig.isGonorrheaEnabled()).thenReturn(false);

    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(
            Map.of("modelgonorrhea|12345-0", TestDataBuilder.createDeviceTypeForGonorrhea()));

    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-gonorrhea-only.csv");

    List<FeedbackMessage> errors = testResultFileValidator.validate(input);

    assertThat(errors).isNotEmpty();
    assertThat(errors.get(0).getMessage())
        .contains(
            "equipment_model_name and test_performed_code combination map to a non-active disease in this jurisdiction");
  }

  @Test
  void testResults_validFile_chlamydiaOnlyWhenChlamydiaFeatureFlagIsFalse() {

    when(featureFlagsConfig.isChlamydiaEnabled()).thenReturn(false);

    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(
            Map.of("modelchlamydia|24334-5", TestDataBuilder.createDeviceTypeForChlamydia()));

    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-chlamydia-only.csv");

    List<FeedbackMessage> errors = testResultFileValidator.validate(input);

    assertThat(errors).isNotEmpty();
    assertThat(errors.get(0).getMessage())
        .contains(
            "equipment_model_name and test_performed_code combination map to a non-active disease in this jurisdiction");
  }

  @Test
  void testResults_validFile_OnlySyphilisFeatureFlagIsFalse() {

    when(featureFlagsConfig.isSyphilisEnabled()).thenReturn(false);

    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(Map.of("modelsyphilis|2343-1", TestDataBuilder.createDeviceTypeForSyphilis()));

    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-syph-only.csv");

    List<FeedbackMessage> errors = testResultFileValidator.validate(input);

    assertThat(errors).isNotEmpty();
    assertThat(errors.get(0).getMessage())
        .contains(
            "equipment_model_name and test_performed_code combination map to a non-active disease in this jurisdiction");
  }

  @Test
  void testResults_validFile_OnlyHepatitisCFeatureFlagIsFalse() {

    when(featureFlagsConfig.isHepatitisCEnabled()).thenReturn(false);

    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(
            Map.of("modelhepatitisc|2424-9", TestDataBuilder.createDeviceTypeForHepatitisC()));

    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-hepatitisC-only.csv");

    List<FeedbackMessage> errors = testResultFileValidator.validate(input);

    assertThat(errors).isNotEmpty();
    assertThat(errors.get(0).getMessage())
        .contains(
            "equipment_model_name and test_performed_code combination map to a non-active disease in this jurisdiction");
  }

  @Test
  void testResults_validFile_rsvOnly() {
    // GIVEN
    InputStream input = loadCsv("testResultUpload/test-results-upload-valid-rsv-only.csv");
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
    List<String> errorMessages = errors.stream().map(FeedbackMessage::getMessage).toList();
    assertThat(errors).hasSize(65);
    errors.forEach(
        error -> {
          String errorMessage = error.getMessage();
          if (errorMessage.contains("File is missing data in the")) {
            assertThat(error.getIndices()).isEqualTo(List.of(2));
          } else if (errorMessage.contains("The header for column")) {
            assertThat(error.getIndices()).isNull();
          }
        });
    testResultsUploadRequiredFields.forEach(
        fieldName ->
            assertThat(errorMessages)
                .contains("File is missing data in the " + fieldName + " column."));
    testResultsUploadRequiredFields.forEach(
        fieldName ->
            assertThat(errorMessages)
                .contains("The header for column " + fieldName + " is missing or invalid."));
  }

  @Test
  void testResultsFile_invalidValues() {
    // GIVEN
    InputStream input = loadCsv("testResultUpload/test-results-upload-invalid-values.csv");
    // WHEN
    List<FeedbackMessage> errors = testResultFileValidator.validate(input);
    // THEN
    assertThat(errors).hasSize(35);

    List<String> errorMessages = errors.stream().map(FeedbackMessage::getMessage).toList();
    List<List<Integer>> indices = errors.stream().map(FeedbackMessage::getIndices).toList();
    assertThat(errorMessages)
        .contains(
            "x is not an acceptable value for the patient_state column.",
            "x is not an acceptable value for the ordering_provider_state column.",
            "x is not an acceptable value for the testing_lab_state column.",
            "x is not an acceptable value for the ordering_facility_state column.",
            "x is not an acceptable value for the patient_zip_code column.",
            "x is not an acceptable value for the ordering_provider_zip_code column.",
            "x is not an acceptable value for the testing_lab_zip_code column.",
            "x is not an acceptable value for the ordering_facility_zip_code column.",
            "x is not an acceptable value for the patient_phone_number column.",
            "x is not an acceptable value for the ordering_provider_phone_number column.",
            "x is not an acceptable value for the testing_lab_phone_number column.",
            "x is not an acceptable value for the ordering_facility_phone_number column.",
            "x is not an acceptable value for the patient_dob column.",
            "x is not an acceptable value for the illness_onset_date column.",
            "x is not an acceptable value for the order_test_date column.",
            "x is not an acceptable value for the specimen_collection_date column.",
            "x is not an acceptable value for the testing_lab_specimen_received_date column.",
            "x is not an acceptable value for the test_result_date column.",
            "x is not an acceptable value for the date_result_released column.",
            "x is not an acceptable value for the patient_email column.",
            "x is not an acceptable value for the testing_lab_clia column.",
            "x is not an acceptable value for the patient_race column.",
            "x is not an acceptable value for the patient_gender column.",
            "x is not an acceptable value for the patient_ethnicity column.",
            "x is not an acceptable value for the pregnant column.",
            "x is not an acceptable value for the employed_in_healthcare column.",
            "x is not an acceptable value for the symptomatic_for_disease column.",
            "x is not an acceptable value for the resident_congregate_setting column.",
            "x is not an acceptable value for the hospitalized column.",
            "x is not an acceptable value for the icu column.",
            "x is not an acceptable value for the residence_type column.",
            "x is not an acceptable value for the test_result column.",
            "x is not an acceptable value for the test_result_status column.",
            "1 is not an acceptable value for the specimen_type column.",
            "Invalid equipment_model_name and test_performed_code combination");
    indices.forEach(i -> assertThat(i).isEqualTo(List.of(2)));
  }

  void testResults_invalidFile(String fileName, String errorMessage) {
    // GIVEN
    InputStream input = loadCsv(fileName);

    // WHEN
    List<FeedbackMessage> errors = testResultFileValidator.validate(input);

    /// THEN
    assertThat(errors).hasSize(1);

    List<String> errorMessages = errors.stream().map(FeedbackMessage::getMessage).toList();

    assertThat(errorMessages).contains(errorMessage);
  }

  @Test
  void testResultsFile_unavailableDisease_returnsUnavailableDiseaseError() {
    when(featureFlagsConfig.isHivEnabled()).thenReturn(false);
    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        // key/val of device in HIV CSV
        .thenReturn(Map.of("modelhiv|16249-0", TestDataBuilder.createDeviceTypeForHIV()));

    testResults_invalidFile(
        "testResultUpload/test-results-upload-valid-hiv-only.csv",
        "equipment_model_name and test_performed_code combination map to a non-active disease in this jurisdiction");
  }

  @Test
  void testResults_invalidSpecimenTypeName() {
    testResults_invalidFile(
        "testResultUpload/test-results-upload-invalid-specimen-name.csv",
        "fake specimen name is not an acceptable value for the specimen_type column.");
  }

  @Test
  void testResults_invalid_deviceModel_testPerformedCode() {
    testResults_invalidFile(
        "testResultUpload/test-results-upload-invalid-deviceModel_testPerformedCode.csv",
        "Invalid equipment_model_name and test_performed_code combination");
  }

  private InputStream loadCsv(String csvFile) {
    return FileValidatorTest.class.getClassLoader().getResourceAsStream(csvFile);
  }
}
