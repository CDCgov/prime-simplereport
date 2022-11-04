package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
import java.io.IOException;
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

    StreetAddress address = s.getValidatedAddress(lookup, null);

    assertEquals("", address.getCounty());
  }

  @Test
  void setsCountyOnStreetAddress() throws SmartyException, IOException {
    ArrayList<Candidate> results = new ArrayList<Candidate>();
    results.add(getMockResult());
    Lookup lookup = mock(Lookup.class);
    when(lookup.getResult()).thenReturn(results);

    StreetAddress address = s.getValidatedAddress(lookup, null);

    assertEquals("District of Columbia", address.getCounty());
  }

  @Test
  void doesNotCorrectStreet() throws SmartyException, IOException {
    ArrayList<Candidate> results = new ArrayList<Candidate>();
    results.add(getMockResult());
    Lookup lookup = mock(Lookup.class);
    when(lookup.getStreet()).thenReturn("User entered street");
    when(lookup.getResult()).thenReturn(results);

    StreetAddress address = s.getValidatedAddress(lookup, null);

    assertEquals("User entered street", address.getStreetOne());
  }

  private Candidate getMockResult() {
    Metadata metadata = mock(Metadata.class);
    when(metadata.getCountyName()).thenReturn("District of Columbia");

    Candidate result = mock(Candidate.class);
    when(result.getMetadata()).thenReturn(metadata);
    return result;
  }
}
