package gov.cdc.usds.simplereport.api.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import gov.cdc.usds.simplereport.api.model.facets.LocatedWrapper;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.service.model.WrappedEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public class ApiFacility extends WrappedEntity<Facility> implements LocatedWrapper<Facility> {

  public ApiFacility(Facility wrapped) {
    super(wrapped);
  }

  @JsonIgnore
  public UUID getOrganizationInternalID() {
    return getWrapped().getOrganization().getInternalId();
  }

  public String getName() {
    return getWrapped().getFacilityName();
  }

  public String getCliaNumber() {
    return getWrapped().getCliaNumber();
  }

  public String getPhone() {
    return getWrapped().getTelephone();
  }

  public String getEmail() {
    return getWrapped().getEmail();
  }

  public List<DeviceType> getDeviceTypes() {
    return getWrapped().getDeviceTypes();
  }

  public DeviceType getDefaultDeviceType() {
    return getWrapped().getDefaultDeviceType();
  }

  public ApiProvider getOrderingProvider() {
    return Optional.ofNullable(getWrapped().getOrderingProvider())
        .map(ApiProvider::new)
        .orElse(null);
  }
}
