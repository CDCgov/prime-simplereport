package gov.cdc.usds.simplereport.utils;

import static gov.cdc.usds.simplereport.utils.DateTimeUtils.convertToZonedDateTime;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.AddressValidationService;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

public class DateTimeUtilsTest {
  private static AddressValidationService addressValidationService;

  @BeforeAll
  public static void init() {
    addressValidationService = mock(AddressValidationService.class);
  }

  @Test
  void testConvertToZonedDateTime_withValidTimezoneSuffix() {
    var date = "6/28/2023 14:00 MST";
    var address = new StreetAddress(null, null, null, null, null);
    var expectedZonedDateTime =
        ZonedDateTime.of(2023, 6, 28, 14, 0, 0, 0, ZoneId.of("US/Mountain"));

    var actualZonedDateTime = convertToZonedDateTime(date, addressValidationService, address);

    assertThat(actualZonedDateTime.toString()).isEqualTo(expectedZonedDateTime.toString());
  }

  @Test
  void testConvertToZonedDateTime_withAddress() {
    var date = "6/28/2023 14:00";
    when(addressValidationService.getZoneIdByAddress(any())).thenReturn(ZoneId.of("US/Pacific"));
    var address = new StreetAddress(null, null, null, null, null);
    var expectedZonedDateTime = ZonedDateTime.of(2023, 6, 28, 14, 0, 0, 0, ZoneId.of("US/Pacific"));

    var actualZonedDateTime = convertToZonedDateTime(date, addressValidationService, address);

    assertThat(actualZonedDateTime.toString()).isEqualTo(expectedZonedDateTime.toString());
  }

  @Test
  void testConvertToZonedDateTime_withFallback() {
    var date = "6/28/2023 14:00";
    var address = new StreetAddress(null, null, null, null, null);
    var expectedZonedDateTime = ZonedDateTime.of(2023, 6, 28, 14, 0, 0, 0, ZoneId.of("US/Eastern"));

    var actualZonedDateTime = convertToZonedDateTime(date, addressValidationService, address);

    assertThat(actualZonedDateTime.toString()).isEqualTo(expectedZonedDateTime.toString());
  }

  @Test
  void testConvertToZonedDateTime_withICANNTzIdentifier() {
    var date = "6/28/2023 14:00 US/Samoa";
    var address = new StreetAddress(null, null, null, null, null);
    var expectedZonedDateTime = ZonedDateTime.of(2023, 6, 28, 14, 0, 0, 0, ZoneId.of("US/Samoa"));

    var actualZonedDateTime = convertToZonedDateTime(date, addressValidationService, address);

    assertThat(actualZonedDateTime.toString()).isEqualTo(expectedZonedDateTime.toString());
  }
}
