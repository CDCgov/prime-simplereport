package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class ApiOrganization {

  private Organization wrapped;
  private List<Facility> facilities;

  public ApiOrganization(Organization wrapped, Collection<Facility> facilities) {
    super();
    this.wrapped = wrapped;
    this.facilities = new ArrayList<>(facilities);
  }

  public UUID getInternalId() {
    return wrapped.getInternalId();
  }

  public String getName() {
    return wrapped.getOrganizationName();
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
}
