package gov.cdc.usds.simplereport.config.authorization;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Collection;
import java.util.EnumSet;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;

/** Tests for the mixin methods of {@link PermissionHolder}. */
class PermissionHolderTest {

  @Test
  void getGrantedPermissions_userRole_userPermissions() {
    Set<UserPermission> permissions = convertToPermissions(EnumSet.of(OrganizationRole.USER));
    Set<UserPermission> expected =
        EnumSet.of(
            UserPermission.READ_PATIENT_LIST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.READ_RESULT_LIST,
            UserPermission.EDIT_PATIENT,
            UserPermission.ARCHIVE_PATIENT,
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
  void getGrantedPermissions_noRoles_noPermissions() {
    Set<UserPermission> permissions = convertToPermissions(EnumSet.noneOf(OrganizationRole.class));
    assertEquals(EnumSet.noneOf(UserPermission.class), permissions);
  }

  @Test
  void getGrantedPermissions_restrictedUser_restrictedPermissions() {
    Set<UserPermission> permissions =
        convertToPermissions(EnumSet.of(OrganizationRole.ENTRY_ONLY, OrganizationRole.USER));
    Set<UserPermission> expected =
        EnumSet.of(
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.SEARCH_PATIENTS);
    assertEquals(expected, permissions);
  }

  @Test
  void getEffectiveRole_allRoles_admin() {
    Set<OrganizationRole> roles = EnumSet.allOf(OrganizationRole.class);
    assertEquals(OrganizationRole.ADMIN, makeHolder(roles).getEffectiveRole().get());
  }

  @Test
  void getEffectiveRole_noRoles_empty() {
    Set<OrganizationRole> roles = EnumSet.noneOf(OrganizationRole.class);
    assertEquals(Optional.empty(), makeHolder(roles).getEffectiveRole());
  }

  @Test
  void getEffectiveRole_onlyUser_user() {
    Set<OrganizationRole> roles = Set.of(OrganizationRole.USER);
    assertEquals(OrganizationRole.USER, makeHolder(roles).getEffectiveRole().get());
  }

  @Test
  void getEffectiveRole_onlyEntry_entry() {
    Set<OrganizationRole> roles = Set.of(OrganizationRole.ENTRY_ONLY);
    assertEquals(OrganizationRole.ENTRY_ONLY, makeHolder(roles).getEffectiveRole().get());
  }

  @Test
  void getEffectiveRole_userAndEntry_entry() {
    Set<OrganizationRole> roles = Set.of(OrganizationRole.USER, OrganizationRole.ENTRY_ONLY);
    assertEquals(OrganizationRole.ENTRY_ONLY, makeHolder(roles).getEffectiveRole().get());
  }

  private Set<UserPermission> convertToPermissions(Collection<OrganizationRole> grantedRoles) {
    return makeHolder(grantedRoles).getGrantedPermissions();
  }

  private PermissionHolder makeHolder(Collection<OrganizationRole> roles) {
    return () -> Set.copyOf(roles);
  }
}
