package gov.cdc.usds.simplereport.config.authorization;

import java.util.Collection;
import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;
import java.util.UUID;

public class OrganizationRoleClaims implements PermissionHolder {

  private String organizationExternalId;
  private Set<UUID> facilities;
  private Set<OrganizationRole> grantedRoles;

  public OrganizationRoleClaims(
      String organizationExternalId,
      Set<UUID> facilities,
      Collection<OrganizationRole> grantedRoles) {
    super();
    this.organizationExternalId = organizationExternalId;
    this.facilities = facilities;
    this.grantedRoles = EnumSet.copyOf(grantedRoles);
  }

  public String getOrganizationExternalId() {
    return organizationExternalId;
  }

  /**
   * This is the collection of facilities that a user can access. If {@code getGrantedRoles()}
   * returns {@code UserPermission.ACCESS_ALL_FACILITIES}, the return value from this method can be
   * ignored.
   */
  public Set<UUID> getFacilities() {
    return Collections.unmodifiableSet(facilities);
  }

  public Set<OrganizationRole> getGrantedRoles() {
    return Collections.unmodifiableSet(grantedRoles);
  }
}
