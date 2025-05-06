package gov.cdc.usds.simplereport.api;

import static gov.cdc.usds.simplereport.api.converter.FhirConstants.DETECTED_SNOMED;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.INVALID_SNOMED;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NEGATIVE_SNOMED;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.NOT_DETECTED_SNOMED;
import static gov.cdc.usds.simplereport.api.converter.FhirConstants.POSITIVE_SNOMED;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.PhoneNumber;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneNumberInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.PhoneType;
import gov.cdc.usds.simplereport.db.model.auxiliary.SnomedConceptRecord;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoField;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
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
  private Translators() {
    throw new IllegalStateException("Utility class");
  }

  private static final long LOOK_BACK_YEARS = 99;

  // Accepts either two-digit or four-digit years.
  // Two-digit years will always resolve to years past.
  // (e.g., if today is Jan. 1, 2023, and the formatter is passed 11/4/24, it will resolve to Nov 4,
  // 1924).
  public static final DateTimeFormatter PAST_DATE_FLEXIBLE_FORMATTER =
      new DateTimeFormatterBuilder()
          .appendPattern("M/d/")
          .optionalStart()
          .appendPattern("uuuu")
          .optionalEnd()
          .optionalStart()
          .appendValueReduced(ChronoField.YEAR, 2, 2, LocalDate.now().minusYears(LOOK_BACK_YEARS))
          .optionalEnd()
          .toFormatter();

  private static final int MAX_STRING_LENGTH = 500;

  public static final LocalDate parseUserShortDate(String input) {
    String date = parseString(input);
    if (date == null) {
      return null;
    }
    try {
      return LocalDate.parse(date, PAST_DATE_FLEXIBLE_FORMATTER);
    } catch (DateTimeParseException e) {
      throw IllegalGraphqlArgumentException.invalidInput(input, "date");
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

  public static PhoneType parsePhoneType(String t) {
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

  public static String parseStringNoTrim(String value) {
    if (value == null || "".equals(value)) {
      return null;
    }
    if (value.length() >= MAX_STRING_LENGTH) {
      throw new IllegalGraphqlArgumentException(
          "Value received exceeds field length limit of " + MAX_STRING_LENGTH + " characters");
    }
    return value;
  }

  public static String parseString(String v) {
    String value = parseStringNoTrim(v);
    if (value == null) {
      return null;
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

  public static List<String> parseEmails(List<String> emails) {
    if (emails == null || emails.isEmpty()) {
      return Collections.emptyList();
    }

    return emails.stream().map(Translators::parseEmail).collect(Collectors.toList());
  }

  public static final String REFUSED = "refused";
  public static final String OTHER = "other";
  private static final Map<String, String> RACES =
      Map.of(
          "american indian or alaskan native",
          "native",
          "asian",
          "asian",
          "black or african american",
          "black",
          "native hawaiian or other pacific islander",
          "pacific",
          "white",
          "white",
          "unknown",
          "unknown",
          "prefer not to answer",
          REFUSED,
          OTHER,
          OTHER);

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

  private static final Set<String> ETHNICITIES = Set.of("hispanic", "not_hispanic", REFUSED);

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

  public static final String MALE = "male";
  public static final String FEMALE = "female";
  private static final Set<String> GENDERS = Set.of(MALE, FEMALE, OTHER, REFUSED);

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

  public static final String NON_BINARY = "nonbinary";
  public static final String TRANS_MAN = "transman";
  public static final String TRANS_WOMAN = "transwoman";
  public static final Set<String> GENDER_IDENTITIES =
      Set.of(FEMALE, MALE, TRANS_WOMAN, TRANS_MAN, NON_BINARY, OTHER, REFUSED);

  public static String parseGenderIdentity(String genderIdentityInput) {
    String genderIdentity = parseString(genderIdentityInput);
    if (genderIdentity == null) {
      return null;
    }
    genderIdentity = genderIdentity.toLowerCase();
    if (GENDER_IDENTITIES.contains(genderIdentity)) {
      return genderIdentity;
    }
    throw new IllegalGraphqlArgumentException(
        "\""
            + genderIdentityInput
            + "\" must be one of ["
            + String.join(", ", GENDER_IDENTITIES)
            + "].");
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
  private static final Set<String> UNK = Set.of("unk", "u");

  public static Boolean parseYesNoUnk(String v) {
    String stringValue = parseString(v);
    if (stringValue == null || UNK.contains(stringValue.toLowerCase())) {
      return null;
    }
    Boolean boolValue = YES_NO.get(stringValue.toLowerCase());
    if (boolValue == null) {
      throw IllegalGraphqlArgumentException.invalidInput(v, "value");
    }
    return boolValue;
  }

  // "NA" is used for international addresses
  public static final Set<String> STATE_CODES =
      Set.of(
          "AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "FM", "GA", "GU", "HI",
          "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MH", "MI", "MN", "MO", "MP",
          "MS", "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR",
          "PW", "RI", "SC", "SD", "TN", "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY", "NA");

  public static final Set<String> CANADIAN_STATE_CODES =
      Set.of("AB", "BC", "MB", "NB", "NL", "NT", "NS", "NU", "ON", "PE", "QC", "SK", "YT");

  public static final Set<String> COUNTRY_CODES =
      Set.of(
          "AFG", "ALB", "DZA", "AND", "AGO", "ATG", "ARG", "ARM", "AUS", "AUT", "AZE", "BHS", "BHR",
          "BGD", "BRB", "BLR", "BEL", "BLZ", "BEN", "BTN", "BOL", "BIH", "BWA", "BRA", "BRN", "BGR",
          "BFA", "MMR", "BDI", "CPV", "KHM", "CMR", "CAN", "CAF", "TCD", "CHL", "CHN", "COL", "COM",
          "COG", "COD", "CRI", "CIV", "HRV", "CUB", "CYP", "CZE", "DNK", "DJI", "DOM", "DMA", "ECU",
          "EGY", "SLV", "GNQ", "ERI", "EST", "SWZ", "ETH", "FJI", "FIN", "FRA", "GAB", "GMB", "GEO",
          "DEU", "GHA", "GRC", "GRD", "GTM", "GIN", "GNB", "GUY", "HTI", "VAT", "HND", "HUN", "ISL",
          "IND", "IDN", "IRN", "IRQ", "IRL", "ISR", "ITA", "JAM", "JPN", "JOR", "KAZ", "KEN", "KIR",
          "PRK", "KOR", "XKS", "KWT", "KGZ", "LAO", "LVA", "LBN", "LSO", "LBR", "LBY", "LIE", "LTU",
          "LUX", "MDG", "MWI", "MYS", "MDV", "MLI", "MLT", "MHL", "MRT", "MUS", "MEX", "FSM", "MDA",
          "MCO", "MNG", "MNE", "MAR", "MOZ", "NAM", "NRU", "NPL", "NLD", "NZL", "NIC", "NER", "NGA",
          "MKD", "NOR", "OMN", "PAK", "PLW", "PAN", "PNG", "PRY", "PER", "PHL", "POL", "PRT", "QAT",
          "ROU", "RUS", "RWA", "KNA", "LCA", "VCT", "WSM", "SMR", "STP", "SAU", "SEN", "SRB", "SYC",
          "SLE", "SGP", "SVK", "SVN", "SLB", "SOM", "ZAF", "SSD", "ESP", "LKA", "SDN", "SUR", "SWE",
          "CHE", "SYR", "TJK", "TZA", "THA", "TLS", "TGO", "TON", "TTO", "TUN", "TUR", "TKM", "TUV",
          "UGA", "UKR", "ARE", "GBR", "USA", "URY", "UZB", "VUT", "VEN", "VNM", "YEM", "ZMB", "ZWE",
          "TWN", "XQZ", "ASM", "AIA", "ATA", "ABW", "XAC", "XBK", "BMU", "BVT", "IOT", "CYM", "CXR",
          "CPT", "CCK", "COK", "XCS", "CUW", "XXD", "FLK", "FRO", "GUF", "PYF", "ATF", "GIB", "GRL",
          "GLP", "GUM", "GGY", "HMD", "HKG", "XHO", "IMN", "XJM", "XJV", "JEY", "XJA", "XKR", "MAC",
          "MTQ", "MYT", "XMW", "MSR", "XNV", "NCL", "NIU", "NFK", "MNP", "XPL", "XPR", "PCN", "PRI",
          "REU", "BLM", "SHN", "MAF", "SPM", "SXM", "SGS", "XSP", "XSV", "TKL", "TCA", "VGB", "VIR",
          "XWK", "WLF");

  public static String parseState(String s) {
    String state = parseString(s);
    if (state == null) {
      return null;
    }
    state = state.toUpperCase();
    if (STATE_CODES.contains(state) || CANADIAN_STATE_CODES.contains(state)) {
      return state;
    }
    throw IllegalGraphqlArgumentException.invalidInput(s, "state");
  }

  private static final Map<String, String> RESPIRATORY_SYMPTOMS =
      Map.ofEntries(
          Map.entry("426000000", "Fever over 100.4F"),
          Map.entry("103001002", "Feeling feverish"),
          Map.entry("43724002", "Chills"),
          Map.entry("49727002", "Cough"),
          Map.entry("267036007", "Shortness of breath"),
          Map.entry("230145002", "Difficulty breathing"),
          Map.entry("84229001", "Fatigue"),
          Map.entry("68962001", "Muscle or body aches"),
          Map.entry("25064002", "Headache"),
          Map.entry("36955009", "New loss of taste"),
          Map.entry("44169009", "New loss of smell"),
          Map.entry("162397003", "Sore throat"),
          Map.entry("68235000", "Nasal congestion"),
          Map.entry("64531003", "Runny nose"),
          Map.entry("422587007", "Nausea"),
          Map.entry("422400008", "Vomiting"),
          Map.entry("62315008", "Diarrhea"),
          Map.entry("261665006", "Other symptom not listed"));

  private static final Map<String, String> SYPHILIS_SYMPTOMS =
      Map.ofEntries(
          Map.entry("724386005", "Genital sore/lesion"),
          Map.entry("195469007", "Anal sore/lesion"),
          Map.entry("26284000", "Sore(s) in mouth/lips"),
          Map.entry("266128007", "Body Rash"),
          Map.entry("56940005", "Palmar (hand)/plantar (foot) rash"),
          Map.entry("91554004", "Flat white warts"),
          Map.entry("15188001", "Hearing loss"),
          Map.entry("246636008", "Blurred vision"),
          Map.entry("56317004", "Alopecia"));

  private static Map<String, String> getSupportedSymptoms() {
    Map<String, String> supportedSymptoms = new HashMap<>();
    supportedSymptoms.putAll(RESPIRATORY_SYMPTOMS);
    supportedSymptoms.putAll(SYPHILIS_SYMPTOMS);
    return supportedSymptoms;
  }

  public static String getSymptomName(String snomedCode) {
    Map<String, String> supportedSymptoms = getSupportedSymptoms();
    return supportedSymptoms.get(snomedCode);
  }

  public static Map<String, Boolean> parseSymptoms(String symptoms) {
    if (symptoms == null) {
      return Collections.emptyMap();
    }
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
          Map.entry(OTHER, "Other"));
  private static final Set<String> ORGANIZATION_TYPE_KEYS = ORGANIZATION_TYPES.keySet();

  public static final Map<String, SnomedConceptRecord> ABNORMAL_SNOMEDS =
      Map.ofEntries(
          Map.entry(
              DETECTED_SNOMED,
              new SnomedConceptRecord("Detected", DETECTED_SNOMED, TestResult.POSITIVE)),
          Map.entry(
              "720735008",
              new SnomedConceptRecord("Presumptive positive", "720735008", TestResult.POSITIVE)),
          Map.entry(
              POSITIVE_SNOMED,
              new SnomedConceptRecord("Positive", POSITIVE_SNOMED, TestResult.POSITIVE)),
          Map.entry(
              "11214006", new SnomedConceptRecord("Reactive", "11214006", TestResult.POSITIVE)));

  public static final Map<String, SnomedConceptRecord> NORMAL_SNOMEDS =
      Map.ofEntries(
          Map.entry(
              NOT_DETECTED_SNOMED,
              new SnomedConceptRecord("Not detected", NOT_DETECTED_SNOMED, TestResult.NEGATIVE)),
          Map.entry(
              NEGATIVE_SNOMED,
              new SnomedConceptRecord("Negative", NEGATIVE_SNOMED, TestResult.NEGATIVE)),
          Map.entry(
              "895231008",
              new SnomedConceptRecord(
                  "Not detected in pooled specimen", "895231008", TestResult.NEGATIVE)),
          Map.entry(
              "131194007",
              new SnomedConceptRecord("Non-Reactive", "131194007", TestResult.NEGATIVE)),
          // certain UNDETERMINED codes are also flagged as normal
          // https://github.com/CDCgov/prime-reportstream/blob/1ffae4ca0b04cd0aa9f169e26813ecd86df71bb5/prime-router/src/main/kotlin/metadata/Mappers.kt#L768
          Map.entry(
              "419984006",
              new SnomedConceptRecord("Inconclusive", "419984006", TestResult.UNDETERMINED)),
          Map.entry(
              "42425007",
              new SnomedConceptRecord("Equivocal", "42425007", TestResult.UNDETERMINED)),
          Map.entry(
              "82334004",
              new SnomedConceptRecord("Indeterminate", "82334004", TestResult.UNDETERMINED)),
          Map.entry(
              "373121007",
              new SnomedConceptRecord("Test not done", "373121007", TestResult.UNDETERMINED)),
          Map.entry(
              INVALID_SNOMED,
              new SnomedConceptRecord("Invalid result", INVALID_SNOMED, TestResult.UNDETERMINED)),
          Map.entry(
              "125154007",
              new SnomedConceptRecord(
                  "Specimen unsatisfactory for evaluation", "125154007", TestResult.UNDETERMINED)));

  public static final SnomedConceptRecord DETECTED_SNOMED_CONCEPT =
      ABNORMAL_SNOMEDS.get(DETECTED_SNOMED);
  private static final SnomedConceptRecord NOT_DETECTED_SNOMED_CONCEPT =
      NORMAL_SNOMEDS.get(NOT_DETECTED_SNOMED);
  private static final SnomedConceptRecord INVALID_SNOMED_CONCEPT =
      NORMAL_SNOMEDS.get(INVALID_SNOMED);
  private static final List<SnomedConceptRecord> RESULTS_SNOMED_CONCEPTS =
      List.of(DETECTED_SNOMED_CONCEPT, NOT_DETECTED_SNOMED_CONCEPT, INVALID_SNOMED_CONCEPT);

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

  public static Optional<String> toOptional(String str) {
    if (str == null) {
      return Optional.empty();
    } else {
      return Optional.of(str);
    }
  }

  public static TestResult convertSnomedToResult(String snomed) {
    SnomedConceptRecord concept =
        RESULTS_SNOMED_CONCEPTS.stream()
            .filter(snomedConcept -> snomed.equals(snomedConcept.code()))
            .findFirst()
            .orElse(INVALID_SNOMED_CONCEPT);
    return concept.displayName();
  }

  public static String convertTestResultToSnomed(TestResult result) {
    SnomedConceptRecord concept =
        RESULTS_SNOMED_CONCEPTS.stream()
            .filter(snomedConcept -> result.equals(snomedConcept.displayName()))
            .findFirst()
            .orElse(INVALID_SNOMED_CONCEPT);
    return concept.code();
  }

  public static SnomedConceptRecord getSnomedConceptByCode(String snomedCode) {
    return RESULTS_SNOMED_CONCEPTS.stream()
        .filter(snomedConcept -> snomedCode.equals(snomedConcept.code()))
        .findFirst()
        .orElse(null);
  }
}
