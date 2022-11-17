package gov.cdc.usds.simplereport.validators;

import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.ValueOrError;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getIteratorForCsv;
import static gov.cdc.usds.simplereport.validators.CsvValidatorUtils.getNextRow;
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

import com.fasterxml.jackson.databind.MappingIterator;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class TestResultFileValidator {

  public List<FeedbackMessage> validate(InputStream csvStream) {

    final MappingIterator<Map<String, String>> valueIterator = getIteratorForCsv(csvStream);

    if (!valueIterator.hasNext()) {
      throw new IllegalArgumentException("Empty or invalid CSV submitted");
    }

    var mapOfErrors = new HashMap<String, FeedbackMessage>();
    var currentRow = 1;

    while (valueIterator.hasNext()) {
      final Map<String, String> row;
      try {
        row = getNextRow(valueIterator);
      } catch (CsvProcessingException ex) {
        log.error("Unable to parse test result csv.", ex);
        var feedback =
            new FeedbackMessage(
                CsvValidatorUtils.REPORT_SCOPE,
                "File has the incorrect number of columns or empty rows. Please make sure all columns match the data template, and delete any empty rows.",
                List.of(ex.getLineNumber()));
        mapOfErrors.put(feedback.getMessage(), feedback);
        break;
      }
      var currentRowErrors = new ArrayList<FeedbackMessage>();

      TestResultRow extractedData = new TestResultRow(row);

      // validate headers
      currentRowErrors.addAll(extractedData.validateHeaders());

      // validate individual values
      currentRowErrors.addAll(validateState(extractedData.getPatientState()));
      currentRowErrors.addAll(validateState(extractedData.getOrderingProviderState()));
      currentRowErrors.addAll(validateState(extractedData.getTestingLabState()));
      currentRowErrors.addAll(validateState(extractedData.getOrderingFacilityState()));

      currentRowErrors.addAll(validateZipCode(extractedData.getPatientZipCode()));
      currentRowErrors.addAll(validateZipCode(extractedData.getOrderingProviderZipCode()));
      currentRowErrors.addAll(validateZipCode(extractedData.getTestingLabZipCode()));
      currentRowErrors.addAll(validateZipCode(extractedData.getOrderingFacilityZipCode()));

      currentRowErrors.addAll(validatePhoneNumber(extractedData.getPatientPhoneNumber()));
      currentRowErrors.addAll(validatePhoneNumber(extractedData.getOrderingProviderPhoneNumber()));
      currentRowErrors.addAll(validatePhoneNumber(extractedData.getTestingLabPhoneNumber()));
      currentRowErrors.addAll(validatePhoneNumber(extractedData.getOrderingFacilityPhoneNumber()));

      currentRowErrors.addAll(validateDateFormat(extractedData.getPatientDob()));
      currentRowErrors.addAll(validateDateFormat(extractedData.getIllnessOnsetDate()));

      currentRowErrors.addAll(validateDateTime(extractedData.getOrderTestDate()));
      currentRowErrors.addAll(validateDateTime(extractedData.getSpecimenCollectionDate()));
      currentRowErrors.addAll(validateDateTime(extractedData.getTestingLabSpecimenReceivedDate()));
      currentRowErrors.addAll(validateDateTime(extractedData.getTestResultDate()));
      currentRowErrors.addAll(validateDateTime(extractedData.getDateResultReleased()));

      currentRowErrors.addAll(validateEmail(extractedData.getPatientEmail()));
      currentRowErrors.addAll(validateRace(extractedData.getPatientRace()));
      currentRowErrors.addAll(validateBiologicalSex(extractedData.getPatientGender()));
      currentRowErrors.addAll(validateEthnicity(extractedData.getPatientEthnicity()));

      currentRowErrors.addAll(validateYesNoAnswer(extractedData.getPregnant()));
      currentRowErrors.addAll(validateYesNoAnswer(extractedData.getEmployedInHealthcare()));
      currentRowErrors.addAll(validateYesNoAnswer(extractedData.getSymptomaticForDisease()));
      currentRowErrors.addAll(validateYesNoAnswer(extractedData.getResidentCongregateSetting()));
      currentRowErrors.addAll(validateYesNoAnswer(extractedData.getHospitalized()));
      currentRowErrors.addAll(validateYesNoAnswer(extractedData.getIcu()));
      currentRowErrors.addAll(validateResidence(extractedData.getResidenceType()));

      currentRowErrors.addAll(validateTestResult(extractedData.getTestResult()));
      currentRowErrors.addAll(validateTestResultStatus(extractedData.getTestResultStatus()));
      currentRowErrors.addAll(validateSpecimenType(extractedData.getSpecimenType()));

      currentRowErrors.addAll(validateClia(extractedData.getTestingLabClia()));

      final var finalCurrentRow = currentRow;
      currentRowErrors.forEach(
          error -> error.setIndices(new ArrayList<>(List.of(finalCurrentRow))));

      currentRowErrors.forEach(
          error ->
              mapOfErrors.merge(
                  error.getMessage(),
                  error,
                  (e1, e2) -> {
                    e1.getIndices().addAll(e2.getIndices());
                    return e1;
                  }));

      currentRow++;
    }

    var errors = new ArrayList<>(mapOfErrors.values());
    errors.sort(Comparator.comparingInt(e -> e.getIndices().get(0)));
    return errors;
  }

  @Getter
  public static class TestResultRow {
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
      testingLabSpecimenReceivedDate =
          getValue(rawRow, "testing_lab_specimen_received_date", false);
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

    private List<FeedbackMessage> validateHeaders() {
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
      List<FeedbackMessage> rowErrors = new ArrayList<>();
      allFields.forEach(field -> rowErrors.addAll(field.getPossibleError()));
      return rowErrors;
    }
  }
}
