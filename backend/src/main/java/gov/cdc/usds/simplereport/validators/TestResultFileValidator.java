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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;

@Component
public class TestResultFileValidator {

  public static final String ZIP_CODE_REGEX = "^[0-9]{5}(?:-[0-9]{4})?$";

  /// 000-000-0000
  public static final String PHONE_NUMBER_REGEX = "^[1-9]\\d{2}-\\d{3}-\\d{4}$";

  // MM/DD/YYYY OR M/D/YYYY
  public static final String DATE_REGEX = "^\\d{1,2}\\/\\d{1,2}\\/\\d{4}$";

  // MM/DD/YYYY HH:mm, MM/DD/YYYY H:mm, M/D/YYYY HH:mm OR M/D/YYYY H:mm
  public static final String DATE_TIME_REGEX =
      "^\\d{1,2}\\/\\d{1,2}\\/\\d{4}( ([0-1]?[0-9]|2[0-3]):[0-5][0-9])?$";
  public static final String EMAIL_REGEX = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$";

  private final Set<String> VALID_STATE_CODES = new HashSet<>();

  private final Set<String> GENDER_VALUES =
      Set.of(
          "M", "Male",
          "F", "Female",
          "O", "Other",
          "U", "Unknown",
          "A", "Ambiguous",
          "N", "Not applicable");

  private final Set<String> ETHNICITY_VALUES =
      Set.of(
          "2135-2", "Hispanic or Latino",
          "2186-5", "Not Hispanic or Latino",
          "UNK", "Unknown");

  private final Set<String> RACE_VALUES =
      Set.of(
          "1002-5", "American Indian or Alaska Native",
          "2028-9", "Asian",
          "2054-5", "Black or African American",
          "2076-8", "Native Hawaiian or Other Pacific Islander",
          "2106-3", "White",
          "2131-1", "Other",
          "ASKU", "Ask but unknown",
          "UNK", "Unknown");

  private final Set<String> YES_NO_VALUES =
      Set.of(
          "Y", "YES",
          "N", "NO",
          "U", "UNK");

  private final Set<String> RESIDENCE_VALUES =
      Set.of(
          "22232009", "Hospital",
          "2081004", "Hospital Ship",
          "32074000", "Long Term Care Hospital",
          "224929004", "Secure Hospital",
          "42665001", "Nursing Home",
          "30629002", "Retirement Home",
          "74056004", "Orphanage",
          "722173008", "Prison-based Care Site",
          "20078004", "Substance Abuse Treatment Center",
          "257573002", "Boarding House",
          "224683003", "Military Accommodation",
          "284546000", "Hospice",
          "257628001", "Hostel",
          "310207003", "Sheltered Housing",
          "57656006", "Penal Institution",
          "285113009", "Religious Institutional Residence",
          "285141008", "Work (environment)",
          "32911000", "Homeless");

  private final Set<String> TEST_RESULT_STATUS_VALUES = Set.of("F", "C");

  public TestResultFileValidator() {
    VALID_STATE_CODES.addAll(STATE_CODES);
    VALID_STATE_CODES.addAll(CANADIAN_STATE_CODES);
  }

  public boolean validateHeaders(InputStream csvStream) {
    final MappingIterator<Map<String, String>> valueIterator = getIteratorForCsv(csvStream);

    if (!valueIterator.hasNext()) {
      throw new IllegalArgumentException("Empty or invalid CSV submitted");
    }

    while (valueIterator.hasNext()) {
      final Map<String, String> row = getNextRow(valueIterator);

      String patientId = getValue(row, "patient_id", false);
      String patientLastName = getValue(row, "patient_last_name", true);
      String patientFirstName = getValue(row, "patient_first_name", true);
      String patientMiddleName = getValue(row, "patient_middle_name", false);
      String patientStreet = getValue(row, "patient_street", true);
      String patientStreet2 = getValue(row, "patient_street2", false);
      String patientCity = getValue(row, "patient_city", true);
      String patientState = getValue(row, "patient_state", true);
      String patientZipCode = getValue(row, "patient_zip_code", true);
      String patientCounty = getValue(row, "patient_county", true);
      String patientPhoneNumber = getValue(row, "patient_phone_number", true);
      String patientDob = getValue(row, "patient_dob", true);
      String patientGender = getValue(row, "patient_gender", true);
      String patientRace = getValue(row, "patient_race", true);
      String patientEthnicity = getValue(row, "patient_ethnicity", true);
      String patientPreferredLanguage = getValue(row, "patient_preferred_language", false);
      String patientEmail = getValue(row, "patient_email", false);
      String accessionNumber = getValue(row, "accession_number", true);
      String equipmentModelName = getValue(row, "equipment_model_name", true);
      String testPerformedCode = getValue(row, "test_performed_code", true);
      String testResult = getValue(row, "test_result", true);
      String orderTestDate = getValue(row, "order_test_date", true);
      String specimenCollectionDate = getValue(row, "specimen_collection_date", true);
      String testingLabSpecimenReceivedDate =
          getValue(row, "testing_lab_specimen_received_date", true);
      String testResultDate = getValue(row, "test_result_date", true);
      String dateResultReleased = getValue(row, "date_result_released", true);
      String specimenType = getValue(row, "specimen_type", true);
      String orderingProviderId = getValue(row, "ordering_provider_id", true);
      String orderingProviderLastName = getValue(row, "ordering_provider_last_name", true);
      String orderingProviderFirstName = getValue(row, "ordering_provider_first_name", true);
      String orderingProviderMiddleName = getValue(row, "ordering_provider_middle_name", false);
      String orderingProviderStreet = getValue(row, "ordering_provider_street", true);
      String orderingProviderStreet2 = getValue(row, "ordering_provider_street2", false);
      String orderingProviderCity = getValue(row, "ordering_provider_city", true);
      String orderingProviderState = getValue(row, "ordering_provider_state", true);
      String orderingProviderZipCode = getValue(row, "ordering_provider_zip_code", true);
      String orderingProviderPhoneNumber = getValue(row, "ordering_provider_phone_number", true);
      String testingLabClia = getValue(row, "testing_lab_clia", true);
      String testingLabName = getValue(row, "testing_lab_name", true);
      String testingLabStreet = getValue(row, "testing_lab_street", true);
      String testingLabStreet2 = getValue(row, "testing_lab_street2", false);
      String testingLabCity = getValue(row, "testing_lab_city", true);
      String testingLabState = getValue(row, "testing_lab_state", true);
      String testingLabZipCode = getValue(row, "testing_lab_zip_code", true);
      String testingLabPhoneNumber = getValue(row, "testing_lab_phone_number", false);
      String pregnant = getValue(row, "pregnant", false);
      String employedInHealthcare = getValue(row, "employed_in_healthcare", false);
      String symptomaticForDisease = getValue(row, "symptomatic_for_disease", false);
      String illnessOnsetDate = getValue(row, "illness_onset_date", false);
      String residentCongregateSetting = getValue(row, "resident_congregate_setting", false);
      String residenceType = getValue(row, "residence_type", false);
      String hospitalized = getValue(row, "hospitalized", false);
      String icu = getValue(row, "icu", false);
      String orderingFacilityName = getValue(row, "ordering_facility_name", true);
      String orderingFacilityStreet = getValue(row, "ordering_facility_street", true);
      String orderingFacilityStreet2 = getValue(row, "ordering_facility_street2", false);
      String orderingFacilityCity = getValue(row, "ordering_facility_city", true);
      String orderingFacilityState = getValue(row, "ordering_facility_state", true);
      String orderingFacilityZipCode = getValue(row, "ordering_facility_zip_code", true);
      String orderingFacilityPhoneNumber = getValue(row, "ordering_facility_phone_number", true);
      String comment = getValue(row, "comment", false);
      String testResultStatus = getValue(row, "test_result_status", false);
      String reportingFacilityName = getValue(row, "reporting_facility_name", true);
      String reportingFacilityClia = getValue(row, "reporting_facility_clia", true);

      List<FeedbackMessage> errors = new ArrayList<>();

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
      errors.addAll(validateTestResultStatus(testResultStatus));
    }

    return true;
  }

  private List<FeedbackMessage> validateResidence(String input) {
    return validateInSet(input, RESIDENCE_VALUES, "residence type");
  }

  private List<FeedbackMessage> validateYesNoAnswer(String input) {
    return validateInSet(input, YES_NO_VALUES, "value");
  }

  private List<FeedbackMessage> validateEthnicity(String input) {
    return validateInSet(input, ETHNICITY_VALUES, "race");
  }

  private List<FeedbackMessage> validateRace(String input) {
    return validateInSet(input, RACE_VALUES, "race");
  }

  private List<FeedbackMessage> validateGender(String input) {
    return validateInSet(input, GENDER_VALUES, "gender");
  }

  private List<FeedbackMessage> validateState(String input) {
    return validateInSet(input, VALID_STATE_CODES, "state");
  }

  private List<FeedbackMessage> validateTestResultStatus(String input) {
    return validateInSet(input, TEST_RESULT_STATUS_VALUES, "test result status");
  }

  private List<FeedbackMessage> validateZipCode(String input) {
    return validateRegex(input, ZIP_CODE_REGEX, "zipcode");
  }

  public List<FeedbackMessage> validatePhoneNumber(String input) {
    return validateRegex(input, PHONE_NUMBER_REGEX, "phone number");
  }

  private List<FeedbackMessage> validateDate(String input) {
    return validateRegex(input, DATE_REGEX, "date");
  }

  private List<FeedbackMessage> validateDateTime(String input) {
    return validateRegex(input, DATE_TIME_REGEX, "date or datetime");
  }

  private List<FeedbackMessage> validateEmail(String input) {
    return validateRegex(input, EMAIL_REGEX, "email");
  }

  private List<FeedbackMessage> validateRegex(String input, String regex, String type) {
    List<FeedbackMessage> errors = new ArrayList<>();
    String value = parseString(input);
    if (value == null) {
      return errors;
    }
    if (!value.matches(regex)) {
      errors.add(new FeedbackMessage("error", input + " is not a recognized " + type));
    }
    return errors;
  }

  private List<FeedbackMessage> validateInSet(
      String input, Set<String> acceptableValues, String type) {
    List<FeedbackMessage> errors = new ArrayList<>();
    String value = parseString(input);
    if (value == null) {
      return errors;
    }
    if (!acceptableValues.contains(value.toUpperCase())) {
      errors.add(new FeedbackMessage("error", input + " is not a recognized " + type));
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

  public String getValue(Map<String, String> row, String name, boolean isRequired) {
    String value = row.get(name);
    if (isRequired && (value == null || value.trim().isEmpty())) {
      throw new IllegalArgumentException(name + " is required.");
    }
    return value;
  }

  private MappingIterator<Map<String, String>> getIteratorForCsv(InputStream csvStream)
      throws IllegalArgumentException {
    try {
      BufferedReader csvStreamBuffered =
          new BufferedReader(new InputStreamReader(csvStream, StandardCharsets.UTF_8));

      return new CsvMapper()
          .enable(CsvParser.Feature.FAIL_ON_MISSING_COLUMNS)
          .readerFor(Map.class)
          .with(resultSchema(false))
          .readValues(csvStreamBuffered);
    } catch (IOException e) {
      throw new IllegalArgumentException(e.getMessage());
    }
  }

  private CsvSchema resultSchema(boolean hasHeaderRow) {
    // using both addColumn and setUseHeader() causes offset issues (columns don't align). use one
    // or the other.

    if (hasHeaderRow) {
      return CsvSchema.builder().setUseHeader(true).build();
    } else {
      // Sequence order matters
      return CsvSchema.builder()
          .setUseHeader(true) // no valid header row detected
          .build();
    }
  }
}
