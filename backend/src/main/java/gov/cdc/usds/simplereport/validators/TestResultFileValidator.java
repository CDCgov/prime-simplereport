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

      String patient_id = getValue(row, "patient_id", false);
      String patient_last_name = getValue(row, "patient_last_name", true);
      String patient_first_name = getValue(row, "patient_first_name", true);
      String patient_middle_name = getValue(row, "patient_middle_name", false);
      String patient_street = getValue(row, "patient_street", true);
      String patient_street2 = getValue(row, "patient_street2", false);
      String patient_city = getValue(row, "patient_city", true);
      String patient_state = getValue(row, "patient_state", true);
      String patient_zip_code = getValue(row, "patient_zip_code", true);
      String patient_county = getValue(row, "patient_county", true);
      String patient_phone_number = getValue(row, "patient_phone_number", true);
      String patient_dob = getValue(row, "patient_dob", true);
      String patient_gender = getValue(row, "patient_gender", true);
      String patient_race = getValue(row, "patient_race", true);
      String patient_ethnicity = getValue(row, "patient_ethnicity", true);
      String patient_preferred_language = getValue(row, "patient_preferred_language", false);
      String patient_email = getValue(row, "patient_email", false);
      String accession_number = getValue(row, "accession_number", true);
      String equipment_model_name = getValue(row, "equipment_model_name", true);
      String test_performed_code = getValue(row, "test_performed_code", true);
      String test_result = getValue(row, "test_result", true);
      String order_test_date = getValue(row, "order_test_date", true);
      String specimen_collection_date = getValue(row, "specimen_collection_date", true);
      String testing_lab_specimen_received_date =
          getValue(row, "testing_lab_specimen_received_date", true);
      String test_result_date = getValue(row, "test_result_date", true);
      String date_result_released = getValue(row, "date_result_released", true);
      String specimen_type = getValue(row, "specimen_type", true);
      String ordering_provider_id = getValue(row, "ordering_provider_id", true);
      String ordering_provider_last_name = getValue(row, "ordering_provider_last_name", true);
      String ordering_provider_first_name = getValue(row, "ordering_provider_first_name", true);
      String ordering_provider_middle_name = getValue(row, "ordering_provider_middle_name", false);
      String ordering_provider_street = getValue(row, "ordering_provider_street", true);
      String ordering_provider_street2 = getValue(row, "ordering_provider_street2", false);
      String ordering_provider_city = getValue(row, "ordering_provider_city", true);
      String ordering_provider_state = getValue(row, "ordering_provider_state", true);
      String ordering_provider_zip_code = getValue(row, "ordering_provider_zip_code", true);
      String ordering_provider_phone_number = getValue(row, "ordering_provider_phone_number", true);
      String testing_lab_clia = getValue(row, "testing_lab_clia", true);
      String testing_lab_name = getValue(row, "testing_lab_name", true);
      String testing_lab_street = getValue(row, "testing_lab_street", true);
      String testing_lab_street2 = getValue(row, "testing_lab_street2", false);
      String testing_lab_city = getValue(row, "testing_lab_city", true);
      String testing_lab_state = getValue(row, "testing_lab_state", true);
      String testing_lab_zip_code = getValue(row, "testing_lab_zip_code", true);
      String testing_lab_phone_number = getValue(row, "testing_lab_phone_number", false);
      String pregnant = getValue(row, "pregnant", false);
      String employed_in_healthcare = getValue(row, "employed_in_healthcare", false);
      String symptomatic_for_disease = getValue(row, "symptomatic_for_disease", false);
      String illness_onset_date = getValue(row, "illness_onset_date", false);
      String resident_congregate_setting = getValue(row, "resident_congregate_setting", false);
      String residence_type = getValue(row, "residence_type", false);
      String hospitalized = getValue(row, "hospitalized", false);
      String icu = getValue(row, "icu", false);
      String ordering_facility_name = getValue(row, "ordering_facility_name", true);
      String ordering_facility_street = getValue(row, "ordering_facility_street", true);
      String ordering_facility_street2 = getValue(row, "ordering_facility_street2", false);
      String ordering_facility_city = getValue(row, "ordering_facility_city", true);
      String ordering_facility_state = getValue(row, "ordering_facility_state", true);
      String ordering_facility_zip_code = getValue(row, "ordering_facility_zip_code", true);
      String ordering_facility_phone_number = getValue(row, "ordering_facility_phone_number", true);
      String comment = getValue(row, "comment", false);
      String test_result_status = getValue(row, "test_result_status", false);
      String reporting_facility_name = getValue(row, "reporting_facility_name", true);
      String reporting_facility_clia = getValue(row, "reporting_facility_clia", true);

      List<FeedbackMessage> errors = new ArrayList<>();

      errors.addAll(validateState(patient_state));
      errors.addAll(validateState(ordering_provider_state));
      errors.addAll(validateState(testing_lab_state));
      errors.addAll(validateState(ordering_facility_state));

      errors.addAll(validateZipCode(patient_zip_code));
      errors.addAll(validateZipCode(ordering_provider_zip_code));
      errors.addAll(validateZipCode(testing_lab_zip_code));
      errors.addAll(validateZipCode(ordering_facility_zip_code));

      errors.addAll(validatePhoneNumber(patient_phone_number));
      errors.addAll(validatePhoneNumber(ordering_provider_phone_number));
      errors.addAll(validatePhoneNumber(testing_lab_phone_number));
      errors.addAll(validatePhoneNumber(ordering_facility_phone_number));

      errors.addAll(validateDate(patient_dob));
      errors.addAll(validateDate(illness_onset_date));

      errors.addAll(validateDateTime(order_test_date));
      errors.addAll(validateDateTime(specimen_collection_date));
      errors.addAll(validateDateTime(testing_lab_specimen_received_date));
      errors.addAll(validateDateTime(test_result_date));
      errors.addAll(validateDateTime(date_result_released));

      errors.addAll(validateEmail(patient_email));
      errors.addAll(validateRace(patient_race));
      errors.addAll(validateGender(patient_gender));
      errors.addAll(validateEthnicity(patient_ethnicity));

      errors.addAll(validateYesNoAnswer(pregnant));
      errors.addAll(validateYesNoAnswer(employed_in_healthcare));
      errors.addAll(validateYesNoAnswer(symptomatic_for_disease));
      errors.addAll(validateYesNoAnswer(resident_congregate_setting));
      errors.addAll(validateYesNoAnswer(hospitalized));
      errors.addAll(validateYesNoAnswer(icu));
      errors.addAll(validateResidence(residence_type));
      errors.addAll(validateTestResultStatus(test_result_status));
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
