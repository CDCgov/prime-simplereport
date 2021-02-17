package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;

class ApiUserServiceTest extends BaseServiceTest<ApiUserService> {

    @BeforeEach
    void setupData() {
        initSampleData();
    }

    // The next several retrieval tests expect the demo users as they are defined in the 
    // no-security and no-okta-mgmt profiles
    @Test
    @WithSimpleReportOrgAdminUser
    void getUsernamesInCurrentOrg_adminUser_success() {
        List<String> userUsernames = _service.getUsernamesInCurrentOrg(OrganizationRole.USER);
        Collections.sort(userUsernames);
        assertEquals(userUsernames.size(), 4);
        assertEquals(userUsernames.get(0), "ben@sample.com");
        assertEquals(userUsernames.get(1), "bob@sample.com");
        assertEquals(userUsernames.get(2), "jamar@sample.com");
        assertEquals(userUsernames.get(3), "sarah@sample.com");

        List<String> adminUsernames = _service.getUsernamesInCurrentOrg(OrganizationRole.ADMIN);
        //TODO: delete
        for (String username : adminUsernames) {
            System.out.print("GET_USERNAMES_CURRENT_ORG:USERNAME="+username);
        }
        Collections.sort(adminUsernames);
        assertEquals(adminUsernames.size(), 2);
        assertEquals(adminUsernames.get(0), "bob@sample.com");
        assertEquals(adminUsernames.get(1), "sarah@sample.com");

        List<String> entryUsernames = _service.getUsernamesInCurrentOrg(OrganizationRole.ENTRY_ONLY);
        assertEquals(entryUsernames.size(), 1);
        assertEquals(entryUsernames.get(0), "jamar@sample.com");
    }

    @Test
    @WithSimpleReportSiteAdminUser
    void getUsernamesInCurrentOrg_superUser_error() {
        assertSecurityError(() -> {
            _service.getUsernamesInCurrentOrg(OrganizationRole.USER);
        });
    }

    @Test
    void getUsernamesInCurrentOrg_standardUser_error() {
        assertSecurityError(() -> {
            _service.getUsernamesInCurrentOrg(OrganizationRole.USER);
        });
    }

    @Test
    @WithSimpleReportOrgAdminUser
    void getUsersInCurrentOrg_adminUser_success() {
        List<String> userUsernames = _service.getUsersInCurrentOrg(OrganizationRole.USER).stream()
                .map(u->u.getLoginEmail()).collect(Collectors.toList());
        Collections.sort(userUsernames);
        assertEquals(userUsernames.size(), 3);
        assertEquals(userUsernames.get(0), "ben@sample.com");
        assertEquals(userUsernames.get(1), "jamar@sample.com");
        assertEquals(userUsernames.get(2), "sarah@sample.com");
        
        List<String> adminUsernames = _service.getUsersInCurrentOrg(OrganizationRole.ADMIN).stream()
                .map(u->u.getLoginEmail()).collect(Collectors.toList());
        assertEquals(adminUsernames.size(), 1);
        assertEquals(adminUsernames.get(0), "sarah@sample.com");
        
        List<String> entryUsernames = _service.getUsersInCurrentOrg(OrganizationRole.ENTRY_ONLY).stream()
                .map(u->u.getLoginEmail()).collect(Collectors.toList());
        assertEquals(entryUsernames.size(), 1);
        assertEquals(entryUsernames.get(0), "jamar@sample.com");
    }

    @Test
    @WithSimpleReportSiteAdminUser
    void getUsersInCurrentOrg_superUser_error() {
        assertSecurityError(() -> {
            _service.getUsersInCurrentOrg(OrganizationRole.USER);
        });
    }

    @Test
    void getUsersInCurrentOrg_standardUser_error() {
        assertSecurityError(() -> {
            _service.getUsersInCurrentOrg(OrganizationRole.USER);
        });
    }

    @Test
    @WithSimpleReportOrgAdminUser
    void getOrganizationRolesForUser_adminUser_success() {
        // This is the only way we can get a handle on the internal IDs of the users to check their roles
        List<ApiUser> users = _service.getUsersInCurrentOrg(OrganizationRole.USER);
        for (ApiUser user : users) {
            Optional<OrganizationRoles> roles = _service.getOrganizationRolesForUser(user.getInternalId());
            assertTrue(roles.isPresent());
            assertEquals(roles.get().getOrganization().getExternalId(), "DIS_ORG");
            assertTrue(roles.get().getEffectiveRole().isPresent());
            switch (user.getLoginEmail()) {
                case "ben@sample.com":
                    assertEquals(roles.get().getEffectiveRole().get(), OrganizationRole.USER);
                    break;
                case "jamar@sample.com":
                    assertEquals(roles.get().getEffectiveRole().get(), OrganizationRole.ENTRY_ONLY);
                    break;
                case "sarah@sample.com":
                    assertEquals(roles.get().getEffectiveRole().get(), OrganizationRole.ADMIN);
                    break;
            }
        }
    }
}
