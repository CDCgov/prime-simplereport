package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;
import java.util.Collections;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.function.BiConsumer;
import org.junit.jupiter.api.Test;

class ApiUserServiceTest extends BaseServiceTest<ApiUserService> {

  // The next several retrieval tests expect the demo users as they are defined in the
  // no-security and no-okta-mgmt profiles
  @Test
  @WithSimpleReportOrgAdminUser
  void getUsersInCurrentOrg_adminUser_success() {
    initSampleData();
    List<UserInfo> users = _service.getUsersInCurrentOrg();
    Collections.sort(users, new UserInfoEmailComparator());
    BiConsumer<UserInfo, Set<OrganizationRole>> roleCheck =
        (u, expected) -> {
          EnumSet<OrganizationRole> actual = EnumSet.copyOf(u.getRoles());
          assertEquals(expected, actual);
        };
    assertEquals(users.size(), 4);
    assertEquals(users.get(0).getEmail(), "admin@example.com");
    roleCheck.accept(users.get(0), EnumSet.of(OrganizationRole.NO_ACCESS, OrganizationRole.ADMIN));
    assertEquals(users.get(1).getEmail(), "allfacilities@example.com");
    roleCheck.accept(
        users.get(1),
        EnumSet.of(
            OrganizationRole.NO_ACCESS, OrganizationRole.USER, OrganizationRole.ALL_FACILITIES));
    assertEquals(users.get(2).getEmail(), "bobbity@example.com");
    roleCheck.accept(users.get(2), EnumSet.of(OrganizationRole.NO_ACCESS, OrganizationRole.USER));
    assertEquals(users.get(3).getEmail(), "nobody@example.com");
    roleCheck.accept(
        users.get(3), EnumSet.of(OrganizationRole.NO_ACCESS, OrganizationRole.ENTRY_ONLY));
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
