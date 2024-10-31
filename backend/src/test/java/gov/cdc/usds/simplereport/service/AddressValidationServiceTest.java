package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.isA;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.smartystreets.api.exceptions.SmartyException;
import com.smartystreets.api.us_street.Candidate;
import com.smartystreets.api.us_street.Client;
import com.smartystreets.api.us_street.Lookup;
import com.smartystreets.api.us_street.Metadata;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.errors.InvalidAddressException;
import gov.cdc.usds.simplereport.service.model.TimezoneInfo;
import java.io.IOException;
import java.time.ZoneId;
import java.util.ArrayList;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AddressValidationServiceTest {

  private AddressValidationService s;

  @BeforeEach
  public void setup() throws SmartyException, IOException, InterruptedException {
    Client client = mock(Client.class);
    doNothing().when(client).send(isA(Lookup.class));
    s = new AddressValidationService(client);
  }

  @Test
  void returnsEmptyCountyWhenNoAddressesAreFound() {
    ArrayList<Candidate> results = new ArrayList<Candidate>();
    Lookup lookup = mock(Lookup.class);
    when(lookup.getResult()).thenReturn(results);

    StreetAddress address = s.getValidatedAddress(lookup);

    assertEquals("", address.getCounty());
  }

  @Test
  void setsCountyOnStreetAddress() throws SmartyException, IOException {
    ArrayList<Candidate> results = new ArrayList<Candidate>();
    results.add(getMockResult());
    Lookup lookup = mock(Lookup.class);
    when(lookup.getResult()).thenReturn(results);

    StreetAddress address = s.getValidatedAddress(lookup);

    assertEquals("District of Columbia", address.getCounty());
  }

  @Test
  void doesNotCorrectStreet() throws SmartyException, IOException {
    ArrayList<Candidate> results = new ArrayList<Candidate>();
    results.add(getMockResult());
    Lookup lookup = mock(Lookup.class);
    when(lookup.getStreet()).thenReturn("User entered street");
    when(lookup.getResult()).thenReturn(results);

    StreetAddress address = s.getValidatedAddress(lookup);

    assertEquals("User entered street", address.getStreetOne());
  }

  @Test
  void withSupportedTimezoneCommonName_returnsCorrectZoneIdByLookup() {
    ArrayList<Candidate> results = new ArrayList<Candidate>();
    results.add(getMockTimeZoneInfoResult("Central", -5.0));
    Lookup lookup = mock(Lookup.class);
    when(lookup.getResult()).thenReturn(results);

    ZoneId zoneId = s.getZoneIdByLookup(lookup);

    assertEquals(ZoneId.of("US/Central"), zoneId);
  }

  @Test
  void withSupportedUtcOffsetTimezone_returnsCorrectZoneIdByLookup() {
    ArrayList<Candidate> results = new ArrayList<Candidate>();
    results.add(getMockTimeZoneInfoResult("UTC+9", +9.0));
    Lookup lookup = mock(Lookup.class);
    when(lookup.getResult()).thenReturn(results);

    ZoneId zoneId = s.getZoneIdByLookup(lookup);

    assertEquals(ZoneId.of("+9"), zoneId);
  }

  @Test
  void withUnsupportedTimezoneCommonName_returnsNull() {
    ArrayList<Candidate> results = new ArrayList<Candidate>();
    results.add(getMockTimeZoneInfoResult("FakeZoneId", -25.0));
    Lookup lookup = mock(Lookup.class);
    when(lookup.getResult()).thenReturn(results);

    ZoneId zoneId = s.getZoneIdByLookup(lookup);

    assertNull(zoneId);
  }

  @Test
  void returnsCorrectTimeZoneInfoByLookup() {
    ArrayList<Candidate> results = new ArrayList<>();
    results.add(getMockResult());
    Lookup lookup = mock(Lookup.class);
    when(lookup.getResult()).thenReturn(results);

    TimezoneInfo timeZoneInfo = s.getTimezoneInfoByLookup(lookup);

    assertEquals(results.get(0).getMetadata().getTimeZone(), timeZoneInfo.timezoneCommonName);
    assertEquals(results.get(0).getMetadata().getUtcOffset(), timeZoneInfo.utcOffset);
    assertEquals(results.get(0).getMetadata().obeysDst(), timeZoneInfo.obeysDaylightSavings);
  }

  @Test
  void throwsInvalidAddressExceptionOnEmptyResults() {
    ArrayList<Candidate> results = new ArrayList<>();
    Lookup lookup = mock(Lookup.class);
    when(lookup.getResult()).thenReturn(results);

    assertThrows(InvalidAddressException.class, () -> s.getTimezoneInfoByLookup(lookup));
  }

  private Candidate getMockTimeZoneInfoResult(String commonName, Double utcOffset) {
    Metadata metadata = mock(Metadata.class);
    when(metadata.getTimeZone()).thenReturn(commonName);
    when(metadata.getUtcOffset()).thenReturn(utcOffset);
    when(metadata.obeysDst()).thenReturn(true);

    Candidate result = mock(Candidate.class);
    when(result.getMetadata()).thenReturn(metadata);
    return result;
  }

  private Candidate getMockResult() {
    Metadata metadata = mock(Metadata.class);
    when(metadata.getCountyName()).thenReturn("District of Columbia");

    Candidate result = mock(Candidate.class);
    when(result.getMetadata()).thenReturn(metadata);
    return result;
  }
}
