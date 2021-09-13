package gov.cdc.usds.simplereport.service.model;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.PermissionHolder;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;

public class OrganizationRoles implements PermissionHolder {

  private Organization _organization;
  private Set<Facility> _facilities;
  private Set<OrganizationRole> _roles;

  public OrganizationRoles(
      Organization organization, Set<Facility> facilities, Set<OrganizationRole> roles) {
    super();
    this._organization = organization;
    this._facilities = facilities;
    this._roles = EnumSet.copyOf(roles);
  }

  public Organization getOrganization() {
    return _organization;
  }

  public Set<Facility> getFacilities() {
    return _facilities;
  }

  public Set<OrganizationRole> getGrantedRoles() {
    return _roles;
  }

  public boolean containsFacility(UUID facilityId) {
    return getFacilities().stream().anyMatch(f -> f.getInternalId().equals(facilityId));
  }

  public boolean containsFacility(Facility facility) {
    return containsFacility(facility.getInternalId());
  }
}
