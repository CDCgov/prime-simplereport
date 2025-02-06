package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.utils.DateTimeUtils.DATE_TIME_FORMATTER;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.convertToZonedDateTime;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.getCurrentDatestamp;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.parseDateStringZoneId;
import static gov.cdc.usds.simplereport.utils.DateTimeUtils.parseLocalDateTime;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.ResultsUploaderCachingService;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class DateTimeUtilsTest {
  private static ResultsUploaderCachingService resultsUploaderCachingService;

  @BeforeAll
  public static void init() {
    resultsUploaderCachingService = mock(ResultsUploaderCachingService.class);
  }

  @BeforeEach
  public void beforeEach() {
    when(resultsUploaderCachingService.getZoneIdByAddress(any()))
        .thenReturn(ZoneId.of("US/Eastern"));
  }

  void testConvertToZonedDateTime(String dateString, ZoneId expectedZoneId) {
    var address = new StreetAddress(null, null, null, null, null);
    var actualZonedDateTime =
        convertToZonedDateTime(dateString, resultsUploaderCachingService, address);
    var expectedZonedDateTime = ZonedDateTime.of(2023, 6, 28, 14, 0, 0, 0, expectedZoneId);
    assertThat(actualZonedDateTime).hasToString(expectedZonedDateTime.toString());
  }

  @Test
  void testConvertToZonedDateTime_withValidTimezoneSuffix() {
    testConvertToZonedDateTime("6/28/2023 14:00 MST", ZoneId.of("US/Mountain"));
  }

  @Test
  void testConvertToZonedDateTime_withAddress() {
    when(resultsUploaderCachingService.getZoneIdByAddress(any()))
        .thenReturn(ZoneId.of("US/Pacific"));
    testConvertToZonedDateTime("6/28/2023 14:00", ZoneId.of("US/Pacific"));
  }

  @Test
  void testConvertToZonedDateTime_withExtraWhitespace() {
    String dateString = "01 / 01 / 2023 11 : 11";
    ZonedDateTime actualZonedDateTime = convertToZonedDateTime(dateString);
    ZonedDateTime expectedZonedDateTime =
        ZonedDateTime.of(2023, 1, 1, 11, 11, 0, 0, ZoneId.of("US/Eastern"));
    assertThat(actualZonedDateTime).isEqualTo(expectedZonedDateTime);
  }

  @Test
  void testParseLocalDateTime_withExtraWhitespace() {
    String dateTimeString = "01 / 01 / 2023 11 : 11";
    LocalDateTime expectedDateTime = LocalDateTime.of(2023, 1, 1, 11, 11);
    LocalDateTime actualDateTime = parseLocalDateTime(dateTimeString, DATE_TIME_FORMATTER);
    assertThat(actualDateTime).isEqualTo(expectedDateTime);
  }

  @Test
  void testConvertToZonedDateTime_withFallback() {
    testConvertToZonedDateTime("6/28/2023 14:00", ZoneId.of("US/Eastern"));
  }

  @Test
  void testParseDateStringZoneId_withTimezone() {
    String dateString = "01/01/2023 11:11 EST";
    ZoneId expectedZoneId = ZoneId.of("US/Eastern");
    ZoneId actualZoneId = parseDateStringZoneId(dateString);
    assertThat(actualZoneId).isEqualTo(expectedZoneId);
  }

  @Test
  void testParseDateStringZoneId_withoutTimezone() {
    String dateString = "01/01/2023 11:11";
    ZoneId expectedZoneId = ZoneId.of("US/Eastern");
    ZoneId actualZoneId = parseDateStringZoneId(dateString);
    assertThat(actualZoneId).isEqualTo(expectedZoneId);
  }

  @Test
  void testParseDateStringZoneId_pureDateOnly() {
    String dateString = "01/01/2023";
    ZoneId expectedZoneId = ZoneId.of("US/Eastern");
    ZoneId actualZoneId = parseDateStringZoneId(dateString);
    assertThat(actualZoneId).isEqualTo(expectedZoneId);
  }

  @Test
  void testParseDateStringZoneId_invalidTimezone() {
    String dateString = "01/01/2023 11:11 XYZ";
    ZoneId expectedZoneId = ZoneId.of("US/Eastern");
    ZoneId actualZoneId = parseDateStringZoneId(dateString);
    assertThat(actualZoneId).isEqualTo(expectedZoneId);
  }

  @Test
  void testConvertToZonedDateTime_withFallbackWithJustString() {
    String dateString = "6/28/2023 14:00";

    var actualZonedDateTime = convertToZonedDateTime(dateString);
    var expectedZonedDateTime = ZonedDateTime.of(2023, 6, 28, 14, 0, 0, 0, ZoneId.of("US/Eastern"));
    assertThat(actualZonedDateTime).hasToString(expectedZonedDateTime.toString());
  }

  @Test
  void testConvertToZonedDateTime_withICANNTzIdentifier() {
    testConvertToZonedDateTime("6/28/2023 14:00 US/Samoa", ZoneId.of("US/Samoa"));
  }

  void test_parseLocalDateTime(String dateTimeString, LocalDateTime expectedDateTime) {
    var actualDateTime = parseLocalDateTime(dateTimeString, DATE_TIME_FORMATTER);
    assertThat(expectedDateTime).hasToString(actualDateTime.toString());
  }

  @Test
  void parseLocalDateTime_single_digit_hour() {
    String dateTimeString = "07/13/2023 9:30";
    LocalDateTime expectedDateTime = LocalDateTime.of(2023, 7, 13, 9, 30);
    test_parseLocalDateTime(dateTimeString, expectedDateTime);
  }

  @Test
  void parseLocalDateTime_two_digit_hour() {
    String dateTimeString = "07/13/2023 09:30";
    LocalDateTime expectedDateTime = LocalDateTime.of(2023, 7, 13, 9, 30);
    test_parseLocalDateTime(dateTimeString, expectedDateTime);
  }

  @Test
  void parseLocalDateTime_no_time() {
    String dateTimeString = "07/13/2023";
    LocalDateTime expectedDateTime = LocalDateTime.of(2023, 7, 13, 12, 0);
    test_parseLocalDateTime(dateTimeString, expectedDateTime);
  }

  @Test
  void getCurrentDatestamp_returnDateString() {
    LocalDateTime expectedDateTime = LocalDateTime.of(2023, 7, 13, 12, 0);
    assertThat(getCurrentDatestamp(expectedDateTime)).isEqualTo("20230713");
  }
}
