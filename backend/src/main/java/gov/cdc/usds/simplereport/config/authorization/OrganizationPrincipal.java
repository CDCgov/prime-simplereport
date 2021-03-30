package gov.cdc.usds.simplereport.config.authorization;

import gov.cdc.usds.simplereport.db.model.Organization;
import java.util.Objects;

/** A principal that represents the organizational affiliation of a SimpleReport user. */
public final class OrganizationPrincipal extends NamedPrincipal {
  private final Organization organization;

  public OrganizationPrincipal(Organization organization) {
    super("ORGANIZATION:" + organization.getExternalId());
    this.organization = organization;
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
