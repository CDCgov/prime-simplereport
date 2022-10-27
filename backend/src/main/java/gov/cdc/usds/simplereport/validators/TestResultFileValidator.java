package gov.cdc.usds.simplereport.validators;

import static gov.cdc.usds.simplereport.api.Translators.CANADIAN_STATE_CODES;
import static gov.cdc.usds.simplereport.api.Translators.STATE_CODES;

import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.databind.RuntimeJsonMappingException;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvParser;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import lombok.Getter;
import org.springframework.stereotype.Component;

@Component
public class TestResultFileValidator {

  private static final String ZIP_CODE_REGEX = "^[0-9]{5}(?:-[0-9]{4})?$";

  /// 000-000-0000
  private static final String PHONE_NUMBER_REGEX = "^[1-9]\\d{2}-\\d{3}-\\d{4}$";

  // MM/DD/YYYY OR M/D/YYYY
  private static final String DATE_REGEX = "^\\d{1,2}\\/\\d{1,2}\\/\\d{4}$";

  // MM/DD/YYYY HH:mm, MM/DD/YYYY H:mm, M/D/YYYY HH:mm OR M/D/YYYY H:mm
  private static final String DATE_TIME_REGEX =
      "^\\d{1,2}\\/\\d{1,2}\\/\\d{4}( ([0-1]?[0-9]|2[0-3]):[0-5][0-9])?$";
  private static final String EMAIL_REGEX = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$";
  private static final String CLIA_REGEX = "^[A-Za-z0-9]{2}[Dd][A-Za-z0-9]{7}$";
  private static final String ALPHABET_REGEX = "^[a-zA-Z]+$";
  private static final Set<String> VALID_STATE_CODES = new HashSet<>();
  private static final Set<String> GENDER_VALUES =
      Set.of(
          "m", "male",
          "f", "female",
          "o", "other",
          "u", "unknown",
          "a", "ambiguous",
          "n", "not applicable");
  private static final Set<String> ETHNICITY_VALUES =
      Set.of(
          "2135-2", "hispanic or latino",
          "2186-5", "not hispanic or latino",
          "unk", "unknown");
  private static final Set<String> RACE_VALUES =
      Set.of(
          "1002-5", "american indian or alaska native",
          "2028-9", "asian",
          "2054-5", "black or african american",
          "2076-8", "native hawaiian or other pacific islander",
          "2106-3", "white",
          "2131-1", "other",
          "asku", "ask but unknown",
          "unk", "unknown");
  private static final Set<String> YES_NO_VALUES =
      Set.of(
          "y", "yes",
          "n", "no",
          "u", "unk");
  private static final Set<String> TEST_RESULT_VALUES =
      Set.of("positive", "negative", "not detected", "detected", "invalid result");
  private static final Set<String> SPECIMEN_TYPE_VALUES =
      Set.of(
          "nasal swab",
          "nasopharyngeal swab",
          "anterior nares swab",
          "throat swab",
          "oropharyngeal swab",
          "whole blood",
          "plasma",
          "serum");
  private static final Set<String> RESIDENCE_VALUES =
      Set.of(
          "22232009", "hospital",
          "2081004", "hospital ship",
          "32074000", "long term care hospital",
          "224929004", "secure hospital",
          "42665001", "nursing home",
          "30629002", "retirement home",
          "74056004", "orphanage",
          "722173008", "prison-based care site",
          "20078004", "substance abuse treatment center",
          "257573002", "boarding house",
          "224683003", "military accommodation",
          "284546000", "hospice",
          "257628001", "hostel",
          "310207003", "sheltered housing",
          "57656006", "penal institution",
          "285113009", "religious institutional residence",
          "285141008", "work (environment)",
          "32911000", "homeless");
  private static final Set<String> TEST_RESULT_STATUS_VALUES = Set.of("f", "c");
  private static final String ITEM_SCOPE = "item";
  private static final String REPORT_SCOPE = "report";

  public TestResultFileValidator() {
    VALID_STATE_CODES.addAll(
        STATE_CODES.stream().map(String::toLowerCase).collect(Collectors.toList()));
    VALID_STATE_CODES.addAll(
        CANADIAN_STATE_CODES.stream().map(String::toLowerCase).collect(Collectors.toList()));
  }

  public List<FeedbackMessage> validate(InputStream csvStream) {
    final MappingIterator<Map<String, String>> valueIterator = getIteratorForCsv(csvStream);

    if (!valueIterator.hasNext()) {
      throw new IllegalArgumentException("Empty or invalid CSV submitted");
    }

    List<FeedbackMessage> errors = new ArrayList<>();

    while (valueIterator.hasNext() && errors.isEmpty()) {
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
      ValueOrError orderingProviderFirstName = getValue(row, "ordering_provider_first_name", true);
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
      ValueOrError residentCongregateSetting = getValue(row, "resident_congregate_setting", false);
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
      errors.addAll(validateGender(patientGender));
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

    return errors;
  }

  private List<FeedbackMessage> validateTestResult(ValueOrError input) {
    return validateSpecificValueOrSNOMED(input, TEST_RESULT_VALUES);
  }

  private List<FeedbackMessage> validateSpecimenType(ValueOrError input) {
    return validateSpecificValueOrSNOMED(input, SPECIMEN_TYPE_VALUES);
  }

  private List<FeedbackMessage> validateSpecificValueOrSNOMED(
      ValueOrError input, Set<String> acceptableValues) {
    List<FeedbackMessage> errors = new ArrayList<>();
    String value = parseString(input.getValue());
    if (value == null) {
      return errors;
    }
    boolean nonSNOMEDValue = value.matches(ALPHABET_REGEX);
    if (nonSNOMEDValue) {
      return validateInSet(input, acceptableValues);
    }
    return errors;
  }

  private List<FeedbackMessage> validateResidence(ValueOrError input) {
    return validateInSet(input, RESIDENCE_VALUES);
  }

  private List<FeedbackMessage> validateYesNoAnswer(ValueOrError input) {
    return validateInSet(input, YES_NO_VALUES);
  }

  private List<FeedbackMessage> validateEthnicity(ValueOrError input) {
    return validateInSet(input, ETHNICITY_VALUES);
  }

  private List<FeedbackMessage> validateRace(ValueOrError input) {
    return validateInSet(input, RACE_VALUES);
  }

  private List<FeedbackMessage> validateGender(ValueOrError input) {
    return validateInSet(input, GENDER_VALUES);
  }

  private List<FeedbackMessage> validateState(ValueOrError input) {
    return validateInSet(input, VALID_STATE_CODES);
  }

  private List<FeedbackMessage> validateTestResultStatus(ValueOrError input) {
    return validateInSet(input, TEST_RESULT_STATUS_VALUES);
  }

  private List<FeedbackMessage> validateZipCode(ValueOrError input) {
    return validateRegex(input, ZIP_CODE_REGEX);
  }

  private List<FeedbackMessage> validatePhoneNumber(ValueOrError input) {
    return validateRegex(input, PHONE_NUMBER_REGEX);
  }

  private List<FeedbackMessage> validateClia(ValueOrError input) {
    return validateRegex(input, CLIA_REGEX);
  }

  private List<FeedbackMessage> validateDate(ValueOrError input) {
    return validateRegex(input, DATE_REGEX);
  }

  private List<FeedbackMessage> validateDateTime(ValueOrError input) {
    return validateRegex(input, DATE_TIME_REGEX);
  }

  private List<FeedbackMessage> validateEmail(ValueOrError input) {
    return validateRegex(input, EMAIL_REGEX);
  }

  private List<FeedbackMessage> validateRegex(ValueOrError input, String regex) {
    List<FeedbackMessage> errors = new ArrayList<>();
    String value = parseString(input.getValue());
    if (value == null) {
      return errors;
    }
    if (!value.matches(regex)) {
      errors.add(
          new FeedbackMessage(
              ITEM_SCOPE,
              input.getValue() + " is not a valid value for column " + input.getHeader()));
    }
    return errors;
  }

  private List<FeedbackMessage> validateInSet(ValueOrError input, Set<String> acceptableValues) {
    List<FeedbackMessage> errors = new ArrayList<>();
    String value = parseString(input.getValue());
    if (value == null) {
      return errors;
    }
    if (!acceptableValues.contains(value.toLowerCase())) {
      errors.add(
          new FeedbackMessage(
              ITEM_SCOPE,
              input.getValue() + " is not an acceptable value for column " + input.getHeader()));
    }
    return errors;
  }

  private String parseString(String value) {
    if (value == null || "".equals(value)) {
      return null;
    }
    return value.trim();
  }

  private Map<String, String> getNextRow(MappingIterator<Map<String, String>> valueIterator)
      throws IllegalArgumentException {
    try {
      return valueIterator.next();
    } catch (RuntimeJsonMappingException e) {
      throw new IllegalArgumentException(e.getMessage());
    }
  }

  private ValueOrError getValue(Map<String, String> row, String name, boolean isRequired) {
    String value = row.get(name);
    if (isRequired && (value == null || value.trim().isEmpty())) {
      return new ValueOrError(new FeedbackMessage(REPORT_SCOPE, name + " is a required column."));
    }
    return new ValueOrError(value, name);
  }

  private MappingIterator<Map<String, String>> getIteratorForCsv(InputStream csvStream)
      throws IllegalArgumentException {
    try {
      BufferedReader csvStreamBuffered =
          new BufferedReader(new InputStreamReader(csvStream, StandardCharsets.UTF_8));

      return new CsvMapper()
          .enable(CsvParser.Feature.FAIL_ON_MISSING_COLUMNS)
          .readerFor(Map.class)
          .with(CsvSchema.builder().setUseHeader(true).build())
          .readValues(csvStreamBuffered);
    } catch (IOException e) {
      throw new IllegalArgumentException(e.getMessage());
    }
  }

  @Getter
  private static class ValueOrError {
    private final List<FeedbackMessage> error;
    private final String value;
    private final String header;

    public ValueOrError(String value, String header) {
      this.value = value;
      this.error = Collections.emptyList();
      this.header = header;
    }

    public ValueOrError(FeedbackMessage error) {
      this.value = null;
      this.header = null;
      this.error = List.of(error);
    }

    public List<FeedbackMessage> getPossibleError() {
      return this.error;
    }
  }
}
