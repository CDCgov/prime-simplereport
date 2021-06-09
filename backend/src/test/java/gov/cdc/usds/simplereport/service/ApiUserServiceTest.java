package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

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
            "newuser@example.com",
            new PersonName("First", "Middle", "Last", "Jr"),
            Role.USER,
            true);

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
            "nobody@example.com", new PersonName("First", "Middle", "Last", "Jr"), Role.USER, true);

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
                    "allfacilities@example.com", personName, Role.USER, true));

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
            () ->
                _service.createUserInCurrentOrg("captain@pirate.com", personName, Role.USER, true));

    assertEquals("Unable to add user.", caught.getMessage());
  }

  private void roleCheck(final UserInfo userInfo, final Set<OrganizationRole> expected) {
    EnumSet<OrganizationRole> actual = EnumSet.copyOf(userInfo.getRoles());
    assertEquals(expected, actual);
  }
}
