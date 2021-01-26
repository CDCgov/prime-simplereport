package gov.cdc.usds.simplereport.config.authorization;

import java.util.Set;
import java.util.Collections;

/**
 * Interface for an object that returns a set (usually a singleton) of
 * organization roles, and a set (usually non-empty) of permissions granted by
 * those roles.
 */
public interface PermissionHolder {

    Set<OrganizationRole> getGrantedRoles();

    default Set<UserPermission> getGrantedPermissions() {
        Set<OrganizationRole> roles = getGrantedRoles();
        // Even though this is clunkier than a for-loop, 
        // it makes the permission check order super-explicit, as it should be
        if (roles.contains(OrganizationRole.ADMIN)) {
            return OrganizationRole.ADMIN.getGrantedPermissions();
        } else if (roles.contains(OrganizationRole.ENTRY_ONLY)) {
            return OrganizationRole.ENTRY_ONLY.getGrantedPermissions();
        } else if (roles.contains(OrganizationRole.USER)) {
            return OrganizationRole.USER.getGrantedPermissions();
        } else {
            return Collections.emptySet();
        }
    }
}
