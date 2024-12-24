package gov.cdc.usds.simplereport.api.provider;

import static gov.cdc.usds.simplereport.api.Translators.parseState;
import static gov.cdc.usds.simplereport.api.Translators.parseString;

import gov.cdc.usds.simplereport.api.model.AddProviderInput;
import gov.cdc.usds.simplereport.api.model.UpdateProviderInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.service.ProviderService;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class ProviderResolver {

  private final ProviderService providerService;

  @MutationMapping
  // todo: change to return Provider, must include UUID
  public boolean addProvider(@Argument AddProviderInput providerData, @Argument UUID facilityId) {
    PersonName name =
        new PersonName(
            providerData.getFirstName(),
            providerData.getMiddleName(),
            providerData.getLastName(),
            providerData.getSuffix());
    StreetAddress address =
        new StreetAddress(
            parseString(providerData.getStreet()),
            parseString(providerData.getStreetTwo()),
            parseString(providerData.getCity()),
            parseState(providerData.getState()),
            parseString(providerData.getZipCode()),
            parseString(providerData.getCounty()));

    if (facilityId != null) {
      providerService.createProviderForFacility(
          name, address, providerData.getPhone(), providerData.getNpi(), facilityId);
    } else {
      providerService.createProviderNoFacility(
          name, address, providerData.getPhone(), providerData.getNpi());
    }
    return true;
  }

  @MutationMapping
  // todo: change to return Provider
  public boolean updateProvider(@Argument UpdateProviderInput providerData) {
    PersonName name =
        new PersonName(
            providerData.getFirstName(),
            providerData.getMiddleName(),
            providerData.getLastName(),
            providerData.getSuffix());
    StreetAddress address =
        new StreetAddress(
            parseString(providerData.getStreet()),
            parseString(providerData.getStreetTwo()),
            parseString(providerData.getCity()),
            parseState(providerData.getState()),
            parseString(providerData.getZipCode()),
            parseString(providerData.getCounty()));

    providerService.updateProvider(
        providerData.getProviderId(),
        name,
        address,
        providerData.getPhone(),
        providerData.getNpi());

    return true;
  }

  @MutationMapping
  public boolean deleteProvider(@Argument UUID providerId) {
    providerService.deleteProvider(providerId);
    return true;
  }
}
