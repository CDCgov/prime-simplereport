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

  private static final String MONTH = "(0?[1-9]|1[0-2])";
  private static final String DAY = "(0?[1-9]|[12]\\d|3[01])";
  private static final String HOUR = "(0?\\d|1\\d|2[0-3])";

  public static final String TIMEZONE_SUFFIX_REGEX =
      "^"
          + MONTH
          + "\\s*/\\s*"
          + DAY
          + "\\s*/\\s*\\d{4}\\s+"
          + HOUR
          + "\\s*:\\s*[0-5]\\d\\s+(\\S+)\\s*$";

  public static final ZoneId FALLBACK_TIMEZONE_ID = ZoneId.of("US/Eastern");

  private static final ZoneId easternTimeZoneId = ZoneId.of("US/Eastern");
  private static final ZoneId centralTimeZoneId = ZoneId.of("US/Central");
  private static final ZoneId mountainTimeZoneId = ZoneId.of("US/Mountain");
  private static final ZoneId pacificTimeZoneId = ZoneId.of("US/Pacific");
  private static final ZoneId alaskaTimeZoneId = ZoneId.of("US/Alaska");
  private static final ZoneId hawaiiTimeZoneId = ZoneId.of("US/Hawaii");
  private static final ZoneId aleutianTimeZoneId = ZoneId.of("US/Aleutian");
  private static final ZoneId samoaTimeZoneId = ZoneId.of("US/Samoa");
  private static final ZoneId puertoRicoTimeZoneId = ZoneId.of("America/Puerto_Rico");

  /**
   * Map of common name `time_zone` values returned from SmartyStreets and their corresponding
   * ZoneId https://www.smarty.com/docs/cloud/us-street-api
   */
  public static final Map<String, ZoneId> commonNameZoneIdMap =
      Map.ofEntries(
          Map.entry("Alaska".toLowerCase(), alaskaTimeZoneId),
          Map.entry("Atlantic".toLowerCase(), puertoRicoTimeZoneId),
          Map.entry("Central".toLowerCase(), centralTimeZoneId),
          Map.entry("Eastern".toLowerCase(), easternTimeZoneId),
          Map.entry("Hawaii".toLowerCase(), hawaiiTimeZoneId),
          Map.entry("Mountain".toLowerCase(), mountainTimeZoneId),
          Map.entry("None".toLowerCase(), FALLBACK_TIMEZONE_ID),
          Map.entry("Pacific".toLowerCase(), pacificTimeZoneId),
          Map.entry("Samoa".toLowerCase(), samoaTimeZoneId),
          Map.entry("UTC+9".toLowerCase(), ZoneId.of("+9")),
          Map.entry("UTC+10".toLowerCase(), ZoneId.of("+10")),
          Map.entry("UTC+11".toLowerCase(), ZoneId.of("+11")),
          Map.entry("UTC+12".toLowerCase(), ZoneId.of("+12")));

  /**
   * Map of abbreviated timezones and their corresponding ZoneId Used for bulk upload timestamp
   * validations and when converting user-supplied timezones to a ZoneId
   */
  public static final Map<String, ZoneId> timezoneAbbreviationZoneIdMap =
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
          Map.entry("SST", samoaTimeZoneId),
          Map.entry("ADT", puertoRicoTimeZoneId),
          Map.entry("AST", puertoRicoTimeZoneId));

  public static ZonedDateTime convertToZonedDateTime(
      String dateString,
      ResultsUploaderCachingService resultsUploaderCachingService,
      StreetAddress addressForTimezone) {
    ZoneId zoneId;
    LocalDateTime localDateTime;

    // If user provided timezone code in datetime field
    if (hasTimezoneSubstring(dateString)) {
      zoneId = parseDateStringZoneId(dateString);
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

  public static ZonedDateTime convertToZonedDateTime(String dateString) {
    ZoneId zoneId = parseDateStringZoneId(dateString);
    LocalDateTime localDateTime = parseLocalDateTime(dateString, DATE_TIME_FORMATTER);
    return ZonedDateTime.of(localDateTime, zoneId);
  }

  private static ZoneId parseDateStringZoneId(String dateString) {
    ZoneId zoneId;

    var timezoneCode = dateString.substring(dateString.lastIndexOf(" ")).trim();
    try {
      zoneId = parseZoneId(timezoneCode);
    } catch (DateTimeException e) {
      zoneId = FALLBACK_TIMEZONE_ID;
    }
    return zoneId;
  }

  public static boolean hasTimezoneSubstring(String value) {
    return value.matches(TIMEZONE_SUFFIX_REGEX);
  }

  public static ZoneId parseZoneId(String timezoneCode) {
    if (timezoneAbbreviationZoneIdMap.containsKey(timezoneCode.toUpperCase())) {
      return timezoneAbbreviationZoneIdMap.get(timezoneCode.toUpperCase());
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

  public static String getCurrentDatestamp(LocalDateTime time) {
    ZonedDateTime zonedDateTime = time.atZone(easternTimeZoneId);
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMdd");
    return formatter.format(zonedDateTime);
  }
}
