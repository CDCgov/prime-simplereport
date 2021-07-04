package gov.cdc.usds.simplereport.api;

import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import java.util.Optional;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.stereotype.Repository;
import org.springframework.web.context.WebApplicationContext;

@Repository
@Scope(scopeName = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
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

  public void reset() {
    hasBeenPopulated = false;
    organizationRoles = Optional.empty();
  }
}
