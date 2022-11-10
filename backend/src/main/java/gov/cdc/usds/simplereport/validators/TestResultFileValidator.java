package gov.cdc.usds.simplereport.validators;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getValue;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateBiologicalSex;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateClia;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.validateDate;
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

import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class TestResultFileValidator {

  public List<FeedbackMessage> validate(InputStream csvStream) {
    List<FeedbackMessage> errors = new ArrayList<>();

    try {
      final MappingIterator<Map<String, String>> valueIterator = getIteratorForCsv(csvStream);

      if (!valueIterator.hasNext()) {
        throw new IllegalArgumentException("Empty or invalid CSV submitted");
      }

      while (valueIterator.hasNext()) {
        final Map<String, String> row = getNextRow(valueIterator);

        ValueOrError patientId = getValue(row, "patient_id", false);
        ValueOrError patientLastName = getValue(row, "patient_last_name", true);
        ValueOrError patientFirstName = getValue(row, "patient_first_name", true);
        ValueOrError patientMiddleName = getValue(row, "patient_middle_name", false);
        ValueOrError patientStreet = getValue(row, "patient_street", true);
        ValueOrError patientStreet2 = getValue(row, "patient_street2", false);
        ValueOrError patientCity = getValue(row, "patient_city", true);
        ValueOrError patientState = getValue(row, "patient_state", true);
        ValueOrError patientZipCode = getValue(row, "patient_zip_code", true);
        ValueOrError patientCounty = getValue(row, "patient_county", true);
        ValueOrError patientPhoneNumber = getValue(row, "patient_phone_number", true);
        ValueOrError patientDob = getValue(row, "patient_dob", true);
        ValueOrError patientGender = getValue(row, "patient_gender", true);
        ValueOrError patientRace = getValue(row, "patient_race", true);
        ValueOrError patientEthnicity = getValue(row, "patient_ethnicity", true);
        ValueOrError patientPreferredLanguage = getValue(row, "patient_preferred_language", false);
        ValueOrError patientEmail = getValue(row, "patient_email", false);
        ValueOrError accessionNumber = getValue(row, "accession_number", true);
        ValueOrError equipmentModelName = getValue(row, "equipment_model_name", true);
        ValueOrError testPerformedCode = getValue(row, "test_performed_code", true);
        ValueOrError testResult = getValue(row, "test_result", true);
        ValueOrError orderTestDate = getValue(row, "order_test_date", true);
        ValueOrError specimenCollectionDate = getValue(row, "specimen_collection_date", false);
        ValueOrError testingLabSpecimenReceivedDate =
            getValue(row, "testing_lab_specimen_received_date", false);
        ValueOrError testResultDate = getValue(row, "test_result_date", true);
        ValueOrError dateResultReleased = getValue(row, "date_result_released", false);
        ValueOrError specimenType = getValue(row, "specimen_type", true);
        ValueOrError orderingProviderId = getValue(row, "ordering_provider_id", true);
        ValueOrError orderingProviderLastName = getValue(row, "ordering_provider_last_name", true);
        ValueOrError orderingProviderFirstName =
            getValue(row, "ordering_provider_first_name", true);
        ValueOrError orderingProviderMiddleName =
            getValue(row, "ordering_provider_middle_name", false);
        ValueOrError orderingProviderStreet = getValue(row, "ordering_provider_street", true);
        ValueOrError orderingProviderStreet2 = getValue(row, "ordering_provider_street2", false);
        ValueOrError orderingProviderCity = getValue(row, "ordering_provider_city", true);
        ValueOrError orderingProviderState = getValue(row, "ordering_provider_state", true);
        ValueOrError orderingProviderZipCode = getValue(row, "ordering_provider_zip_code", true);
        ValueOrError orderingProviderPhoneNumber =
            getValue(row, "ordering_provider_phone_number", true);
        ValueOrError testingLabClia = getValue(row, "testing_lab_clia", true);
        ValueOrError testingLabName = getValue(row, "testing_lab_name", true);
        ValueOrError testingLabStreet = getValue(row, "testing_lab_street", true);
        ValueOrError testingLabStreet2 = getValue(row, "testing_lab_street2", false);
        ValueOrError testingLabCity = getValue(row, "testing_lab_city", true);
        ValueOrError testingLabState = getValue(row, "testing_lab_state", true);
        ValueOrError testingLabZipCode = getValue(row, "testing_lab_zip_code", true);
        ValueOrError testingLabPhoneNumber = getValue(row, "testing_lab_phone_number", false);
        ValueOrError pregnant = getValue(row, "pregnant", false);
        ValueOrError employedInHealthcare = getValue(row, "employed_in_healthcare", false);
        ValueOrError symptomaticForDisease = getValue(row, "symptomatic_for_disease", false);
        ValueOrError illnessOnsetDate = getValue(row, "illness_onset_date", false);
        ValueOrError residentCongregateSetting =
            getValue(row, "resident_congregate_setting", false);
        ValueOrError residenceType = getValue(row, "residence_type", false);
        ValueOrError hospitalized = getValue(row, "hospitalized", false);
        ValueOrError icu = getValue(row, "icu", false);
        ValueOrError orderingFacilityName = getValue(row, "ordering_facility_name", false);
        ValueOrError orderingFacilityStreet = getValue(row, "ordering_facility_street", false);
        ValueOrError orderingFacilityStreet2 = getValue(row, "ordering_facility_street2", false);
        ValueOrError orderingFacilityCity = getValue(row, "ordering_facility_city", false);
        ValueOrError orderingFacilityState = getValue(row, "ordering_facility_state", false);
        ValueOrError orderingFacilityZipCode = getValue(row, "ordering_facility_zip_code", false);
        ValueOrError orderingFacilityPhoneNumber =
            getValue(row, "ordering_facility_phone_number", false);
        ValueOrError comment = getValue(row, "comment", false);
        ValueOrError testResultStatus = getValue(row, "test_result_status", false);

        // validate headers
        errors.addAll(patientId.getPossibleError());
        errors.addAll(patientLastName.getPossibleError());
        errors.addAll(patientFirstName.getPossibleError());
        errors.addAll(patientMiddleName.getPossibleError());
        errors.addAll(patientStreet.getPossibleError());
        errors.addAll(patientStreet2.getPossibleError());
        errors.addAll(patientCity.getPossibleError());
        errors.addAll(patientState.getPossibleError());
        errors.addAll(patientZipCode.getPossibleError());
        errors.addAll(patientCounty.getPossibleError());
        errors.addAll(patientPhoneNumber.getPossibleError());
        errors.addAll(patientDob.getPossibleError());
        errors.addAll(patientGender.getPossibleError());
        errors.addAll(patientRace.getPossibleError());
        errors.addAll(patientEthnicity.getPossibleError());
        errors.addAll(patientPreferredLanguage.getPossibleError());
        errors.addAll(patientEmail.getPossibleError());
        errors.addAll(accessionNumber.getPossibleError());
        errors.addAll(equipmentModelName.getPossibleError());
        errors.addAll(testPerformedCode.getPossibleError());
        errors.addAll(testResult.getPossibleError());
        errors.addAll(orderTestDate.getPossibleError());
        errors.addAll(specimenCollectionDate.getPossibleError());
        errors.addAll(testingLabSpecimenReceivedDate.getPossibleError());
        errors.addAll(testResultDate.getPossibleError());
        errors.addAll(dateResultReleased.getPossibleError());
        errors.addAll(specimenType.getPossibleError());
        errors.addAll(orderingProviderId.getPossibleError());
        errors.addAll(orderingProviderLastName.getPossibleError());
        errors.addAll(orderingProviderFirstName.getPossibleError());
        errors.addAll(orderingProviderMiddleName.getPossibleError());
        errors.addAll(orderingProviderStreet.getPossibleError());
        errors.addAll(orderingProviderStreet2.getPossibleError());
        errors.addAll(orderingProviderCity.getPossibleError());
        errors.addAll(orderingProviderState.getPossibleError());
        errors.addAll(orderingProviderZipCode.getPossibleError());
        errors.addAll(orderingProviderPhoneNumber.getPossibleError());
        errors.addAll(testingLabClia.getPossibleError());
        errors.addAll(testingLabName.getPossibleError());
        errors.addAll(testingLabStreet.getPossibleError());
        errors.addAll(testingLabStreet2.getPossibleError());
        errors.addAll(testingLabCity.getPossibleError());
        errors.addAll(testingLabState.getPossibleError());
        errors.addAll(testingLabZipCode.getPossibleError());
        errors.addAll(testingLabPhoneNumber.getPossibleError());
        errors.addAll(pregnant.getPossibleError());
        errors.addAll(employedInHealthcare.getPossibleError());
        errors.addAll(symptomaticForDisease.getPossibleError());
        errors.addAll(illnessOnsetDate.getPossibleError());
        errors.addAll(residentCongregateSetting.getPossibleError());
        errors.addAll(residenceType.getPossibleError());
        errors.addAll(hospitalized.getPossibleError());
        errors.addAll(icu.getPossibleError());
        errors.addAll(orderingFacilityName.getPossibleError());
        errors.addAll(orderingFacilityStreet.getPossibleError());
        errors.addAll(orderingFacilityStreet2.getPossibleError());
        errors.addAll(orderingFacilityCity.getPossibleError());
        errors.addAll(orderingFacilityState.getPossibleError());
        errors.addAll(orderingFacilityZipCode.getPossibleError());
        errors.addAll(orderingFacilityPhoneNumber.getPossibleError());
        errors.addAll(comment.getPossibleError());
        errors.addAll(testResultStatus.getPossibleError());

        // validate individual values
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

        errors.addAll(validateDate(patientDob));
        errors.addAll(validateDate(illnessOnsetDate));

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
      }
    } catch (CsvProcessingException ex) {
      log.error("Unable to parse test result csv.", ex);
      errors.add(
          new FeedbackMessage(
              CsvValidatorUtils.REPORT_SCOPE,
              "File has the incorrect number of columns or empty rows. Please make sure all columns match the data template, and delete any empty rows.",
              new int[] {ex.getLineNumber()}));
    }

    return errors;
  }
}
