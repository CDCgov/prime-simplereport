package gov.cdc.usds.simplereport.validators;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.from;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.service.ResultsUploaderCachingService;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.test_util.TestDataBuilder;
import gov.cdc.usds.simplereport.test_util.TestErrorMessageUtil;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.jetbrains.annotations.NotNull;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.test.context.junit.jupiter.SpringExtension;

@ExtendWith(SpringExtension.class)
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
          "testing_lab_clia",
          "genders_of_sexual_partners",
          "patient_gender_identity");

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
    validRowMap.put("genders_of_sexual_partners", "M, F, TM, TW");
    validRowMap.put("patient_gender_identity", "F");
  }

  @Test
  void processRowSetsAllValues() {
    var testResultRow = new TestResultRow(validRowMap);

    assertThat(testResultRow)
        .returns(
            validRowMap.get("patient_id"),
            from(TestResultRow::getPatientId).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_last_name"),
            from(TestResultRow::getPatientLastName).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_first_name"),
            from(TestResultRow::getPatientFirstName).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_middle_name"),
            from(TestResultRow::getPatientMiddleName).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_street"),
            from(TestResultRow::getPatientStreet).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_street2"),
            from(TestResultRow::getPatientStreet2).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_city"),
            from(TestResultRow::getPatientCity).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_state"),
            from(TestResultRow::getPatientState).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_zip_code"),
            from(TestResultRow::getPatientZipCode).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_county"),
            from(TestResultRow::getPatientCounty).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_phone_number"),
            from(TestResultRow::getPatientPhoneNumber).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_dob"),
            from(TestResultRow::getPatientDob).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_gender"),
            from(TestResultRow::getPatientGender).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_race"),
            from(TestResultRow::getPatientRace).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_ethnicity"),
            from(TestResultRow::getPatientEthnicity).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_preferred_language"),
            from(TestResultRow::getPatientPreferredLanguage).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_email"),
            from(TestResultRow::getPatientEmail).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("accession_number"),
            from(TestResultRow::getAccessionNumber).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("equipment_model_name"),
            from(TestResultRow::getEquipmentModelName).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("test_performed_code"),
            from(TestResultRow::getTestPerformedCode).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("test_result"),
            from(TestResultRow::getTestResult).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("order_test_date"),
            from(TestResultRow::getOrderTestDate).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("specimen_collection_date"),
            from(TestResultRow::getSpecimenCollectionDate).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("testing_lab_specimen_received_date"),
            from(TestResultRow::getTestingLabSpecimenReceivedDate).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("test_result_date"),
            from(TestResultRow::getTestResultDate).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("date_result_released"),
            from(TestResultRow::getDateResultReleased).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("specimen_type"),
            from(TestResultRow::getSpecimenType).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_provider_id"),
            from(TestResultRow::getOrderingProviderId).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_provider_last_name"),
            from(TestResultRow::getOrderingProviderLastName).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_provider_first_name"),
            from(TestResultRow::getOrderingProviderFirstName).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_provider_middle_name"),
            from(TestResultRow::getOrderingProviderMiddleName).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_provider_street"),
            from(TestResultRow::getOrderingProviderStreet).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_provider_street2"),
            from(TestResultRow::getOrderingProviderStreet2).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_provider_city"),
            from(TestResultRow::getOrderingProviderCity).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_provider_state"),
            from(TestResultRow::getOrderingProviderState).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_provider_zip_code"),
            from(TestResultRow::getOrderingProviderZipCode).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_provider_phone_number"),
            from(TestResultRow::getOrderingProviderPhoneNumber).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("testing_lab_clia"),
            from(TestResultRow::getTestingLabClia).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("testing_lab_name"),
            from(TestResultRow::getTestingLabName).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("testing_lab_street"),
            from(TestResultRow::getTestingLabStreet).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("testing_lab_street2"),
            from(TestResultRow::getTestingLabStreet2).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("testing_lab_city"),
            from(TestResultRow::getTestingLabCity).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("testing_lab_state"),
            from(TestResultRow::getTestingLabState).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("testing_lab_zip_code"),
            from(TestResultRow::getTestingLabZipCode).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("testing_lab_phone_number"),
            from(TestResultRow::getTestingLabPhoneNumber).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("pregnant"),
            from(TestResultRow::getPregnant).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("employed_in_healthcare"),
            from(TestResultRow::getEmployedInHealthcare).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("symptomatic_for_disease"),
            from(TestResultRow::getSymptomaticForDisease).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("illness_onset_date"),
            from(TestResultRow::getIllnessOnsetDate).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("resident_congregate_setting"),
            from(TestResultRow::getResidentCongregateSetting).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("residence_type"),
            from(TestResultRow::getResidenceType).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("hospitalized"),
            from(TestResultRow::getHospitalized).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("icu"), from(TestResultRow::getIcu).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_facility_name"),
            from(TestResultRow::getOrderingFacilityName).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_facility_street"),
            from(TestResultRow::getOrderingFacilityStreet).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_facility_street2"),
            from(TestResultRow::getOrderingFacilityStreet2).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_facility_city"),
            from(TestResultRow::getOrderingFacilityCity).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_facility_state"),
            from(TestResultRow::getOrderingFacilityState).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_facility_zip_code"),
            from(TestResultRow::getOrderingFacilityZipCode).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("ordering_facility_phone_number"),
            from(TestResultRow::getOrderingFacilityPhoneNumber).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("comment"),
            from(TestResultRow::getComment).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("test_result_status"),
            from(TestResultRow::getTestResultStatus).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("genders_of_sexual_partners"),
            from(TestResultRow::getGendersOfSexualPartners).andThen(ValueOrError::getValue))
        .returns(
            validRowMap.get("patient_gender_identity"),
            from(TestResultRow::getPatientGenderIdentity).andThen(ValueOrError::getValue));
  }

  @Test
  void validateRequiredFieldsReturnsErrorsForAllEmptyRequiredFields() {
    var testResultRow = new TestResultRow(new HashMap<>());

    var actual = testResultRow.validateRequiredFields();

    var messages = actual.stream().map(FeedbackMessage::getMessage).collect(Collectors.toSet());
    assertThat(actual).hasSize(requiredFields.size());
    requiredFields.forEach(
        fieldName ->
            assertThat(messages).contains("File is missing data in the " + fieldName + " column."));
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
    invalidIndividualFields.put("specimen_type", "100");
    invalidIndividualFields.put("testing_lab_clia", "à");
    invalidIndividualFields.put("genders_of_sexual_partners", "ma, f");
    invalidIndividualFields.put("patient_gender_identity", "fe");
    var testResultRow =
        new TestResultRow(
            invalidIndividualFields,
            mockResultsUploaderCachingService(),
            mock(FeatureFlagsConfig.class));

    var actual = testResultRow.validateIndividualValues();

    var messages =
        actual.stream()
            .map(
                message ->
                    TestErrorMessageUtil.getColumnNameFromInvalidErrorMessage(message.getMessage()))
            .collect(Collectors.toSet());
    assertThat(actual).hasSize(individualFields.size());
    individualFields.forEach(fieldName -> assertThat(messages).contains(fieldName));
  }

  @Test
  void validatePositiveHivRequiredAoeFields() {
    Map<String, String> missingHivRequiredAoeFields =
        getPositiveResultRowMap("HIV model", "80387-4");
    missingHivRequiredAoeFields.put("pregnant", "");
    missingHivRequiredAoeFields.put("genders_of_sexual_partners", "");

    var resultsUploaderCachingService = mock(ResultsUploaderCachingService.class);
    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(Map.of("hiv model|80387-4", TestDataBuilder.createDeviceType()));
    when(resultsUploaderCachingService.getHivEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of("hiv model|80387-4"));

    var testResultRow =
        new TestResultRow(
            missingHivRequiredAoeFields,
            resultsUploaderCachingService,
            mock(FeatureFlagsConfig.class));

    var actual = testResultRow.validateIndividualValues();

    assertThat(actual).hasSize(2);
    actual.forEach(
        message ->
            assertThat(message.getMessage())
                .contains("This is required because the row contains a positive HIV test result."));
  }

  @Test
  void validatePositiveSyphilisRequiredAoeFields() {
    Map<String, String> missingSyphilisRequiredAoeFields =
        getPositiveResultRowMap("Syphilis model", "80387-4");
    missingSyphilisRequiredAoeFields.put("pregnant", "");
    missingSyphilisRequiredAoeFields.put("genders_of_sexual_partners", "");
    missingSyphilisRequiredAoeFields.put("previous_syphilis_diagnosis", "");
    missingSyphilisRequiredAoeFields.put("symptomatic_for_disease", "");

    var resultsUploaderCachingService = mock(ResultsUploaderCachingService.class);
    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(Map.of("syphilis model|80387-4", TestDataBuilder.createDeviceType()));
    when(resultsUploaderCachingService.getSyphilisEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of("syphilis model|80387-4"));

    var testResultRow =
        new TestResultRow(
            missingSyphilisRequiredAoeFields,
            resultsUploaderCachingService,
            mock(FeatureFlagsConfig.class));

    var actual = testResultRow.validateIndividualValues();

    assertThat(actual).hasSize(4);
    actual.forEach(
        message ->
            assertThat(message.getMessage())
                .contains(
                    "This is required because the row contains a positive Syphilis test result."));
  }

  @Test
  void validatePositiveHepatitisCRequiredAoeFields() {
    Map<String, String> missingHepCRequiredAoeFields =
        getPositiveResultRowMap("Hepatitis C Model", "40726-2");
    missingHepCRequiredAoeFields.put("pregnant", "");
    missingHepCRequiredAoeFields.put("genders_of_sexual_partners", "");
    missingHepCRequiredAoeFields.put("symptomatic_for_disease", "");

    ResultsUploaderCachingService resultsUploaderCachingService =
        mock(ResultsUploaderCachingService.class);
    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(Map.of("hepatitis c model|40726-2", TestDataBuilder.createDeviceType()));
    when(resultsUploaderCachingService.getHepatitisCEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of("hepatitis c model|40726-2"));

    TestResultRow testResultRow =
        new TestResultRow(
            missingHepCRequiredAoeFields,
            resultsUploaderCachingService,
            mock(FeatureFlagsConfig.class));

    List<FeedbackMessage> actual = testResultRow.validateIndividualValues();

    assertThat(actual).hasSize(3);
    actual.forEach(
        message ->
            assertThat(message.getMessage())
                .contains(
                    "This is required because the row contains a positive Hepatitis C test result."));
  }

  @Test
  void validatePositiveGonorrheaRequiredAoeFields() {
    Map<String, String> missingGonorrheaRequiredAoeFields =
        getPositiveResultRowMap("Gonorrhea Model", "5028-6");
    missingGonorrheaRequiredAoeFields.put("pregnant", "");
    missingGonorrheaRequiredAoeFields.put("genders_of_sexual_partners", "");
    missingGonorrheaRequiredAoeFields.put("symptomatic_for_disease", "");

    ResultsUploaderCachingService resultsUploaderCachingService =
        mock(ResultsUploaderCachingService.class);
    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(Map.of("gonorrhea model|5028-6", TestDataBuilder.createDeviceType()));
    when(resultsUploaderCachingService.getGonorrheaEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of("gonorrhea model|5028-6"));

    TestResultRow testResultRow =
        new TestResultRow(
            missingGonorrheaRequiredAoeFields,
            resultsUploaderCachingService,
            mock(FeatureFlagsConfig.class));

    List<FeedbackMessage> actual = testResultRow.validateIndividualValues();

    assertThat(actual).hasSize(3);
    actual.forEach(
        message ->
            assertThat(message.getMessage())
                .contains(
                    "This is required because the row contains a positive Gonorrhea test result."));
  }

  @Test
  void validatePositiveChlamydiaRequiredAoeFields() {
    Map<String, String> missingChlamydiaRequiredAoeFields =
        getPositiveResultRowMap("Chlamydia Model", "14298-1");
    missingChlamydiaRequiredAoeFields.put("pregnant", "");
    missingChlamydiaRequiredAoeFields.put("genders_of_sexual_partners", "");
    missingChlamydiaRequiredAoeFields.put("symptomatic_for_disease", "");

    ResultsUploaderCachingService resultsUploaderCachingService =
        mock(ResultsUploaderCachingService.class);
    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(Map.of("chlamydia model|14298-1", TestDataBuilder.createDeviceType()));
    when(resultsUploaderCachingService.getChlamydiaEquipmentModelAndTestPerformedCodeSet())
        .thenReturn(Set.of("chlamydia model|14298-1"));

    TestResultRow testResultRow =
        new TestResultRow(
            missingChlamydiaRequiredAoeFields,
            resultsUploaderCachingService,
            mock(FeatureFlagsConfig.class));

    List<FeedbackMessage> actual = testResultRow.validateIndividualValues();

    assertThat(actual).hasSize(3);
    actual.forEach(
        message ->
            assertThat(message.getMessage())
                .contains(
                    "This is required because the row contains a positive Chlamydia test result."));
  }

  @NotNull
  private Map<String, String> getPositiveResultRowMap(
      String deviceModelName, String testPerformedCode) {
    Map<String, String> positiveResultRowMap = validRowMap;
    positiveResultRowMap.put("equipment_model_name", deviceModelName);
    positiveResultRowMap.put("test_performed_code", testPerformedCode);
    positiveResultRowMap.put("specimen_type", "123456789");
    positiveResultRowMap.put("test_result", "Detected");
    return positiveResultRowMap;
  }

  private ResultsUploaderCachingService mockResultsUploaderCachingService() {
    var resultsUploaderCachingService = mock(ResultsUploaderCachingService.class);
    when(resultsUploaderCachingService.getModelAndTestPerformedCodeToDeviceMap())
        .thenReturn(Map.of("id now|94534-5", TestDataBuilder.createDeviceType()));
    return resultsUploaderCachingService;
  }
}
