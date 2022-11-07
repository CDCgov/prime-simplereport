package gov.cdc.usds.simplereport.config.authorization;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Collection;
import java.util.EnumSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

/** Tests for the mixin methods of {@link PermissionHolder}. */
class PermissionHolderTest {

  @Test
  void getGrantedPermissions_userRole_userPermissions() {
    Set<UserPermission> permissions =
        makeHolder(EnumSet.of(OrganizationRole.USER)).getGrantedPermissions();
    Set<UserPermission> expected =
        EnumSet.of(
            UserPermission.READ_PATIENT_LIST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.READ_RESULT_LIST,
            UserPermission.EDIT_PATIENT,
            UserPermission.ARCHIVE_PATIENT,
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.UPLOAD_RESULTS_SPREADSHEET);
    assertEquals(expected, permissions);
  }

  @Test
  void getGrantedPermissions_allRoles_allPermissions() {
    Set<UserPermission> permissions =
        makeHolder(EnumSet.allOf(OrganizationRole.class)).getGrantedPermissions();
    assertEquals(UserPermission.values().length, permissions.size());
  }

  @Test
  void getGrantedPermissions_noRoles_noPermissions() {
    Set<UserPermission> permissions =
        makeHolder(EnumSet.noneOf(OrganizationRole.class)).getGrantedPermissions();
    assertEquals(EnumSet.noneOf(UserPermission.class), permissions);
  }

  @Test
  void getGrantedPermissions_restrictedUser_restrictedPermissions() {
    Set<UserPermission> permissions =
        makeHolder(EnumSet.of(OrganizationRole.ENTRY_ONLY)).getGrantedPermissions();
    Set<UserPermission> expected =
        EnumSet.of(
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.SEARCH_PATIENTS);
    assertEquals(expected, permissions);
  }

  @Test
  void getGrantedPermissions_restrictedUserAllFacilities_restrictedPermissionsAllFacilities() {
    Set<UserPermission> permissions =
        makeHolder(EnumSet.of(OrganizationRole.ENTRY_ONLY, OrganizationRole.ALL_FACILITIES))
            .getGrantedPermissions();
    Set<UserPermission> expected =
        EnumSet.of(
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.ACCESS_ALL_FACILITIES);
    assertEquals(expected, permissions);
  }

  @Test
  void getEffectiveRoles_allRoles_admin() {
    Set<OrganizationRole> roles = EnumSet.allOf(OrganizationRole.class);
    assertEquals(Set.of(OrganizationRole.ADMIN), makeHolder(roles).getEffectiveRoles());
  }

  @Test
  void getEffectiveRoles_noRoles_empty() {
    Set<OrganizationRole> roles = EnumSet.noneOf(OrganizationRole.class);
    assertEquals(Set.of(), makeHolder(roles).getEffectiveRoles());
  }

  @Test
  void getEffectiveRoles_onlyNoAccess_noAccess() {
    Set<OrganizationRole> roles = Set.of(OrganizationRole.NO_ACCESS);
    assertEquals(Set.of(OrganizationRole.NO_ACCESS), makeHolder(roles).getEffectiveRoles());
  }

  @Test
  void getEffectiveRoles_onlyUser_user() {
    Set<OrganizationRole> roles = Set.of(OrganizationRole.USER);
    assertEquals(Set.of(OrganizationRole.USER), makeHolder(roles).getEffectiveRoles());
  }

  @Test
  void getEffectiveRoles_noAccessAndEntry_entry() {
    Set<OrganizationRole> roles = Set.of(OrganizationRole.ENTRY_ONLY, OrganizationRole.NO_ACCESS);
    assertEquals(Set.of(OrganizationRole.ENTRY_ONLY), makeHolder(roles).getEffectiveRoles());
  }

  @Test
  void getEffectiveRoles_userAndEntry_user() {
    Set<OrganizationRole> roles = Set.of(OrganizationRole.USER, OrganizationRole.ENTRY_ONLY);
    assertEquals(Set.of(OrganizationRole.USER), makeHolder(roles).getEffectiveRoles());
  }

  @Test
  void getEffectiveRoles_userEntryAllFacilities_userAllFacilities() {
    Set<OrganizationRole> roles =
        Set.of(OrganizationRole.USER, OrganizationRole.ENTRY_ONLY, OrganizationRole.ALL_FACILITIES);
    assertEquals(
        Set.of(OrganizationRole.USER, OrganizationRole.ALL_FACILITIES),
        makeHolder(roles).getEffectiveRoles());
  }

  @Test
  void grantsAllFacilityAccess_allRoles_true() {
    Set<OrganizationRole> roles = EnumSet.allOf(OrganizationRole.class);
    assertTrue(makeHolder(roles).grantsAllFacilityAccess());
  }

  @Test
  void grantsAllFacilityAccess_onlyEntry_false() {
    Set<OrganizationRole> roles = Set.of(OrganizationRole.ENTRY_ONLY);
    assertFalse(makeHolder(roles).grantsAllFacilityAccess());
  }

  @Test
  void grantsAllFacilityAccess_entryAllFacilities_true() {
    Set<OrganizationRole> roles =
        Set.of(OrganizationRole.ENTRY_ONLY, OrganizationRole.ALL_FACILITIES);
    assertTrue(makeHolder(roles).grantsAllFacilityAccess());
  }

  @Test
  void grantsAllFacilityAccess_onlyAdmin_false() {
    Set<OrganizationRole> roles = Set.of(OrganizationRole.ADMIN);
    assertTrue(makeHolder(roles).grantsAllFacilityAccess());
  }

  private PermissionHolder makeHolder(Collection<OrganizationRole> roles) {
    return () -> Set.copyOf(roles);
  }
}
