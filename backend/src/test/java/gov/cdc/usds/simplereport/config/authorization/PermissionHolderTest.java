package gov.cdc.usds.simplereport.config.authorization;

import static org.junit.jupiter.api.Assertions.*;

import java.util.Collection;
import java.util.EnumSet;
import java.util.Set;

import org.junit.jupiter.api.Test;

/**
 * Tests for the mixin method(s) of {@link PermissionHolder}.
 */
class PermissionHolderTest {

    @Test
    void getGrantedPermissions_userRole_userPermissions() {
        Set<UserPermission> permissions = convertToPermissions(EnumSet.of(OrganizationRole.USER));
        Set<UserPermission> expected = EnumSet.of(
                UserPermission.READ_PATIENT_LIST,
                UserPermission.READ_RESULT_LIST,
                UserPermission.EDIT_PATIENT,
                UserPermission.START_TEST,
                UserPermission.UPDATE_TEST,
                UserPermission.SUBMIT_TEST);
        assertEquals(expected, permissions);
    }

    @Test
    void getGrantedPermissions_allRoles_allPermissions() {
        Set<UserPermission> permissions = convertToPermissions(EnumSet.allOf(OrganizationRole.class));
        assertEquals(UserPermission.values().length, permissions.size());
    }

    @Test
    void getGrantedPermissions_restrictedUser_restrictedPermissions() {
        Set<UserPermission> permissions = convertToPermissions(
                EnumSet.of(OrganizationRole.ENTRY_ONLY, OrganizationRole.USER));
        Set<UserPermission> expected = EnumSet.of(UserPermission.START_TEST, UserPermission.UPDATE_TEST,
                UserPermission.SUBMIT_TEST, UserPermission.READ_PATIENT_LIST);
        assertEquals(expected, permissions);
    }

    private Set<UserPermission> convertToPermissions(Collection<OrganizationRole> grantedRoles) {
        return new OrganizationRoles("IGNORE", grantedRoles).getGrantedPermissions();
    }
}
