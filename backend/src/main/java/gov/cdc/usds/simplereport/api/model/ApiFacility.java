package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.api.model.facets.LocatedWrapper;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.service.model.WrappedEntity;
import java.util.List;
import java.util.Optional;

public class ApiFacility extends WrappedEntity<Facility> implements LocatedWrapper<Facility> {

  public ApiFacility(Facility wrapped) {
    super(wrapped);
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

  public boolean getIsDeleted() {
    return getWrapped().getIsDeleted();
  }

  public List<DeviceType> getDeviceTypes() {
    return getWrapped().getDeviceTypes();
  }

  public ApiProvider getOrderingProvider() {
    return Optional.ofNullable(getWrapped().getDefaultOrderingProvider())
        .map(ApiProvider::new)
        .orElse(null);
  }
}
