package gov.cdc.usds.simplereport.config.authorization;

import java.util.Arrays;
import java.util.Collections;
import java.util.Set;

/**
 * Interface for an object that returns a set (usually a singleton) of
 * organization roles, and a set (usually non-empty) of permissions granted by
 * those roles.
 */
public interface PermissionHolder {

    Set<OrganizationRole> getGrantedRoles();

    default Set<UserPermission> getGrantedPermissions() {
        Set<OrganizationRole> roles = getGrantedRoles();
        /* Find the highest-precedence role that the user has, and return the
         * permissions for that role */
        for (OrganizationRole r : Arrays.asList(OrganizationRole.ADMIN, OrganizationRole.ENTRY_ONLY,
                OrganizationRole.USER)) {
            if (roles.contains(r)) {
                return r.getGrantedPermissions();
            }
        }
        return Collections.emptySet();
    }
}
