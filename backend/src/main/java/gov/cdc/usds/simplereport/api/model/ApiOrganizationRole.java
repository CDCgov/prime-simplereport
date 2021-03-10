package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import java.util.Collection;
import java.util.Optional;

/**
 * The roles that can be granted to a user, that the front-end understands. The back-end knows of
 * other roles (detailed in {@code OrganizationRole}) that include and go beyond this list.
 *
 * <p>NOTE: the list of these values determines their precedence in resolving a user's roles to one
 * single role -- later roles have higher precedence. Do not edit this order casually!
 */
public enum ApiOrganizationRole {
  /**
   * This is the role for users who are only permitted to create and submit tests, but cannot view
   * historical data or read the entire patient roster.
   */
  ENTRY_ONLY(OrganizationRole.ENTRY_ONLY),
  /**
   * This is the standard role for users who can view and edit patients, create and submit tests,
   * and view historical test results.
   */
  USER(OrganizationRole.USER),
  /**
   * This is the organization admin role: if you have this role, then you have the ability to change
   * your role, so other roles you may have are moot.
   */
  ADMIN(OrganizationRole.ADMIN);

  private OrganizationRole translation;

  private ApiOrganizationRole(OrganizationRole translation) {
    this.translation = translation;
  }

  public String getDescription() {
    return translation.getDescription();
  }

  public OrganizationRole toOrganizationRole() {
    return translation;
  }

  static Optional<ApiOrganizationRole> fromOrganizationRole(OrganizationRole role) {
    for (ApiOrganizationRole apiRole : ApiOrganizationRole.values()) {
      if (apiRole.translation == role) {
        return Optional.of(apiRole);
      }
    }

    return Optional.empty();
  }

  // returns the corresponding ApiOrganizationRole from roles, with highest precedence
  static Optional<ApiOrganizationRole> fromOrganizationRoles(Collection<OrganizationRole> roles) {
    Optional<ApiOrganizationRole> result = Optional.empty();
    for (OrganizationRole role : roles) {
      Optional<ApiOrganizationRole> apiRole = fromOrganizationRole(role);
      if (result.isEmpty() || (!apiRole.isEmpty() && apiRole.get().compareTo(result.get()) >= 0)) {
        result = apiRole;
      }
    }

    return result;
  }
}
