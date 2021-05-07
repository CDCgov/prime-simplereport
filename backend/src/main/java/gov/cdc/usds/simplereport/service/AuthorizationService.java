package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import java.util.List;

public interface AuthorizationService {

  /**
   * Find and return all organizations in which the current user allegedly has a role, and what the
   * roles are. Organizations may be deleted or invalid: it is up to the caller to determine which
   * if any of these claims applies to the actual data model of the current API instance.
   */
  List<OrganizationRoleClaims> findAllOrganizationRoles();

  /** Is the current user a global site admin */
  boolean isSiteAdmin();
}
