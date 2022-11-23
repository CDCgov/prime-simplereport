package gov.cdc.usds.simplereport.validators;

import static org.assertj.core.api.Assertions.assertThat;

import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TestResultRowTest {
  Map<String, String> validRowMap;
  final List<String> requiredFields =
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
          "patient_gender",
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
  final List<String> individualFields =
      List.of(
          "patient_state",
          "ordering_provider_state",
          "testing_lab_state",
          "ordering_facility_state",
          "patient_zip_code",
          "ordering_provider_zip_code",
          "testing_lab_zip_code",
          "ordering_facility_zip_code",
          "patient_phone_number",
          "ordering_provider_phone_number",
          "testing_lab_phone_number",
          "ordering_facility_phone_number",
          "patient_dob",
          "illness_onset_date",
          "order_test_date",
          "specimen_collection_date",
          "testing_lab_specimen_received_date",
          "test_result_date",
          "date_result_released",
          "patient_email",
          "patient_race",
          "patient_gender",
          "patient_ethnicity",
          "pregnant",
          "employed_in_healthcare",
          "symptomatic_for_disease",
          "resident_congregate_setting",
          "hospitalized",
          "icu",
          "residence_type",
          "test_result",
          "test_result_status",
          "specimen_type",
          "testing_lab_clia");

  @BeforeEach
  public void init() {
    validRowMap = new HashMap<>();
    validRowMap.put("patient_id", "1234");
    validRowMap.put("patient_last_name", "Doe");
    validRowMap.put("patient_first_name", "Jane");
    validRowMap.put("patient_middle_name", "");
    validRowMap.put("patient_street", "123 Main St");
    validRowMap.put("patient_street2", "");
    validRowMap.put("patient_city", "Birmingham");
    validRowMap.put("patient_state", "AL");
    validRowMap.put("patient_zip_code", "35226");
    validRowMap.put("patient_county", "Jefferson");
    validRowMap.put("patient_phone_number", "205-999-2800");
    validRowMap.put("patient_dob", "1/20/1962");
    validRowMap.put("patient_gender", "F");
    validRowMap.put("patient_race", "White");
    validRowMap.put("patient_ethnicity", "Not Hispanic or Latino");
    validRowMap.put("patient_preferred_language", "");
    validRowMap.put("patient_email", "");
    validRowMap.put("accession_number", "123");
    validRowMap.put("equipment_model_name", "ID NOW");
    validRowMap.put("test_performed_code", "94534-5");
    validRowMap.put("test_result", "Detected");
    validRowMap.put("order_test_date", "12/20/2021 14:00");
    validRowMap.put("specimen_collection_date", "12/20/2021 14:00");
    validRowMap.put("testing_lab_specimen_received_date", "12/20/2021 14:00");
    validRowMap.put("test_result_date", "12/20/2021 14:00");
    validRowMap.put("date_result_released", "12/20/2021 14:00");
    validRowMap.put("specimen_type", "Nasal Swab");
    validRowMap.put("ordering_provider_id", "1013012657");
    validRowMap.put("ordering_provider_last_name", "Smith MD");
    validRowMap.put("ordering_provider_first_name", "John");
    validRowMap.put("ordering_provider_middle_name", "");
    validRowMap.put("ordering_provider_street", "400 Main Street");
    validRowMap.put("ordering_provider_street2", "");
    validRowMap.put("ordering_provider_city", "Birmingham");
    validRowMap.put("ordering_provider_state", "AL");
    validRowMap.put("ordering_provider_zip_code", "35228");
    validRowMap.put("ordering_provider_phone_number", "205-888-2000");
    validRowMap.put("testing_lab_clia", "01D1058442");
    validRowMap.put("testing_lab_name", "My Urgent Care");
    validRowMap.put("testing_lab_street", "400 Main Street");
    validRowMap.put("testing_lab_street2", "");
    validRowMap.put("testing_lab_city", "Birmingham");
    validRowMap.put("testing_lab_state", "AL");
    validRowMap.put("testing_lab_zip_code", "35228");
    validRowMap.put("testing_lab_phone_number", "205-888-2000");
    validRowMap.put("pregnant", "N");
    validRowMap.put("employed_in_healthcare", "N");
    validRowMap.put("symptomatic_for_disease", "N");
    validRowMap.put("illness_onset_date", "");
    validRowMap.put("resident_congregate_setting", "N");
    validRowMap.put("residence_type", "");
    validRowMap.put("hospitalized", "N");
    validRowMap.put("icu", "N");
    validRowMap.put("ordering_facility_name", "My Urgent Care");
    validRowMap.put("ordering_facility_street", "400 Main Street");
    validRowMap.put("ordering_facility_street2", "Suite 100");
    validRowMap.put("ordering_facility_city", "Birmingham");
    validRowMap.put("ordering_facility_state", "AL");
    validRowMap.put("ordering_facility_zip_code", "35228");
    validRowMap.put("ordering_facility_phone_number", "205-888-2000");
    validRowMap.put("comment", "Test Comment");
    validRowMap.put("test_result_status", "");
  }

  @Test
  void processRowSetsAllValues() {
    var testResultRow = new TestResultRow(validRowMap);

    assertThat(testResultRow.getPatientId().getValue()).isEqualTo(validRowMap.get("patient_id"));
    assertThat(testResultRow.getPatientLastName().getValue())
        .isEqualTo(validRowMap.get("patient_last_name"));
    assertThat(testResultRow.getPatientFirstName().getValue())
        .isEqualTo(validRowMap.get("patient_first_name"));
    assertThat(testResultRow.getPatientMiddleName().getValue())
        .isEqualTo(validRowMap.get("patient_middle_name"));
    assertThat(testResultRow.getPatientStreet().getValue())
        .isEqualTo(validRowMap.get("patient_street"));
    assertThat(testResultRow.getPatientStreet2().getValue())
        .isEqualTo(validRowMap.get("patient_street2"));
    assertThat(testResultRow.getPatientCity().getValue())
        .isEqualTo(validRowMap.get("patient_city"));
    assertThat(testResultRow.getPatientState().getValue())
        .isEqualTo(validRowMap.get("patient_state"));
    assertThat(testResultRow.getPatientZipCode().getValue())
        .isEqualTo(validRowMap.get("patient_zip_code"));
    assertThat(testResultRow.getPatientCounty().getValue())
        .isEqualTo(validRowMap.get("patient_county"));
    assertThat(testResultRow.getPatientPhoneNumber().getValue())
        .isEqualTo(validRowMap.get("patient_phone_number"));
    assertThat(testResultRow.getPatientDob().getValue()).isEqualTo(validRowMap.get("patient_dob"));
    assertThat(testResultRow.getPatientGender().getValue())
        .isEqualTo(validRowMap.get("patient_gender"));
    assertThat(testResultRow.getPatientRace().getValue())
        .isEqualTo(validRowMap.get("patient_race"));
    assertThat(testResultRow.getPatientEthnicity().getValue())
        .isEqualTo(validRowMap.get("patient_ethnicity"));
    assertThat(testResultRow.getPatientPreferredLanguage().getValue())
        .isEqualTo(validRowMap.get("patient_preferred_language"));
    assertThat(testResultRow.getPatientEmail().getValue())
        .isEqualTo(validRowMap.get("patient_email"));
    assertThat(testResultRow.getAccessionNumber().getValue())
        .isEqualTo(validRowMap.get("accession_number"));
    assertThat(testResultRow.getEquipmentModelName().getValue())
        .isEqualTo(validRowMap.get("equipment_model_name"));
    assertThat(testResultRow.getTestPerformedCode().getValue())
        .isEqualTo(validRowMap.get("test_performed_code"));
    assertThat(testResultRow.getTestResult().getValue()).isEqualTo(validRowMap.get("test_result"));
    assertThat(testResultRow.getOrderTestDate().getValue())
        .isEqualTo(validRowMap.get("order_test_date"));
    assertThat(testResultRow.getSpecimenCollectionDate().getValue())
        .isEqualTo(validRowMap.get("specimen_collection_date"));
    assertThat(testResultRow.getTestingLabSpecimenReceivedDate().getValue())
        .isEqualTo(validRowMap.get("testing_lab_specimen_received_date"));
    assertThat(testResultRow.getTestResultDate().getValue())
        .isEqualTo(validRowMap.get("test_result_date"));
    assertThat(testResultRow.getDateResultReleased().getValue())
        .isEqualTo(validRowMap.get("date_result_released"));
    assertThat(testResultRow.getSpecimenType().getValue())
        .isEqualTo(validRowMap.get("specimen_type"));
    assertThat(testResultRow.getOrderingProviderId().getValue())
        .isEqualTo(validRowMap.get("ordering_provider_id"));
    assertThat(testResultRow.getOrderingProviderLastName().getValue())
        .isEqualTo(validRowMap.get("ordering_provider_last_name"));
    assertThat(testResultRow.getOrderingProviderFirstName().getValue())
        .isEqualTo(validRowMap.get("ordering_provider_first_name"));
    assertThat(testResultRow.getOrderingProviderMiddleName().getValue())
        .isEqualTo(validRowMap.get("ordering_provider_middle_name"));
    assertThat(testResultRow.getOrderingProviderStreet().getValue())
        .isEqualTo(validRowMap.get("ordering_provider_street"));
    assertThat(testResultRow.getOrderingProviderStreet2().getValue())
        .isEqualTo(validRowMap.get("ordering_provider_street2"));
    assertThat(testResultRow.getOrderingProviderCity().getValue())
        .isEqualTo(validRowMap.get("ordering_provider_city"));
    assertThat(testResultRow.getOrderingProviderState().getValue())
        .isEqualTo(validRowMap.get("ordering_provider_state"));
    assertThat(testResultRow.getOrderingProviderZipCode().getValue())
        .isEqualTo(validRowMap.get("ordering_provider_zip_code"));
    assertThat(testResultRow.getOrderingProviderPhoneNumber().getValue())
        .isEqualTo(validRowMap.get("ordering_provider_phone_number"));
    assertThat(testResultRow.getTestingLabClia().getValue())
        .isEqualTo(validRowMap.get("testing_lab_clia"));
    assertThat(testResultRow.getTestingLabName().getValue())
        .isEqualTo(validRowMap.get("testing_lab_name"));
    assertThat(testResultRow.getTestingLabStreet().getValue())
        .isEqualTo(validRowMap.get("testing_lab_street"));
    assertThat(testResultRow.getTestingLabStreet2().getValue())
        .isEqualTo(validRowMap.get("testing_lab_street2"));
    assertThat(testResultRow.getTestingLabCity().getValue())
        .isEqualTo(validRowMap.get("testing_lab_city"));
    assertThat(testResultRow.getTestingLabState().getValue())
        .isEqualTo(validRowMap.get("testing_lab_state"));
    assertThat(testResultRow.getTestingLabZipCode().getValue())
        .isEqualTo(validRowMap.get("testing_lab_zip_code"));
    assertThat(testResultRow.getTestingLabPhoneNumber().getValue())
        .isEqualTo(validRowMap.get("testing_lab_phone_number"));
    assertThat(testResultRow.getPregnant().getValue()).isEqualTo(validRowMap.get("pregnant"));
    assertThat(testResultRow.getEmployedInHealthcare().getValue())
        .isEqualTo(validRowMap.get("employed_in_healthcare"));
    assertThat(testResultRow.getSymptomaticForDisease().getValue())
        .isEqualTo(validRowMap.get("symptomatic_for_disease"));
    assertThat(testResultRow.getIllnessOnsetDate().getValue())
        .isEqualTo(validRowMap.get("illness_onset_date"));
    assertThat(testResultRow.getResidentCongregateSetting().getValue())
        .isEqualTo(validRowMap.get("resident_congregate_setting"));
    assertThat(testResultRow.getResidenceType().getValue())
        .isEqualTo(validRowMap.get("residence_type"));
    assertThat(testResultRow.getHospitalized().getValue())
        .isEqualTo(validRowMap.get("hospitalized"));
    assertThat(testResultRow.getIcu().getValue()).isEqualTo(validRowMap.get("icu"));
    assertThat(testResultRow.getOrderingFacilityName().getValue())
        .isEqualTo(validRowMap.get("ordering_facility_name"));
    assertThat(testResultRow.getOrderingFacilityStreet().getValue())
        .isEqualTo(validRowMap.get("ordering_facility_street"));
    assertThat(testResultRow.getOrderingFacilityStreet2().getValue())
        .isEqualTo(validRowMap.get("ordering_facility_street2"));
    assertThat(testResultRow.getOrderingFacilityCity().getValue())
        .isEqualTo(validRowMap.get("ordering_facility_city"));
    assertThat(testResultRow.getOrderingFacilityState().getValue())
        .isEqualTo(validRowMap.get("ordering_facility_state"));
    assertThat(testResultRow.getOrderingFacilityZipCode().getValue())
        .isEqualTo(validRowMap.get("ordering_facility_zip_code"));
    assertThat(testResultRow.getOrderingFacilityPhoneNumber().getValue())
        .isEqualTo(validRowMap.get("ordering_facility_phone_number"));
    assertThat(testResultRow.getComment().getValue()).isEqualTo(validRowMap.get("comment"));
    assertThat(testResultRow.getTestResultStatus().getValue())
        .isEqualTo(validRowMap.get("test_result_status"));
  }

  @Test
  void validateHeadersReturnsErrorsForAllEmptyRequiredFields() {
    var testResultRow = new TestResultRow(new HashMap<>());

    var actual = testResultRow.validateHeaders();

    var messages = actual.stream().map(FeedbackMessage::getMessage).collect(Collectors.toSet());
    assertThat(actual).hasSize(requiredFields.size());
    requiredFields.forEach(
        fieldName -> assertThat(messages).contains(fieldName + " is a required column."));
  }

  @Test
  void validateIndividualFields() {
    var invalidIndividualFields = validRowMap;
    invalidIndividualFields.put("patient_state", "District of Columbia");
    invalidIndividualFields.put("ordering_provider_state", "District of Columbia");
    invalidIndividualFields.put("testing_lab_state", "District of ");
    invalidIndividualFields.put("ordering_facility_state", "District of Columbia");
    invalidIndividualFields.put("patient_zip_code", "205000");
    invalidIndividualFields.put("ordering_provider_zip_code", "205000");
    invalidIndividualFields.put("testing_lab_zip_code", "205000");
    invalidIndividualFields.put("ordering_facility_zip_code", "205000");
    invalidIndividualFields.put("patient_phone_number", "1");
    invalidIndividualFields.put("ordering_provider_phone_number", "1");
    invalidIndividualFields.put("testing_lab_phone_number", "1");
    invalidIndividualFields.put("ordering_facility_phone_number", "1");
    invalidIndividualFields.put("patient_dob", "0/0/00");
    invalidIndividualFields.put("illness_onset_date", "0/0/00");
    invalidIndividualFields.put("order_test_date", "0/0/00");
    invalidIndividualFields.put("specimen_collection_date", "0/0/00");
    invalidIndividualFields.put("testing_lab_specimen_received_date", "0/0/00");
    invalidIndividualFields.put("test_result_date", "0/0/00");
    invalidIndividualFields.put("date_result_released", "0/0/00");
    invalidIndividualFields.put("patient_email", "a");
    invalidIndividualFields.put("patient_race", "black");
    invalidIndividualFields.put("patient_gender", "woman");
    invalidIndividualFields.put("patient_ethnicity", "not hispanic");
    invalidIndividualFields.put("pregnant", "not");
    invalidIndividualFields.put("employed_in_healthcare", "not");
    invalidIndividualFields.put("symptomatic_for_disease", "not");
    invalidIndividualFields.put("resident_congregate_setting", "not");
    invalidIndividualFields.put("hospitalized", "not");
    invalidIndividualFields.put("icu", "not");
    invalidIndividualFields.put("residence_type", "not");
    invalidIndividualFields.put("test_result", "pos");
    invalidIndividualFields.put("test_result_status", "complete");
    invalidIndividualFields.put("specimen_type", "swab");
    invalidIndividualFields.put("testing_lab_clia", "à");
    var testResultRow = new TestResultRow(invalidIndividualFields);

    var actual = testResultRow.validateIndividualValues();

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
