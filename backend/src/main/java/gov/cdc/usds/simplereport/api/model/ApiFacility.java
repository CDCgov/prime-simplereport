package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.api.model.facets.LocatedWrapper;
import gov.cdc.usds.simplereport.db.model.DeviceSpecimenType;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.SpecimenType;
import gov.cdc.usds.simplereport.service.model.WrappedEntity;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

  public List<UUID> getDeviceSpecimenTypes() {
    return getWrapped().getDeviceSpecimenTypes();
  }
  /*
  public List<DeviceSpecimenType> getDeviceSpecimenTypes() {
    return getWrapped().getDeviceSpecimenTypes();
  }
  */

  public List<DeviceType> getDeviceTypes() {
    return getWrapped().getDeviceTypes();
  }

  public List<SpecimenType> getSpecimenTypes() {
    return getWrapped().getSpecimenTypes();
  }

  public DeviceType getDefaultDeviceType() {
    return getWrapped().getDefaultDeviceType();
  }

  public DeviceSpecimenType getDefaultDeviceSpecimen() {
    return getWrapped().getDefaultDeviceSpecimen();
  }

  public ApiProvider getOrderingProvider() {
    return Optional.ofNullable(getWrapped().getOrderingProvider())
        .map(ApiProvider::new)
        .orElse(null);
  }
}
