package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import java.util.Collection;
import java.util.Comparator;
import java.util.Optional;

/**
 * The roles that can be granted to a user, that the front-end understands. The back-end knows of
 * other roles (detailed in {@code OrganizationRole}) that include and go beyond this list.
 *
 * <p>NOTE: the ordering of these values in this enum determines their precedence in resolving a
 * user's roles to one single role -- later roles have higher precedence. This role is used by the
 * front-end to give the user a single shorthand for understanding their privileges in their
 * organization, and is used to populate a single radio-button option and role description defining
 * what the user's role is. Do not edit this enum order casually!
 */
public enum Role {
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

  private Role(OrganizationRole translation) {
    this.translation = translation;
  }

  public String getDescription() {
    return translation.getDescription();
  }

  public OrganizationRole toOrganizationRole() {
    return translation;
  }

  static Optional<Role> fromOrganizationRole(OrganizationRole role) {
    for (Role apiRole : Role.values()) {
      if (apiRole.translation == role) {
        return Optional.of(apiRole);
      }
    }

    return Optional.empty();
  }

  // returns the corresponding Role from roles, with highest precedence
  static Optional<Role> fromOrganizationRoles(Collection<OrganizationRole> roles) {
    return roles.stream()
        .map(Role::fromOrganizationRole)
        .flatMap(Optional::stream)
        .sorted(Comparator.reverseOrder())
        .findFirst();
  }
}
