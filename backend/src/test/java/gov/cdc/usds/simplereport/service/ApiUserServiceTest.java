package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.api.model.errors.UnidentifiedUserException;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;
import java.util.Collections;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class ApiUserServiceTest extends BaseServiceTest<ApiUserService> {
  @Autowired ApiUserRepository _apiUserRepo;

  // The next several retrieval tests expect the demo users as they are defined in the
  // no-security and no-okta-mgmt profiles
  @Test
  @WithSimpleReportOrgAdminUser
  void getUsersInCurrentOrg_adminUser_success() {
    initSampleData();
    List<UserInfo> users = _service.getUsersInCurrentOrg();
    Collections.sort(users, new UserInfoEmailComparator());
    assertEquals(users.size(), 5);
    assertEquals(users.get(0).getEmail(), "admin@example.com");
    roleCheck(users.get(0), EnumSet.of(OrganizationRole.NO_ACCESS, OrganizationRole.ADMIN));
    assertEquals(users.get(1).getEmail(), "allfacilities@example.com");
    roleCheck(
        users.get(1),
        EnumSet.of(
            OrganizationRole.NO_ACCESS, OrganizationRole.USER, OrganizationRole.ALL_FACILITIES));
    assertEquals(users.get(2).getEmail(), "bobbity@example.com");
    roleCheck(users.get(2), EnumSet.of(OrganizationRole.NO_ACCESS, OrganizationRole.USER));
    assertEquals(users.get(3).getEmail(), "nobody@example.com");
    roleCheck(users.get(3), EnumSet.of(OrganizationRole.NO_ACCESS, OrganizationRole.ENTRY_ONLY));
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

  @Test
  @WithSimpleReportOrgAdminUser
  void getUserInCurrentOrg_adminUser_success() {
    initSampleData();

    final String email = "allfacilities@example.com"; // member of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();

    UserInfo userInfo = _service.getUserInCurrentOrg(apiUser.getInternalId());

    assertEquals(email, userInfo.getEmail());
    roleCheck(
        userInfo,
        EnumSet.of(
            OrganizationRole.NO_ACCESS, OrganizationRole.USER, OrganizationRole.ALL_FACILITIES));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getUserInCurrentOrg_adminUserWrongOrg_error() {
    initSampleData();

    final String email = "captain@pirate.com"; // member of DAT_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();

    Exception e =
        assertThrows(
            UnidentifiedUserException.class,
            () -> _service.getUserInCurrentOrg(apiUser.getInternalId()));

    assertEquals("Cannot determine user's identity.", e.getMessage());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getUserInCurrentOrg_superUser_error() {
    initSampleData();

    ApiUser apiUser = _apiUserRepo.findByLoginEmail("allfacilities@example.com").get();
    assertSecurityError(() -> _service.getUserInCurrentOrg(apiUser.getInternalId()));
  }

  @Test
  void getUserInCurrentOrg_standardUser_error() {
    initSampleData();

    ApiUser apiUser = _apiUserRepo.findByLoginEmail("allfacilities@example.com").get();
    assertSecurityError(() -> _service.getUserInCurrentOrg(apiUser.getInternalId()));
  }

  private void roleCheck(final UserInfo userInfo, final Set<OrganizationRole> expected) {
    EnumSet<OrganizationRole> actual = EnumSet.copyOf(userInfo.getRoles());
    assertEquals(expected, actual);
  }

  private class UserInfoEmailComparator implements Comparator<UserInfo> {
    @Override
    public int compare(UserInfo u1, UserInfo u2) {
      return u1.getEmail().compareTo(u2.getEmail());
    }
  }
}
