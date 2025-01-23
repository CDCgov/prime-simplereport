package gov.cdc.usds.simplereport.service;

import com.okta.commons.lang.Strings;
import gov.cdc.usds.simplereport.config.AuthorizationConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Provider;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import gov.cdc.usds.simplereport.db.repository.ProviderRepository;
import gov.cdc.usds.simplereport.properties.OrderingProviderProperties;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProviderService {

  private final ProviderRepository providerRepository;
  private final OrganizationService organizationService;
  private final OrderingProviderProperties opProperties;

  @AuthorizationConfiguration.RequirePermissionEditFacility
  public Provider createProviderNoFacility(
      PersonName name, StreetAddress address, String phone, String npi) {
    return createProvider(name, address, phone, npi);
  }

  @AuthorizationConfiguration.RequirePermissionEditFacility
  public Provider createProviderForFacility(
      PersonName name, StreetAddress address, String telephone, String npi, UUID facilityId) {
    Facility f = organizationService.getFacilityInCurrentOrg(facilityId);

    Provider p = createProvider(name, address, telephone, npi);
    f.addProvider(p);
    return p;
  }

  private Provider createProvider(
      PersonName name, StreetAddress address, String telephone, String npi) {
    if (isMissingRequiredProviderData(name, telephone, npi)) {
      throw new IllegalArgumentException("Missing required fields for provider");
    }

    return providerRepository.save(new Provider(name, npi, address, telephone));
  }

  @AuthorizationConfiguration.RequirePermissionEditProvider
  public void updateProvider(
      UUID providerInternalId,
      PersonName name,
      StreetAddress address,
      String telephone,
      String npi) {
    if (isMissingRequiredProviderData(name, telephone, npi)) {
      throw new IllegalArgumentException("Missing required fields for provider");
    }

    // todo: this doesn't really matter since auth will fail
    Provider p =
        providerRepository
            .findByInternalIdAndIsDeletedIsFalse(providerInternalId)
            .orElseThrow(
                () ->
                    new IllegalArgumentException(
                        "Provider with id " + providerInternalId + " not found"));

    p.getNameInfo().setFirstName(name.getFirstName());
    p.getNameInfo().setMiddleName(name.getMiddleName());
    p.getNameInfo().setLastName(name.getLastName());
    p.getNameInfo().setSuffix(name.getSuffix());
    p.setProviderId(npi);
    p.setTelephone(telephone);
    p.setAddress(address);
  }

  @AuthorizationConfiguration.RequirePermissionEditProvider
  public void deleteProvider(UUID providerInternalId) {
    Provider p =
        providerRepository
            .findById(providerInternalId)
            .orElseThrow(
                () ->
                    new IllegalArgumentException(
                        // todo: doesn't really matter since auth would fail
                        "Provider with id " + providerInternalId + " not found"));

    if (p.getIsDeleted()) {
      throw new IllegalArgumentException(
          "Provider with id " + providerInternalId + " is already deleted");
    }

    Facility facility = p.getFacility();
    if (facility != null) {
      int providerCount = facility.getOrderingProviders().size();
      boolean providerNotRequired =
          opProperties.getStatesNotRequired().contains(facility.getAddress().getState());
      if (providerCount < 2 && !providerNotRequired) {
        throw new IllegalArgumentException(
            "Provider with id "
                + providerInternalId
                + " cannot be deleted because facilities in this state require at least 1 valid provider");
      }
    }

    p.setIsDeleted(true);
  }

  private boolean isMissingRequiredProviderData(PersonName name, String telephone, String npi) {
    return (name == null
        || Strings.isEmpty(name.getFirstName())
        || Strings.isEmpty(name.getLastName())
        || Strings.isEmpty(npi)
        || Strings.isEmpty(telephone));
  }
}
