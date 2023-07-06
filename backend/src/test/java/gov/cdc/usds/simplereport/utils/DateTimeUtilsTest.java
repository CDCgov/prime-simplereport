package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.utils.DateTimeUtils.convertToZonedDateTime;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.ResultsUploaderCachingService;
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
  void testConvertToZonedDateTime_withFallback() {
    testConvertToZonedDateTime("6/28/2023 14:00", ZoneId.of("US/Eastern"));
  }

  @Test
  void testConvertToZonedDateTime_withICANNTzIdentifier() {
    testConvertToZonedDateTime("6/28/2023 14:00 US/Samoa", ZoneId.of("US/Samoa"));
  }
}
