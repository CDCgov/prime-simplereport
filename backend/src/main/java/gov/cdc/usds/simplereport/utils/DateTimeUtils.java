package gov.cdc.usds.simplereport.utils;

import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.ResultsUploaderCachingService;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PRIVATE)
public class DateTimeUtils {
  /**
   * Noon instead of midnight so that if fallback timezone of US/Eastern is used, value is still
   * within the same calendar date (otherwise 6/27 00:00 ET is 6/26 21:00 PT)
   */
  private static final int DEFAULT_HOUR = 12;

  public static final DateTimeFormatter DATE_TIME_FORMATTER =
      DateTimeFormatter.ofPattern("M/d/yyyy[ H:mm]");

  public static final String TIMEZONE_SUFFIX_REGEX =
      "^(0?[1-9]|1[0-2])/(0?[1-9]|1\\d|2\\d|3[01])/\\d{4}( ([0-1]?\\d|2[0-3]):[0-5]\\d)( \\S+)$";

  public static final ZoneId FALLBACK_TIMEZONE_ID = ZoneId.of("US/Eastern");

  private static final ZoneId easternTimeZoneId = ZoneId.of("US/Eastern");
  private static final ZoneId centralTimeZoneId = ZoneId.of("US/Central");
  private static final ZoneId mountainTimeZoneId = ZoneId.of("US/Mountain");
  private static final ZoneId pacificTimeZoneId = ZoneId.of("US/Pacific");
  private static final ZoneId alaskaTimeZoneId = ZoneId.of("US/Alaska");
  private static final ZoneId hawaiiTimeZoneId = ZoneId.of("US/Hawaii");
  private static final ZoneId aleutianTimeZoneId = ZoneId.of("US/Aleutian");
  private static final ZoneId samoaTimeZoneId = ZoneId.of("US/Samoa");

  public static final Map<String, ZoneId> validTimeZoneIdMap =
      Map.ofEntries(
          Map.entry("UTC", ZoneOffset.UTC),
          Map.entry("UT", ZoneOffset.UTC),
          Map.entry("GMT", ZoneOffset.UTC),
          Map.entry("Z", ZoneOffset.UTC),
          Map.entry("ET", easternTimeZoneId),
          Map.entry("EST", easternTimeZoneId),
          Map.entry("EDT", easternTimeZoneId),
          Map.entry("CT", centralTimeZoneId),
          Map.entry("CST", centralTimeZoneId),
          Map.entry("CDT", centralTimeZoneId),
          Map.entry("MT", mountainTimeZoneId),
          Map.entry("MST", mountainTimeZoneId),
          Map.entry("MDT", mountainTimeZoneId),
          Map.entry("PT", pacificTimeZoneId),
          Map.entry("PST", pacificTimeZoneId),
          Map.entry("PDT", pacificTimeZoneId),
          Map.entry("AK", alaskaTimeZoneId),
          Map.entry("AKDT", alaskaTimeZoneId),
          Map.entry("AKST", alaskaTimeZoneId),
          Map.entry("HI", hawaiiTimeZoneId),
          Map.entry("HST", hawaiiTimeZoneId),
          Map.entry("HDT", aleutianTimeZoneId),
          Map.entry("AS", samoaTimeZoneId),
          Map.entry("ASM", samoaTimeZoneId),
          Map.entry("SST", samoaTimeZoneId));

  public static ZonedDateTime convertToZonedDateTime(
      String dateString,
      ResultsUploaderCachingService resultsUploaderCachingService,
      StreetAddress addressForTimezone) {
    ZoneId zoneId;
    LocalDateTime localDateTime;

    // If user provided timezone code in datetime field
    if (hasTimezoneSubstring(dateString)) {
      var timezoneCode = dateString.substring(dateString.lastIndexOf(" ")).trim();
      try {
        zoneId = parseZoneId(timezoneCode);
      } catch (DateTimeException e) {
        zoneId = FALLBACK_TIMEZONE_ID;
      }
    } else { // Otherwise try to get timezone by address
      zoneId = resultsUploaderCachingService.getZoneIdByAddress(addressForTimezone);
      // If that fails, use fallback
      if (zoneId == null) {
        zoneId = FALLBACK_TIMEZONE_ID;
      }
    }

    localDateTime = parseLocalDateTime(dateString, DATE_TIME_FORMATTER);
    return ZonedDateTime.of(localDateTime, zoneId);
  }

  public static boolean hasTimezoneSubstring(String value) {
    return value.matches(TIMEZONE_SUFFIX_REGEX);
  }

  public static ZoneId parseZoneId(String timezoneCode) {
    if (validTimeZoneIdMap.containsKey(timezoneCode.toUpperCase())) {
      return validTimeZoneIdMap.get(timezoneCode.toUpperCase());
    }
    return ZoneId.of(timezoneCode);
  }

  public static LocalDateTime parseLocalDateTime(
      String value, DateTimeFormatter dateTimeFormatter) {
    String dateTimeString = value;
    if (hasTimezoneSubstring(value)) {
      dateTimeString = dateTimeString.substring(0, value.lastIndexOf(' ')).trim();
    }
    LocalDateTime localDateTime;
    var temporalAccessor =
        dateTimeFormatter.parseBest(dateTimeString, LocalDateTime::from, LocalDate::from);
    if (temporalAccessor instanceof LocalDateTime) {
      localDateTime = (LocalDateTime) temporalAccessor;
    } else { // example "6/28/2023"
      localDateTime = ((LocalDate) temporalAccessor).atTime(DEFAULT_HOUR, 0, 0);
    }
    return localDateTime;
  }
}
