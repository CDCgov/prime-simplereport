package gov.cdc.usds.simplereport.validators;

import static gov.cdc.usds.simplereport.api.Translators.CANADIAN_STATE_CODES;
import static gov.cdc.usds.simplereport.api.Translators.COUNTRY_CODES;
import static gov.cdc.usds.simplereport.api.Translators.GENDER_IDENTITIES;
import static gov.cdc.usds.simplereport.api.Translators.PAST_DATE_FLEXIBLE_FORMATTER;
import static gov.cdc.usds.simplereport.api.Translators.STATE_CODES;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.BOARDING_HOUSE_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.BOARDING_HOUSE_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.HOMELESS_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.HOMELESS_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.HOSPICE_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.HOSPICE_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.HOSPITAL_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.HOSPITAL_SHIP_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.HOSPITAL_SHIP_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.HOSPITAL_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.HOSTEL_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.HOSTEL_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.LONG_TERM_HOSPITAL_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.LONG_TERM_HOSPITAL_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.MILITARY_ACCOMMODATION_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.MILITARY_ACCOMMODATION_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.NURSING_HOME_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.NURSING_HOME_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.ORPHANAGE_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.ORPHANAGE_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.PENAL_INSTITUTION_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.PENAL_INSTITUTION_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.PRISON_BASED_CARE_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.PRISON_BASED_CARE_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.RELIGIOUS_RESIDENCE_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.RELIGIOUS_RESIDENCE_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.RETIREMENT_HOME_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.RETIREMENT_HOME_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.SECURE_HOSPITAL_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.SECURE_HOSPITAL_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.SHELTERED_HOUSING_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.SHELTERED_HOUSING_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.SUBSTANCE_ABUSE_TREATMENT_CENTER_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.SUBSTANCE_ABUSE_TREATMENT_CENTER_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.WORK_ENVIRONMENT_LITERAL;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.WORK_ENVIRONMENT_SNOMED;
import static gov.cdc.usds.simplereport.db.model.PersonUtils.getGenderIdentityAbbreviationMap;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.TIMEZONE_SUFFIX_REGEX;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.validTimeZoneIdMap;

import com.fasterxml.jackson.databind.MappingIterator;
import com.fasterxml.jackson.databind.RuntimeJsonMappingException;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvParser;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import gov.cdc.usds.simplereport.api.model.errors.CsvProcessingException;
import gov.cdc.usds.simplereport.api.model.filerow.FileRow;
import gov.cdc.usds.simplereport.db.model.auxiliary.ResultUploadErrorSource;
import gov.cdc.usds.simplereport.db.model.auxiliary.ResultUploadErrorType;
import gov.cdc.usds.simplereport.service.model.reportstream.FeedbackMessage;
import gov.cdc.usds.simplereport.utils.UnknownAddressUtils;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.ZoneId;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import java.util.stream.Stream;
import lombok.Getter;

public class CsvValidatorUtils {

  private static final String ZIP_CODE_REGEX = "^[0-9]{5}(?:-[0-9]{4})?$";

  /// 000-000-0000
  private static final String PHONE_NUMBER_REGEX = "^[1-9]\\d{2}-\\d{3}-\\d{4}$";

  // MM/DD/YYYY OR M/D/YYYY
  // Month and day values of 0 or 00 are invalid, but format of 01 to 09 is still allowed.
  // Months are limited to values between 1 and 12
  // Days are limited to values between 1 and 31
  private static final String DATE_REGEX =
      "^(0{0,1}[1-9]|1[0-2])\\/(0{0,1}[1-9]|1\\d|2\\d|3[01])\\/\\d{4}$";

  /**
   * Validates MM/DD/YYYY HH:mm, MM/DD/YYYY H:mm, M/D/YYYY HH:mm OR M/D/YYYY H:mm
   *
   * <p>Optional timezone code suffix which is checked as a valid timezone separately
   *
   * @see gov.cdc.usds.simplereport.utils.DateTimeUtils
   */
  private static final String DATE_TIME_REGEX =
      "^(0{0,1}[1-9]|1[0-2])\\/(0{0,1}[1-9]|1\\d|2\\d|3[01])\\/\\d{4}( ([0-1]?[0-9]|2[0-3]):[0-5][0-9]( \\S+)?)?$";

  private static final String LOINC_CODE_REGEX = "([0-9]{5})-[0-9]";
  private static final String EMAIL_REGEX = "^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$";
  private static final String SNOMED_REGEX = "(^[0-9]{9}$)|(^[0-9]{15}$)";
  private static final String CLIA_REGEX = "^[A-Za-z0-9]{2}[Dd][A-Za-z0-9]{7}$";
  private static final String ALPHABET_REGEX = "^[a-zA-Z\\s]+$";
  private static final Set<String> VALID_STATE_CODES =
      Stream.concat(
              STATE_CODES.stream().map(String::toLowerCase),
              CANADIAN_STATE_CODES.stream().map(String::toLowerCase))
          .collect(Collectors.toSet());
  private static final Set<String> VALID_COUNTRY_CODES =
      COUNTRY_CODES.stream().map(String::toLowerCase).collect(Collectors.toSet());
  private static final String UNKNOWN_LITERAL = "unknown";
  private static final String UNKNOWN_CODE = "unk";
  private static final String OTHER_LITERAL = "other";
  private static final String REFUSED_LITERAL = "refused";
  private static final String FEMALE_LITERAL = "female";
  private static final String MALE_LITERAL = "male";
  private static final String NATIVE_LITERAL = "american indian or alaska native";
  private static final String NATIVE_CODE = "1002-5";
  private static final String NATIVE_DB_VALUE = "native";
  private static final String ASIAN_LITERAL = "asian";
  private static final String ASIAN_CODE = "2028-9";
  private static final String BLACK_LITERAL = "black or african american";
  private static final String BLACK_CODE = "2054-5";
  private static final String BLACK_DB_VALUE = "black";
  private static final String PACIFIC_ISLANDER_LITERAL =
      "native hawaiian or other pacific islander";
  private static final String PACIFIC_ISLANDER_CODE = "2076-8";
  private static final String PACIFIC_DB_VALUE = "pacific";
  private static final String WHITE_LITERAL = "white";
  private static final String WHITE_CODE = "2106-3";
  private static final String OTHER_RACE_CODE = "2131-1";
  private static final String ASK_LITERAL = "ask, but unknown";
  private static final String ASK_CODE = "asku";
  private static final String HISPANIC_LITERAL = "hispanic or latino";
  private static final String HISPANIC_CODE = "2135-2";
  private static final String HISPANIC_DB_VALUE = "hispanic";
  private static final String NOT_HISPANIC_LITERAL = "not hispanic or latino";
  private static final String NOT_HISPANIC_CODE = "2186-5";
  private static final String NOT_HISPANIC_DB_VALUE = "not_hispanic";
  private static final Set<String> GENDER_VALUES =
      Set.of(
          "m", MALE_LITERAL,
          "f", FEMALE_LITERAL,
          "o", OTHER_LITERAL,
          "u", UNKNOWN_LITERAL,
          "a", "ambiguous",
          "n", "not applicable");

  private static final Set<String> ETHNICITY_VALUES =
      Set.of(
          HISPANIC_CODE, HISPANIC_LITERAL,
          NOT_HISPANIC_CODE, NOT_HISPANIC_LITERAL,
          UNKNOWN_CODE, UNKNOWN_LITERAL);
  private static final Set<String> RACE_VALUES =
      Set.of(
          NATIVE_CODE,
          NATIVE_LITERAL,
          ASIAN_CODE,
          ASIAN_LITERAL,
          BLACK_CODE,
          BLACK_LITERAL,
          PACIFIC_ISLANDER_CODE,
          PACIFIC_ISLANDER_LITERAL,
          WHITE_CODE,
          WHITE_LITERAL,
          OTHER_RACE_CODE,
          OTHER_LITERAL,
          ASK_CODE,
          ASK_LITERAL,
          UNKNOWN_CODE,
          UNKNOWN_LITERAL);
  private static final Set<String> YES_NO_VALUES =
      Set.of(
          "y", "yes",
          "n", "no",
          "u", UNKNOWN_CODE);
  private static final Set<String> TEST_RESULT_VALUES =
      Set.of("positive", "negative", "not detected", "detected", "invalid result");

  private static final Set<String> RESIDENCE_VALUES =
      Set.of(
          HOSPITAL_SNOMED, HOSPITAL_LITERAL,
          HOSPITAL_SHIP_SNOMED, HOSPITAL_SHIP_LITERAL,
          LONG_TERM_HOSPITAL_SNOMED, LONG_TERM_HOSPITAL_LITERAL,
          SECURE_HOSPITAL_SNOMED, SECURE_HOSPITAL_LITERAL,
          NURSING_HOME_SNOMED, NURSING_HOME_LITERAL,
          RETIREMENT_HOME_SNOMED, RETIREMENT_HOME_LITERAL,
          ORPHANAGE_SNOMED, ORPHANAGE_LITERAL,
          PRISON_BASED_CARE_SNOMED, PRISON_BASED_CARE_LITERAL,
          SUBSTANCE_ABUSE_TREATMENT_CENTER_SNOMED, SUBSTANCE_ABUSE_TREATMENT_CENTER_LITERAL,
          BOARDING_HOUSE_SNOMED, BOARDING_HOUSE_LITERAL,
          MILITARY_ACCOMMODATION_SNOMED, MILITARY_ACCOMMODATION_LITERAL,
          HOSPICE_SNOMED, HOSPICE_LITERAL,
          HOSTEL_SNOMED, HOSTEL_LITERAL,
          SHELTERED_HOUSING_SNOMED, SHELTERED_HOUSING_LITERAL,
          PENAL_INSTITUTION_SNOMED, PENAL_INSTITUTION_LITERAL,
          RELIGIOUS_RESIDENCE_SNOMED, RELIGIOUS_RESIDENCE_LITERAL,
          WORK_ENVIRONMENT_SNOMED, WORK_ENVIRONMENT_LITERAL,
          HOMELESS_SNOMED, HOMELESS_LITERAL);
  private static final Set<String> PATIENT_ROLE_VALUES =
      Set.of("staff", "resident", "student", "visitor", UNKNOWN_LITERAL);
  private static final Set<String> PHONE_NUMBER_TYPE_VALUES = Set.of("mobile", "landline");
  private static final Set<String> TEST_RESULT_STATUS_VALUES = Set.of("f", "c");
  public static final String ITEM_SCOPE = "item";

  //  http://hl7.org/fhir/R4/codesystem-data-absent-reason.html#data-absent-reason-unknown
  private static final Set<String> DATA_ABSENT_REASONS =
      Set.of(
          UNKNOWN_LITERAL,
          "asked-unknown",
          "temp-unknown",
          "not-asked",
          "asked-declined",
          "masked",
          "not-applicable",
          "unsupported",
          "as-text",
          "error",
          "not-a-number",
          "negative-infinity",
          "positive-infinity",
          "not-performed",
          "not-permitted");

  private CsvValidatorUtils() {
    throw new IllegalStateException("CsvValidatorUtils is a utility class");
  }

  private static String getInvalidValueErrorMessage(String rowValue, String columnName) {
    return rowValue + " is not an acceptable value for the " + columnName + " column.";
  }

  private static List<String> getOtherUnkAddressColumnNames(String columnName) {
    Set<String> columnNames = UnknownAddressUtils.unknownAddressMap().keySet();
    columnNames.remove(columnName);
    return new ArrayList<>(columnNames);
  }

  public static String getInvalidUnknownAddressErrorMessage(String rowValue, String columnName) {
    List<String> otherUnkAddressColumns = getOtherUnkAddressColumnNames(columnName);
    String otherColumnsMsg =
        otherUnkAddressColumns.get(0) + " and " + otherUnkAddressColumns.get(1);
    return "If you include "
        + rowValue
        + " in the "
        + columnName
        + " column, make sure the values in the "
        + otherColumnsMsg
        + " columns also indicate the address is unknown.";
  }

  private static String getRequiredValueErrorMessage(String columnName) {
    return "File is missing data in the " + columnName + " column.";
  }

  private static String getRequiredHivAoeValuesErrorMessage(String columnName) {
    return "File is missing data in the "
        + columnName
        + " column. This is required because the row contains a positive HIV test result.";
  }

  private static String getRequiredSyphilisAoeValuesErrorMessage(String columnName) {
    return "File is missing data in the "
        + columnName
        + " column. This is required because the row contains a positive Syphilis test result.";
  }

  public static List<FeedbackMessage> validateTestResult(ValueOrError input) {
    return validateSpecificValueOrSNOMED(input, TEST_RESULT_VALUES);
  }

  public static List<FeedbackMessage> validateTestPerformedCode(ValueOrError input) {
    return validateRegex(input, LOINC_CODE_REGEX);
  }

  public static List<FeedbackMessage> validateSpecimenType(
      ValueOrError input, Map<String, String> specimenNameSNOMEDMap) {
    List<FeedbackMessage> errors = new ArrayList<>();
    String value = parseString(input.getValue());

    if (value == null) {
      return errors;
    }

    boolean nonSNOMEDValue = value.matches(ALPHABET_REGEX);

    if (nonSNOMEDValue) {
      if (!specimenNameSNOMEDMap.containsKey(value.toLowerCase())) {
        errors.add(
            FeedbackMessage.builder()
                .scope(ITEM_SCOPE)
                .message(getInvalidValueErrorMessage(input.getValue(), input.getHeader()))
                .errorType(ResultUploadErrorType.INVALID_DATA)
                .source(ResultUploadErrorSource.SIMPLE_REPORT)
                .fieldRequired(true)
                .fieldHeader(input.getHeader())
                .build());
      }

      return errors;
    }

    if (!value.matches(SNOMED_REGEX)) {
      errors.add(
          FeedbackMessage.builder()
              .scope(ITEM_SCOPE)
              .message(getInvalidValueErrorMessage(input.getValue(), input.getHeader()))
              .errorType(ResultUploadErrorType.INVALID_DATA)
              .source(ResultUploadErrorSource.SIMPLE_REPORT)
              .fieldRequired(true)
              .fieldHeader(input.getHeader())
              .build());
    }

    return errors;
  }

  public static List<FeedbackMessage> validateResidence(ValueOrError input) {
    return validateInSet(input, RESIDENCE_VALUES);
  }

  public static List<FeedbackMessage> validateYesNoAnswer(ValueOrError input) {
    return validateInSet(input, YES_NO_VALUES);
  }

  public static List<FeedbackMessage> validateEthnicity(ValueOrError input) {
    return validateInSet(input, ETHNICITY_VALUES);
  }

  public static List<FeedbackMessage> validateRace(ValueOrError input) {
    return validateInSet(input, RACE_VALUES);
  }

  public static List<FeedbackMessage> validateBiologicalSex(ValueOrError input) {
    return validateInSet(input, GENDER_VALUES);
  }

  public static List<FeedbackMessage> validateGenderIdentity(ValueOrError input) {
    return validateInSet(input, GENDER_IDENTITIES);
  }

  public static List<FeedbackMessage> validateState(ValueOrError input) {
    return validateInSet(input, VALID_STATE_CODES);
  }

  public static List<FeedbackMessage> validateCountry(ValueOrError input) {
    return validateInSet(input, VALID_COUNTRY_CODES);
  }

  public static List<FeedbackMessage> validatePartialUnkAddress(
      ValueOrError stateInput, ValueOrError zipInput, ValueOrError streetInput) {
    List<FeedbackMessage> errors = new ArrayList<>();
    List<ValueOrError> addressInputs = new ArrayList<>(List.of(stateInput, zipInput, streetInput));
    addressInputs.forEach(
        addressInput -> {
          boolean isUnk =
              UnknownAddressUtils.isAddressSectionUnk(
                  addressInput.getValue(),
                  UnknownAddressUtils.unknownAddressMap().get(addressInput.getHeader()));
          if (isUnk) {
            errors.add(
                FeedbackMessage.builder()
                    .scope(ITEM_SCOPE)
                    .fieldHeader(addressInput.getHeader())
                    .message(
                        getInvalidUnknownAddressErrorMessage(
                            addressInput.getValue(), addressInput.getHeader()))
                    .errorType(ResultUploadErrorType.INVALID_DATA)
                    .build());
          }
        });
    // only return errors if some values are unknown
    if (errors.stream().count() != addressInputs.stream().count()) {
      return errors;
    }
    return new ArrayList<>();
  }

  public static List<FeedbackMessage> validateTestResultStatus(ValueOrError input) {
    return validateInSet(input, TEST_RESULT_STATUS_VALUES);
  }

  public static List<FeedbackMessage> validateZipCode(ValueOrError input) {
    return validateRegex(input, ZIP_CODE_REGEX);
  }

  public static List<FeedbackMessage> validatePhoneNumber(ValueOrError input) {
    return validateRegex(input, PHONE_NUMBER_REGEX);
  }

  public static List<FeedbackMessage> validatePhoneNumberType(ValueOrError input) {
    return validateInSet(input, PHONE_NUMBER_TYPE_VALUES);
  }

  public static List<FeedbackMessage> validateRole(ValueOrError input) {
    return validateInSet(input, PATIENT_ROLE_VALUES);
  }

  public static List<FeedbackMessage> validateClia(ValueOrError input) {
    return validateRegex(input, CLIA_REGEX);
  }

  public static List<FeedbackMessage> validateFlexibleDate(ValueOrError input) {
    List<FeedbackMessage> errors = new ArrayList<>();
    String value = parseString(input.getValue());
    if (value == null) {
      return errors;
    }
    try {
      PAST_DATE_FLEXIBLE_FORMATTER.parse(input.getValue());
    } catch (DateTimeParseException e) {
      errors.add(
          FeedbackMessage.builder()
              .scope(ITEM_SCOPE)
              .fieldHeader(input.getHeader())
              .message(getInvalidValueErrorMessage(input.getValue(), input.getHeader()))
              .errorType(ResultUploadErrorType.INVALID_DATA)
              .source(ResultUploadErrorSource.SIMPLE_REPORT)
              .fieldRequired(input.isRequired())
              .build());
    }
    return errors;
  }

  public static List<FeedbackMessage> validateDateFormat(ValueOrError input) {
    return validateRegex(input, DATE_REGEX);
  }

  public static List<FeedbackMessage> validateDateTime(ValueOrError input) {
    List<FeedbackMessage> errors = new ArrayList<>(validateRegex(input, DATE_TIME_REGEX));
    if (input.getValue() != null
        && errors.isEmpty()
        && input.getValue().matches(TIMEZONE_SUFFIX_REGEX)) {
      errors.addAll(validateDateTimeZoneCode(input));
    }
    return errors;
  }

  public static List<FeedbackMessage> validateDateTimeZoneCode(ValueOrError input) {
    List<FeedbackMessage> errors = new ArrayList<>();
    String value = input.getValue();
    String timezoneCode = value.substring(value.lastIndexOf(' ')).trim();
    if (!ZoneId.getAvailableZoneIds().contains(timezoneCode)
        && !validTimeZoneIdMap.containsKey(timezoneCode.toUpperCase())) {
      errors.add(
          FeedbackMessage.builder()
              .scope(ITEM_SCOPE)
              .fieldHeader(input.getHeader())
              .message(getInvalidValueErrorMessage(input.getValue(), input.getHeader()))
              .errorType(ResultUploadErrorType.INVALID_DATA)
              .fieldRequired(false)
              .build());
    }
    return errors;
  }

  public static List<FeedbackMessage> validateEmail(ValueOrError input) {
    return validateRegex(input, EMAIL_REGEX);
  }

  public static Map<String, String> getNextRow(MappingIterator<Map<String, String>> valueIterator)
      throws CsvProcessingException {
    try {
      return valueIterator.next();
    } catch (RuntimeJsonMappingException e) {
      var location = valueIterator.getCurrentLocation();
      throw new CsvProcessingException(
          e.getMessage(), location.getLineNr(), location.getColumnNr());
    }
  }

  public static List<FeedbackMessage> validateDataAbsentReason(ValueOrError input) {
    return validateInSet(input, DATA_ABSENT_REASONS);
  }

  public static ValueOrError getValue(Map<String, String> row, String name, boolean isRequired) {
    String value = row.get(name);
    if (value != null && !value.isBlank()) {
      value = value.strip();
    }
    if (isRequired && (value == null || value.isBlank())) {
      return new ValueOrError(
          FeedbackMessage.builder()
              .scope(ITEM_SCOPE)
              .fieldHeader(name)
              .message(getRequiredValueErrorMessage(name))
              .source(ResultUploadErrorSource.SIMPLE_REPORT)
              .errorType(ResultUploadErrorType.MISSING_DATA)
              .fieldRequired(true)
              .build());
    }
    return new ValueOrError(value, name, isRequired);
  }

  public static List<FeedbackMessage> hasMissingRequiredHeaders(
      Map<String, String> row, FileRow fileRow) {
    List<FeedbackMessage> errors = new ArrayList<>();
    Set<String> columns = row.keySet();
    fileRow
        .getRequiredFields()
        .forEach(
            requiredField -> {
              if (!columns.contains(requiredField)) {
                var feedback =
                    FeedbackMessage.builder()
                        .scope(CsvValidatorUtils.ITEM_SCOPE)
                        .message(
                            "The header for column " + requiredField + " is missing or invalid.")
                        .source(ResultUploadErrorSource.SIMPLE_REPORT)
                        .fieldHeader(requiredField)
                        .errorType(ResultUploadErrorType.MISSING_HEADER)
                        .fieldRequired(true)
                        .build();
                errors.add(feedback);
              }
            });
    return errors;
  }

  public static MappingIterator<Map<String, String>> getIteratorForCsv(InputStream csvStream)
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

  /* Values need to be lower case to play nice with frontend */
  public static String convertGenderIdentityToDatabaseValue(String genderIdentity) {
    if (genderIdentity != null) {
      return genderIdentity.toLowerCase();
    }
    return "";
  }

  /* The acceptable values for race and ethnicity don't map to the values expected in our database. */
  public static String convertEthnicityToDatabaseValue(String ethnicity) {
    Map<String, String> displayValueToDatabaseValue =
        Map.ofEntries(
            Map.entry(HISPANIC_LITERAL, HISPANIC_DB_VALUE),
            Map.entry(HISPANIC_CODE, HISPANIC_DB_VALUE),
            Map.entry(NOT_HISPANIC_LITERAL, NOT_HISPANIC_DB_VALUE),
            Map.entry(NOT_HISPANIC_CODE, NOT_HISPANIC_DB_VALUE),
            Map.entry(UNKNOWN_CODE, REFUSED_LITERAL),
            Map.entry(UNKNOWN_LITERAL, REFUSED_LITERAL));

    return displayValueToDatabaseValue.get(ethnicity.toLowerCase());
  }

  public static String convertRaceToDatabaseValue(String race) {
    Map<String, String> displayValueToDatabaseValue =
        Map.ofEntries(
            Map.entry(NATIVE_LITERAL, NATIVE_DB_VALUE),
            Map.entry(NATIVE_CODE, NATIVE_DB_VALUE),
            Map.entry(ASIAN_LITERAL, ASIAN_LITERAL),
            Map.entry(ASIAN_CODE, ASIAN_LITERAL),
            Map.entry(BLACK_LITERAL, BLACK_DB_VALUE),
            Map.entry(BLACK_CODE, BLACK_DB_VALUE),
            Map.entry(PACIFIC_ISLANDER_LITERAL, PACIFIC_DB_VALUE),
            Map.entry(PACIFIC_ISLANDER_CODE, PACIFIC_DB_VALUE),
            Map.entry(WHITE_LITERAL, WHITE_LITERAL),
            Map.entry(WHITE_CODE, WHITE_LITERAL),
            Map.entry(OTHER_LITERAL, OTHER_LITERAL),
            Map.entry(OTHER_RACE_CODE, OTHER_LITERAL),
            Map.entry(ASK_LITERAL, REFUSED_LITERAL),
            Map.entry(ASK_CODE, REFUSED_LITERAL),
            Map.entry(UNKNOWN_LITERAL, REFUSED_LITERAL),
            Map.entry(UNKNOWN_CODE, REFUSED_LITERAL));

    return displayValueToDatabaseValue.get(race.toLowerCase());
  }

  public static String convertSexToDatabaseValue(String biologicalSex) {
    // fun fact: Map.of() has a limit of 10 key/value pairs
    Map<String, String> displayValueToDatabaseValue =
        Map.ofEntries(
            Map.entry("m", MALE_LITERAL),
            Map.entry(MALE_LITERAL, MALE_LITERAL),
            Map.entry("f", FEMALE_LITERAL),
            Map.entry(FEMALE_LITERAL, FEMALE_LITERAL),
            Map.entry("o", OTHER_LITERAL),
            Map.entry(OTHER_LITERAL, OTHER_LITERAL),
            Map.entry("u", REFUSED_LITERAL),
            Map.entry(UNKNOWN_LITERAL, REFUSED_LITERAL),
            Map.entry("a", OTHER_LITERAL),
            Map.entry("ambiguous", OTHER_LITERAL),
            Map.entry("n", OTHER_LITERAL),
            Map.entry("not applicable", OTHER_LITERAL));

    return displayValueToDatabaseValue.get(biologicalSex.toLowerCase());
  }

  private static List<FeedbackMessage> validateSpecificValueOrSNOMED(
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

  public static Set<String> extractSubstringsGenderOfSexualPartners(String value) {
    Set<String> results = new HashSet<>();
    String[] innerValues = value.split(",");
    for (String innerValue : innerValues) {
      results.add(innerValue.strip().toUpperCase());
    }
    return results;
  }

  public static List<FeedbackMessage> validateGendersOfSexualPartners(ValueOrError input) {
    List<FeedbackMessage> errors = new ArrayList<>();
    String value = parseString(input.getValue());
    if (value == null) {
      return errors;
    }
    Set<String> genders = extractSubstringsGenderOfSexualPartners(value);
    if (!getGenderIdentityAbbreviationMap().keySet().containsAll(genders)) {
      errors.add(
          FeedbackMessage.builder()
              .scope(ITEM_SCOPE)
              .fieldHeader(input.getHeader())
              .source(ResultUploadErrorSource.SIMPLE_REPORT)
              .message(getInvalidValueErrorMessage(input.getValue(), input.getHeader()))
              .errorType(ResultUploadErrorType.INVALID_DATA)
              .fieldRequired(input.isRequired())
              .build());
    }
    return errors;
  }

  public static List<FeedbackMessage> validatePositiveHIVRequiredAOEFields(
      ValueOrError testResult, ValueOrError gendersOfSexualPartners, ValueOrError pregnant) {
    List<FeedbackMessage> errors = new ArrayList<>();
    // includes SNOMED values for positive and detected
    Set<String> positiveTestResultValues = Set.of("positive", "detected", "260373001", "10828004");
    if (!positiveTestResultValues.contains(testResult.getValue().toLowerCase())) {
      return errors;
    }

    if (gendersOfSexualPartners.getValue() == null
        || gendersOfSexualPartners.getValue().isBlank()) {
      errors.add(
          FeedbackMessage.builder()
              .scope(ITEM_SCOPE)
              .fieldHeader(gendersOfSexualPartners.getHeader())
              .source(ResultUploadErrorSource.SIMPLE_REPORT)
              .message(getRequiredHivAoeValuesErrorMessage(gendersOfSexualPartners.getHeader()))
              .errorType(ResultUploadErrorType.MISSING_DATA)
              .fieldRequired(gendersOfSexualPartners.isRequired())
              .build());
    }

    if (pregnant.getValue() == null || pregnant.getValue().isBlank()) {
      errors.add(
          FeedbackMessage.builder()
              .scope(ITEM_SCOPE)
              .fieldHeader(pregnant.getHeader())
              .source(ResultUploadErrorSource.SIMPLE_REPORT)
              .message(getRequiredHivAoeValuesErrorMessage(pregnant.getHeader()))
              .errorType(ResultUploadErrorType.MISSING_DATA)
              .fieldRequired(pregnant.isRequired())
              .build());
    }
    return errors;
  }

  private static FeedbackMessage buildSyphilisMissingDataFeedbackMessage(ValueOrError field) {
    return FeedbackMessage.builder()
        .scope(ITEM_SCOPE)
        .fieldHeader(field.getHeader())
        .source(ResultUploadErrorSource.SIMPLE_REPORT)
        .message(getRequiredSyphilisAoeValuesErrorMessage(field.getHeader()))
        .errorType(ResultUploadErrorType.MISSING_DATA)
        .fieldRequired(field.isRequired())
        .build();
  }

  public static List<FeedbackMessage> validatePositiveSyphilisRequiredAOEFields(
      ValueOrError testResult,
      ValueOrError gendersOfSexualPartners,
      ValueOrError pregnant,
      ValueOrError previousSyphilisDiagnosis,
      ValueOrError symptomaticForDisease) {
    List<FeedbackMessage> errors = new ArrayList<>();
    // includes SNOMED values for positive and detected
    Set<String> positiveTestResultValues = Set.of("positive", "detected", "260373001", "10828004");
    if (!positiveTestResultValues.contains(testResult.getValue().toLowerCase())) {
      return errors;
    }

    if (gendersOfSexualPartners.getValue() == null
        || gendersOfSexualPartners.getValue().isBlank()) {
      errors.add(buildSyphilisMissingDataFeedbackMessage(gendersOfSexualPartners));
    }

    if (pregnant.getValue() == null || pregnant.getValue().isBlank()) {
      errors.add(buildSyphilisMissingDataFeedbackMessage(pregnant));
    }

    if (previousSyphilisDiagnosis.getValue() == null
        || previousSyphilisDiagnosis.getValue().isBlank()) {
      errors.add(buildSyphilisMissingDataFeedbackMessage(previousSyphilisDiagnosis));
    }

    if (symptomaticForDisease.getValue() == null || symptomaticForDisease.getValue().isBlank()) {
      errors.add(buildSyphilisMissingDataFeedbackMessage(symptomaticForDisease));
    }

    return errors;
  }

  private static List<FeedbackMessage> validateRegex(ValueOrError input, String regex) {
    List<FeedbackMessage> errors = new ArrayList<>();
    String value = parseString(input.getValue());
    if (value == null) {
      return errors;
    }
    if (!value.matches(regex)) {
      errors.add(
          FeedbackMessage.builder()
              .scope(ITEM_SCOPE)
              .fieldHeader(input.getHeader())
              .source(ResultUploadErrorSource.SIMPLE_REPORT)
              .message(getInvalidValueErrorMessage(input.getValue(), input.getHeader()))
              .errorType(ResultUploadErrorType.INVALID_DATA)
              .fieldRequired(input.isRequired())
              .build());
    }
    return errors;
  }

  private static List<FeedbackMessage> validateInSet(
      ValueOrError input, Set<String> acceptableValues) {
    List<FeedbackMessage> errors = new ArrayList<>();
    String value = parseString(input.getValue());
    if (value == null) {
      return errors;
    }
    if (!acceptableValues.contains(value.toLowerCase())) {
      errors.add(
          FeedbackMessage.builder()
              .scope(ITEM_SCOPE)
              .fieldHeader(input.getHeader())
              .message(getInvalidValueErrorMessage(input.getValue(), input.getHeader()))
              .source(ResultUploadErrorSource.SIMPLE_REPORT)
              .errorType(ResultUploadErrorType.INVALID_DATA)
              .fieldRequired(input.isRequired())
              .build());
    }
    return errors;
  }

  private static String parseString(String value) {
    if (value == null || "".equals(value)) {
      return null;
    }
    return value.trim();
  }

  @Getter
  public static class ValueOrError {
    private final List<FeedbackMessage> error;
    private final String value;
    private final String header;
    private final boolean required;

    public ValueOrError(String value, String header, boolean required) {
      this.value = value;
      this.error = Collections.emptyList();
      this.header = header;
      this.required = required;
    }

    public ValueOrError(String value, String header) {
      this(value, header, false);
    }

    public ValueOrError(FeedbackMessage error) {
      this.value = null;
      this.header = null;
      this.error = List.of(error);
      this.required = error.isFieldRequired();
    }

    public List<FeedbackMessage> getPossibleError() {
      return this.getError();
    }
  }
}
