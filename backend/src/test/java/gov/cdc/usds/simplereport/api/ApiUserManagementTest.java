package gov.cdc.usds.simplereport.api;

import java.util.Set;
import java.util.EnumSet;
import java.util.List;
import java.util.Iterator;
import java.util.HashSet;
import java.util.stream.Collectors;

import static org.mockito.Mockito.when;

import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.JsonNode;

public class ApiUserManagementTest extends BaseApiTest {

    private static final List<String> USERNAMES = List.of("rjj@gmail.com", 
                                                          "rjjones@gmail.com");

    @Override
    protected Set<String> getOktaTestUsernames() {
        return USERNAMES.stream().collect(Collectors.toSet());
    }

    @Test
    public void whoami_standardUser_okResponses() {
        ObjectNode resp = runQuery("current-user-query");
        ObjectNode who = (ObjectNode) resp.get("whoami");
        assertEquals("Bobbity", who.get("firstName").asText());
        assertEquals(OrganizationRole.USER.getGrantedPermissions(), extractPermissionsFromUser(who));
    }

    @Test
    void whoami_entryOnlyUser_okPermissions() {
        useOrgEntryOnly();
        Set<UserPermission> expected = EnumSet.of(UserPermission.START_TEST, UserPermission.SUBMIT_TEST,
                UserPermission.UPDATE_TEST, UserPermission.READ_PATIENT_LIST);
        ObjectNode resp = runQuery("current-user-query");
        ObjectNode who = (ObjectNode) resp.get("whoami");
        assertEquals(expected, extractPermissionsFromUser(who));
    }

    @Test
    void whoami_orgAdminUser_okPermissions() {
        useOrgAdmin();
        Set<UserPermission> expected = EnumSet.allOf(UserPermission.class);
        ObjectNode resp = runQuery("current-user-query");
        ObjectNode who = (ObjectNode) resp.get("whoami");
        assertEquals(expected, extractPermissionsFromUser(who));
    }

    @Test
    public void createUser() {
        useSuperUser();
        when(_oktaService.getOrganizationExternalIdForUser(USERNAMES.get(0)))
            .thenReturn(_initService.getDefaultOrganizationId());
        ObjectNode variables = JsonNodeFactory.instance.objectNode()
            .put("firstName", "Rhonda")
            .put("middleName", "Janet")
            .put("lastName", "Jones")
            .put("suffix", "III")
            .put("email", USERNAMES.get(0))
            .put("organizationExternalId", _initService.getDefaultOrganizationId());
        ObjectNode resp = runQuery("add-user", variables);
        ObjectNode user = (ObjectNode) resp.get("addUser");
        assertEquals("Rhonda", user.get("firstName").asText());
        assertEquals(USERNAMES.get(0), user.get("email").asText());
        assertEquals(_initService.getDefaultOrganizationId(), 
                     user.get("organization").get("externalId").asText());
        assertEquals(OrganizationRole.USER.getGrantedPermissions(), extractPermissionsFromUser(user));
    }

    @Test
    public void createUser_orgUser_failure() {
        ObjectNode variables = JsonNodeFactory.instance.objectNode()
            .put("firstName", "Rhonda")
            .put("middleName", "Janet")
            .put("lastName", "Jones")
            .put("suffix", "III")
            .put("email", USERNAMES.get(0))
            .put("organizationExternalId", _initService.getDefaultOrganizationId());
        runQuery("add-user", variables, ACCESS_ERROR);
    }

    @Test
    public void updateUser() {
        useSuperUser();
        when(_oktaService.getOrganizationExternalIdForUser(USERNAMES.get(0)))
            .thenReturn(_initService.getDefaultOrganizationId());
        when(_oktaService.getOrganizationExternalIdForUser(USERNAMES.get(1)))
            .thenReturn(_initService.getDefaultOrganizationId());

        ObjectNode addVariables = JsonNodeFactory.instance.objectNode()
            .put("firstName", "Rhonda")
            .put("middleName", "Janet")
            .put("lastName", "Jones")
            .put("suffix", "III")
            .put("email", USERNAMES.get(0))
            .put("organizationExternalId", _initService.getDefaultOrganizationId());
        runQuery("add-user", addVariables);

        ObjectNode updateVariables = JsonNodeFactory.instance.objectNode()
            .put("firstName", "Ronda")
            .put("middleName", "J")
            .put("lastName", "Jones")
            .put("suffix", "III")
            .put("newEmail", USERNAMES.get(1))
            .put("oldEmail", USERNAMES.get(0));
        ObjectNode resp = runQuery("update-user", updateVariables);
        ObjectNode user = (ObjectNode) resp.get("updateUser");
        assertEquals("Ronda", user.get("firstName").asText());
        assertEquals(USERNAMES.get(1), user.get("email").asText());
        assertEquals(OrganizationRole.USER.getGrantedPermissions(), extractPermissionsFromUser(user));
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
