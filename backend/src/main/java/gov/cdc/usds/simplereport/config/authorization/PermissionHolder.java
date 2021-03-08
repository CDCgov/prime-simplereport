package gov.cdc.usds.simplereport.config.authorization;

import java.util.ArrayList;
import java.util.Collection;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Interface for an object that returns a set (usually a singleton) of organization roles, and a set
 * (usually non-empty) of permissions granted by those roles.
 */
public interface PermissionHolder {

  Set<OrganizationRole> getGrantedRoles();

  default Set<UserPermission> getGrantedPermissions() {
    return getPermissionsFromRoles(getGrantedRoles());
  }

  default boolean grantsAllFacilityAccess() {
    return getGrantedPermissions().contains(UserPermission.ACCESS_ALL_FACILITIES);
  }

  default Set<OrganizationRole> getEffectiveRoles() {
    return getEffectiveRoles(getGrantedRoles());
  }

  /**
   * Iterate over all granted roles from most to least permission-granting, until all granted
   * permissions are covered by the roles added thus far, then stop and return that set of roles.
   */
  public static Set<OrganizationRole> getEffectiveRoles(Collection<OrganizationRole> roles) {
    List<OrganizationRole> grantedRoles = new ArrayList<>(roles);
    grantedRoles.sort(new OrganizationRole.EffectiveRoleComparator());
    // set of all permissions granted by the user's granted roles
    Set<UserPermission> grantedPerms = getPermissionsFromRoles(grantedRoles);

    // minimal set of roles that effectively captures all of user's granted permissions
    Set<OrganizationRole> effectiveRoles = EnumSet.noneOf(OrganizationRole.class);
    // all permissions granted by the OrganizationRoles in effectiveRoles
    Set<UserPermission> effectivePerms = EnumSet.noneOf(UserPermission.class);
    for (OrganizationRole r : grantedRoles) {
      if (effectivePerms.addAll(r.getGrantedPermissions())) {
        effectiveRoles.add(r);
      }
      if (effectivePerms.equals(grantedPerms)) {
        break;
      }
    }

    if (effectiveRoles.isEmpty() && roles.contains(OrganizationRole.getDefault())) {
      effectiveRoles.add(OrganizationRole.getDefault());
    }

    return effectiveRoles;
  }

  public static Set<UserPermission> getPermissionsFromRoles(Collection<OrganizationRole> roles) {
    Set<UserPermission> granted =
        roles.stream()
            .map(r -> r.getGrantedPermissions())
            .flatMap(Set::stream)
            .collect(Collectors.toSet());

    return granted;
  }

  public static boolean grantsAllFacilityAccess(Collection<OrganizationRole> roles) {
    return getPermissionsFromRoles(roles).contains(UserPermission.ACCESS_ALL_FACILITIES);
  }
}
