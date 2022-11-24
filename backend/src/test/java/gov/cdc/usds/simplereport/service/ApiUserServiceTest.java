package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.okta.sdk.resource.user.UserStatus;
import gov.cdc.usds.simplereport.api.model.ApiUserWithStatus;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.api.model.errors.ConflictingUserException;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
class ApiUserServiceTest extends BaseServiceTest<ApiUserService> {

  @Autowired ApiUserRepository _apiUserRepo;
  @Autowired OktaRepository _oktaRepo;

  // The next several retrieval tests expect the demo users as they are defined in the
  // no-security and no-okta-mgmt profiles
  @Test
  @WithSimpleReportOrgAdminUser
  void getUsersInCurrentOrg_adminUser_success() {
    initSampleData();
    List<ApiUser> users = _service.getUsersInCurrentOrg();
    assertEquals(5, users.size());
    assertEquals("admin@example.com", users.get(0).getLoginEmail());
    assertEquals("Andrews", users.get(0).getNameInfo().getLastName());
    assertEquals("bobbity@example.com", users.get(1).getLoginEmail());
    assertEquals("Bobberoo", users.get(1).getNameInfo().getLastName());
    assertEquals("nobody@example.com", users.get(2).getLoginEmail());
    assertEquals("Nixon", users.get(2).getNameInfo().getLastName());
    assertEquals("notruby@example.com", users.get(3).getLoginEmail());
    assertEquals("Reynolds", users.get(3).getNameInfo().getLastName());
    assertEquals("allfacilities@example.com", users.get(4).getLoginEmail());
    assertEquals("Williams", users.get(4).getNameInfo().getLastName());
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
  void getUsersAndStatusInCurrentOrg_success() {
    initSampleData();
    List<ApiUserWithStatus> users = _service.getUsersAndStatusInCurrentOrg();
    assertEquals(5, users.size());

    checkApiUserWithStatus(users.get(0), "admin@example.com", "Andrews", UserStatus.ACTIVE);
    checkApiUserWithStatus(users.get(1), "bobbity@example.com", "Bobberoo", UserStatus.ACTIVE);
    checkApiUserWithStatus(users.get(2), "nobody@example.com", "Nixon", UserStatus.ACTIVE);
    checkApiUserWithStatus(users.get(3), "notruby@example.com", "Reynolds", UserStatus.ACTIVE);
    checkApiUserWithStatus(
        users.get(4), "allfacilities@example.com", "Williams", UserStatus.ACTIVE);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getUser_adminUser_success() {
    initSampleData();

    final String email = "allfacilities@example.com"; // member of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();

    UserInfo userInfo = _service.getUser(apiUser.getInternalId());

    assertEquals(email, userInfo.getEmail());
    roleCheck(
        userInfo,
        EnumSet.of(
            OrganizationRole.NO_ACCESS, OrganizationRole.USER, OrganizationRole.ALL_FACILITIES));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getUser_adminUserWrongOrg_error() {
    initSampleData();

    // captain@pirate.com is a member of DAT_ORG, but requester is admin of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail("captain@pirate.com").get();
    assertSecurityError(() -> _service.getUser(apiUser.getInternalId()));
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getUser_superUser_success() {
    initSampleData();

    final String email = "allfacilities@example.com"; // member of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();

    UserInfo userInfo = _service.getUser(apiUser.getInternalId());

    assertEquals(email, userInfo.getEmail());
    roleCheck(
        userInfo,
        EnumSet.of(
            OrganizationRole.NO_ACCESS, OrganizationRole.USER, OrganizationRole.ALL_FACILITIES));
  }

  @Test
  void getUser_standardUser_error() {
    initSampleData();

    ApiUser apiUser = _apiUserRepo.findByLoginEmail("allfacilities@example.com").get();
    assertSecurityError(() -> _service.getUser(apiUser.getInternalId()));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void createUserInCurrentOrg_orgAdmin_success() {
    initSampleData();

    UserInfo newUserInfo =
        _service.createUserInCurrentOrg(
            "newuser@example.com", new PersonName("First", "Middle", "Last", "Jr"), Role.USER);

    assertEquals("newuser@example.com", newUserInfo.getEmail());

    PersonName personName = newUserInfo.getNameInfo();
    assertEquals("First", personName.getFirstName());
    assertEquals("Middle", personName.getMiddleName());
    assertEquals("Last", personName.getLastName());
    assertEquals("Jr", personName.getSuffix());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void createUserInCurrentOrg_reprovisionDeletedUser_success() {
    initSampleData();

    // disable a user from this organization
    ApiUser orgUser = _apiUserRepo.findByLoginEmail("nobody@example.com").get();
    orgUser.setIsDeleted(true);
    _apiUserRepo.save(orgUser);
    _oktaRepo.setUserIsActive(orgUser.getLoginEmail(), false);

    UserInfo reprovisionedUserInfo =
        _service.createUserInCurrentOrg(
            "nobody@example.com", new PersonName("First", "Middle", "Last", "Jr"), Role.USER);

    // the user will be re-enabled and updated
    assertEquals("nobody@example.com", reprovisionedUserInfo.getEmail());

    PersonName personName = reprovisionedUserInfo.getNameInfo();
    assertEquals("First", personName.getFirstName());
    assertEquals("Middle", personName.getMiddleName());
    assertEquals("Last", personName.getLastName());
    assertEquals("Jr", personName.getSuffix());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void createUserInCurrentOrg_enabledUserExists_error() {
    initSampleData();

    PersonName personName = new PersonName("First", "Middle", "Last", "Jr");

    ConflictingUserException caught =
        assertThrows(
            ConflictingUserException.class,
            () ->
                _service.createUserInCurrentOrg(
                    "allfacilities@example.com", personName, Role.USER));

    assertEquals("A user with this email address already exists.", caught.getMessage());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void createUserInCurrentOrg_disabledUserWrongOrg_error() {
    initSampleData();

    // disable a user from another organization
    ApiUser wrongOrgUser = _apiUserRepo.findByLoginEmail("captain@pirate.com").get();
    wrongOrgUser.setIsDeleted(true);
    _apiUserRepo.save(wrongOrgUser);
    _oktaRepo.setUserIsActive(wrongOrgUser.getLoginEmail(), false);

    PersonName personName = new PersonName("First", "Middle", "Last", "Jr");

    AccessDeniedException caught =
        assertThrows(
            AccessDeniedException.class,
            () -> _service.createUserInCurrentOrg("captain@pirate.com", personName, Role.USER));

    assertEquals("Unable to add user.", caught.getMessage());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void editUserName_orgAdmin_success() {
    initSampleData();

    final String email = "allfacilities@example.com"; // member of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();
    PersonName newName = apiUser.getNameInfo();
    newName.setFirstName("NewFirst");
    newName.setMiddleName("NewFirst");
    newName.setLastName("NewFirst");
    newName.setSuffix("NewFirst");

    UserInfo userInfo = _service.updateUser(apiUser.getInternalId(), newName);

    assertEquals(apiUser.getInternalId(), userInfo.getInternalId());
    assertEquals(apiUser.getNameInfo().getFirstName(), newName.getFirstName());
    assertEquals(apiUser.getNameInfo().getMiddleName(), newName.getMiddleName());
    assertEquals(apiUser.getNameInfo().getLastName(), newName.getLastName());
    assertEquals(apiUser.getNameInfo().getSuffix(), newName.getSuffix());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void editUserEmail_orgAdmin_success() {
    initSampleData();

    final String email = "allfacilities@example.com"; // member of DIS_ORG
    final String newEmail = "newemail@example.com"; // member of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();

    UserInfo userInfo = _service.updateUserEmail(apiUser.getInternalId(), newEmail);

    assertEquals(apiUser.getInternalId(), userInfo.getInternalId());
    assertEquals(userInfo.getEmail(), newEmail);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void resetUserPassword_orgAdmin_success() {
    initSampleData();

    final String email = "allfacilities@example.com"; // member of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();

    UserInfo userInfo = _service.resetUserPassword(apiUser.getInternalId());

    assertEquals(apiUser.getInternalId(), userInfo.getInternalId());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void resendActivationEmail_orgAdmin_success() {
    initSampleData();

    final String email = "allfacilities@example.com";
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();

    UserInfo userInfo = _service.resendActivationEmail(apiUser.getInternalId());

    assertEquals(apiUser.getInternalId(), userInfo.getInternalId());
  }

  private void roleCheck(final UserInfo userInfo, final Set<OrganizationRole> expected) {
    EnumSet<OrganizationRole> actual = EnumSet.copyOf(userInfo.getRoles());
    assertEquals(expected, actual);
  }

  private void checkApiUserWithStatus(
      ApiUserWithStatus user, String email, String lastName, UserStatus expectedStatus) {
    assertEquals(email, user.getEmail());
    assertEquals(lastName, user.getLastName());
    assertEquals(expectedStatus, user.getStatus());
  }
}
