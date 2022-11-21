package gov.cdc.usds.simplereport.validators;

import static org.assertj.core.api.Assertions.assertThat;

import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class TestResultRowTest {
  TestResultRow testResultRow;
  Map<String, String> rowMap;
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
    testResultRow = new TestResultRow();
    rowMap = new HashMap<>();
    rowMap.put("patient_id", "1234");
    rowMap.put("patient_last_name", "Doe");
    rowMap.put("patient_first_name", "Jane");
    rowMap.put("patient_middle_name", "");
    rowMap.put("patient_street", "123 Main St");
    rowMap.put("patient_street2", "");
    rowMap.put("patient_city", "Birmingham");
    rowMap.put("patient_state", "AL");
    rowMap.put("patient_zip_code", "35226");
    rowMap.put("patient_county", "Jefferson");
    rowMap.put("patient_phone_number", "205-999-2800");
    rowMap.put("patient_dob", "1/20/1962");
    rowMap.put("patient_gender", "F");
    rowMap.put("patient_race", "White");
    rowMap.put("patient_ethnicity", "Not Hispanic or Latino");
    rowMap.put("patient_preferred_language", "");
    rowMap.put("patient_email", "");
    rowMap.put("accession_number", "123");
    rowMap.put("equipment_model_name", "ID NOW");
    rowMap.put("test_performed_code", "94534-5");
    rowMap.put("test_result", "Detected");
    rowMap.put("order_test_date", "12/20/2021 14:00");
    rowMap.put("specimen_collection_date", "12/20/2021 14:00");
    rowMap.put("testing_lab_specimen_received_date", "12/20/2021 14:00");
    rowMap.put("test_result_date", "12/20/2021 14:00");
    rowMap.put("date_result_released", "12/20/2021 14:00");
    rowMap.put("specimen_type", "Nasal Swab");
    rowMap.put("ordering_provider_id", "1013012657");
    rowMap.put("ordering_provider_last_name", "Smith MD");
    rowMap.put("ordering_provider_first_name", "John");
    rowMap.put("ordering_provider_middle_name", "");
    rowMap.put("ordering_provider_street", "400 Main Street");
    rowMap.put("ordering_provider_street2", "");
    rowMap.put("ordering_provider_city", "Birmingham");
    rowMap.put("ordering_provider_state", "AL");
    rowMap.put("ordering_provider_zip_code", "35228");
    rowMap.put("ordering_provider_phone_number", "205-888-2000");
    rowMap.put("testing_lab_clia", "01D1058442");
    rowMap.put("testing_lab_name", "My Urgent Care");
    rowMap.put("testing_lab_street", "400 Main Street");
    rowMap.put("testing_lab_street2", "");
    rowMap.put("testing_lab_city", "Birmingham");
    rowMap.put("testing_lab_state", "AL");
    rowMap.put("testing_lab_zip_code", "35228");
    rowMap.put("testing_lab_phone_number", "205-888-2000");
    rowMap.put("pregnant", "N");
    rowMap.put("employed_in_healthcare", "N");
    rowMap.put("symptomatic_for_disease", "N");
    rowMap.put("illness_onset_date", "");
    rowMap.put("resident_congregate_setting", "N");
    rowMap.put("residence_type", "");
    rowMap.put("hospitalized", "N");
    rowMap.put("icu", "N");
    rowMap.put("ordering_facility_name", "My Urgent Care");
    rowMap.put("ordering_facility_street", "400 Main Street");
    rowMap.put("ordering_facility_street2", "Suite 100");
    rowMap.put("ordering_facility_city", "Birmingham");
    rowMap.put("ordering_facility_state", "AL");
    rowMap.put("ordering_facility_zip_code", "35228");
    rowMap.put("ordering_facility_phone_number", "205-888-2000");
    rowMap.put("comment", "Test Comment");
    rowMap.put("test_result_status", "");
  }

  @Test
  public void processRowSetsAllValues() {
    testResultRow.processRow(rowMap);

    assertThat(testResultRow.getPatientId().getValue()).isEqualTo(rowMap.get("patient_id"));
    assertThat(testResultRow.getPatientLastName().getValue())
        .isEqualTo(rowMap.get("patient_last_name"));
    assertThat(testResultRow.getPatientFirstName().getValue())
        .isEqualTo(rowMap.get("patient_first_name"));
    assertThat(testResultRow.getPatientMiddleName().getValue())
        .isEqualTo(rowMap.get("patient_middle_name"));
    assertThat(testResultRow.getPatientStreet().getValue()).isEqualTo(rowMap.get("patient_street"));
    assertThat(testResultRow.getPatientStreet2().getValue())
        .isEqualTo(rowMap.get("patient_street2"));
    assertThat(testResultRow.getPatientCity().getValue()).isEqualTo(rowMap.get("patient_city"));
    assertThat(testResultRow.getPatientState().getValue()).isEqualTo(rowMap.get("patient_state"));
    assertThat(testResultRow.getPatientZipCode().getValue())
        .isEqualTo(rowMap.get("patient_zip_code"));
    assertThat(testResultRow.getPatientCounty().getValue()).isEqualTo(rowMap.get("patient_county"));
    assertThat(testResultRow.getPatientPhoneNumber().getValue())
        .isEqualTo(rowMap.get("patient_phone_number"));
    assertThat(testResultRow.getPatientDob().getValue()).isEqualTo(rowMap.get("patient_dob"));
    assertThat(testResultRow.getPatientGender().getValue()).isEqualTo(rowMap.get("patient_gender"));
    assertThat(testResultRow.getPatientRace().getValue()).isEqualTo(rowMap.get("patient_race"));
    assertThat(testResultRow.getPatientEthnicity().getValue())
        .isEqualTo(rowMap.get("patient_ethnicity"));
    assertThat(testResultRow.getPatientPreferredLanguage().getValue())
        .isEqualTo(rowMap.get("patient_preferred_language"));
    assertThat(testResultRow.getPatientEmail().getValue()).isEqualTo(rowMap.get("patient_email"));
    assertThat(testResultRow.getAccessionNumber().getValue())
        .isEqualTo(rowMap.get("accession_number"));
    assertThat(testResultRow.getEquipmentModelName().getValue())
        .isEqualTo(rowMap.get("equipment_model_name"));
    assertThat(testResultRow.getTestPerformedCode().getValue())
        .isEqualTo(rowMap.get("test_performed_code"));
    assertThat(testResultRow.getTestResult().getValue()).isEqualTo(rowMap.get("test_result"));
    assertThat(testResultRow.getOrderTestDate().getValue())
        .isEqualTo(rowMap.get("order_test_date"));
    assertThat(testResultRow.getSpecimenCollectionDate().getValue())
        .isEqualTo(rowMap.get("specimen_collection_date"));
    assertThat(testResultRow.getTestingLabSpecimenReceivedDate().getValue())
        .isEqualTo(rowMap.get("testing_lab_specimen_received_date"));
    assertThat(testResultRow.getTestResultDate().getValue())
        .isEqualTo(rowMap.get("test_result_date"));
    assertThat(testResultRow.getDateResultReleased().getValue())
        .isEqualTo(rowMap.get("date_result_released"));
    assertThat(testResultRow.getSpecimenType().getValue()).isEqualTo(rowMap.get("specimen_type"));
    assertThat(testResultRow.getOrderingProviderId().getValue())
        .isEqualTo(rowMap.get("ordering_provider_id"));
    assertThat(testResultRow.getOrderingProviderLastName().getValue())
        .isEqualTo(rowMap.get("ordering_provider_last_name"));
    assertThat(testResultRow.getOrderingProviderFirstName().getValue())
        .isEqualTo(rowMap.get("ordering_provider_first_name"));
    assertThat(testResultRow.getOrderingProviderMiddleName().getValue())
        .isEqualTo(rowMap.get("ordering_provider_middle_name"));
    assertThat(testResultRow.getOrderingProviderStreet().getValue())
        .isEqualTo(rowMap.get("ordering_provider_street"));
    assertThat(testResultRow.getOrderingProviderStreet2().getValue())
        .isEqualTo(rowMap.get("ordering_provider_street2"));
    assertThat(testResultRow.getOrderingProviderCity().getValue())
        .isEqualTo(rowMap.get("ordering_provider_city"));
    assertThat(testResultRow.getOrderingProviderState().getValue())
        .isEqualTo(rowMap.get("ordering_provider_state"));
    assertThat(testResultRow.getOrderingProviderZipCode().getValue())
        .isEqualTo(rowMap.get("ordering_provider_zip_code"));
    assertThat(testResultRow.getOrderingProviderPhoneNumber().getValue())
        .isEqualTo(rowMap.get("ordering_provider_phone_number"));
    assertThat(testResultRow.getTestingLabClia().getValue())
        .isEqualTo(rowMap.get("testing_lab_clia"));
    assertThat(testResultRow.getTestingLabName().getValue())
        .isEqualTo(rowMap.get("testing_lab_name"));
    assertThat(testResultRow.getTestingLabStreet().getValue())
        .isEqualTo(rowMap.get("testing_lab_street"));
    assertThat(testResultRow.getTestingLabStreet2().getValue())
        .isEqualTo(rowMap.get("testing_lab_street2"));
    assertThat(testResultRow.getTestingLabCity().getValue())
        .isEqualTo(rowMap.get("testing_lab_city"));
    assertThat(testResultRow.getTestingLabState().getValue())
        .isEqualTo(rowMap.get("testing_lab_state"));
    assertThat(testResultRow.getTestingLabZipCode().getValue())
        .isEqualTo(rowMap.get("testing_lab_zip_code"));
    assertThat(testResultRow.getTestingLabPhoneNumber().getValue())
        .isEqualTo(rowMap.get("testing_lab_phone_number"));
    assertThat(testResultRow.getPregnant().getValue()).isEqualTo(rowMap.get("pregnant"));
    assertThat(testResultRow.getEmployedInHealthcare().getValue())
        .isEqualTo(rowMap.get("employed_in_healthcare"));
    assertThat(testResultRow.getSymptomaticForDisease().getValue())
        .isEqualTo(rowMap.get("symptomatic_for_disease"));
    assertThat(testResultRow.getIllnessOnsetDate().getValue())
        .isEqualTo(rowMap.get("illness_onset_date"));
    assertThat(testResultRow.getResidentCongregateSetting().getValue())
        .isEqualTo(rowMap.get("resident_congregate_setting"));
    assertThat(testResultRow.getResidenceType().getValue()).isEqualTo(rowMap.get("residence_type"));
    assertThat(testResultRow.getHospitalized().getValue()).isEqualTo(rowMap.get("hospitalized"));
    assertThat(testResultRow.getIcu().getValue()).isEqualTo(rowMap.get("icu"));
    assertThat(testResultRow.getOrderingFacilityName().getValue())
        .isEqualTo(rowMap.get("ordering_facility_name"));
    assertThat(testResultRow.getOrderingFacilityStreet().getValue())
        .isEqualTo(rowMap.get("ordering_facility_street"));
    assertThat(testResultRow.getOrderingFacilityStreet2().getValue())
        .isEqualTo(rowMap.get("ordering_facility_street2"));
    assertThat(testResultRow.getOrderingFacilityCity().getValue())
        .isEqualTo(rowMap.get("ordering_facility_city"));
    assertThat(testResultRow.getOrderingFacilityState().getValue())
        .isEqualTo(rowMap.get("ordering_facility_state"));
    assertThat(testResultRow.getOrderingFacilityZipCode().getValue())
        .isEqualTo(rowMap.get("ordering_facility_zip_code"));
    assertThat(testResultRow.getOrderingFacilityPhoneNumber().getValue())
        .isEqualTo(rowMap.get("ordering_facility_phone_number"));
    assertThat(testResultRow.getComment().getValue()).isEqualTo(rowMap.get("comment"));
    assertThat(testResultRow.getTestResultStatus().getValue())
        .isEqualTo(rowMap.get("test_result_status"));
  }

  @Test
  public void validateHeadersReturnsErrorsForAllEmptyRequiredFields() {
    testResultRow.processRow(new HashMap<>());

    var actual = testResultRow.validateHeaders();

    var messages = actual.stream().map(FeedbackMessage::getMessage).collect(Collectors.toSet());
    assertThat(actual).hasSize(requiredFields.size());
    requiredFields.forEach(
        fieldName -> assertThat(messages).contains(fieldName + " is a required column."));
  }

  @Test
  public void validateIndividualFields() {
    rowMap.put("patient_state", "District of Columbia");
    rowMap.put("ordering_provider_state", "District of Columbia");
    rowMap.put("testing_lab_state", "District of ");
    rowMap.put("ordering_facility_state", "District of Columbia");
    rowMap.put("patient_zip_code", "205000");
    rowMap.put("ordering_provider_zip_code", "205000");
    rowMap.put("testing_lab_zip_code", "205000");
    rowMap.put("ordering_facility_zip_code", "205000");
    rowMap.put("patient_phone_number", "1");
    rowMap.put("ordering_provider_phone_number", "1");
    rowMap.put("testing_lab_phone_number", "1");
    rowMap.put("ordering_facility_phone_number", "1");
    rowMap.put("patient_dob", "0/0/00");
    rowMap.put("illness_onset_date", "0/0/00");
    rowMap.put("order_test_date", "0/0/00");
    rowMap.put("specimen_collection_date", "0/0/00");
    rowMap.put("testing_lab_specimen_received_date", "0/0/00");
    rowMap.put("test_result_date", "0/0/00");
    rowMap.put("date_result_released", "0/0/00");
    rowMap.put("patient_email", "a");
    rowMap.put("patient_race", "black");
    rowMap.put("patient_gender", "woman");
    rowMap.put("patient_ethnicity", "not hispanic");
    rowMap.put("pregnant", "not");
    rowMap.put("employed_in_healthcare", "not");
    rowMap.put("symptomatic_for_disease", "not");
    rowMap.put("resident_congregate_setting", "not");
    rowMap.put("hospitalized", "not");
    rowMap.put("icu", "not");
    rowMap.put("residence_type", "not");
    rowMap.put("test_result", "pos");
    rowMap.put("test_result_status", "complete");
    rowMap.put("specimen_type", "swab");
    rowMap.put("testing_lab_clia", "à");
    testResultRow.processRow(rowMap);

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
