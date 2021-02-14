package gov.cdc.usds.simplereport.api;

import java.util.Set;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Iterator;
import java.util.HashSet;
import java.util.Optional;

import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.argThat;
import org.mockito.ArgumentMatcher;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.Organization;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.JsonNode;

class ApiUserManagementTest extends BaseApiTest {

    private static final List<String> USERNAMES = List.of("rjj@gmail.com", 
                                                          "rjjones@gmail.com",
                                                          "jaredholler@msn.com",
                                                          "janicek90@yahoo.com");

    @Test
    void whoami_standardUser_okResponses() {
        ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
        assertEquals("Bobbity", who.get("firstName").asText());
        assertEquals("Standard user", who.get("roleDescription").asText());
        assertFalse(who.get("isAdmin").asBoolean());
        assertEquals(OrganizationRole.USER.getGrantedPermissions(), extractPermissionsFromUser(who));
    }

    @Test
    void whoami_entryOnlyUser_okPermissionsAndRoleDescription() {
        useOrgEntryOnly();
        Set<UserPermission> expected = EnumSet.of(UserPermission.START_TEST, UserPermission.SUBMIT_TEST,
                UserPermission.UPDATE_TEST, UserPermission.SEARCH_PATIENTS);
        ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
        assertEquals("Test-entry user", who.get("roleDescription").asText());
        assertFalse(who.get("isAdmin").asBoolean());
        assertEquals(expected, extractPermissionsFromUser(who));
    }

    @Test
    void whoami_orgAdminUser_okPermissionsAndRoleDescription() {
        useOrgAdmin();
        Set<UserPermission> expected = EnumSet.allOf(UserPermission.class);
        ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
        assertEquals("Admin user", who.get("roleDescription").asText());
        assertFalse(who.get("isAdmin").asBoolean());
        assertEquals(expected, extractPermissionsFromUser(who));
    }

    @Test
    void whoami_superuser_okResponses() {
        useSuperUser();
        setRoles(null);
        ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
        assertEquals("Super Admin", who.get("roleDescription").asText());
        assertTrue(who.get("isAdmin").asBoolean());
        assertEquals(Collections.emptySet(), extractPermissionsFromUser(who));
    }

    @Test
    void whoami_nobody_okResponses() {
        setRoles(null);
        ObjectNode who = (ObjectNode) runQuery("current-user-query").get("whoami");
        assertEquals("Misconfigured user", who.get("roleDescription").asText());
        assertFalse(who.get("isAdmin").asBoolean());
        assertEquals(Collections.emptySet(), extractPermissionsFromUser(who));
    }

    @Test
    void createUser_adminUser_success() {
        useSuperUser();
        useOrgAdmin();
        when(_oktaRepo.getOrganizationRolesForUser(USERNAMES.get(0)))
                .thenReturn(Optional.of(getOrgRoles(OrganizationRole.USER)));
        ObjectNode variables = getAddUserVariables("Rhonda", "Janet", "Jones", "III", 
                USERNAMES.get(0), _initService.getDefaultOrganization().getExternalId());
        ObjectNode resp = runQuery("add-user", variables);
        ObjectNode user = (ObjectNode) resp.get("addUser");
        assertEquals("Rhonda", user.get("firstName").asText());
        assertEquals(USERNAMES.get(0), user.get("email").asText());
        assertEquals(_initService.getDefaultOrganization().getExternalId(), 
                user.get("organization").get("externalId").asText());
        assertEquals(OrganizationRole.USER.getGrantedPermissions(), extractPermissionsFromUser(user));
    }

    @Test
    void createUser_orgUser_failure() {
        ObjectNode variables = getAddUserVariables("Rhonda", "Janet", "Jones", "III", 
                USERNAMES.get(0), _initService.getDefaultOrganization().getExternalId());
        runQuery("add-user", variables, ACCESS_ERROR);
    }

    @Test
    void updateUser_adminUser_success() {
        useSuperUser();
        useOrgAdmin();

        when(_oktaRepo.getOrganizationRolesForUser(USERNAMES.get(0)))
                .thenReturn(Optional.of(getOrgRoles(OrganizationRole.USER)));

        ObjectNode addVariables = getAddUserVariables("Rhonda", "Janet", "Jones", "III", 
                USERNAMES.get(0), _initService.getDefaultOrganization().getExternalId());
        runQuery("add-user", addVariables);

        when(_oktaRepo.getOrganizationRolesForUser(USERNAMES.get(1)))
                .thenReturn(Optional.of(getOrgRoles(OrganizationRole.USER)));

        ObjectNode updateVariables = getUpdateUserVariables("Ronda", "J", "Jones", "III", 
                USERNAMES.get(1), USERNAMES.get(0));
        ObjectNode resp = runQuery("update-user", updateVariables);
        ObjectNode user = (ObjectNode) resp.get("updateUser");
        assertEquals("Ronda", user.get("firstName").asText());
        assertEquals(USERNAMES.get(1), user.get("email").asText());
        assertEquals(OrganizationRole.USER.getGrantedPermissions(), extractPermissionsFromUser(user));
    }

    @Test
    void updateUser_orgUser_failure() {
        ObjectNode updateVariables = getUpdateUserVariables("Ronda", "J", "Jones", "III", 
                USERNAMES.get(1), USERNAMES.get(0));
        runQuery("update-user", updateVariables, ACCESS_ERROR);
    }

    @Test
    void getUsers_adminUser_success() {
        useSuperUser();
        useOrgAdmin();

        when(_oktaRepo.getOrganizationRolesForUser(USERNAMES.get(0)))
                .thenReturn(Optional.of(getOrgRoles(OrganizationRole.USER)));
        when(_oktaRepo.getOrganizationRolesForUser(USERNAMES.get(2)))
                .thenReturn(Optional.of(getOrgRoles(OrganizationRole.USER)));
        when(_oktaRepo.getOrganizationRolesForUser(USERNAMES.get(3)))
                .thenReturn(Optional.of(getOrgRoles(OrganizationRole.USER)));
        
        List<ObjectNode> usersAdded = Arrays.asList(
                getAddUserVariables("Rhonda", "Janet", "Jones", "III", 
                        USERNAMES.get(0), _initService.getDefaultOrganization().getExternalId()),
                getAddUserVariables("Jared", "K", "Holler", null, 
                        USERNAMES.get(2), _initService.getDefaultOrganization().getExternalId()),
                getAddUserVariables("Janice", null, "Katz", "Jr", 
                        USERNAMES.get(3), _initService.getDefaultOrganization().getExternalId()));
        for (ObjectNode userVariables : usersAdded) {
            runQuery("add-user", userVariables);
        }

        OrganizationMatcher defaultOrgMatcher = new OrganizationMatcher(_initService.getDefaultOrganization());
        
        when(_oktaRepo.getAllUsernamesForOrganization(argThat(defaultOrgMatcher), eq(OrganizationRole.USER)))
                .thenReturn(List.of(USERNAMES.get(0), USERNAMES.get(2), USERNAMES.get(3)));
        when(_oktaRepo.getAllUsernamesForOrganization(argThat(defaultOrgMatcher), eq(OrganizationRole.ADMIN)))
                .thenReturn(List.of());
        when(_oktaRepo.getAllUsernamesForOrganization(argThat(defaultOrgMatcher), eq(OrganizationRole.ENTRY_ONLY)))
                .thenReturn(List.of());
      
        ObjectNode resp = runQuery("users-query");
        List<ObjectNode> usersRetrieved = toList((ArrayNode) resp.get("users"));
        
        assertEquals(usersRetrieved.size(), usersAdded.size());

        Collections.sort(usersAdded, new SortByEmail());
        Collections.sort(usersRetrieved, new SortByEmail());

        for (int i = 0; i < usersRetrieved.size(); i++) {
            ObjectNode userRetrieved = (ObjectNode) usersRetrieved.get(i);
            ObjectNode userAdded = usersAdded.get(i);
            assertEquals(userRetrieved.get("firstName").asText(),
                         userAdded.get("firstName").asText());
            assertEquals(userRetrieved.get("email").asText(),
                         userAdded.get("email").asText());
            assertEquals(userRetrieved.get("organization").get("externalId").asText(),
                         userAdded.get("organizationExternalId").asText());
            assertEquals(OrganizationRole.USER.getGrantedPermissions(), 
                         extractPermissionsFromUser(userRetrieved));
        }
    }

    @Test
    void getUsers_orgUser_failure() {
        runQuery("users-query", ACCESS_ERROR);
    }

    private class OrganizationMatcher implements ArgumentMatcher<Organization> {
        private Organization left;

        public OrganizationMatcher(Organization left) {
            this.left = left;
        }

        public boolean matches(Organization right) {
            return left == null && right == null ||
                   left != null && right != null &&
                   left.getExternalId().equals(right.getExternalId()) &&
                   left.getOrganizationName().equals(right.getOrganizationName());
        }
    }

    private class SortByEmail implements Comparator<ObjectNode> 
    { 
        // Used for sorting by email
        public int compare(ObjectNode userA, ObjectNode userB) 
        { 
            return userA.get("email").asText().compareTo(userB.get("email").asText()); 
        } 
    } 

    private List<ObjectNode> toList(ArrayNode arr) {
        List<ObjectNode> list = new ArrayList<>();
        for (int i = 0; i < arr.size(); i++) {
            list.add((ObjectNode) arr.get(i));
        }
        return list;
    }

    private OrganizationRoleClaims getOrgRoles(OrganizationRole role) {
        Set<OrganizationRole> roles = new HashSet<>();
        roles.add(OrganizationRole.USER);
        roles.add(role);
        return new OrganizationRoleClaims(_initService.getDefaultOrganization().getExternalId(),
                                                   roles);
    }

    private ObjectNode getAddUserVariables(String firstName, 
                                           String middleName, 
                                           String lastName, 
                                           String suffix, 
                                           String email, 
                                           String orgExternalId) {
        ObjectNode variables = JsonNodeFactory.instance.objectNode()
            .put("firstName", firstName)
            .put("middleName", middleName)
            .put("lastName", lastName)
            .put("suffix", suffix)
            .put("email", email)
            .put("organizationExternalId", orgExternalId);
        return variables;
    }

    private ObjectNode getUpdateUserVariables(String firstName, 
                                           String middleName, 
                                           String lastName, 
                                           String suffix, 
                                           String newEmail, 
                                           String oldEmail) {
        ObjectNode variables = JsonNodeFactory.instance.objectNode()
            .put("firstName", firstName)
            .put("middleName", middleName)
            .put("lastName", lastName)
            .put("suffix", suffix)
            .put("newEmail", newEmail)
            .put("oldEmail", oldEmail);
        return variables;
    }

    private Set<UserPermission> extractPermissionsFromUser(ObjectNode user) {
        Iterator<JsonNode> permissionsIter = user.get("permissions").elements();
        Set<UserPermission> permissions = new HashSet<>();
        while (permissionsIter.hasNext()) {
            permissions.add(UserPermission.valueOf(permissionsIter.next().asText()));
        }
        return permissions;
    }
}
