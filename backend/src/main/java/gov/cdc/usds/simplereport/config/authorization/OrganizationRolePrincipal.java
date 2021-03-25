package gov.cdc.usds.simplereport.config.authorization;

import java.security.Principal;
import java.util.Objects;

/** A principal that represents a SimpleReport organization role. */
public final class OrganizationRolePrincipal implements Principal {
  private final OrganizationRole organizationRole;

  public OrganizationRolePrincipal(OrganizationRole organizationRole) {
    this.organizationRole = Objects.requireNonNull(organizationRole);
  }

  @Override
  public String getName() {
    return organizationRole.name();
  }

  public OrganizationRole getOrganizationRole() {
    return organizationRole;
  }

  @Override
  public boolean equals(Object o) {
    return this == o
        || (o instanceof OrganizationRolePrincipal
            && organizationRole.equals(((OrganizationRolePrincipal) o).organizationRole));
  }

  @Override
  public int hashCode() {
    return Objects.hash(organizationRole);
  }
}
