package gov.cdc.usds.simplereport.api;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneNumberInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.IntStream;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONObject;

/**
 * Static package for utilities to translate things to or from wireline format in non copy-paste
 * ways.
 */
public class Translators {
  private static final DateTimeFormatter US_SLASHDATE_SHORT_FORMATTER =
      DateTimeFormatter.ofPattern("M/d/yyyy");
  private static final int MAX_STRING_LENGTH = 500;

  public static final LocalDate parseUserShortDate(String d) {
    String date = parseString(d);
    if (date == null) {
      return null;
    }
    try {
      return LocalDate.parse(date, US_SLASHDATE_SHORT_FORMATTER);
    } catch (DateTimeParseException e) {
      throw IllegalGraphqlArgumentException.invalidInput(d, "date");
    }
  }

  public static String parsePhoneNumber(String userSuppliedPhoneNumber) {
    if (StringUtils.isBlank(userSuppliedPhoneNumber)) {
      return null;
    }

    try {
      var phoneUtil = PhoneNumberUtil.getInstance();
      return phoneUtil.format(
          phoneUtil.parse(userSuppliedPhoneNumber, "US"),
          PhoneNumberUtil.PhoneNumberFormat.NATIONAL);
    } catch (NumberParseException parseException) {
      throw IllegalGraphqlArgumentException.invalidInput(userSuppliedPhoneNumber, "phone number");
    }
  }

  public static List<PhoneNumber> parsePhoneNumbers(List<PhoneNumberInput> phoneNumbers) {
    if (phoneNumbers == null) {
      return List.of();
    }

    return phoneNumbers.stream()
        .map(
            phoneNumberInput ->
                new PhoneNumber(
                    parsePhoneType(phoneNumberInput.getType()),
                    parsePhoneNumber(phoneNumberInput.getNumber())))
        .collect(Collectors.toList());
  }

  private static PhoneType parsePhoneType(String t) {
    String type = parseString(t);
    if (type == null) {
      // When we no longer require backwards compatibility with an old UI, we can parse this
      // more strictly
      return null;
    }
    try {
      return PhoneType.valueOf(type.toUpperCase());
    } catch (IllegalArgumentException e) {
      throw new IllegalGraphqlArgumentException("Invalid PhoneType received");
    }
  }

  public static String parseString(String value) {
    if (value == null || "".equals(value)) {
      return null;
    }
    if (value.length() >= MAX_STRING_LENGTH) {
      throw new IllegalGraphqlArgumentException(
          "Value received exceeds field length limit of " + MAX_STRING_LENGTH + " characters");
    }
    return value.trim();
  }

  public static UUID parseUUID(String uuid) {
    if (uuid == null || "".equals(uuid)) {
      return null;
    }
    try {
      return UUID.fromString(uuid);
    } catch (IllegalArgumentException e) {
      throw IllegalGraphqlArgumentException.invalidInput(uuid, "UUID");
    }
  }

  public static PersonRole parsePersonRole(String r, boolean allowNull) {
    String role = parseString(r);
    if (role == null) {
      if (allowNull) {
        return null;
      }
      return PersonRole.UNKNOWN;
    }
    try {
      return PersonRole.valueOf(role.toUpperCase());
    } catch (IllegalArgumentException e) {
      throw IllegalGraphqlArgumentException.invalidInput(r, "role");
    }
  }

  public static String parseEmail(String e) {
    String email = parseString(e);
    if (email == null) {
      return null;
    }
    if (email.contains("@")) {
      return email;
    }
    throw IllegalGraphqlArgumentException.invalidInput(e, "email");
  }

  private static final Map<String, String> RACES =
      Map.of(
          "american indian or alaskan native", "native",
          "asian", "asian",
          "black or african american", "black",
          "native hawaiian or other pacific islander", "pacific",
          "white", "white",
          "unknown", "unknown",
          "prefer not to answer", "refused",
          "other", "other");

  private static final Set<String> RACE_VALUES =
      RACES.values().stream().collect(Collectors.toSet());
  private static final Set<String> RACE_KEYS = RACES.keySet();

  public static String parseRace(String r) {
    String race = parseString(r);
    if (race == null) {
      return null;
    }
    race = race.toLowerCase();
    if (RACE_VALUES.contains(race)) {
      return race;
    }
    throw IllegalGraphqlArgumentException.mustBeEnumerated(r, RACE_VALUES);
  }

  public static String parseRaceDisplayValue(String r) {
    String race = parseString(r);
    if (race == null) {
      return null;
    }
    race = race.toLowerCase();
    if (RACES.containsKey(race)) {
      return RACES.get(race);
    }
    if (RACES.containsValue(race)) {
      return race; // passed in the correct value
    }
    // not found
    throw IllegalGraphqlArgumentException.mustBeEnumerated(r, RACE_KEYS);
  }

  private static final Set<String> ETHNICITIES = Set.of("hispanic", "not_hispanic", "refused");

  public static String parseEthnicity(String e) {
    String ethnicity = parseString(e);
    if (ethnicity == null) {
      return null;
    }
    ethnicity = ethnicity.toLowerCase();
    if (ETHNICITIES.contains(ethnicity)) {
      return ethnicity;
    }
    throw IllegalGraphqlArgumentException.mustBeEnumerated(e, ETHNICITIES);
  }

  private static final int MAX_TRIBAL_AFFILIATION = 567;
  private static final Set<String> TRIBAL_AFFILIATIONS =
      IntStream.range(1, MAX_TRIBAL_AFFILIATION)
          .mapToObj(Integer::toString)
          .collect(Collectors.toSet());

  public static String parseTribalAffiliation(String ta) {
    String tribalAffiliation = parseString(ta);
    if (tribalAffiliation == null) {
      return null;
    }
    if (TRIBAL_AFFILIATIONS.contains(tribalAffiliation)) {
      return tribalAffiliation;
    }
    throw IllegalGraphqlArgumentException.mustBeEnumerated(ta, TRIBAL_AFFILIATIONS);
  }

  private static final Set<String> GENDERS = Set.of("male", "female", "other", "refused");

  public static String parseGender(String g) {
    String gender = parseString(g);
    if (gender == null) {
      return null;
    }
    gender = gender.toLowerCase();
    if (GENDERS.contains(gender)) {
      return gender;
    }
    throw new IllegalGraphqlArgumentException(
        "\"" + g + "\" must be one of [" + String.join(", ", GENDERS) + "].");
  }

  public static TestResult parseTestResult(String r) {
    String result = parseString(r);
    if (result == null) {
      return null;
    }
    try {
      result = result.toUpperCase();
      if ("INCONCLUSIVE".equals(result)) {
        result = TestResult.UNDETERMINED.name();
      }
      return TestResult.valueOf(result);
    } catch (IllegalArgumentException e) {
      throw IllegalGraphqlArgumentException.invalidInput(r, "test result");
    }
  }

  private static final Map<String, Boolean> YES_NO =
      Map.of("y", true, "yes", true, "n", false, "no", false, "true", true, "false", false);

  public static Boolean parseYesNo(String v) {
    String stringValue = parseString(v);
    if (stringValue == null) {
      return null;
    }
    Boolean boolValue = YES_NO.get(stringValue.toLowerCase());
    if (boolValue == null) {
      throw IllegalGraphqlArgumentException.invalidInput(v, "value");
    }
    return boolValue;
  }

  private static final Set<String> STATE_CODES =
      Set.of(
          "AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "FM", "GA", "GU", "HI",
          "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MH", "MI", "MN", "MO", "MP",
          "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR",
          "PW", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY");

  public static String parseState(String s) {
    String state = parseString(s);
    if (state == null) {
      return null;
    }
    state = state.toUpperCase();
    if (STATE_CODES.contains(state)) {
      return state;
    }
    throw IllegalGraphqlArgumentException.invalidInput(s, "state");
  }

  public static Map<String, Boolean> parseSymptoms(String symptoms) {
    Map<String, Boolean> symptomsMap = new HashMap<String, Boolean>();
    JSONObject symptomsJSONObject = new JSONObject(symptoms);
    Iterator<?> keys = symptomsJSONObject.keys();
    while (keys.hasNext()) {
      String key = (String) keys.next();
      Boolean value = symptomsJSONObject.getBoolean(key);
      symptomsMap.put(key, value);
    }
    return symptomsMap;
  }

  public static PersonName consolidateNameArguments(
      PersonName name, String firstName, String middleName, String lastName, String suffix) {
    return consolidateNameArguments(name, firstName, middleName, lastName, suffix, false);
  }

  public static PersonName consolidateNameArguments(
      PersonName name,
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      boolean allowEmpty) {
    if (name != null && !StringUtils.isAllBlank(firstName, middleName, lastName, suffix)) {
      throw new IllegalGraphqlArgumentException(
          "Do not specify both unrolled and structured name arguments");
    }
    if (name == null) {
      name = new PersonName(firstName, middleName, lastName, suffix);
    }
    if (!allowEmpty && StringUtils.isBlank(name.getLastName())) {
      throw new IllegalGraphqlArgumentException("lastName cannot be empty");
    }
    return name;
  }

  private static final Map<String, String> ORGANIZATION_TYPES =
      Map.ofEntries(
          Map.entry("k12", "K-12 School"),
          Map.entry("university", "College/University"),
          Map.entry("correctional_facility", "Correctional Facility"),
          Map.entry("airport", "Airport/Transit Station"),
          Map.entry("shelter", "Homeless Shelter"),
          Map.entry("fqhc", "FQHC"),
          Map.entry("primary_care", "Primary Care / Mental Health Outpatient"),
          Map.entry("assisted_living", "Assisted Living Facility"),
          Map.entry("hospital", "Hospital or Clinic"),
          Map.entry("urgent_care", "Urgent Care"),
          Map.entry("nursing_home", "Nursing Home"),
          Map.entry("treatment_center", "Substance Abuse Treatment Center"),
          Map.entry("hospice", "Hospice"),
          Map.entry("pharmacy", "Pharmacy"),
          Map.entry("employer", "Employer"),
          Map.entry("government_agency", "Government Agency"),
          Map.entry("camp", "Camp"),
          Map.entry("lab", "Lab"),
          Map.entry("other", "Other"));

  private static final Set<String> ORGANIZATION_TYPE_KEYS = ORGANIZATION_TYPES.keySet();

  public static String parseOrganizationType(String t) {
    String type = parseString(t);
    if (type == null) {
      return null;
    }
    if (ORGANIZATION_TYPE_KEYS.contains(type)) {
      return type;
    }
    throw IllegalGraphqlArgumentException.invalidInput(t, "organization type");
  }

  public static String parseOrganizationTypeFromName(String t) {
    for (Map.Entry<String, String> entry : ORGANIZATION_TYPES.entrySet()) {
      if (entry.getValue().equals(t)) {
        return entry.getKey();
      }
    }
    throw IllegalGraphqlArgumentException.invalidInput(t, "organization type");
  }
}
