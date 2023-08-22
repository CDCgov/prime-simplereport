package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.apiuser.UserMutationResolver.MOVE_USER_ARGUMENT_ERROR;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

import gov.cdc.usds.simplereport.api.model.ApiUserWithStatus;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.api.model.errors.ConflictingUserException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAccountUserException;
import gov.cdc.usds.simplereport.api.model.errors.RestrictedAccessUserException;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.IdentifiedEntity;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.db.repository.ApiUserRepository;
import gov.cdc.usds.simplereport.db.repository.FacilityRepository;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.idp.repository.PartialOktaUser;
import gov.cdc.usds.simplereport.service.model.UserInfo;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportOrgAdminUser;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportSiteAdminUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.*;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openapitools.client.model.UserStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = "hibernate.query.interceptor.error-level=ERROR")
class ApiUserServiceTest extends BaseServiceTest<ApiUserService> {

  @Autowired @SpyBean ApiUserRepository _apiUserRepo;
  @Autowired @SpyBean OktaRepository _oktaRepo;
  @Autowired OrganizationService _organizationService;
  @Autowired FacilityRepository facilityRepository;
  @Autowired private TestDataFactory _dataFactory;

  Set<UUID> emptySet = Collections.emptySet();

  @BeforeEach
  void cleanup() {
    reset(_apiUserRepo);
    reset(_oktaRepo);
  }

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
    var facilityIdSet =
        facilityRepository
            .findAllByOrganization(_organizationService.getCurrentOrganization())
            .stream()
            .map(IdentifiedEntity::getInternalId)
            .collect(Collectors.toSet());
    UserInfo newUserInfo =
        _service.createUserInCurrentOrg(
            "newuser@example.com",
            new PersonName("First", "Middle", "Last", "Jr"),
            Role.USER,
            false,
            facilityIdSet);

    assertEquals("newuser@example.com", newUserInfo.getEmail());

    PersonName personName = newUserInfo.getNameInfo();
    assertEquals("First", personName.getFirstName());
    assertEquals("Middle", personName.getMiddleName());
    assertEquals("Last", personName.getLastName());
    assertEquals("Jr", personName.getSuffix());
    assertThat(facilityIdSet)
        .hasSameElementsAs(
            newUserInfo.getFacilities().stream()
                .map(IdentifiedEntity::getInternalId)
                .collect(Collectors.toSet()));
    assertThat(newUserInfo.getRoles())
        .hasSameElementsAs(List.of(OrganizationRole.NO_ACCESS, OrganizationRole.USER));
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
            "nobody@example.com",
            new PersonName("First", "Middle", "Last", "Jr"),
            Role.USER,
            true,
            Set.of());

    // the user will be re-enabled and updated
    assertEquals("nobody@example.com", reprovisionedUserInfo.getEmail());

    var facilities =
        facilityRepository
            .findAllByOrganization(_organizationService.getCurrentOrganization())
            .stream()
            .map(IdentifiedEntity::getInternalId)
            .toList();
    PersonName personName = reprovisionedUserInfo.getNameInfo();
    assertEquals("First", personName.getFirstName());
    assertEquals("Middle", personName.getMiddleName());
    assertEquals("Last", personName.getLastName());
    assertEquals("Jr", personName.getSuffix());
    assertThat(
            reprovisionedUserInfo.getFacilities().stream()
                .map(IdentifiedEntity::getInternalId)
                .toList())
        .hasSameElementsAs(facilities);
    assertThat(reprovisionedUserInfo.getRoles())
        .hasSameElementsAs(
            List.of(
                OrganizationRole.NO_ACCESS,
                OrganizationRole.USER,
                OrganizationRole.ALL_FACILITIES));
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
                    "allfacilities@example.com", personName, Role.USER, false, emptySet));

    assertEquals("A user with this email address already exists.", caught.getMessage());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void createUserInCurrentOrg_disabledUser_conflictingUser_error() {
    initSampleData();

    // disable a user from another organization
    ApiUser wrongOrgUser = _apiUserRepo.findByLoginEmail("captain@pirate.com").get();
    wrongOrgUser.setIsDeleted(true);
    _apiUserRepo.save(wrongOrgUser);
    _oktaRepo.setUserIsActive(wrongOrgUser.getLoginEmail(), false);

    PersonName personName = new PersonName("First", "Middle", "Last", "Jr");

    ConflictingUserException caught =
        assertThrows(
            ConflictingUserException.class,
            () ->
                _service.createUserInCurrentOrg(
                    "captain@pirate.com", personName, Role.USER, false, emptySet));

    assertEquals("A user with this email address already exists.", caught.getMessage());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getAllUsersByOrganization_success() {
    Organization org = _dataFactory.saveValidOrganization();
    _dataFactory.createValidApiUser("allfacilities@example.com", org);
    _dataFactory.createValidApiUser("nofacilities@example.com", org);
    UserInfo userToBeDeleted = _dataFactory.createValidApiUser("somefacilities@example.com", org);
    _service.setIsDeleted(userToBeDeleted.getInternalId(), true);

    Organization differentOrg =
        _dataFactory.saveOrganization("other org", "k12", "OTHER_ORG", true);
    _dataFactory.createValidApiUser("otherorgfacilities@example.com", differentOrg);

    List<ApiUser> activeUsers = _service.getAllUsersByOrganization(org);
    assertEquals(3, activeUsers.size());
    List<String> activeUserEmails =
        activeUsers.stream()
            .map(activeUser -> activeUser.getLoginEmail())
            .sorted()
            .collect(Collectors.toList());
    assertEquals(
        activeUserEmails,
        List.of(
            "allfacilities@example.com", "nofacilities@example.com", "somefacilities@example.com"));
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
    verify(_oktaRepo, times(1)).resetUserPassword(email);

    assertEquals(apiUser.getInternalId(), userInfo.getInternalId());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void reactivateUser_orgAdmin_success() {
    initSampleData();

    final String email = "allfacilities@example.com"; // member of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();

    UserInfo userInfo = _service.reactivateUser(apiUser.getInternalId());
    verify(_oktaRepo, times(1)).reactivateUser(email);

    assertEquals(apiUser.getInternalId(), userInfo.getInternalId());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void reactivateAndResetUserPassword_orgAdmin_success() {
    initSampleData();
    final String email = "allfacilities@example.com"; // member of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();

    UserInfo userInfo = _service.reactivateUserAndResetPassword(apiUser.getInternalId());
    verify(_oktaRepo, times(1)).reactivateUser(email);
    verify(_oktaRepo, times(1)).resetUserPassword(email);

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

  @Test
  @WithSimpleReportSiteAdminUser
  void getUserByLoginEmail_success() {
    initSampleData();

    String email = "allfacilities@example.com";
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();
    UserInfo userInfo = _service.getUserByLoginEmail(email);

    assertEquals(apiUser.getInternalId(), userInfo.getInternalId());
    assertEquals(email, userInfo.getEmail());
    assertEquals(UserStatus.ACTIVE, userInfo.getUserStatus());
    assertEquals(false, userInfo.getIsAdmin());
    assertThat(userInfo.getFacilities()).hasSize(2);
    assertThat(userInfo.getPermissions()).hasSize(10);
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getUserByLoginEmail_user_not_found() {
    doReturn(Optional.empty()).when(this._apiUserRepo).findByLoginEmailIncludeArchived(anyString());
    NonexistentUserException caught =
        assertThrows(
            NonexistentUserException.class,
            () -> _service.getUserByLoginEmail("nonexistent@email.com"));
    assertEquals("Cannot find user.", caught.getMessage());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getUserByLoginEmail_accountWithNoOktaGroups_Error() {
    initSampleData();
    String email = "allfacilities@example.com";
    PartialOktaUser oktaUser =
        PartialOktaUser.builder()
            .isSiteAdmin(false)
            .status(UserStatus.ACTIVE)
            .organizationRoleClaims(Optional.empty())
            .build();

    when(this._oktaRepo.findUser(anyString())).thenReturn(oktaUser);
    OktaAccountUserException caught =
        assertThrows(OktaAccountUserException.class, () -> _service.getUserByLoginEmail(email));
    assertEquals(
        "User is not configured correctly: the okta account is not properly setup.",
        caught.getMessage());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getUserByLoginEmail_accountNotFoundInOkta_Error() {
    initSampleData();
    String email = "allfacilities@example.com";

    when(this._oktaRepo.findUser(anyString())).thenThrow(IllegalGraphqlArgumentException.class);
    OktaAccountUserException caught =
        assertThrows(OktaAccountUserException.class, () -> _service.getUserByLoginEmail(email));
    assertEquals(
        "User is not configured correctly: the okta account is not properly setup.",
        caught.getMessage());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getUserByLoginEmail_UnauthorizedSiteAdminAccount_Error() {
    initSampleData();
    String email = "allfacilities@example.com";
    PartialOktaUser oktaUser =
        PartialOktaUser.builder()
            .isSiteAdmin(true)
            .status(UserStatus.ACTIVE)
            .organizationRoleClaims(Optional.empty())
            .build();

    when(this._oktaRepo.findUser(anyString())).thenReturn(oktaUser);
    RestrictedAccessUserException caught =
        assertThrows(
            RestrictedAccessUserException.class, () -> _service.getUserByLoginEmail(email));
    assertEquals("Site admin account cannot be accessed.", caught.getMessage());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getUserByLoginEmail_not_authorized() {
    AccessDeniedException caught =
        assertThrows(
            AccessDeniedException.class, () -> _service.getUserByLoginEmail("example@email.com"));
    assertEquals("Access is denied", caught.getMessage());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void moveUserToNewOrganization_assignToAllFacilities_success() {
    initSampleData();
    final String email = "allfacilities@example.com";
    Organization orgToTestMovementTo = _dataFactory.saveValidOrganization();
    String orgToMoveExternalId = orgToTestMovementTo.getExternalId();

    _service.moveUserToNewOrganization(
        email, orgToMoveExternalId, true, Optional.of(List.of()), OrganizationRole.ADMIN);
    verify(_oktaRepo, times(1))
        .moveUserToNewOrganization(
            email, orgToTestMovementTo, Set.of(), OrganizationRole.ADMIN, true);
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void moveUserToNewOrganization_assignToAllFalseWithoutFacilities_throwsIllegalArgException() {
    initSampleData();
    final String email = "allfacilities@example.com";
    Organization orgToTestMovementTo = _dataFactory.saveValidOrganization();
    String moveOrgExternalId = orgToTestMovementTo.getExternalId();

    IllegalArgumentException caught =
        assertThrows(
            IllegalArgumentException.class,
            () ->
                _service.moveUserToNewOrganization(
                    email,
                    moveOrgExternalId,
                    false,
                    Optional.of(List.of()),
                    OrganizationRole.USER));
    assertEquals(MOVE_USER_ARGUMENT_ERROR, caught.getMessage());

    IllegalArgumentException caught2 =
        assertThrows(
            IllegalArgumentException.class,
            () ->
                _service.moveUserToNewOrganization(
                    email, moveOrgExternalId, false, null, OrganizationRole.USER));
    assertEquals(MOVE_USER_ARGUMENT_ERROR, caught2.getMessage());

    IllegalArgumentException caught3 =
        assertThrows(
            IllegalArgumentException.class,
            () ->
                _service.moveUserToNewOrganization(
                    email, moveOrgExternalId, false, OrganizationRole.USER));
    assertEquals(MOVE_USER_ARGUMENT_ERROR, caught3.getMessage());
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
