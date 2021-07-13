package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.WrappedEntity;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

public class ApiOrganization extends WrappedEntity<Organization> {

  private List<Facility> facilities;

  public ApiOrganization(Organization wrapped, Collection<Facility> facilities) {
    super(wrapped);
    this.facilities = new ArrayList<>(facilities);
  }

  public String getName() {
    return wrapped.getOrganizationName();
  }

  public String getType() {
    return wrapped.getOrganizationType();
  }

  public String getExternalId() {
    return wrapped.getExternalId();
  }

  public List<ApiFacility> getTestingFacility() {
    return getFacilities();
  }

  public List<ApiFacility> getFacilities() {
    return facilities.stream().map(ApiFacility::new).collect(Collectors.toList());
  }

  public boolean getIdentityVerified() {
    return wrapped.getIdentityVerified();
  }

  public String getPatientSelfRegistrationLink() {
    return wrapped.getPatientSelfRegistrationLink();
  }
}
