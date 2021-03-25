package gov.cdc.usds.simplereport.config.authorization;

import gov.cdc.usds.simplereport.db.model.Organization;
import java.security.Principal;
import java.util.Objects;

/** A principal that represents the organizational affiliation of a SimpleReport user. */
public final class OrganizationPrincipal implements Principal {
  private final Organization organization;

  public OrganizationPrincipal(Organization organization) {
    this.organization = Objects.requireNonNull(organization);
  }

  @Override
  public String getName() {
    return organization.getExternalId();
  }

  public Organization getOrganization() {
    return organization;
  }

  @Override
  public boolean equals(Object o) {
    return this == o
        || (o instanceof OrganizationPrincipal
            && organization.equals(((OrganizationPrincipal) o).organization));
  }

  @Override
  public int hashCode() {
    return Objects.hash(organization);
  }
}
