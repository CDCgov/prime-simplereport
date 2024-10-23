package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.Translators.parseState;
import static gov.cdc.usds.simplereport.api.Translators.parseString;

import com.smartystreets.api.ClientBuilder;
import com.smartystreets.api.exceptions.SmartyException;
import com.smartystreets.api.us_street.Candidate;
import com.smartystreets.api.us_street.Client;
import com.smartystreets.api.us_street.Lookup;
import com.smartystreets.api.us_street.MatchType;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.properties.SmartyStreetsProperties;
import gov.cdc.usds.simplereport.service.errors.InvalidAddressException;
import gov.cdc.usds.simplereport.service.model.TimezoneInfo;
import java.io.IOException;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AddressValidationService {
  private Client _client;

  public AddressValidationService(Client client) {
    _client = client;
  }

  @Autowired
  public AddressValidationService(SmartyStreetsProperties config) {
    _client = new ClientBuilder(config.getId(), config.getToken()).buildUsStreetApiClient();
  }

  private Lookup getStrictLookup(
      String street1, String street2, String city, String state, String postalCode) {
    Lookup lookup = new Lookup();
    lookup.setStreet(parseString(street1));
    // Smartystreets defines Street2 as "Any extra address information (e.g., Leave it on the front
    // porch.)"
    // and secondary as "Apartment, suite, or office number (e.g., "Apt 52" or simply "52"; not
    // "Apt52".)""
    lookup.setSecondary(parseString(street2));
    lookup.setCity(parseString(city));
    lookup.setState(parseState(state));
    lookup.setZipCode(parseString(postalCode));
    lookup.setMatch(MatchType.STRICT);
    return lookup;
  }

  private List<Candidate> getLookupResults(Lookup lookup) {
    try {
      _client.send(lookup);
    } catch (SmartyException | IOException ex) {
      log.error("SmartyStreets address lookup failed", ex);
      throw new IllegalGraphqlArgumentException(
          "The server is unable to verify the address you entered. Please try again later");
    } catch (InterruptedException ex) {
      log.error("SmartyStreets address lookup interrupted", ex);
      Thread.currentThread().interrupt();
    }

    return lookup.getResult();
  }

  public StreetAddress getValidatedAddress(Lookup lookup) {
    var results = getLookupResults(lookup);

    if (results.isEmpty()) {
      return new StreetAddress(
          lookup.getStreet(),
          lookup.getSecondary(),
          lookup.getCity(),
          lookup.getState(),
          lookup.getZipCode(),
          "");
    }

    // If the address is invalid then Smarty street returns 0 results.
    // If the address is valid the results are returned and the first result is the best match
    // and is the one we should be using to get the County metadata
    Candidate addressMatch = results.get(0);
    return new StreetAddress(
        lookup.getStreet(),
        lookup.getSecondary(),
        lookup.getCity(),
        lookup.getState(),
        lookup.getZipCode(),
        addressMatch.getMetadata().getCountyName());
  }

  /** Returns a StreetAddress if the address is valid and throws an exception if it is not */
  public StreetAddress getValidatedAddress(
      String street1, String street2, String city, String state, String postalCode) {
    Lookup lookup = getStrictLookup(street1, street2, city, state, postalCode);
    return getValidatedAddress(lookup);
  }

  public TimezoneInfo getTimezoneInfoByLookup(Lookup lookup) {
    var results = getLookupResults(lookup);

    if (results.isEmpty()) {
      throw new InvalidAddressException("The server is unable to verify the address you entered.");
    }

    Candidate addressMatch = results.get(0);

    return TimezoneInfo.builder()
        .timezoneCommonName(addressMatch.getMetadata().getTimeZone())
        .utcOffset((int) addressMatch.getMetadata().getUtcOffset())
        .obeysDaylightSavings(addressMatch.getMetadata().obeysDst())
        .build();
  }

  /**
   * @param address the StreetAddress to find the timezone id of
   * @return ZoneId of the address or null if not found
   */
  public ZoneId getZoneIdByAddress(StreetAddress address) {
    if (address == null) {
      return null;
    }
    Lookup lookup =
        getStrictLookup(
            address.getStreetOne(),
            address.getStreetTwo(),
            address.getCity(),
            address.getState(),
            address.getPostalCode());
    return getZoneIdByLookup(lookup);
  }

  public ZoneId getZoneIdByLookup(Lookup lookup) {
    TimezoneInfo timezoneInfo = null;
    try {
      timezoneInfo = getTimezoneInfoByLookup(lookup);
    } catch (InvalidAddressException | IllegalGraphqlArgumentException exception) {
      log.error("Unable to find timezone with provided address", exception);
    }
    if (timezoneInfo == null) {
      return null;
    }

    ZoneOffset zoneOffset = ZoneOffset.of(String.valueOf(timezoneInfo.utcOffset));
    return ZoneId.of(zoneOffset.getId());
  }
}
