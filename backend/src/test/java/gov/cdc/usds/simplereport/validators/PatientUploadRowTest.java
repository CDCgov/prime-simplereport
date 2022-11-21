package gov.cdc.usds.simplereport.validators;

import static org.assertj.core.api.Assertions.assertThat;

import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class PatientUploadRowTest {
  PatientUploadRow patientUploadRow;
  Map<String, String> rowMap;
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
    patientUploadRow = new PatientUploadRow();
    rowMap = new HashMap<>();
    rowMap.put("last_name", "Doe");
    rowMap.put("first_name", "Jane");
    rowMap.put("middle_name", "Amanda");
    rowMap.put("suffix", "");
    rowMap.put("race", "black or african american");
    rowMap.put("date_of_birth", "11/3/80");
    rowMap.put("biological_sex", "Female");
    rowMap.put("ethnicity", "not hispanic or latino");
    rowMap.put("street", "1234 Main Street");
    rowMap.put("street_2", "Apt 2");
    rowMap.put("city", "Anchorage");
    rowMap.put("county", "");
    rowMap.put("state", "AK");
    rowMap.put("zip_code", "99501");
    rowMap.put("phone_number", "410-867-5309");
    rowMap.put("phone_number_type", "mobile");
    rowMap.put("employed_in_healthcare", "No");
    rowMap.put("resident_congregate_setting", "No");
    rowMap.put("role", "Staff");
    rowMap.put("email", "jane@testingorg.com");
  }

  @Test
  public void processRowSetsAllValues() {
    patientUploadRow.processRow(rowMap);

    assertThat(patientUploadRow.getFirstName().getValue()).isEqualTo(rowMap.get("first_name"));
    assertThat(patientUploadRow.getLastName().getValue()).isEqualTo(rowMap.get("last_name"));
    assertThat(patientUploadRow.getMiddleName().getValue()).isEqualTo(rowMap.get("middle_name"));
    assertThat(patientUploadRow.getSuffix().getValue()).isEqualTo(rowMap.get("suffix"));
    assertThat(patientUploadRow.getRace().getValue()).isEqualTo(rowMap.get("race"));
    assertThat(patientUploadRow.getDateOfBirth().getValue()).isEqualTo(rowMap.get("date_of_birth"));
    assertThat(patientUploadRow.getBiologicalSex().getValue())
        .isEqualTo(rowMap.get("biological_sex"));
    assertThat(patientUploadRow.getEthnicity().getValue()).isEqualTo(rowMap.get("ethnicity"));
    assertThat(patientUploadRow.getStreet().getValue()).isEqualTo(rowMap.get("street"));
    assertThat(patientUploadRow.getStreet2().getValue()).isEqualTo(rowMap.get("street_2"));
    assertThat(patientUploadRow.getCity().getValue()).isEqualTo(rowMap.get("city"));
    assertThat(patientUploadRow.getCounty().getValue()).isEqualTo(rowMap.get("county"));
    assertThat(patientUploadRow.getState().getValue()).isEqualTo(rowMap.get("state"));
    assertThat(patientUploadRow.getZipCode().getValue()).isEqualTo(rowMap.get("zip_code"));
    assertThat(patientUploadRow.getCountry().getValue()).isEqualTo(rowMap.get("country"));
    assertThat(patientUploadRow.getPhoneNumber().getValue()).isEqualTo(rowMap.get("phone_number"));
    assertThat(patientUploadRow.getPhoneNumberType().getValue())
        .isEqualTo(rowMap.get("phone_number_type"));
    assertThat(patientUploadRow.getEmployedInHealthcare().getValue())
        .isEqualTo(rowMap.get("employed_in_healthcare"));
    assertThat(patientUploadRow.getResidentCongregateSetting().getValue())
        .isEqualTo(rowMap.get("resident_congregate_setting"));
    assertThat(patientUploadRow.getRole().getValue()).isEqualTo(rowMap.get("role"));
    assertThat(patientUploadRow.getEmail().getValue()).isEqualTo(rowMap.get("email"));
  }

  @Test
  public void validateHeadersReturnsErrorsForAllEmptyRequiredFields() {
    patientUploadRow.processRow(new HashMap<>());

    var actual = patientUploadRow.validateHeaders();

    var messages = actual.stream().map(FeedbackMessage::getMessage).collect(Collectors.toSet());
    assertThat(actual).hasSize(requiredFields.size());
    requiredFields.forEach(
        fieldName -> assertThat(messages).contains(fieldName + " is a required column."));
  }

  @Test
  public void validateIndividualFields() {
    rowMap.put("date_of_birth", "0/00/0000");
    rowMap.put("race", "black");
    rowMap.put("biological_sex", "woman");
    rowMap.put("ethnicity", "not hispanic");
    rowMap.put("resident_congregate_setting", "nope");
    rowMap.put("employed_in_healthcare", "nope");
    rowMap.put("role", "Employee");
    rowMap.put("state", "District of Colombia");
    rowMap.put("zip_code", "205000");
    rowMap.put("country", "America");
    rowMap.put("phone_number", "1");
    rowMap.put("phone_number_type", "cell");
    rowMap.put("email", "email");
    patientUploadRow.processRow(rowMap);

    var actual = patientUploadRow.validateIndividualValues();

    var messages =
        actual.stream()
            .map(
                message ->
                    message.getMessage().substring(message.getMessage().lastIndexOf(" ") + 1))
            .collect(Collectors.toSet());
    assertThat(actual).hasSize(individualFields.size());
    individualFields.forEach(fieldName -> assertThat(messages).contains(fieldName));
  }
}
