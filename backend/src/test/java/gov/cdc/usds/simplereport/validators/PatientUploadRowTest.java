package gov.cdc.usds.simplereport.validators;

import static org.assertj.core.api.Assertions.assertThat;

import gov.cdc.usds.simplereport.api.model.filerow.PatientUploadRow;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.test_util.TestErrorMessageUtil;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class PatientUploadRowTest {
  Map<String, String> validRowMap;
  final List<String> requiredFields =
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

  final List<String> individualFields =
      List.of(
          "date_of_birth",
          "race",
          "biological_sex",
          "ethnicity",
          "resident_congregate_setting",
          "employed_in_healthcare",
          "role",
          "state",
          "zip_code",
          "country",
          "phone_number",
          "phone_number_type",
          "email");

  @BeforeEach
  public void init() {
    validRowMap = new HashMap<>();
    validRowMap.put("last_name", "Doe");
    validRowMap.put("first_name", "Jane");
    validRowMap.put("middle_name", "Amanda");
    validRowMap.put("suffix", "");
    validRowMap.put("race", "black or african american");
    validRowMap.put("date_of_birth", "11/3/80");
    validRowMap.put("biological_sex", "Female");
    validRowMap.put("ethnicity", "not hispanic or latino");
    validRowMap.put("street", "1234 Main Street");
    validRowMap.put("street_2", "Apt 2");
    validRowMap.put("city", "Anchorage");
    validRowMap.put("county", "");
    validRowMap.put("state", "AK");
    validRowMap.put("zip_code", "99501");
    validRowMap.put("phone_number", "410-867-5309");
    validRowMap.put("phone_number_type", "mobile");
    validRowMap.put("employed_in_healthcare", "No");
    validRowMap.put("resident_congregate_setting", "No");
    validRowMap.put("role", "Staff");
    validRowMap.put("email", "jane@testingorg.com");
  }

  @Test
  void processRowSetsAllValues() {
    var patientUploadRow = new PatientUploadRow(validRowMap);

    assertThat(patientUploadRow.getFirstName().getValue()).isEqualTo(validRowMap.get("first_name"));
    assertThat(patientUploadRow.getLastName().getValue()).isEqualTo(validRowMap.get("last_name"));
    assertThat(patientUploadRow.getMiddleName().getValue())
        .isEqualTo(validRowMap.get("middle_name"));
    assertThat(patientUploadRow.getSuffix().getValue()).isEqualTo(validRowMap.get("suffix"));
    assertThat(patientUploadRow.getRace().getValue()).isEqualTo(validRowMap.get("race"));
    assertThat(patientUploadRow.getDateOfBirth().getValue())
        .isEqualTo(validRowMap.get("date_of_birth"));
    assertThat(patientUploadRow.getBiologicalSex().getValue())
        .isEqualTo(validRowMap.get("biological_sex"));
    assertThat(patientUploadRow.getEthnicity().getValue()).isEqualTo(validRowMap.get("ethnicity"));
    assertThat(patientUploadRow.getStreet().getValue()).isEqualTo(validRowMap.get("street"));
    assertThat(patientUploadRow.getStreet2().getValue()).isEqualTo(validRowMap.get("street_2"));
    assertThat(patientUploadRow.getCity().getValue()).isEqualTo(validRowMap.get("city"));
    assertThat(patientUploadRow.getCounty().getValue()).isEqualTo(validRowMap.get("county"));
    assertThat(patientUploadRow.getState().getValue()).isEqualTo(validRowMap.get("state"));
    assertThat(patientUploadRow.getZipCode().getValue()).isEqualTo(validRowMap.get("zip_code"));
    assertThat(patientUploadRow.getCountry().getValue()).isEqualTo(validRowMap.get("country"));
    assertThat(patientUploadRow.getPhoneNumber().getValue())
        .isEqualTo(validRowMap.get("phone_number"));
    assertThat(patientUploadRow.getPhoneNumberType().getValue())
        .isEqualTo(validRowMap.get("phone_number_type"));
    assertThat(patientUploadRow.getEmployedInHealthcare().getValue())
        .isEqualTo(validRowMap.get("employed_in_healthcare"));
    assertThat(patientUploadRow.getResidentCongregateSetting().getValue())
        .isEqualTo(validRowMap.get("resident_congregate_setting"));
    assertThat(patientUploadRow.getRole().getValue()).isEqualTo(validRowMap.get("role"));
    assertThat(patientUploadRow.getEmail().getValue()).isEqualTo(validRowMap.get("email"));
  }

  @Test
  void validateRequiredFieldsReturnsErrorsForAllEmptyRequiredFields() {
    var patientUploadRow = new PatientUploadRow(new HashMap<>());

    var actual = patientUploadRow.validateRequiredFields();

    var messages = actual.stream().map(FeedbackMessage::getMessage).collect(Collectors.toSet());
    assertThat(actual).hasSize(requiredFields.size());
    requiredFields.forEach(
        fieldName ->
            assertThat(messages).contains("File is missing data in the " + fieldName + " column."));
  }

  @Test
  void validateIndividualFields() {
    var invalidIndividualValues = validRowMap;
    invalidIndividualValues.put("date_of_birth", "0/00/0000");
    invalidIndividualValues.put("race", "black");
    invalidIndividualValues.put("biological_sex", "woman");
    invalidIndividualValues.put("ethnicity", "not hispanic");
    invalidIndividualValues.put("resident_congregate_setting", "nope");
    invalidIndividualValues.put("employed_in_healthcare", "nope");
    invalidIndividualValues.put("role", "Employee");
    invalidIndividualValues.put("state", "District of Colombia");
    invalidIndividualValues.put("zip_code", "205000");
    invalidIndividualValues.put("country", "America");
    invalidIndividualValues.put("phone_number", "1");
    invalidIndividualValues.put("phone_number_type", "cell");
    invalidIndividualValues.put("email", "email");

    var patientUploadRow = new PatientUploadRow(invalidIndividualValues);

    var actual = patientUploadRow.validateIndividualValues();

    var messages =
        actual.stream()
            .map(
                message ->
                    TestErrorMessageUtil.getColumnNameFromInvalidErrorMessage(message.getMessage()))
            .collect(Collectors.toSet());
    assertThat(actual).hasSize(individualFields.size());
    individualFields.forEach(fieldName -> assertThat(messages).contains(fieldName));
  }
}
