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
  Map<String, String> patientRow;
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
    patientRow = new HashMap<>();
    patientRow.put("first_name", "Robert");
    patientRow.put("last_name", "Hill");
    patientRow.put("middle_name", "Jeffrey");
    patientRow.put("suffix", "");
    patientRow.put("race", "White");
    patientRow.put("date_of_birth", "08/13/1985");
    patientRow.put("biological_sex", "Male");
    patientRow.put("ethnicity", "not hispanic or latino");
    patientRow.put("street", "1600 Pennsylvania Avenue");
    patientRow.put("street_2", "");
    patientRow.put("city", "Washington");
    patientRow.put("county", "");
    patientRow.put("state", "DC");
    patientRow.put("zip_code", "20500");
    patientRow.put("country", "USA");
    patientRow.put("phone_number", "12485551234");
    patientRow.put("phone_number_type", "mobile");
    patientRow.put("employed_in_healthcare", "N");
    patientRow.put("resident_congregate_setting", "N");
    patientRow.put("role", "Staff");
    patientRow.put("email", "BobbyHill@example.com");
  }

  @Test
  public void processRowSetsAllValues() {
    patientUploadRow.processRow(patientRow);

    assertThat(patientUploadRow.getFirstName().getValue()).isEqualTo(patientRow.get("first_name"));
    assertThat(patientUploadRow.getLastName().getValue()).isEqualTo(patientRow.get("last_name"));
    assertThat(patientUploadRow.getMiddleName().getValue())
        .isEqualTo(patientRow.get("middle_name"));
    assertThat(patientUploadRow.getSuffix().getValue()).isEqualTo(patientRow.get("suffix"));
    assertThat(patientUploadRow.getRace().getValue()).isEqualTo(patientRow.get("race"));
    assertThat(patientUploadRow.getDateOfBirth().getValue())
        .isEqualTo(patientRow.get("date_of_birth"));
    assertThat(patientUploadRow.getBiologicalSex().getValue())
        .isEqualTo(patientRow.get("biological_sex"));
    assertThat(patientUploadRow.getEthnicity().getValue()).isEqualTo(patientRow.get("ethnicity"));
    assertThat(patientUploadRow.getStreet().getValue()).isEqualTo(patientRow.get("street"));
    assertThat(patientUploadRow.getStreet2().getValue()).isEqualTo(patientRow.get("street_2"));
    assertThat(patientUploadRow.getCity().getValue()).isEqualTo(patientRow.get("city"));
    assertThat(patientUploadRow.getCounty().getValue()).isEqualTo(patientRow.get("county"));
    assertThat(patientUploadRow.getState().getValue()).isEqualTo(patientRow.get("state"));
    assertThat(patientUploadRow.getZipCode().getValue()).isEqualTo(patientRow.get("zip_code"));
    assertThat(patientUploadRow.getCountry().getValue()).isEqualTo(patientRow.get("country"));
    assertThat(patientUploadRow.getPhoneNumber().getValue())
        .isEqualTo(patientRow.get("phone_number"));
    assertThat(patientUploadRow.getPhoneNumberType().getValue())
        .isEqualTo(patientRow.get("phone_number_type"));
    assertThat(patientUploadRow.getEmployedInHealthcare().getValue())
        .isEqualTo(patientRow.get("employed_in_healthcare"));
    assertThat(patientUploadRow.getResidentCongregateSetting().getValue())
        .isEqualTo(patientRow.get("resident_congregate_setting"));
    assertThat(patientUploadRow.getRole().getValue()).isEqualTo(patientRow.get("role"));
    assertThat(patientUploadRow.getEmail().getValue()).isEqualTo(patientRow.get("email"));
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
    patientRow.put("date_of_birth", "0/00/0000");
    patientRow.put("race", "black");
    patientRow.put("biological_sex", "woman");
    patientRow.put("ethnicity", "not hispanic");
    patientRow.put("resident_congregate_setting", "nope");
    patientRow.put("employed_in_healthcare", "nope");
    patientRow.put("role", "Employee");
    patientRow.put("state", "District of Colombia");
    patientRow.put("zip_code", "205000");
    patientRow.put("country", "America");
    patientRow.put("phone_number", "1");
    patientRow.put("phone_number_type", "cell");
    patientRow.put("email", "email");
    patientUploadRow.processRow(patientRow);

    var actual = patientUploadRow.validateIndividualValues();

    var messages =
        actual.stream()
            .map(
                message ->
                    message.getMessage().substring(message.getMessage().lastIndexOf(" ") + 1))
            .collect(Collectors.toSet());
    System.out.println(messages);
    assertThat(actual).hasSize(individualFields.size());
    individualFields.forEach(fieldName -> assertThat(messages).contains(fieldName));
  }
}
