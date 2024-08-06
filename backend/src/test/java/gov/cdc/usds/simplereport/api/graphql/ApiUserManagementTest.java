package gov.cdc.usds.simplereport.api.graphql;

import static gov.cdc.usds.simplereport.api.model.errors.PrivilegeUpdateFacilityAccessException.PRIVILEGE_UPDATE_FACILITY_ACCESS_ERROR;
import static java.util.Collections.emptyMap;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.verify;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.NullNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.boot.test.mock.mockito.SpyBean;

class ApiUserManagementTest extends BaseGraphqlTest {

  private static final String NO_USER_ERROR =
      "header: Cannot find user.; body: Please check for errors and try again";

  private static final List<String> USERNAMES =
      List.of("rjj@gmail.com", "rjjones@gmail.com", "jaredholler@msn.com", "janicek90@yahoo.com");

  private static final EnumSet<UserPermission> ADMIN_PERMISSIONS =
      EnumSet.of(
          UserPermission.READ_PATIENT_LIST,
          UserPermission.READ_ARCHIVED_PATIENT_LIST,
          UserPermission.SEARCH_PATIENTS,
          UserPermission.READ_RESULT_LIST,
          UserPermission.EDIT_PATIENT,
          UserPermission.ARCHIVE_PATIENT,
          UserPermission.EDIT_FACILITY,
          UserPermission.EDIT_ORGANIZATION,
          UserPermission.MANAGE_USERS,
          UserPermission.START_TEST,
          UserPermission.UPDATE_TEST,
          UserPermission.SUBMIT_TEST,
          UserPermission.ACCESS_ALL_FACILITIES,
          UserPermission.VIEW_ARCHIVED_FACILITIES,
          UserPermission.UPLOAD_RESULTS_SPREADSHEET);

  private static final EnumSet<UserPermission> TENANT_DATA_ACCESS_PERMISSIONS =
      EnumSet.allOf(UserPermission.class);

  @SpyBean private OktaRepository _oktaRepo;

  @BeforeEach
  void resetOktaRepo() {
    // Test initialization in BaseGraphqlTest makes calls to OktaRepository, this resets the
    // state of the SpyBean so we can only examine the calls that are the results of the tests
    // in this class
    reset(_oktaRepo);
  }

  @Test
  void whoami_standardUser_okUserInfoAndPermissions() {
    ObjectNode who =
        (ObjectNode) runQuery("current-user-query", "whoDat", null, null).get("whoami");
    assertEquals("Bobbity", who.get("firstName").asText());
    assertEquals("Bobbity", who.path("name").get("firstName").asText());
    assertEquals("Bob", who.get("middleName").asText());
    assertEquals("Bob", who.path("name").get("middleName").asText());
    assertEquals("Bobberoo", who.get("lastName").asText());
    assertEquals("Bobberoo", who.path("name").get("lastName").asText());
    assertEquals("Standard user", who.get("roleDescription").asText());
    assertFalse(who.get("isAdmin").asBoolean());
    assertEquals(who.get("role").asText(), Role.USER.name());
    assertEquals(Set.of(Role.USER), extractRolesFromUser(who));
    assertEquals(
        EnumSet.of(
            UserPermission.READ_PATIENT_LIST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.READ_RESULT_LIST,
            UserPermission.EDIT_PATIENT,
            UserPermission.ARCHIVE_PATIENT,
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.UPLOAD_RESULTS_SPREADSHEET),
        extractPermissionsFromUser(who));
    assertUserCanAccessExactFacilities(who, Set.of(TestUserIdentities.TEST_FACILITY_2));
    assertLastAuditEntry(
        TestUserIdentities.STANDARD_USER,
        "whoDat",
        EnumSet.of(
            UserPermission.READ_PATIENT_LIST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.READ_RESULT_LIST,
            UserPermission.EDIT_PATIENT,
            UserPermission.ARCHIVE_PATIENT,
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.UPLOAD_RESULTS_SPREADSHEET),
        null);
  }

  @Test
  void whoami_standardUser_okOrganizationInfo() {
    ObjectNode who =
        (ObjectNode) runQuery("current-user-query", "whoDat", null, null).get("whoami");
    JsonNode orgNode = who.path("organization");
    assertTrue(orgNode.has("id"), "'id' field present on organization");
    assertTrue(orgNode.has("internalId"), "'internalId' field present on organization");
    assertEquals(orgNode.get("id").asText(), orgNode.get("internalId").asText());

    JsonNode facilityNode = orgNode.path("facilities").get(0);
    assertEquals("Injection Site", facilityNode.get("name").asText());
    assertEquals("2797 N Cerrada de Beto", facilityNode.get("street").asText());
    assertEquals("2797 N Cerrada de Beto", facilityNode.path("address").get("streetOne").asText());

    JsonNode providerNode = facilityNode.get("orderingProvider");
    assertEquals("Flintstone", providerNode.get("lastName").asText());
    assertEquals("Flintstone", providerNode.path("name").get("lastName").asText());
    assertEquals("123 Main Street", providerNode.get("street").asText());
    assertEquals("123 Main Street", providerNode.path("address").get("streetOne").asText());
    assertEquals("Oz", providerNode.get("city").asText());
    assertEquals("Oz", providerNode.path("address").get("city").asText());
    assertEquals("12345", providerNode.get("zipCode").asText());
    assertEquals("12345", providerNode.path("address").get("postalCode").asText());
  }

  @Test
  void whoami_entryOnlyUser_okPermissionsRolesFacilities() {
    useOrgEntryOnly();
    ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
    assertEquals("Test-entry user", who.get("roleDescription").asText());
    assertFalse(who.get("isAdmin").asBoolean());
    assertEquals(who.get("role").asText(), Role.ENTRY_ONLY.name());
    assertEquals(Set.of(Role.ENTRY_ONLY), extractRolesFromUser(who));
    assertEquals(
        EnumSet.of(
            UserPermission.START_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SEARCH_PATIENTS),
        extractPermissionsFromUser(who));
    assertUserCanAccessExactFacilities(who, Set.of(TestUserIdentities.TEST_FACILITY_1));
  }

  @Test
  void whoami_orgAdminUser_okPermissionsRolesFacilities() {
    useOrgAdmin();
    ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
    assertEquals("Admin user", who.get("roleDescription").asText());
    assertFalse(who.get("isAdmin").asBoolean());
    assertEquals(who.get("role").asText(), Role.ADMIN.name());
    assertEquals(Set.of(Role.ADMIN), extractRolesFromUser(who));
    assertEquals(ADMIN_PERMISSIONS, extractPermissionsFromUser(who));
    assertUserCanAccessAllFacilities(who);
  }

  @Test
  void whoami_allFacilityAccessUser_okPermissionsRolesFacilities() {
    useOrgUserAllFacilityAccess();
    ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
    assertEquals("Standard user", who.get("roleDescription").asText());
    assertFalse(who.get("isAdmin").asBoolean());
    assertEquals(who.get("role").asText(), Role.USER.name());
    assertEquals(Set.of(Role.USER), extractRolesFromUser(who));
    assertEquals(
        EnumSet.of(
            UserPermission.READ_PATIENT_LIST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.READ_RESULT_LIST,
            UserPermission.EDIT_PATIENT,
            UserPermission.ARCHIVE_PATIENT,
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.ACCESS_ALL_FACILITIES,
            UserPermission.UPLOAD_RESULTS_SPREADSHEET),
        extractPermissionsFromUser(who));
    assertUserCanAccessAllFacilities(who);
  }

  @Test
  void whoami_superuser_okResponses() {
    useSuperUser();
    ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
    assertEquals("Super Admin", who.get("roleDescription").asText());
    assertTrue(who.get("isAdmin").asBoolean());
    assertEquals(Set.of(), extractRolesFromUser(who));
    assertEquals(Collections.emptySet(), extractPermissionsFromUser(who));
    assertUserHasNoOrg(who);
  }

  @Test
  void whoami_nobody_okResponses() {
    useBrokenUser();
    ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
    assertEquals("Misconfigured user", who.get("roleDescription").asText());
    assertFalse(who.get("isAdmin").asBoolean());
    assertEquals(Set.of(), extractRolesFromUser(who));
    assertEquals(Collections.emptySet(), extractPermissionsFromUser(who));
    assertUserHasNoOrg(who);
  }

  @Test
  void whoami_invalidFacilityAccess_okPermissionsRolesFacilities() {
    useInvalidFacilitiesUser();

    ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
    assertFalse(who.get("isAdmin").asBoolean());
    assertEquals(who.get("role").asText(), Role.USER.name());
    assertTrue(extractFacilitiesFromUser(who).isEmpty());
  }

  @ParameterizedTest
  @ValueSource(strings = {"addUserOp", "addUserLegacy"})
  void addUser_superUser_success(String operation) {
    useSuperUser();
    ObjectNode user = runBoilerplateAddUser(Role.ADMIN, operation);
    assertEquals("Rhonda", user.path("name").get("firstName").asText());
    assertEquals(USERNAMES.get(0), user.get("email").asText());
    assertEquals(
        TestUserIdentities.DEFAULT_ORGANIZATION,
        user.get("organization").get("externalId").asText());
    assertEquals(user.get("role").asText(), Role.ADMIN.name());
    assertEquals(Set.of(Role.ADMIN), extractRolesFromUser(user));
    assertEquals(
        EnumSet.of(
            UserPermission.READ_PATIENT_LIST,
            UserPermission.READ_ARCHIVED_PATIENT_LIST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.READ_RESULT_LIST,
            UserPermission.EDIT_PATIENT,
            UserPermission.ARCHIVE_PATIENT,
            UserPermission.EDIT_FACILITY,
            UserPermission.EDIT_ORGANIZATION,
            UserPermission.MANAGE_USERS,
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.ACCESS_ALL_FACILITIES,
            UserPermission.VIEW_ARCHIVED_FACILITIES,
            UserPermission.UPLOAD_RESULTS_SPREADSHEET),
        extractPermissionsFromUser(user));

    assertUserCanAccessAllFacilities(user);

    verify(_oktaRepo)
        .createUser(
            any(IdentityAttributes.class), any(Organization.class), anySet(), anySet(), eq(true));
  }

  @Test
  void addUser_newArgStructure_success() {
    useSuperUser();
    Map<String, Object> variables = makeBoilerplateArgs(Role.ADMIN, true);
    JsonNode user = runQuery("add-user", "addUserNovel", variables, null).get("addUser");
    assertEquals("Rhonda", user.get("name").get("firstName").asText());

    verify(_oktaRepo)
        .createUser(
            any(IdentityAttributes.class), any(Organization.class), anySet(), anySet(), eq(true));
  }

  @Test
  void addUser_disabledOrg_success() {
    TestUserIdentities.withUser(
        TestUserIdentities.SITE_ADMIN_USER,
        () -> {
          Organization org = _dataFactory.saveUnverifiedOrganization();

          useSuperUser();

          Map<String, Object> variables = makeBoilerplateArgs(Role.ADMIN, true);
          variables.put("organizationExternalId", org.getExternalId());
          JsonNode user = runQuery("add-user", "addUserNovel", variables, null).get("addUser");
          assertEquals("Rhonda", user.get("name").get("firstName").asText());
        });

    // the user should have been set to disabled in okta because the org is not verified
    verify(_oktaRepo)
        .createUser(
            any(IdentityAttributes.class), any(Organization.class), anySet(), anySet(), eq(false));
  }

  @Test
  void addUser_invalidNames_failure() {
    useSuperUser();
    HashMap<String, Object> variables = new HashMap<>(makeBoilerplateArgs(Role.ADMIN, false));
    variables.remove("lastName");

    runQuery("add-user", "addUserNovel", variables, "cannot be empty");
    variables = new HashMap<>(makeBoilerplateArgs(Role.ADMIN, true));
    variables.put("lastName", "Oopsies");
    runQuery("add-user", "addUserNovel", variables, "both unrolled and structured name arguments");
  }

  @Test
  void addUser_adminUser_failure() {
    useOrgAdmin();
    Map<String, Object> variables = makeBoilerplateArgs(Role.USER);
    runQuery("add-user", "addUserOp", variables, ACCESS_ERROR);
  }

  @Test
  void addUser_orgUser_failure() {
    Map<String, Object> variables = makeBoilerplateArgs(Role.USER);
    runQuery("add-user", "addUserOp", variables, ACCESS_ERROR);
    assertLastAuditEntry(
        TestUserIdentities.STANDARD_USER,
        "addUserOp",
        Set.of(
            UserPermission.READ_PATIENT_LIST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.READ_RESULT_LIST,
            UserPermission.EDIT_PATIENT,
            UserPermission.ARCHIVE_PATIENT,
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.UPLOAD_RESULTS_SPREADSHEET),
        List.of("addUser"));
  }

  @ParameterizedTest
  @ValueSource(strings = {"addUserToCurrentOrgOp", "addUserToCurrentOrgLegacyOp"})
  void addUserToCurrentOrg_adminUser_success(String operation) {
    useOrgAdmin();
    ObjectNode user = runBoilerplateAddUserToCurrentOrg(Role.ENTRY_ONLY, operation);
    assertEquals("Rhonda", user.get("firstName").asText());
    assertEquals(USERNAMES.get(0), user.get("email").asText());
    assertEquals(
        TestUserIdentities.DEFAULT_ORGANIZATION,
        user.get("organization").get("externalId").asText());
    assertEquals(user.get("role").asText(), Role.ENTRY_ONLY.name());
    assertEquals(Set.of(Role.ENTRY_ONLY), extractRolesFromUser(user));
    assertEquals(
        EnumSet.of(
            UserPermission.START_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SEARCH_PATIENTS),
        extractPermissionsFromUser(user));
    assertLastAuditEntry(
        TestUserIdentities.ORG_ADMIN_USER, operation, ADMIN_PERMISSIONS, List.of());
    assertUserCanAccessExactFacilities(user, Set.of(TestUserIdentities.TEST_FACILITY_1));

    verify(_oktaRepo)
        .createUser(
            any(IdentityAttributes.class), any(Organization.class), anySet(), anySet(), eq(true));
  }

  @Test
  void addUserToCurrentOrg_newArgStructure_success() {
    useOrgAdmin();
    Map<String, Object> variables = makeBoilerplateArgs(Role.ADMIN, true);
    JsonNode user =
        runQuery("add-user-to-current-org", "addUserToCurrentOrgNovel", variables, null)
            .get("addUserToCurrentOrg");
    assertEquals("Rhonda", user.get("firstName").asText());

    verify(_oktaRepo)
        .createUser(
            any(IdentityAttributes.class), any(Organization.class), anySet(), anySet(), eq(true));
  }

  @Test
  void addUserToCurrentOrg_invalidNames_failure() {
    useOrgAdmin();
    HashMap<String, Object> variables = new HashMap<>(makeBoilerplateArgs(Role.ADMIN, false));
    variables.remove("lastName");
    runQuery("add-user-to-current-org", "addUserToCurrentOrgNovel", variables, "cannot be empty");
    variables = new HashMap<>(makeBoilerplateArgs(Role.ADMIN, true));
    variables.put("lastName", "Oopsies");
    runQuery(
        "add-user-to-current-org",
        "addUserToCurrentOrgNovel",
        variables,
        "both unrolled and structured name arguments");
  }

  @Test
  void addUserToCurrentOrg_superUser_failure() {
    useSuperUser();
    Map<String, Object> variables = makeBoilerplateArgs(Role.USER);
    runQuery("add-user-to-current-org", "addUserToCurrentOrgOp", variables, ACCESS_ERROR);
    assertLastAuditEntry(
        TestUserIdentities.SITE_ADMIN_USER,
        "addUserToCurrentOrgOp",
        Set.of(),
        List.of("addUserToCurrentOrg"));
  }

  @Test
  void addUserToCurrentOrg_orgUser_failure() {
    Map<String, Object> variables = makeBoilerplateArgs(Role.USER);
    runQuery(
        "add-user-to-current-org",
        "addUserToCurrentOrgOp",
        variables,
        "Current user does not have permission to request [/addUserToCurrentOrg]");
  }

  @Test
  void addUserToCurrentOrg_disabledUser_success() {
    useOrgAdmin();

    // add a new user
    String addedUserId = runBoilerplateAddUserToCurrentOrg(Role.ENTRY_ONLY).get("id").asText();

    // disable new user
    Map<String, Object> deleteVariables = Map.of("id", addedUserId, "deleted", true);
    String email =
        runQuery("set-user-is-deleted", deleteVariables)
            .get("setUserIsDeleted")
            .get("email")
            .asText();

    // add user again (expect the user to be re-enabled with their original role)
    Map<String, Object> addVariables = makeBoilerplateArgs(Role.USER, false);
    addVariables.put("email", email);
    addVariables.put("firstName", "A-Different-FirstName");
    addVariables.put("lastName", "A-Different-LastName");
    ObjectNode enabledUser =
        (ObjectNode)
            runQuery("add-user-to-current-org", "addUserToCurrentOrgNovel", addVariables, null)
                .get("addUserToCurrentOrg");
    String enabledUserId = enabledUser.get("id").asText();

    // after enabling through reprovision of disabled user
    assertEquals(addedUserId, enabledUserId);
    assertEquals("A-Different-FirstName", enabledUser.get("firstName").asText());
    assertEquals("A-Different-LastName", enabledUser.get("lastName").asText());
    assertEquals(Set.of(Role.USER), extractRolesFromUser(enabledUser));
    assertEquals(
        Set.of(TestUserIdentities.TEST_FACILITY_1),
        extractFacilitiesFromUser(enabledUser).keySet());
    assertEquals(
        EnumSet.of(
            UserPermission.ARCHIVE_PATIENT,
            UserPermission.EDIT_PATIENT,
            UserPermission.READ_PATIENT_LIST,
            UserPermission.READ_RESULT_LIST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.START_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.UPLOAD_RESULTS_SPREADSHEET),
        extractPermissionsFromUser(enabledUser));

    verify(_oktaRepo)
        .createUser(
            any(IdentityAttributes.class), any(Organization.class), anySet(), anySet(), eq(true));
  }

  @Test
  void addUserToCurrentOrg_enabledUserExists_failure() {
    useOrgAdmin();
    runBoilerplateAddUserToCurrentOrg(Role.ADMIN);

    Map<String, Object> variables = makeBoilerplateArgs(Role.ADMIN, false);
    runQuery(
        "add-user-to-current-org",
        "addUserToCurrentOrgNovel",
        variables,
        "A user with this email already exists in our system. Please contact SimpleReport support for help.");
  }

  @Test
  void updateUser_adminUser_success() {
    useOrgAdmin();

    ObjectNode addUser = runBoilerplateAddUserToCurrentOrg(Role.USER);
    String id = addUser.get("id").asText();

    Map<String, Object> updateVariables = getUpdateUserVariables(id, "Ronda", "J", "Jones", "III");
    ObjectNode updateResp = runQuery("update-user", "updateUser", updateVariables, null);
    ObjectNode updateUser = (ObjectNode) updateResp.get("updateUser");
    assertEquals("Ronda", updateUser.get("firstName").asText());
    assertEquals(USERNAMES.get(0), updateUser.get("email").asText());
    assertEquals(updateUser.get("role").asText(), Role.USER.name());
    assertEquals(Set.of(Role.USER), extractRolesFromUser(updateUser));
    assertEquals(
        EnumSet.of(
            UserPermission.READ_PATIENT_LIST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.READ_RESULT_LIST,
            UserPermission.EDIT_PATIENT,
            UserPermission.ARCHIVE_PATIENT,
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.UPLOAD_RESULTS_SPREADSHEET),
        extractPermissionsFromUser(updateUser));
    assertUserCanAccessExactFacilities(updateUser, Set.of(TestUserIdentities.TEST_FACILITY_1));
  }

  @Test
  void updateUser_superUser_success() {
    useSuperUser();

    ObjectNode addUser = runBoilerplateAddUser(Role.ADMIN);
    String id = addUser.get("id").asText();

    Map<String, Object> updateVariables = getUpdateUserVariables(id, "Ronda", "J", "Jones", "III");
    ObjectNode resp = runQuery("update-user", "updateUser", updateVariables, null);
    ObjectNode updateUser = (ObjectNode) resp.get("updateUser");
    assertEquals("Ronda", updateUser.get("firstName").asText());
    assertEquals(USERNAMES.get(0), updateUser.get("email").asText());
    assertEquals(updateUser.get("role").asText(), Role.ADMIN.name());
    assertEquals(Set.of(Role.ADMIN), extractRolesFromUser(updateUser));
    assertEquals(ADMIN_PERMISSIONS, extractPermissionsFromUser(updateUser));

    assertUserCanAccessAllFacilities(updateUser);
  }

  @Test
  void updateUser_orgUser_failure() {
    useSuperUser();

    ObjectNode addUser = runBoilerplateAddUser(Role.ADMIN);
    String id = addUser.get("id").asText();

    useOrgUser();

    Map<String, Object> updateVariables = getUpdateUserVariables(id, "Ronda", "J", "Jones", "III");
    runQuery(
        "update-user",
        "updateUser",
        updateVariables,
        "Current user does not have permission to request [/updateUser]");
  }

  @Test
  void updateUser_nonexistentUser_failure() {
    useSuperUser();
    Map<String, Object> updateVariables =
        getUpdateUserVariables(
            "fa2efa2e-fa2e-fa2e-fa2e-fa2efa2efa2e", "Ronda", "J", "Jones", "III");
    runQuery("update-user", "updateUser", updateVariables, NO_USER_ERROR);
  }

  @Test
  void updateUser_self_success() {
    useOrgAdmin();
    ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
    String id = who.get("id").asText();

    Map<String, Object> updateVariables = getUpdateUserVariables(id, "Ronda", "J", "Jones", "III");
    ObjectNode resp = runQuery("update-user", "updateUser", updateVariables, null);
    ObjectNode updateUser = (ObjectNode) resp.get("updateUser");
    assertEquals("Ronda", updateUser.get("firstName").asText());
    assertEquals(TestUserIdentities.ORG_ADMIN_USER, updateUser.get("email").asText());
    assertEquals(Set.of(Role.ADMIN), extractRolesFromUser(updateUser));
    assertEquals(ADMIN_PERMISSIONS, extractPermissionsFromUser(updateUser));
    assertUserCanAccessAllFacilities(updateUser);
  }

  @Test
  void updateUserEmail_adminUser_success() {
    useOrgAdmin();

    ObjectNode addUser = runBoilerplateAddUserToCurrentOrg(Role.USER);
    String newEmail = addUser.get("id").asText();
    String id = addUser.get("id").asText();

    Map<String, Object> newEmailNode =
        Map.of(
            "id", id,
            "email", newEmail);

    ObjectNode updateResp = runQuery("update-user-email", "updateUserEmail", newEmailNode, null);
    ObjectNode updateUser = (ObjectNode) updateResp.get("updateUserEmail");

    assertEquals(id, updateUser.get("id").asText());
    assertEquals(newEmail, updateUser.get("email").asText());
  }

  @Test
  void updateUserEmail_superUser_success() {
    useSuperUser();

    ObjectNode addUser = runBoilerplateAddUser(Role.ADMIN);
    String newEmail = addUser.get("id").asText();
    String id = addUser.get("id").asText();

    Map<String, Object> updateVars =
        Map.of(
            "id", id,
            "email", newEmail);
    ObjectNode updateResp = runQuery("update-user-email", "updateUserEmail", updateVars, null);
    ObjectNode updateUser = (ObjectNode) updateResp.get("updateUserEmail");

    assertEquals(id, updateUser.get("id").asText());
    assertEquals(newEmail, updateUser.get("email").asText());
  }

  @Test
  void updateUserEmail_orgUser_failure() {
    useSuperUser();

    ObjectNode addUser = runBoilerplateAddUser(Role.ADMIN);
    String newEmail = addUser.get("id").asText();
    String id = addUser.get("id").asText();

    useOrgUser();

    Map<String, Object> updateVars =
        Map.of(
            "id", id,
            "email", newEmail);

    runQuery(
        "update-user-email",
        "updateUserEmail",
        updateVars,
        "Current user does not have permission to request [/updateUserEmail]");
  }

  @Test
  void updateUserEmail_self_success() {
    useOrgAdmin();
    ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
    String newEmail = who.get("id").asText();
    String id = who.get("id").asText();

    Map<String, Object> updateVars =
        Map.of(
            "id", id,
            "email", newEmail);
    ObjectNode resp = runQuery("update-user-email", "updateUserEmail", updateVars, null);
    ObjectNode updateUser = (ObjectNode) resp.get("updateUserEmail");

    assertEquals(id, updateUser.get("id").asText());
    assertEquals(newEmail, updateUser.get("email").asText());
  }

  @Test
  void resetUserPassword_orgUser_success() {
    useSuperUser();

    ObjectNode addUser = runBoilerplateAddUser(Role.ADMIN);
    String id = addUser.get("id").asText();

    useOrgAdmin();

    Map<String, Object> resetUserPasswordVariables = Map.of("id", id);
    ObjectNode resp =
        runQuery("reset-user-password", "resetUserPassword", resetUserPasswordVariables, null);
    ObjectNode resetUserPassword = (ObjectNode) resp.get("resetUserPassword");
    assertEquals(USERNAMES.get(0), resetUserPassword.get("email").asText());
  }

  @Test
  void resetUserPassword_orgUser_failure() {
    useSuperUser();

    ObjectNode addUser = runBoilerplateAddUser(Role.ADMIN);
    String id = addUser.get("id").asText();

    useOrgUser();

    Map<String, Object> resetUserPasswordVariables = Map.of("id", id);
    runQuery(
        "reset-user-password",
        "resetUserPassword",
        resetUserPasswordVariables,
        "Current user does not have permission to request [/resetUserPassword]");
  }

  @Test
  void resetUserMfa_orgUser_success() {
    useSuperUser();

    ObjectNode addUser = runBoilerplateAddUser(Role.ADMIN);
    String id = addUser.get("id").asText();

    useOrgAdmin();

    Map<String, Object> resetUserMfaVariables = Map.of("id", id);
    ObjectNode resp = runQuery("reset-user-mfa", "resetUserMfa", resetUserMfaVariables, null);
    ObjectNode resetUserMfa = (ObjectNode) resp.get("resetUserMfa");
    assertEquals(USERNAMES.get(0), resetUserMfa.get("email").asText());
  }

  @Test
  void resetUserMfa_orgUser_failure() {
    useSuperUser();

    ObjectNode addUser = runBoilerplateAddUser(Role.ADMIN);
    String id = addUser.get("id").asText();

    useOrgUser();

    Map<String, Object> resetUserMfaVariables = Map.of("id", id);
    runQuery(
        "reset-user-mfa",
        "resetUserMfa",
        resetUserMfaVariables,
        "Current user does not have permission to request [/resetUserMfa]");
  }

  @Test
  void resendActivationEmail_orgUser_success() {
    useSuperUser();

    ObjectNode addUser = runBoilerplateAddUser(Role.ADMIN);
    String id = addUser.get("id").asText();

    useOrgAdmin();

    Map<String, Object> resendActivationEmailVariables = Map.of("id", id);
    ObjectNode resp =
        runQuery(
            "resend-activation-email",
            "resendActivationEmail",
            resendActivationEmailVariables,
            null);
    ObjectNode resendActivationEmailResponse = (ObjectNode) resp.get("resendActivationEmail");
    assertEquals(USERNAMES.get(0), resendActivationEmailResponse.get("email").asText());
  }

  @Test
  void resendActivationEmail_orgUser_failure() {
    useSuperUser();

    ObjectNode addUser = runBoilerplateAddUser(Role.ADMIN);
    String id = addUser.get("id").asText();

    useOrgUser();

    Map<String, Object> resendActivationEmailVariables = Map.of("id", id);
    runQuery(
        "resend-activation-email",
        "resendActivationEmail",
        resendActivationEmailVariables,
        "Current user does not have permission to request [/resendActivationEmail]");
  }

  @Test
  void updateUserPrivileges_orgAdmin_success() {
    useOrgAdmin();

    ObjectNode addUser = runBoilerplateAddUserToCurrentOrg(Role.USER);
    String id = addUser.get("id").asText();

    // Update 1: ENTRY_ONLY, All facilities
    Map<String, Object> updatePrivilegesVariables =
        getUpdateUserPrivilegesVariables(id, Role.ENTRY_ONLY, true, Set.of());

    ObjectNode updateResp = runQuery("update-user-privileges", updatePrivilegesVariables);
    ObjectNode updateUser = (ObjectNode) updateResp.get("updateUserPrivileges");

    assertEquals("Test-entry user", updateUser.get("roleDescription").asText());
    assertEquals(updateUser.get("role").asText(), Role.ENTRY_ONLY.name());
    assertEquals(Set.of(Role.ENTRY_ONLY), extractRolesFromUser(updateUser));
    assertEquals(
        EnumSet.of(
            UserPermission.START_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.ACCESS_ALL_FACILITIES),
        extractPermissionsFromUser(updateUser));
    assertUserCanAccessAllFacilities(updateUser);

    // Update 2: ADMIN, All facilities
    updatePrivilegesVariables = getUpdateUserPrivilegesVariables(id, Role.ADMIN, true, Set.of());

    updateResp = runQuery("update-user-privileges", updatePrivilegesVariables);
    updateUser = (ObjectNode) updateResp.get("updateUserPrivileges");

    assertEquals("Admin user", updateUser.get("roleDescription").asText());
    assertEquals(updateUser.get("role").asText(), Role.ADMIN.name());
    assertEquals(Set.of(Role.ADMIN), extractRolesFromUser(updateUser));
    assertEquals(ADMIN_PERMISSIONS, extractPermissionsFromUser(updateUser));
    assertUserCanAccessAllFacilities(updateUser);

    // Update 3: USER, Access to 2 facilities
    updatePrivilegesVariables =
        getUpdateUserPrivilegesVariables(
            id,
            Role.USER,
            false,
            extractFacilityUuidsFromUser(
                updateUser,
                Set.of(TestUserIdentities.TEST_FACILITY_1, TestUserIdentities.TEST_FACILITY_2)));

    updateResp = runQuery("update-user-privileges", updatePrivilegesVariables);
    updateUser = (ObjectNode) updateResp.get("updateUserPrivileges");

    assertEquals("Standard user", updateUser.get("roleDescription").asText());
    assertEquals(updateUser.get("role").asText(), Role.USER.name());
    assertEquals(Set.of(Role.USER), extractRolesFromUser(updateUser));
    assertEquals(
        EnumSet.of(
            UserPermission.READ_PATIENT_LIST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.READ_RESULT_LIST,
            UserPermission.EDIT_PATIENT,
            UserPermission.ARCHIVE_PATIENT,
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.UPLOAD_RESULTS_SPREADSHEET),
        extractPermissionsFromUser(updateUser));
    assertUserCanAccessExactFacilities(
        updateUser, Set.of(TestUserIdentities.TEST_FACILITY_1, TestUserIdentities.TEST_FACILITY_2));
    assertUserCanAccessAllFacilities(updateUser);
  }

  @Test
  void updateUserPrivilegesNoFacilities_orgAdmin_failure() {
    useOrgAdmin();

    ObjectNode addUser = runBoilerplateAddUserToCurrentOrg(Role.USER);
    String id = addUser.get("id").asText();

    Map<String, Object> updatePrivilegesVariables =
        getUpdateUserPrivilegesVariables(id, Role.USER, false, Collections.emptySet());

    runQuery(
        "update-user-privileges",
        updatePrivilegesVariables,
        PRIVILEGE_UPDATE_FACILITY_ACCESS_ERROR);
  }

  private ObjectNode runBoilerplateAddUserToCurrentOrg(Role newUserRole) {
    return runBoilerplateAddUserToCurrentOrg(newUserRole, "addUserToCurrentOrgOp");
  }

  private ObjectNode runBoilerplateAddUserToCurrentOrg(Role newUserRole, String operation) {

    Map<String, Object> addVariables = makeBoilerplateArgs(newUserRole);
    ObjectNode addResp = runQuery("add-user-to-current-org", operation, addVariables, null);
    ObjectNode addUser = (ObjectNode) addResp.get("addUserToCurrentOrg");
    return addUser;
  }

  private ObjectNode runBoilerplateAddUser(Role newUserRole) {
    return runBoilerplateAddUser(newUserRole, "addUserOp");
  }

  private ObjectNode runBoilerplateAddUser(Role newUserRole, String operation) {
    Map<String, Object> addVariables = makeBoilerplateArgs(Role.ADMIN);
    ObjectNode addResp = runQuery("add-user", operation, addVariables, null);
    ObjectNode addUser = (ObjectNode) addResp.get("addUser");
    return addUser;
  }

  private Map<String, Object> makeBoilerplateArgs(Role role) {
    return makeBoilerplateArgs(role, false);
  }

  private Map<String, Object> makeBoilerplateArgs(Role role, boolean useNestedName) {
    List<UUID> facilities =
        (role == Role.ADMIN)
            ? Collections.emptyList()
            : List.of(extractAllFacilitiesInOrg().get(TestUserIdentities.TEST_FACILITY_1));
    return getAddUserVariables(
        "Rhonda",
        "Janet",
        "Jones",
        "III",
        USERNAMES.get(0),
        TestUserIdentities.DEFAULT_ORGANIZATION,
        role.name(),
        useNestedName,
        facilities);
  }

  @Test
  void updateUserPrivileges_superUser_success() {
    useSuperUser();

    ObjectNode addUser = runBoilerplateAddUser(Role.ADMIN);
    String id = addUser.get("id").asText();

    Map<String, Object> updatePrivilegesVariables =
        getUpdateUserPrivilegesVariables(id, Role.ENTRY_ONLY, true, Set.of());

    ObjectNode updateResp = runQuery("update-user-privileges", updatePrivilegesVariables);
    ObjectNode updateUser = (ObjectNode) updateResp.get("updateUserPrivileges");

    assertEquals("Test-entry user", updateUser.get("roleDescription").asText());
    assertEquals(updateUser.get("role").asText(), Role.ENTRY_ONLY.name());
    assertEquals(Set.of(Role.ENTRY_ONLY), extractRolesFromUser(updateUser));
    assertEquals(
        EnumSet.of(
            UserPermission.START_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.ACCESS_ALL_FACILITIES),
        extractPermissionsFromUser(updateUser));

    assertUserCanAccessAllFacilities(updateUser);
  }

  @Test
  void updateUserPrivileges_outsideOrgAdmin_failure() {
    useSuperUser();
    String id = runBoilerplateAddUser(Role.ENTRY_ONLY).get("id").asText();

    useOutsideOrgAdmin();

    Map<String, Object> updatePrivilegesVariables =
        getUpdateUserPrivilegesVariables(id, Role.ENTRY_ONLY, false, Set.of());

    runQuery("update-user-privileges", updatePrivilegesVariables, ACCESS_ERROR);
  }

  @Test
  void updateUserPrivileges_outsideOrgUser_failure() {
    useSuperUser();
    String id = runBoilerplateAddUser(Role.ENTRY_ONLY).get("id").asText();

    useOutsideOrgUser();

    Map<String, Object> updatePrivilegesVariables =
        getUpdateUserPrivilegesVariables(id, Role.ENTRY_ONLY, false, Set.of());

    runQuery(
        "update-user-privileges",
        updatePrivilegesVariables,
        "Current user does not have permission to request [/updateUserPrivileges]");
  }

  @Test
  void updateUserPrivileges_orgUser_failure() {
    useSuperUser();
    String id = runBoilerplateAddUser(Role.ENTRY_ONLY).get("id").asText();

    useOrgUser();

    Map<String, Object> updatePrivilegesVariables =
        getUpdateUserPrivilegesVariables(id, Role.ENTRY_ONLY, false, Set.of());

    runQuery(
        "update-user-privileges",
        updatePrivilegesVariables,
        "Current user does not have permission to request [/updateUserPrivileges]");
  }

  @Test
  void updateUserPrivileges_nonexistentUser_failure() {
    useSuperUser();
    Map<String, Object> updatePrivilegesVariables =
        getUpdateUserPrivilegesVariables(
            "fa2efa2e-fa2e-fa2e-fa2e-fa2efa2efa2e", Role.ENTRY_ONLY, true, Set.of());
    runQuery("update-user-privileges", updatePrivilegesVariables, NO_USER_ERROR);
  }

  @Test
  void updateUserPrivileges_self_failure() {
    useOrgAdmin();
    ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
    String id = who.get("id").asText();

    Map<String, Object> updatePrivilegesVariables =
        getUpdateUserPrivilegesVariables(id, Role.ENTRY_ONLY, true, Set.of());
    runQuery("update-user-privileges", updatePrivilegesVariables, ACCESS_ERROR);
  }

  @Test
  void setUserIsDeleted_adminUser_success() {
    useOrgAdmin();
    String id = runBoilerplateAddUserToCurrentOrg(Role.ENTRY_ONLY).get("id").asText();
    assertTrue(fetchUserList().stream().anyMatch(o -> id.equals(o.get("id").asText())));

    Map<String, Object> deleteVariables = Map.of("id", id, "deleted", true);
    ObjectNode resp = runQuery("set-user-is-deleted", deleteVariables);
    assertEquals(USERNAMES.get(0), resp.get("setUserIsDeleted").get("email").asText());

    assertTrue(fetchUserList().stream().noneMatch(o -> id.equals(o.get("id").asText())));

    Map<String, Object> restoreVariables = Map.of("id", id, "deleted", false);
    ObjectNode restoreResp = runQuery("set-user-is-deleted", restoreVariables);
    assertEquals(USERNAMES.get(0), restoreResp.get("setUserIsDeleted").get("email").asText());

    assertTrue(fetchUserList().stream().anyMatch(o -> id.equals(o.get("id").asText())));
  }

  @Test
  void setUserIsDeleted_superUser_success() {
    useSuperUser();
    String id = runBoilerplateAddUser(Role.USER).get("id").asText();

    Map<String, Object> deleteVariables = Map.of("id", id, "deleted", true);

    ObjectNode resp = runQuery("set-user-is-deleted", deleteVariables);
    assertEquals(USERNAMES.get(0), resp.get("setUserIsDeleted").get("email").asText());

    useOrgAdmin();
    assertTrue(fetchUserList().stream().noneMatch(o -> id.equals(o.get("id").asText())));
  }

  @Test
  void setUserIsDeleted_outsideOrgAdmin_failure() {
    useSuperUser();

    ObjectNode addUser = runBoilerplateAddUser(Role.ADMIN);
    String id = addUser.get("id").asText();

    useOutsideOrgAdmin();

    Map<String, Object> deleteVariables = Map.of("id", id, "deleted", true);

    runQuery("set-user-is-deleted", deleteVariables, ACCESS_ERROR);
  }

  @Test
  void setUserIsDeleted_outsideOrgUser_failure() {
    useSuperUser();
    String id = runBoilerplateAddUser(Role.USER).get("id").asText();

    useOutsideOrgUser();

    Map<String, Object> deleteVariables = Map.of("id", id, "deleted", true);

    runQuery(
        "set-user-is-deleted",
        deleteVariables,
        "Current user does not have permission to request [/setUserIsDeleted]");
  }

  @Test
  void getWhoami_entryOnlyUser_facilitiesRestricted() {
    useOrgEntryOnly();
    ObjectNode user = (ObjectNode) runQuery("current-user-query").get("whoami");
    assertThrows(AssertionError.class, () -> assertUserCanAccessAllFacilities(user));
  }

  @Test
  void setUserIsDeleted_orgUser_failure() {
    useSuperUser();

    ObjectNode addUser = runBoilerplateAddUser(Role.ADMIN);
    String id = addUser.get("id").asText();

    useOrgUser();

    Map<String, Object> deleteVariables = Map.of("id", id, "deleted", true);

    runQuery(
        "set-user-is-deleted",
        deleteVariables,
        "Current user does not have permission to request [/setUserIsDeleted]");
  }

  @Test
  void setUserIsDeleted_self_failure() {
    useOrgAdmin();
    ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
    String id = who.get("id").asText();

    Map<String, Object> deleteVariables = Map.of("id", id, "deleted", true);

    runQuery("set-user-is-deleted", deleteVariables, ACCESS_ERROR);
  }

  // The next retrieval test also expects demo users as defined in the no-okta-mgmt profile
  @Test
  void getUsers_adminUser_success() {
    useOrgAdmin();

    List<Map<String, Object>> usersAdded =
        Arrays.asList(
            makeBoilerplateArgs(Role.ADMIN),
            getAddUserVariables(
                "Jared",
                "K",
                "Holler",
                null,
                USERNAMES.get(2),
                TestUserIdentities.DEFAULT_ORGANIZATION,
                Role.ADMIN.name(),
                Collections.emptyList()),
            getAddUserVariables(
                "Janice",
                null,
                "Katz",
                "Jr",
                USERNAMES.get(3),
                TestUserIdentities.DEFAULT_ORGANIZATION,
                Role.ADMIN.name(),
                Collections.emptyList()));
    for (Map<String, Object> userVariables : usersAdded) {
      runQuery("add-user-to-current-org", "addUserToCurrentOrgOp", userVariables, null);
    }

    List<ObjectNode> usersRetrieved = fetchUserList();

    assertTrue(usersRetrieved.size() > usersAdded.size());

    for (int i = 0; i < usersAdded.size(); i++) {
      Map<String, Object> userAdded = usersAdded.get(i);
      Optional<ObjectNode> found =
          usersRetrieved.stream()
              .filter(u -> u.get("email").asText().equals(userAdded.get("email")))
              .findFirst();
      assertTrue(found.isPresent());
      ObjectNode userRetrieved = found.get();

      assertEquals(userRetrieved.get("firstName").asText(), userAdded.get("firstName"));
      assertEquals(userRetrieved.get("email").asText(), userAdded.get("email"));
    }
  }

  private List<ObjectNode> fetchUserList() {
    return toList((ArrayNode) runQuery("users-query").get("users"));
  }

  @Test
  void getUsers_orgUser_failure() {
    runQuery("users-query", "Current user does not have permission to request [/users]");
  }

  @Test
  void setCurrentUserTenantDataAccess_adminUser_success() {
    useSuperUser();
    Map<String, Object> variables =
        Map.of(
            "organizationExternalId",
            TestUserIdentities.DEFAULT_ORGANIZATION,
            "justification",
            "This is my justification");
    ObjectNode user =
        (ObjectNode)
            runQuery(
                    "set-current-user-tenant-data-access",
                    "SetCurrentUserTenantDataAccessOp",
                    variables,
                    null)
                .get("setCurrentUserTenantDataAccess");
    assertEquals("ruby@example.com", user.get("email").asText());
    assertEquals(Role.ADMIN, Role.valueOf(user.get("role").asText()));
    assertEquals(TENANT_DATA_ACCESS_PERMISSIONS, extractPermissionsFromUser(user));
    assertLastAuditEntry("ruby@example.com", null, null);

    // run query using tenant data access
    runQuery("current-user-query").get("whoami");
    assertLastAuditEntry(
        "ruby@example.com",
        TestUserIdentities.DEFAULT_ORGANIZATION,
        TENANT_DATA_ACCESS_PERMISSIONS);
  }

  @Test
  void setCurrentUserTenantDataAccess_adminUserRemoveAccess_success() {
    useSuperUser();
    ObjectNode user =
        (ObjectNode)
            runQuery(
                    "set-current-user-tenant-data-access",
                    "SetCurrentUserTenantDataAccessOp",
                    emptyMap(),
                    null)
                .get("setCurrentUserTenantDataAccess");
    assertEquals("ruby@example.com", user.get("email").asText());
    assertEquals(NullNode.instance, user.get("organization"));
    assertEquals(NullNode.instance, user.get("role"));
    assertEquals(new HashSet<UserPermission>(), extractPermissionsFromUser(user));
  }

  @Test
  void setCurrentUserTenantDataAccess_orgAdminUser_failure() {
    useOrgAdmin();
    Map<String, Object> variables =
        Map.of(
            "organizationExternalId",
            TestUserIdentities.DEFAULT_ORGANIZATION,
            "justification",
            "This is my justification");
    runQuery(
        "set-current-user-tenant-data-access",
        "SetCurrentUserTenantDataAccessOp",
        variables,
        ACCESS_ERROR);
  }

  @Test
  void setCurrentUserTenantDataAccess_externalIdTrailingSpace_success() {
    TestUserIdentities.withUser(
        TestUserIdentities.SITE_ADMIN_USER,
        () -> {
          useSuperUser();
          _dataFactory.saveOrganization("The Mall", "k12", "dc-with-trailing-space ", true);

          Map<String, Object> variables =
              Map.of(
                  "organizationExternalId", "dc-with-trailing-space ",
                  "justification", "This is my justification");
          ObjectNode user =
              (ObjectNode)
                  runQuery(
                          "set-current-user-tenant-data-access",
                          "SetCurrentUserTenantDataAccessOp",
                          variables,
                          null)
                      .get("setCurrentUserTenantDataAccess");
          assertEquals("ruby@example.com", user.get("email").asText());
          assertEquals(Role.ADMIN, Role.valueOf(user.get("role").asText()));
          assertEquals(TENANT_DATA_ACCESS_PERMISSIONS, extractPermissionsFromUser(user));
          assertLastAuditEntry("ruby@example.com", null, null);

          // run query using tenant data access
          runQuery("current-user-query").get("whoami");
          assertLastAuditEntry(
              "ruby@example.com", "dc-with-trailing-space ", TENANT_DATA_ACCESS_PERMISSIONS);
        });
  }

  @Test
  void getUserByEmail_supportAdminUser_success() {
    useSuperUser();
    ObjectNode addedUser = runBoilerplateAddUser(Role.ADMIN);
    Map<String, Object> variables = new HashMap<>();
    variables.put("email", addedUser.get("email"));
    ObjectNode retrievedUser =
        (ObjectNode) runQuery("user-query", "GetUserByLoginEmail", variables, null).get("user");
    assertEquals(addedUser.get("email"), retrievedUser.get("email"));
    assertEquals(addedUser.get("id"), retrievedUser.get("id"));
    assertEquals("ACTIVE", retrievedUser.get("status").asText());
    assertEquals(addedUser.get("role"), retrievedUser.get("role"));
    assertEquals(false, retrievedUser.get("isDeleted").asBoolean());
  }

  @Test
  void getUserById_supportAdminUser_success() {
    useSuperUser();
    ObjectNode addedUser = runBoilerplateAddUser(Role.ADMIN);
    Map<String, Object> variables = new HashMap<>();
    variables.put("id", addedUser.get("id"));
    ObjectNode retrievedUser =
        (ObjectNode) runQuery("user-query", "GetUserDetails", variables, null).get("user");
    assertEquals(addedUser.get("email"), retrievedUser.get("email"));
    assertEquals(addedUser.get("id"), retrievedUser.get("id"));
    assertEquals("ACTIVE", retrievedUser.get("status").asText());
    assertEquals(addedUser.get("role"), retrievedUser.get("role"));
    assertEquals(false, retrievedUser.get("isDeleted").asBoolean());
  }

  @Test
  void getUserByEmail_supportAdminUser_notFound() {
    useSuperUser();
    Map<String, Object> variables = new HashMap<>();
    variables.put("email", "sample@email.com");
    ObjectNode user =
        (ObjectNode)
            runQuery("user-query", "GetUserByLoginEmail", variables, null)
                .get("GetUserByLoginEmail");
    assertEquals(null, user);
  }

  @Test
  void getUserByEmail_orgAdminUser_unauthorized() {
    useOrgAdmin();
    Map<String, Object> variables = new HashMap<>();
    variables.put("email", "sample@email.com");
    runQuery("user-query", "GetUserByLoginEmail", variables, "Unauthorized");
  }

  @Test
  void getUserByEmail_orgAdminUser_invalidParameters() {
    useOrgAdmin();
    Map<String, Object> variables = new HashMap<>();
    runQuery("user-query", "GetUserNoParams", variables, "User search parameters are missing.");
  }

  private List<ObjectNode> toList(ArrayNode arr) {
    List<ObjectNode> list = new ArrayList<>();
    for (int i = 0; i < arr.size(); i++) {
      list.add((ObjectNode) arr.get(i));
    }
    return list;
  }

  private Map<String, Object> getAddUserVariables(
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      String email,
      String orgExternalId,
      String role,
      boolean nestedName,
      List<UUID> facilities) {
    Map<String, Object> variables = new HashMap<>();
    variables.put("email", email);
    variables.put("organizationExternalId", orgExternalId);
    variables.put("role", role);
    variables.put("facilities", facilities);

    HashMap<String, Object> nameInfo = new HashMap<>();
    nameInfo.put("firstName", firstName);
    nameInfo.put("middleName", middleName);
    nameInfo.put("lastName", lastName);
    nameInfo.put("suffix", suffix);

    if (nestedName) {
      variables.put("name", nameInfo);
    } else {
      variables.putAll(nameInfo);
    }
    return variables;
  }

  private Map<String, Object> getAddUserVariables(
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      String email,
      String orgExternalId,
      String role,
      List<UUID> facilities) {
    return getAddUserVariables(
        firstName, middleName, lastName, suffix, email, orgExternalId, role, false, facilities);
  }

  private Map<String, Object> getUpdateUserVariables(
      String id, String firstName, String middleName, String lastName, String suffix) {
    Map<String, Object> variables =
        Map.of(
            "id", id,
            "firstName", firstName,
            "middleName", middleName,
            "lastName", lastName,
            "suffix", suffix);
    return variables;
  }

  private Set<Role> extractRolesFromUser(ObjectNode user) {
    Iterator<JsonNode> rolesIter = user.get("roles").elements();
    Set<Role> roles = new HashSet<>();
    while (rolesIter.hasNext()) {
      roles.add(Role.valueOf(rolesIter.next().asText()));
    }
    return roles;
  }

  private Set<UserPermission> extractPermissionsFromUser(ObjectNode user) {
    Iterator<JsonNode> permissionsIter = user.get("permissions").elements();
    Set<UserPermission> permissions = new HashSet<>();
    while (permissionsIter.hasNext()) {
      permissions.add(UserPermission.valueOf(permissionsIter.next().asText()));
    }
    return permissions;
  }

  // map from each facility's name to its UUID; includes all facilities user can access
  private Map<String, UUID> extractFacilitiesFromUser(ObjectNode user) {
    Iterator<JsonNode> facilitiesIter = user.get("organization").get("facilities").elements();
    Map<String, UUID> facilities = new HashMap<>();
    while (facilitiesIter.hasNext()) {
      JsonNode facility = facilitiesIter.next();
      facilities.put(facility.get("name").asText(), UUID.fromString(facility.get("id").asText()));
    }
    return facilities;
  }

  private Set<UUID> extractFacilityUuidsFromUser(ObjectNode user, Set<String> facilityNames) {
    Map<String, UUID> facilities = extractFacilitiesFromUser(user);
    return facilityNames.stream().map(facilities::get).collect(Collectors.toSet());
  }

  private void assertUserCanAccessAllFacilities(ObjectNode user) {
    assertEquals(extractAllFacilitiesInOrg(), extractFacilitiesFromUser(user));
  }

  private void assertUserCanAccessExactFacilities(ObjectNode user, Set<String> facilityNames) {
    assertEquals(extractFacilitiesFromUser(user).keySet(), facilityNames);
  }

  private void assertUserHasNoOrg(ObjectNode user) {
    assertTrue(user.get("organization").isNull());
  }
}
