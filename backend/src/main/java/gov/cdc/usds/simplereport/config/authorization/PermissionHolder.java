package gov.cdc.usds.simplereport.config.authorization;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;
import java.util.HashSet;

/**
 * Interface for an object that returns a set (usually a singleton) of
 * organization roles, and a set (usually non-empty) of permissions granted by
 * those roles.
 */
public interface PermissionHolder {

    Set<OrganizationRole> getGrantedRoles();

    default Set<UserPermission> getGrantedPermissions() {
        Set<OrganizationRole> roles = getGrantedRoles();
        Set<UserPermission> permissions = new HashSet<>();
        for (OrganizationRole r : Arrays.asList(OrganizationRole.ADMIN, OrganizationRole.ENTRY_ONLY,
                OrganizationRole.USER)) {
            if (roles.contains(r)) {
                permissions.addAll(r.getGrantedPermissions());
            }
        }
        return permissions;
    }
}
