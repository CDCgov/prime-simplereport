package gov.cdc.usds.simplereport.utils;

import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.AddressValidationService;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

public class DateTimeUtils {
    /**
     * Noon instead of midnight so that if fallback timezone of US/Eastern is used,
     * value is still within the same calendar date (otherwise 6/27 00:00 ET is 6/26 21:00 PT)
     */
    private static final int DEFAULT_HOUR = 12;
    public static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("M/d/yyyy[ HH:mm]");

    public static final String TIMEZONE_ABBREVIATION_SUFFIX_REGEX = "( [A-Z]{2,5})?$";

    public static ZoneId FALLBACK_TIMEZONE_ID = ZoneId.of("US/Eastern");

    public static Map<String, ZoneId> validTimeZoneIdMap = Map.ofEntries(
            Map.entry("UTC", ZoneId.of("UTC")),
            Map.entry("UT", ZoneId.of("UTC")),
            Map.entry("GMT", ZoneId.of("UTC")),
            Map.entry("Z", ZoneId.of("UTC")),
            Map.entry("ET", ZoneId.of("US/Eastern")),
            Map.entry("EST", ZoneId.of("US/Eastern")),
            Map.entry("EDT", ZoneId.of("US/Eastern")),
            Map.entry("CT", ZoneId.of("US/Central")),
            Map.entry("CST", ZoneId.of("US/Central")),
            Map.entry("CDT", ZoneId.of("US/Central")),
            Map.entry("MT", ZoneId.of("US/Mountain")),
            Map.entry("MST", ZoneId.of("US/Mountain")),
            Map.entry("MDT", ZoneId.of("US/Mountain")),
            Map.entry("PT", ZoneId.of("US/Pacific")),
            Map.entry("PST", ZoneId.of("US/Pacific")),
            Map.entry("PDT", ZoneId.of("US/Pacific")),
            Map.entry("AK", ZoneId.of("US/Alaska")),
            Map.entry("AKDT", ZoneId.of("US/Alaska")),
            Map.entry("AKST", ZoneId.of("US/Alaska")),
            Map.entry("HI", ZoneId.of("US/Hawaii")),
            Map.entry("HST", ZoneId.of("US/Hawaii")),
            Map.entry("HDT", ZoneId.of("US/Aleutian")),
            Map.entry("AS", ZoneId.of("US/Samoa")),
            Map.entry("ASM", ZoneId.of("US/Samoa")),
            Map.entry("SST", ZoneId.of("US/Samoa"))
    );

    public static ZonedDateTime convertToZonedDateTime(
            String dateString,
            AddressValidationService addressValidationService,
            StreetAddress addressForTimezone) {
        ZoneId zoneId;
        LocalDateTime localDateTime;

        if (hasTimezoneSubstring(dateString)) {
            var timezoneCode = dateString.substring(dateString.lastIndexOf(" ")).trim();
            try {
                zoneId = parseZoneId(timezoneCode);
            } catch (DateTimeException e) {
                zoneId = FALLBACK_TIMEZONE_ID;
            }
        } else {
            zoneId = addressValidationService.getZoneIdByAddress(addressForTimezone);
            if (zoneId == null) {
                zoneId = FALLBACK_TIMEZONE_ID;
            }
        }

        localDateTime = parseLocalDateTime(dateString, DATE_TIME_FORMATTER);
        return ZonedDateTime.of(localDateTime, zoneId);
    }

    public static boolean hasTimezoneSubstring(String value) {
        return value.matches(TIMEZONE_ABBREVIATION_SUFFIX_REGEX);
    }

    public static ZoneId parseZoneId(String timezoneCode) {
        if (validTimeZoneIdMap.containsKey(timezoneCode)) {
            return validTimeZoneIdMap.get(timezoneCode);
        }
        return ZoneId.of(timezoneCode);
    }

    public static LocalDateTime parseLocalDateTime(String value, DateTimeFormatter dateTimeFormatter) {
        String dateTimeString = value;
        if (hasTimezoneSubstring(value)) {
            dateTimeString = dateTimeString.substring(0, value.lastIndexOf(' ')).trim();
        }
        LocalDateTime localDateTime;
        var temporalAccessor = dateTimeFormatter.parseBest(dateTimeString, LocalDateTime::from, LocalDate::from);
        if (temporalAccessor instanceof LocalDateTime) {
            localDateTime = (LocalDateTime) temporalAccessor;
        } else {
            localDateTime = ((LocalDate) temporalAccessor).atTime(DEFAULT_HOUR, 0, 0);
        }
        return localDateTime;
    }
}
