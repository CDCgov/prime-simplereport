package gov.cdc.usds.simplereport.config.authorization;

import java.util.Collection;
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

  default boolean grantsArchivedFacilityAccess() {
    return getGrantedPermissions().contains(UserPermission.VIEW_ARCHIVED_FACILITIES);
  }

  private static Set<UserPermission> getPermissionsFromRoles(Collection<OrganizationRole> roles) {
    Set<UserPermission> granted =
        roles.stream()
            .map(r -> r.getGrantedPermissions())
            .flatMap(Set::stream)
            .collect(Collectors.toSet());

    return granted;
  }

  static boolean grantsAllFacilityAccess(Collection<OrganizationRole> roles) {
    return getPermissionsFromRoles(roles).contains(UserPermission.ACCESS_ALL_FACILITIES);
  }
}
