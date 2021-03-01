package gov.cdc.usds.simplereport.service.model;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.PermissionHolder;
import gov.cdc.usds.simplereport.db.model.Organization;
import java.util.EnumSet;
import java.util.Set;

public class OrganizationRoles implements PermissionHolder {

  private Organization _organization;
  private Set<OrganizationRole> _roles;

  public OrganizationRoles(Organization organization, Set<OrganizationRole> roles) {
    super();
    this._organization = organization;
    this._roles = EnumSet.copyOf(roles);
  }

  public Organization getOrganization() {
    return _organization;
  }

  public Set<OrganizationRole> getGrantedRoles() {
    return _roles;
  }
}
