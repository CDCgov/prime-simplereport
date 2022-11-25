package gov.cdc.usds.simplereport.api.model.filerow;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateBiologicalSex;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateClia;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateDateFormat;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateDateTime;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateEmail;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateEthnicity;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validatePhoneNumber;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateRace;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateResidence;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateSpecimenType;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateState;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateTestResult;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateTestResultStatus;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateYesNoAnswer;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateZipCode;

import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.Getter;

@Getter
public class TestResultRow implements FileRow {
  private final ValueOrError patientId;
  private final ValueOrError patientLastName;
  private final ValueOrError patientFirstName;
  private final ValueOrError patientMiddleName;
  private final ValueOrError patientStreet;
  private final ValueOrError patientStreet2;
  private final ValueOrError patientCity;
  private final ValueOrError patientState;
  private final ValueOrError patientZipCode;
  private final ValueOrError patientCounty;
  private final ValueOrError patientPhoneNumber;
  private final ValueOrError patientDob;
  private final ValueOrError patientGender;
  private final ValueOrError patientRace;
  private final ValueOrError patientEthnicity;
  private final ValueOrError patientPreferredLanguage;
  private final ValueOrError patientEmail;
  private final ValueOrError accessionNumber;
  private final ValueOrError equipmentModelName;
  private final ValueOrError testPerformedCode;
  private final ValueOrError testResult;
  private final ValueOrError orderTestDate;
  private final ValueOrError specimenCollectionDate;
  private final ValueOrError testingLabSpecimenReceivedDate;
  private final ValueOrError testResultDate;
  private final ValueOrError dateResultReleased;
  private final ValueOrError specimenType;
  private final ValueOrError orderingProviderId;
  private final ValueOrError orderingProviderLastName;
  private final ValueOrError orderingProviderFirstName;
  private final ValueOrError orderingProviderMiddleName;
  private final ValueOrError orderingProviderStreet;
  private final ValueOrError orderingProviderStreet2;
  private final ValueOrError orderingProviderCity;
  private final ValueOrError orderingProviderState;
  private final ValueOrError orderingProviderZipCode;
  private final ValueOrError orderingProviderPhoneNumber;
  private final ValueOrError testingLabClia;
  private final ValueOrError testingLabName;
  private final ValueOrError testingLabStreet;
  private final ValueOrError testingLabStreet2;
  private final ValueOrError testingLabCity;
  private final ValueOrError testingLabState;
  private final ValueOrError testingLabZipCode;
  private final ValueOrError testingLabPhoneNumber;
  private final ValueOrError pregnant;
  private final ValueOrError employedInHealthcare;
  private final ValueOrError symptomaticForDisease;
  private final ValueOrError illnessOnsetDate;
  private final ValueOrError residentCongregateSetting;
  private final ValueOrError residenceType;
  private final ValueOrError hospitalized;
  private final ValueOrError icu;
  private final ValueOrError orderingFacilityName;
  private final ValueOrError orderingFacilityStreet;
  private final ValueOrError orderingFacilityStreet2;
  private final ValueOrError orderingFacilityCity;
  private final ValueOrError orderingFacilityState;
  private final ValueOrError orderingFacilityZipCode;
  private final ValueOrError orderingFacilityPhoneNumber;
  private final ValueOrError comment;
  private final ValueOrError testResultStatus;

  public TestResultRow(Map<String, String> rawRow) {
    patientId = getValue(rawRow, "patient_id", false);
    patientLastName = getValue(rawRow, "patient_last_name", true);
    patientFirstName = getValue(rawRow, "patient_first_name", true);
    patientMiddleName = getValue(rawRow, "patient_middle_name", false);
    patientStreet = getValue(rawRow, "patient_street", true);
    patientStreet2 = getValue(rawRow, "patient_street2", false);
    patientCity = getValue(rawRow, "patient_city", true);
    patientState = getValue(rawRow, "patient_state", true);
    patientZipCode = getValue(rawRow, "patient_zip_code", true);
    patientCounty = getValue(rawRow, "patient_county", true);
    patientPhoneNumber = getValue(rawRow, "patient_phone_number", true);
    patientDob = getValue(rawRow, "patient_dob", true);
    patientGender = getValue(rawRow, "patient_gender", true);
    patientRace = getValue(rawRow, "patient_race", true);
    patientEthnicity = getValue(rawRow, "patient_ethnicity", true);
    patientPreferredLanguage = getValue(rawRow, "patient_preferred_language", false);
    patientEmail = getValue(rawRow, "patient_email", false);
    accessionNumber = getValue(rawRow, "accession_number", true);
    equipmentModelName = getValue(rawRow, "equipment_model_name", true);
    testPerformedCode = getValue(rawRow, "test_performed_code", true);
    testResult = getValue(rawRow, "test_result", true);
    orderTestDate = getValue(rawRow, "order_test_date", true);
    specimenCollectionDate = getValue(rawRow, "specimen_collection_date", false);
    testingLabSpecimenReceivedDate = getValue(rawRow, "testing_lab_specimen_received_date", false);
    testResultDate = getValue(rawRow, "test_result_date", true);
    dateResultReleased = getValue(rawRow, "date_result_released", false);
    specimenType = getValue(rawRow, "specimen_type", true);
    orderingProviderId = getValue(rawRow, "ordering_provider_id", true);
    orderingProviderLastName = getValue(rawRow, "ordering_provider_last_name", true);
    orderingProviderFirstName = getValue(rawRow, "ordering_provider_first_name", true);
    orderingProviderMiddleName = getValue(rawRow, "ordering_provider_middle_name", false);
    orderingProviderStreet = getValue(rawRow, "ordering_provider_street", true);
    orderingProviderStreet2 = getValue(rawRow, "ordering_provider_street2", false);
    orderingProviderCity = getValue(rawRow, "ordering_provider_city", true);
    orderingProviderState = getValue(rawRow, "ordering_provider_state", true);
    orderingProviderZipCode = getValue(rawRow, "ordering_provider_zip_code", true);
    orderingProviderPhoneNumber = getValue(rawRow, "ordering_provider_phone_number", true);
    testingLabClia = getValue(rawRow, "testing_lab_clia", true);
    testingLabName = getValue(rawRow, "testing_lab_name", true);
    testingLabStreet = getValue(rawRow, "testing_lab_street", true);
    testingLabStreet2 = getValue(rawRow, "testing_lab_street2", false);
    testingLabCity = getValue(rawRow, "testing_lab_city", true);
    testingLabState = getValue(rawRow, "testing_lab_state", true);
    testingLabZipCode = getValue(rawRow, "testing_lab_zip_code", true);
    testingLabPhoneNumber = getValue(rawRow, "testing_lab_phone_number", false);
    pregnant = getValue(rawRow, "pregnant", false);
    employedInHealthcare = getValue(rawRow, "employed_in_healthcare", false);
    symptomaticForDisease = getValue(rawRow, "symptomatic_for_disease", false);
    illnessOnsetDate = getValue(rawRow, "illness_onset_date", false);
    residentCongregateSetting = getValue(rawRow, "resident_congregate_setting", false);
    residenceType = getValue(rawRow, "residence_type", false);
    hospitalized = getValue(rawRow, "hospitalized", false);
    icu = getValue(rawRow, "icu", false);
    orderingFacilityName = getValue(rawRow, "ordering_facility_name", false);
    orderingFacilityStreet = getValue(rawRow, "ordering_facility_street", false);
    orderingFacilityStreet2 = getValue(rawRow, "ordering_facility_street2", false);
    orderingFacilityCity = getValue(rawRow, "ordering_facility_city", false);
    orderingFacilityState = getValue(rawRow, "ordering_facility_state", false);
    orderingFacilityZipCode = getValue(rawRow, "ordering_facility_zip_code", false);
    orderingFacilityPhoneNumber = getValue(rawRow, "ordering_facility_phone_number", false);
    comment = getValue(rawRow, "comment", false);
    testResultStatus = getValue(rawRow, "test_result_status", false);
  }

  @Override
  public List<FeedbackMessage> validateRequiredFields() {
    List<ValueOrError> allFields =
        List.of(
            patientId,
            patientLastName,
            patientFirstName,
            patientMiddleName,
            patientStreet,
            patientStreet2,
            patientCity,
            patientState,
            patientZipCode,
            patientCounty,
            patientPhoneNumber,
            patientDob,
            patientGender,
            patientRace,
            patientEthnicity,
            patientPreferredLanguage,
            patientEmail,
            accessionNumber,
            equipmentModelName,
            testPerformedCode,
            testResult,
            orderTestDate,
            specimenCollectionDate,
            testingLabSpecimenReceivedDate,
            testResultDate,
            dateResultReleased,
            specimenType,
            orderingProviderId,
            orderingProviderLastName,
            orderingProviderFirstName,
            orderingProviderMiddleName,
            orderingProviderStreet,
            orderingProviderStreet2,
            orderingProviderCity,
            orderingProviderState,
            orderingProviderZipCode,
            orderingProviderPhoneNumber,
            testingLabClia,
            testingLabName,
            testingLabStreet,
            testingLabStreet2,
            testingLabCity,
            testingLabState,
            testingLabZipCode,
            testingLabPhoneNumber,
            pregnant,
            employedInHealthcare,
            symptomaticForDisease,
            illnessOnsetDate,
            residentCongregateSetting,
            residenceType,
            hospitalized,
            icu,
            orderingFacilityName,
            orderingFacilityStreet,
            orderingFacilityStreet2,
            orderingFacilityCity,
            orderingFacilityState,
            orderingFacilityZipCode,
            orderingFacilityPhoneNumber,
            comment,
            testResultStatus);
    List<FeedbackMessage> errors = new ArrayList<>();
    allFields.forEach(field -> errors.addAll(field.getPossibleError()));
    return errors;
  }

  @Override
  public List<FeedbackMessage> validateIndividualValues() {
    var errors = new ArrayList<FeedbackMessage>();
    errors.addAll(validateState(patientState));
    errors.addAll(validateState(orderingProviderState));
    errors.addAll(validateState(testingLabState));
    errors.addAll(validateState(orderingFacilityState));

    errors.addAll(validateZipCode(patientZipCode));
    errors.addAll(validateZipCode(orderingProviderZipCode));
    errors.addAll(validateZipCode(testingLabZipCode));
    errors.addAll(validateZipCode(orderingFacilityZipCode));

    errors.addAll(validatePhoneNumber(patientPhoneNumber));
    errors.addAll(validatePhoneNumber(orderingProviderPhoneNumber));
    errors.addAll(validatePhoneNumber(testingLabPhoneNumber));
    errors.addAll(validatePhoneNumber(orderingFacilityPhoneNumber));

    errors.addAll(validateDateFormat(patientDob));
    errors.addAll(validateDateFormat(illnessOnsetDate));

    errors.addAll(validateDateTime(orderTestDate));
    errors.addAll(validateDateTime(specimenCollectionDate));
    errors.addAll(validateDateTime(testingLabSpecimenReceivedDate));
    errors.addAll(validateDateTime(testResultDate));
    errors.addAll(validateDateTime(dateResultReleased));

    errors.addAll(validateEmail(patientEmail));
    errors.addAll(validateRace(patientRace));
    errors.addAll(validateBiologicalSex(patientGender));
    errors.addAll(validateEthnicity(patientEthnicity));

    errors.addAll(validateYesNoAnswer(pregnant));
    errors.addAll(validateYesNoAnswer(employedInHealthcare));
    errors.addAll(validateYesNoAnswer(symptomaticForDisease));
    errors.addAll(validateYesNoAnswer(residentCongregateSetting));
    errors.addAll(validateYesNoAnswer(hospitalized));
    errors.addAll(validateYesNoAnswer(icu));
    errors.addAll(validateResidence(residenceType));

    errors.addAll(validateTestResult(testResult));
    errors.addAll(validateTestResultStatus(testResultStatus));
    errors.addAll(validateSpecimenType(specimenType));

    errors.addAll(validateClia(testingLabClia));

    return errors;
  }
}
