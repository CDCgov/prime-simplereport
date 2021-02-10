package gov.cdc.usds.simplereport.api;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;

import org.json.JSONObject;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Static package for utilities to translate things to or from wireline format
 * in non copy-paste ways.
 */
public class Translators {

    private static DateTimeFormatter US_SLASHDATE_FORMATTER = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static DateTimeFormatter US_SLASHDATE_SHORT_FORMATTER = DateTimeFormatter.ofPattern("M/d/yyyy");
    private static final int MAX_STRING_LENGTH = 500;

    public static final LocalDate parseUserShortDate(String d) {
        String date = parseString(d);
        if (date == null) {
            return null;
        }
        try {
            return LocalDate.parse(date, US_SLASHDATE_SHORT_FORMATTER);
        } catch (DateTimeParseException e) {
            throw new IllegalGraphqlArgumentException("[" + d + "] is not a valid date.");
        }
    }

    public static final LocalDate parseUserDate(String userSuppliedDateString) {
        if (userSuppliedDateString == null) {
            return null;
        }
        if (userSuppliedDateString.contains("/")) {
            return LocalDate.parse(userSuppliedDateString, US_SLASHDATE_FORMATTER);
        } else {
            return LocalDate.parse(userSuppliedDateString); // ISO_LOCAL_DATE is the default
        }
    }

    public static final Date parseUserDateTime(String userSuppliedIsoDateString) {
        if (userSuppliedIsoDateString == null) {
            return null;
        }
        Instant isoDateInstant;
        try {
            isoDateInstant = Instant.parse(userSuppliedIsoDateString);
        } catch (DateTimeParseException parseException) {
            throw new IllegalGraphqlArgumentException("[" + userSuppliedIsoDateString + "] is not a valid date.");
        }
        return Date.from(isoDateInstant);
    }

    public static String parsePhoneNumber(String userSuppliedPhoneNumber) {
        if (userSuppliedPhoneNumber == null) {
            return null;
        }

        try {
            var phoneUtil = PhoneNumberUtil.getInstance();
            return phoneUtil.format(phoneUtil.parse(userSuppliedPhoneNumber, "US"),
                    PhoneNumberUtil.PhoneNumberFormat.NATIONAL);
        } catch (NumberParseException parseException) {
            throw new IllegalGraphqlArgumentException("[" + userSuppliedPhoneNumber + "] is not a valid phone number.");
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
            throw new IllegalGraphqlArgumentException("\"" + uuid + "\" is not a valid UUID.");
        }
    }

    public static PersonRole parsePersonRole(String r) {
        String role = parseString(r);
        if (role == null) {
            return PersonRole.UNKNOWN;
        }
        try {
            return PersonRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalGraphqlArgumentException("\"" + r + "\" is not a valid role.");
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
        throw new IllegalGraphqlArgumentException("\"" + e + "\" is not a valid email.");
    }

    private static final Map<String, String> RACES = Map.of(
        "american indian or alaskan native", "native",
        "asian", "asian",
        "black or african american", "black",
        "native hawaiian or other pacific islander", "pacific",
        "white", "white",
        "unknown", "unknown",
        "refused to answer", "refused"
    );

    private static final Set<String> RACE_VALUES = RACES.values().stream().collect(Collectors.toSet());
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
        throw new IllegalGraphqlArgumentException("\"" + r + "\" must be one of [" + String.join(", ", RACE_VALUES) + "].");
    }

    public static String parseRaceDisplayValue(String r) {
        String race = parseString(r);
        if (race == null) {
            return null;
        }
        race = RACES.get(race.toLowerCase());
        if (race == null) {
            throw new IllegalGraphqlArgumentException("\"" + r + "\" must be one of [" + String.join(", ", RACE_KEYS) + "].");
        }
        return race;
    }

    private static final Set<String> ETHNICITIES = Set.of("hispanic", "not_hispanic");

    public static String parseEthnicity(String e) {
        String ethnicity = parseString(e);
        if (ethnicity == null) {
            return null;
        }
        ethnicity = ethnicity.toLowerCase();
        if (ETHNICITIES.contains(ethnicity)) {
            return ethnicity;
        }
        throw new IllegalGraphqlArgumentException(
                "\"" + e + "\" must be one of [" + String.join(", ", ETHNICITIES) + "].");
    }

    private static final Set<String> GENDERS = Set.of("male", "female", "other");

    public static String parseGender(String g) {
        String gender = parseString(g);
        if (gender == null) {
            return null;
        }
        gender = gender.toLowerCase();
        if (GENDERS.contains(gender)) {
            return gender;
        }
        throw new IllegalGraphqlArgumentException("\"" + g + "\" must be one of [" + String.join(", ", GENDERS) + "].");
    }

    private static final Map<String, Boolean> YES_NO = Map.of("y", true, "yes", true, "n", false, "no", false);

    public static Boolean parseYesNo(String v) {
        String stringValue = parseString(v);
        if (stringValue == null) {
            return null;
        }
        Boolean boolValue = YES_NO.get(stringValue.toLowerCase());
        if (boolValue == null) {
            throw new IllegalGraphqlArgumentException("\"" + v + "\" is not a valid value.");
        }
        return boolValue;
    }

    private static final Set<String> STATE_CODES = Set.of("AK", "AL", "AR", "AS", "AZ", "CA", "CO", "CT", "DC", "DE",
            "FL", "GA", "GU", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS",
            "MT", "NC", "ND", "NE", "NH", "NJ", "NM", "NV", "NY", "OH", "OK", "OR", "PA", "PR", "RI", "SC", "SD", "TN",
            "TX", "UT", "VA", "VI", "VT", "WA", "WI", "WV", "WY");

    public static String parseState(String s) {
        String state = parseString(s);
        if (state == null) {
            return null;
        }
        state = state.toUpperCase();
        if (STATE_CODES.contains(state)) {
            return state;
        }
        throw new IllegalGraphqlArgumentException("\"" + s + "\" is not a valid state.");
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
}
