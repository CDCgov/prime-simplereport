package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.service.model.UserInfo;
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
    void getUsersInCurrentOrg_adminUser_success() {
        List<UserInfo> users = _service.getUsersInCurrentOrg();
        Collections.sort(users, new UserInfoEmailComparator());
        assertEquals(users.size(), 4);
        assertEquals(users.get(0).getEmail(), "ben@sample.com");
        assertEquals(users.get(0).getRoles(), List.of(OrganizationRole.USER));
        assertEquals(users.get(1).getEmail(), "bob@sample.com");
        assertEquals(users.get(1).getRoles(), List.of(OrganizationRole.USER, OrganizationRole.ADMIN));
        assertEquals(users.get(2).getEmail(), "jamar@sample.com");
        assertEquals(users.get(2).getRoles(), List.of(OrganizationRole.ENTRY_ONLY, OrganizationRole.USER));
        assertEquals(users.get(3).getEmail(), "sarah@sample.com");
        assertEquals(users.get(3).getRoles(), List.of(OrganizationRole.USER, OrganizationRole.ADMIN));
    }

    @Test
    @WithSimpleReportSiteAdminUser
    void getUsersInCurrentOrg_superUser_error() {
        assertSecurityError(_service::getUsersInCurrentOrg);
    }

    @Test
    void getUsersInCurrentOrg_standardUser_error() {
        assertSecurityError(_service::getUsersInCurrentOrg);
    }

    private class UserInfoEmailComparator implements Comparator<UserInfo> {
        @Override
        public int compare(UserInfo u1, UserInfo u2) {
            return u1.getEmail().compareTo(u2.getEmail());
        }
    }
}
