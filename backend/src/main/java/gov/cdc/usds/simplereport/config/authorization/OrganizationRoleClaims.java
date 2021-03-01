package gov.cdc.usds.simplereport.config.authorization;

import java.util.Collection;
import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

public class OrganizationRoleClaims implements PermissionHolder {

  private String organizationExternalId;
  private Set<OrganizationRole> grantedRoles;

  public OrganizationRoleClaims(
      String organizationExternalId, Collection<OrganizationRole> grantedRoles) {
    super();
    this.organizationExternalId = organizationExternalId;
    this.grantedRoles = EnumSet.copyOf(grantedRoles);
  }

  public String getOrganizationExternalId() {
    return organizationExternalId;
  }

  public Set<OrganizationRole> getGrantedRoles() {
    return Collections.unmodifiableSet(grantedRoles);
  }
}
