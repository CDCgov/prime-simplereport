package gov.cdc.usds.simplereport.service;

import com.smartystreets.api.ClientBuilder;
import com.smartystreets.api.exceptions.SmartyException;
import com.smartystreets.api.us_street.Candidate;
import com.smartystreets.api.us_street.Client;
import com.smartystreets.api.us_street.Lookup;
import com.smartystreets.api.us_street.MatchType;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.SmartyStreetsConfig;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.errors.InvalidAddressException;
import java.io.IOException;
import java.util.ArrayList;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AddressValidationService {

  private Client _client;

  public AddressValidationService(Client client) {
    _client = client;
  }

  @Autowired
  public AddressValidationService(SmartyStreetsConfig config) {
    _client = new ClientBuilder(config.getAuthId(), config.getAuthToken()).buildUsStreetApiClient();
  }

  public Lookup createLookup(
      String street1, String street2, String city, String state, String postalCode) {
    Lookup lookup = new Lookup();
    lookup.setStreet(street1);
    // Smartystreets defines Street2 as "Any extra address information (e.g., Leave it on the front
    // porch.)"
    // and secondary as "Apartment, suite, or office number (e.g., "Apt 52" or simply "52"; not
    // "Apt52".)""
    lookup.setSecondary(street2);
    lookup.setCity(city);
    lookup.setState(state);
    lookup.setZipCode(postalCode);
    return lookup;
  }

  /** Returns a StreetAddress if the address is valid and throws an exception if it is not */
  public StreetAddress getValidatedAddress(Lookup lookup) throws InvalidAddressException {
    lookup.setMatch(MatchType.STRICT);
    try {
      _client.send(lookup);
    } catch (SmartyException | IOException ex) {
      throw new IllegalGraphqlArgumentException(
          "The server is unable to verify the address you entered. Please try again later");
    }

    ArrayList<Candidate> results = lookup.getResult();

    if (results.isEmpty()) {
      throw new InvalidAddressException("Address entered could not be validated");
    }

    Candidate addressMatch = results.get(0);
    return new StreetAddress(
        lookup.getStreet(),
        lookup.getSecondary(),
        lookup.getCity(),
        lookup.getState(),
        lookup.getZipCode(),
        addressMatch.getMetadata().getCountyName());
  }
}
