package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import java.util.Optional;
import org.springframework.stereotype.Repository;
import org.springframework.web.context.annotation.RequestScope;

@Repository
@RequestScope
public class CurrentOrganizationRolesContextHolder {
  private boolean hasBeenPopulated = false;
  private Optional<OrganizationRoles> organizationRoles = Optional.empty();

  public Optional<OrganizationRoles> getOrganizationRoles() {
    return organizationRoles;
  }

  public boolean hasBeenPopulated() {
    return hasBeenPopulated;
  }

  public void setOrganizationRoles(Optional<OrganizationRoles> organizationRoles) {
    hasBeenPopulated = true;
    this.organizationRoles = organizationRoles;
  }

  // allow re-population of organization roles, this is used when canceling tenant
  // data access so the cached organization roles will not be returned
  public void reset() {
    hasBeenPopulated = false;
    organizationRoles = Optional.empty();
  }
}
