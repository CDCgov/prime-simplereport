package gov.cdc.usds.simplereport.api;

import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.Date;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.lang.IllegalArgumentException;

/**
 * Static package for utilities to translate things to or from wireline format in non copy-paste ways.
 */
public class Translators {

    private static DateTimeFormatter US_SLASHDATE_FORMATTER = DateTimeFormatter.ofPattern("MM/dd/yyyy");
    private static DateTimeFormatter US_SLASHDATE_SHORT_FORMATTER = DateTimeFormatter.ofPattern("M/d/yyyy");
    private static DateTimeFormatter ISO_INSTANT_FORMATTER = DateTimeFormatter.ISO_INSTANT;

    public static final LocalDate parseUserShortDate(String date) {
        if (date == null) {
            return null;
        }
        try {
            return LocalDate.parse(date, US_SLASHDATE_SHORT_FORMATTER);
        } catch (DateTimeParseException e) {
            throw new IllegalGraphqlArgumentException("[" + date + "] is not a valid date.");
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
        }
        catch (DateTimeParseException parseException) {
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
        return value == null || "".equals(value) ? null : value.trim();
    }

    public static UUID parseUUID(String uuid) {
        return uuid == null || uuid == "" ? null : UUID.fromString(uuid);
    }

    public static PersonRole parsePersonRole(String r) {
        String role = parseString(r);
        if (role == null) {
            return PersonRole.UNKNOWN;
        } 
        try {
            return PersonRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e){
            throw new IllegalGraphqlArgumentException("\""+r+"\" is not a valid role.");
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
        throw new IllegalGraphqlArgumentException("\""+e+"\" is not a valid email.");
    }

    private static final Set<String> RACES = Set.of(
        "native", "asian", "black", "pacific", "white", "unknown", "refused"
    );

    public static String parseRace(String r) {
        String race = parseString(r);
        if (race == null) {
            return null;
        }
        race = race.toLowerCase();
        if (RACES.contains(race)) {
            return race;
        }
        throw new IllegalGraphqlArgumentException("\""+r+"\" is not a valid race.");
    }

    private static final Set<String> ETHNICITIES = Set.of(
        "hispanic", "not_hispanic"
    );

    public static String parseEthnicity(String e) {
        String ethnicity = parseString(e);
        if (ethnicity == null) {
            return null;
        }
        ethnicity = ethnicity.toLowerCase();
        if (ETHNICITIES.contains(ethnicity)) {
            return ethnicity;
        }
        throw new IllegalGraphqlArgumentException("\""+e+"\" is not a valid ethnicity.");
    }

    private static final Set<String> GENDERS = Set.of(
        "male", "female", "other"
    );

    public static String parseGender(String g) {
        String gender = parseString(g);
        if (gender == null) {
            return null;
        }
        gender = gender.toLowerCase();
        if (GENDERS.contains(gender)) {
            return gender;
        }
        throw new IllegalGraphqlArgumentException("\""+g+"\" is not a valid gender.");
    }

    private static final Map<String, Boolean> yesNoMap = Map.of(
        "y", true,
        "yes", true,
        "n", false,
        "no", false
    );


    public static Boolean parseYesNo(String v) {
        String value = parseString(v);
        if (value == null) {
            return null;
        }
        value = value.toLowerCase();
        try {
            return yesNoMap.get(value);
        } catch (Exception e) {
            throw new IllegalGraphqlArgumentException("\""+v+"\" is not a valid value.");
        }
    }

}
