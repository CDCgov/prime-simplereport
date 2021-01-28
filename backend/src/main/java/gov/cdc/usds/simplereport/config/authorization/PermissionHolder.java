package gov.cdc.usds.simplereport.config.authorization;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

/**
 * Interface for an object that returns a set (usually a singleton) of
 * organization roles, and a set (usually non-empty) of permissions granted by
 * those roles.
 */
public interface PermissionHolder {

    Set<OrganizationRole> getGrantedRoles();

    default Set<UserPermission> getGrantedPermissions() {
        return getEffectiveRole().map(OrganizationRole::getGrantedPermissions)
                .orElse(Collections.emptySet());
    }

    default Optional<OrganizationRole> getEffectiveRole() {
        return getGrantedRoles().stream()
                .sorted(new OrganizationRole.EffectiveRoleComparator())
                .findFirst();
    }
}
