package gov.cdc.usds.simplereport.service;

import static gov.cdc.usds.simplereport.api.model.errors.PrivilegeUpdateFacilityAccessException.PRIVILEGE_UPDATE_FACILITY_ACCESS_ERROR;
import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doReturn;
import static org.mockito.Mockito.reset;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.okta.sdk.resource.model.UserStatus;
import gov.cdc.usds.simplereport.api.model.ApiUserWithStatus;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.api.model.errors.ConflictingUserException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.api.model.errors.NonexistentUserException;
import gov.cdc.usds.simplereport.api.model.errors.OktaAccountUserException;
import gov.cdc.usds.simplereport.api.model.errors.PrivilegeUpdateFacilityAccessException;
import gov.cdc.usds.simplereport.api.model.errors.RestrictedAccessUserException;
import gov.cdc.usds.simplereport.api.model.errors.UnidentifiedFacilityException;
import gov.cdc.usds.simplereport.config.FeatureFlagsConfig;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Facility;
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
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.util.Collections;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.boot.test.mock.mockito.SpyBean;
import org.springframework.data.domain.Page;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.test.context.TestPropertySource;

@TestPropertySource(properties = {"spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"})
class ApiUserServiceTest extends BaseServiceTest<ApiUserService> {

  @Autowired @SpyBean ApiUserRepository _apiUserRepo;
  @Autowired @SpyBean OktaRepository _oktaRepo;
  @Autowired OrganizationService _organizationService;
  @Autowired FacilityRepository facilityRepository;
  @Autowired @SpyBean DbOrgRoleClaimsService _dbOrgRoleClaimsService;
  @MockBean FeatureFlagsConfig _featureFlagsConfig;
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
  void getUsersInCurrentOrg_withAdminUser_withOktaMigrationDisabled_success() {
    initSampleData();
    List<ApiUser> users = _service.getUsersInCurrentOrg();
    assertEquals(6, users.size());
    assertEquals("admin@example.com", users.get(0).getLoginEmail());
    assertEquals("Andrews", users.get(0).getNameInfo().getLastName());
    assertEquals("bobbity@example.com", users.get(1).getLoginEmail());
    assertEquals("Bobberoo", users.get(1).getNameInfo().getLastName());
    assertEquals("invalid@example.com", users.get(2).getLoginEmail());
    assertEquals("Irwin", users.get(2).getNameInfo().getLastName());
    assertEquals("nobody@example.com", users.get(3).getLoginEmail());
    assertEquals("Nixon", users.get(3).getNameInfo().getLastName());
    assertEquals("notruby@example.com", users.get(4).getLoginEmail());
    assertEquals("Reynolds", users.get(4).getNameInfo().getLastName());
    assertEquals("allfacilities@example.com", users.get(5).getLoginEmail());
    assertEquals("Williams", users.get(5).getNameInfo().getLastName());

    Organization currentOrg = _organizationService.getCurrentOrganization();
    verify(_oktaRepo, times(1)).getAllUsersForOrganization(currentOrg);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getUsersInCurrentOrg_withAdminUser_withOktaMigrationEnabled_success() {
    initSampleData();
    when(_featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(true);

    List<ApiUser> users = _service.getUsersInCurrentOrg();
    assertEquals(6, users.size());
    assertEquals("admin@example.com", users.get(0).getLoginEmail());
    assertEquals("Andrews", users.get(0).getNameInfo().getLastName());
    assertEquals("bobbity@example.com", users.get(1).getLoginEmail());
    assertEquals("Bobberoo", users.get(1).getNameInfo().getLastName());
    assertEquals("invalid@example.com", users.get(2).getLoginEmail());
    assertEquals("Irwin", users.get(2).getNameInfo().getLastName());
    assertEquals("nobody@example.com", users.get(3).getLoginEmail());
    assertEquals("Nixon", users.get(3).getNameInfo().getLastName());
    assertEquals("notruby@example.com", users.get(4).getLoginEmail());
    assertEquals("Reynolds", users.get(4).getNameInfo().getLastName());
    assertEquals("allfacilities@example.com", users.get(5).getLoginEmail());
    assertEquals("Williams", users.get(5).getNameInfo().getLastName());

    verify(_oktaRepo, times(0)).getAllUsersForOrganization(any());
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
    assertEquals(6, users.size());

    checkApiUserWithStatus(users.get(0), "admin@example.com", "Andrews", UserStatus.ACTIVE);
    checkApiUserWithStatus(users.get(1), "bobbity@example.com", "Bobberoo", UserStatus.ACTIVE);
    checkApiUserWithStatus(users.get(2), "invalid@example.com", "Irwin", UserStatus.ACTIVE);
    checkApiUserWithStatus(users.get(3), "nobody@example.com", "Nixon", UserStatus.ACTIVE);
    checkApiUserWithStatus(users.get(4), "notruby@example.com", "Reynolds", UserStatus.ACTIVE);
    checkApiUserWithStatus(
        users.get(5), "allfacilities@example.com", "Williams", UserStatus.ACTIVE);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getPagedUsersAndStatusInCurrentOrg_success() {
    initSampleData();
    Page<ApiUserWithStatus> usersPage = _service.getPagedUsersAndStatusInCurrentOrg(0, 3);
    List<ApiUserWithStatus> users = usersPage.stream().toList();
    assertEquals(3, users.size());

    checkApiUserWithStatus(users.get(0), "admin@example.com", "Andrews", UserStatus.ACTIVE);
    checkApiUserWithStatus(users.get(1), "bobbity@example.com", "Bobberoo", UserStatus.ACTIVE);
    checkApiUserWithStatus(
        users.get(2), "allfacilities@example.com", "Williams", UserStatus.ACTIVE);

    Page<ApiUserWithStatus> users2ndPage = _service.getPagedUsersAndStatusInCurrentOrg(1, 3);
    List<ApiUserWithStatus> users2ndList = users2ndPage.stream().toList();
    assertEquals(3, users2ndList.size());

    checkApiUserWithStatus(users2ndList.get(0), "invalid@example.com", "Irwin", UserStatus.ACTIVE);
    checkApiUserWithStatus(users2ndList.get(1), "nobody@example.com", "Nixon", UserStatus.ACTIVE);
    checkApiUserWithStatus(
        users2ndList.get(2), "notruby@example.com", "Reynolds", UserStatus.ACTIVE);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void searchUsersAndStatusInCurrentOrgPaged_success() {
    initSampleData();
    Page<ApiUserWithStatus> usersPage =
        _service.searchUsersAndStatusInCurrentOrgPaged(0, 10, "Bob");
    List<ApiUserWithStatus> users = usersPage.stream().toList();
    assertEquals(1, users.size());
    checkApiUserWithStatus(users.get(0), "bobbity@example.com", "Bobberoo", UserStatus.ACTIVE);
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getUser_withAdminUser_withOktaMigrationDisabled_success() {
    initSampleData();

    final String email = "allfacilities@example.com"; // member of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();

    UserInfo userInfo = _service.getUser(apiUser.getInternalId());

    verify(_dbOrgRoleClaimsService, times(1)).getOrganizationRoleClaims((ApiUser) any());
    assertEquals(email, userInfo.getEmail());
    roleCheck(
        userInfo,
        EnumSet.of(
            OrganizationRole.NO_ACCESS, OrganizationRole.USER, OrganizationRole.ALL_FACILITIES));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getUser_withAdminUser_withOktaMigrationEnabled_success() {
    initSampleData();
    when(_featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(true);
    final String email = "allfacilities@example.com"; // member of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();

    UserInfo userInfo = _service.getUser(apiUser.getInternalId());

    verify(_dbOrgRoleClaimsService, times(2)).getOrganizationRoleClaims((ApiUser) any());
    assertEquals(email, userInfo.getEmail());
    roleCheck(userInfo, EnumSet.of(OrganizationRole.USER, OrganizationRole.ALL_FACILITIES));
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getUser_withSuperUser_withOktaMigrationDisabled_success() {
    initSampleData();

    final String email = "allfacilities@example.com"; // member of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();

    UserInfo userInfo = _service.getUser(apiUser.getInternalId());

    verify(_dbOrgRoleClaimsService, times(1)).getOrganizationRoleClaims((ApiUser) any());
    assertEquals(email, userInfo.getEmail());
    roleCheck(
        userInfo,
        EnumSet.of(
            OrganizationRole.NO_ACCESS, OrganizationRole.USER, OrganizationRole.ALL_FACILITIES));

    // check roles and facilities for site admin were not created
    String currentUsername = _service.getCurrentUserInfo().getEmail();
    assertEquals(TestUserIdentities.SITE_ADMIN_USER, currentUsername);
    ApiUser siteAdminUser = _apiUserRepo.findByLoginEmail(currentUsername).get();
    assertTrue(siteAdminUser.getRoles().isEmpty());
    assertTrue(siteAdminUser.getFacilities().isEmpty());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getUser_withSuperUser_withOktaMigrationEnabled_success() {
    initSampleData();
    when(_featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(true);

    final String email = "allfacilities@example.com"; // member of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();

    UserInfo userInfo = _service.getUser(apiUser.getInternalId());

    verify(_dbOrgRoleClaimsService, times(2)).getOrganizationRoleClaims((ApiUser) any());
    assertEquals(email, userInfo.getEmail());
    roleCheck(userInfo, EnumSet.of(OrganizationRole.USER, OrganizationRole.ALL_FACILITIES));

    // check roles and facilities for site admin were not created
    String currentUsername = _service.getCurrentUserInfo().getEmail();
    ApiUser siteAdminUser = _apiUserRepo.findByLoginEmail(currentUsername).get();
    assertTrue(siteAdminUser.getRoles().isEmpty());
    assertTrue(siteAdminUser.getFacilities().isEmpty());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void getUser_withAdminUserInDifferentOrg_error() {
    initSampleData();

    // captain@pirate.com is a member of DAT_ORG, but requester is admin of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail("captain@pirate.com").get();
    assertSecurityError(() -> _service.getUser(apiUser.getInternalId()));
  }

  @Test
  void getUser_withStandardUser_error() {
    initSampleData();

    ApiUser apiUser = _apiUserRepo.findByLoginEmail("allfacilities@example.com").get();
    assertSecurityError(() -> _service.getUser(apiUser.getInternalId()));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void createUserInCurrentOrg_withOrgAdmin_withOktaMigrationDisabled_success() {
    initSampleData();
    Set<UUID> facilityIdSet =
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
    verify(_dbOrgRoleClaimsService, times(0)).getOrganizationRoleClaims((ApiUser) any());

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
  void createUserInCurrentOrg_withOrgAdmin_withOktaMigrationEnabled_success() {
    initSampleData();
    when(_featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(true);
    Set<UUID> facilityIdSet =
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
    verify(_dbOrgRoleClaimsService, times(1)).getOrganizationRoleClaims((ApiUser) any());

    assertEquals("newuser@example.com", newUserInfo.getEmail());
    assertThat(facilityIdSet)
        .hasSameElementsAs(
            newUserInfo.getFacilities().stream()
                .map(IdentifiedEntity::getInternalId)
                .collect(Collectors.toSet()));
    assertThat(newUserInfo.getRoles()).hasSameElementsAs(List.of(OrganizationRole.USER));
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void createUserInCurrentOrg_reprovisionDeletedUser_withOktaMigrationDisabled_success() {
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
    verify(_dbOrgRoleClaimsService, times(0)).getOrganizationRoleClaims((ApiUser) any());

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
  void createUserInCurrentOrg_reprovisionDeletedUser_withOktaMigrationEnabled_success() {
    initSampleData();
    when(_featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(true);

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
    verify(_dbOrgRoleClaimsService, times(1)).getOrganizationRoleClaims((ApiUser) any());

    // the user will be re-enabled and updated
    assertEquals("nobody@example.com", reprovisionedUserInfo.getEmail());

    var facilities =
        facilityRepository
            .findAllByOrganization(_organizationService.getCurrentOrganization())
            .stream()
            .map(IdentifiedEntity::getInternalId)
            .toList();
    assertThat(
            reprovisionedUserInfo.getFacilities().stream()
                .map(IdentifiedEntity::getInternalId)
                .toList())
        .hasSameElementsAs(facilities);
    assertThat(reprovisionedUserInfo.getRoles())
        .hasSameElementsAs(List.of(OrganizationRole.USER, OrganizationRole.ALL_FACILITIES));
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
    Facility facility = _dataFactory.createValidFacility(org);
    _dataFactory.createValidApiUser("allfacilities@example.com", org, Role.USER, Set.of(facility));
    _dataFactory.createValidApiUser("nofacilities@example.com", org, Role.USER, Set.of(facility));
    UserInfo userToBeDeleted =
        _dataFactory.createValidApiUser(
            "somefacilities@example.com", org, Role.USER, Set.of(facility));
    _service.setIsDeleted(userToBeDeleted.getInternalId(), true);

    Organization differentOrg =
        _dataFactory.saveOrganization("other org", "k12", "OTHER_ORG", true);
    Facility differentFacility = _dataFactory.createValidFacility(differentOrg);
    _dataFactory.createValidApiUser(
        "otherorgfacilities@example.com", differentOrg, Role.USER, Set.of(differentFacility));

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
  @WithSimpleReportSiteAdminUser
  void resetUserPassword_withSiteAdmin_withOktaMigrationDisabled_success() {
    initSampleData();

    final String email = "allfacilities@example.com"; // member of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();

    UserInfo userInfo = _service.resetUserPassword(apiUser.getInternalId());
    verify(_oktaRepo, times(1)).resetUserPassword(email);
    verify(_dbOrgRoleClaimsService, times(0)).getOrganizationRoleClaims((ApiUser) any());

    assertEquals(apiUser.getInternalId(), userInfo.getInternalId());

    // check roles and facilities for site admin were not created
    String currentUsername = _service.getCurrentUserInfo().getEmail();
    assertEquals(TestUserIdentities.SITE_ADMIN_USER, currentUsername);
    ApiUser siteAdminUser = _apiUserRepo.findByLoginEmail(currentUsername).get();
    assertTrue(siteAdminUser.getRoles().isEmpty());
    assertTrue(siteAdminUser.getFacilities().isEmpty());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void resetUserPassword_withOrgAdmin_withOktaMigrationDisabled_success() {
    initSampleData();
    when(_featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(true);

    final String email = "allfacilities@example.com"; // member of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();

    UserInfo userInfo = _service.resetUserPassword(apiUser.getInternalId());
    verify(_oktaRepo, times(1)).resetUserPassword(email);
    verify(_dbOrgRoleClaimsService, times(1)).getOrganizationRoleClaims((ApiUser) any());

    assertEquals(apiUser.getInternalId(), userInfo.getInternalId());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void resetUserPassword_withOrgAdmin_withOktaMigrationEnabled_success() {
    initSampleData();

    final String email = "allfacilities@example.com"; // member of DIS_ORG
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();

    UserInfo userInfo = _service.resetUserPassword(apiUser.getInternalId());
    verify(_oktaRepo, times(1)).resetUserPassword(email);
    verify(_dbOrgRoleClaimsService, times(0)).getOrganizationRoleClaims((ApiUser) any());

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
  void getUserByLoginEmail_withOktaMigrationDisabled_success() {
    initSampleData();

    String email = "allfacilities@example.com";
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();
    UserInfo userInfo = _service.getUserByLoginEmail(email);

    verify(_dbOrgRoleClaimsService, times(1)).getOrganizationRoleClaims((ApiUser) any());
    assertEquals(apiUser.getInternalId(), userInfo.getInternalId());
    assertEquals(email, userInfo.getEmail());
    assertEquals(UserStatus.ACTIVE, userInfo.getUserStatus());
    assertEquals(false, userInfo.getIsAdmin());
    assertThat(userInfo.getFacilities()).hasSize(2);
    assertThat(userInfo.getPermissions()).hasSize(10);
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getUserByLoginEmail_withOktaMigrationEnabled_success() {
    initSampleData();
    when(_featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(true);

    String email = "allfacilities@example.com";
    ApiUser apiUser = _apiUserRepo.findByLoginEmail(email).get();
    UserInfo userInfo = _service.getUserByLoginEmail(email);

    verify(_dbOrgRoleClaimsService, times(2)).getOrganizationRoleClaims((ApiUser) any());

    assertEquals(apiUser.getInternalId(), userInfo.getInternalId());
    assertEquals(email, userInfo.getEmail());
    assertEquals(UserStatus.ACTIVE, userInfo.getUserStatus());
    assertEquals(false, userInfo.getIsAdmin());
    assertThat(userInfo.getFacilities()).hasSize(2);
    assertThat(userInfo.getPermissions()).hasSize(10);

    // check roles and facilities for site admin were not created
    String currentUsername = _service.getCurrentUserInfo().getEmail();
    assertEquals(TestUserIdentities.SITE_ADMIN_USER, currentUsername);
    ApiUser siteAdminUser = _apiUserRepo.findByLoginEmail(currentUsername).get();
    assertTrue(siteAdminUser.getRoles().isEmpty());
    assertTrue(siteAdminUser.getFacilities().isEmpty());
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
    assertEquals("Access Denied", caught.getMessage());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getUserByLoginEmail_invalidClaims_withOktaMigrationDisabled_success() {
    initSampleData();
    String email = "invalid@example.com";

    // we should be able to retrieve user info for a user with invalid claims (no facility access)
    // without failing
    UserInfo result = _service.getUserByLoginEmail(email);
    verify(_dbOrgRoleClaimsService, times(1)).getOrganizationRoleClaims((ApiUser) any());
    assertThat(result.getFacilities()).isEmpty();
    assertEquals(List.of(OrganizationRole.NO_ACCESS, OrganizationRole.USER), result.getRoles());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void getUserByLoginEmail_invalidClaims_withOktaMigrationEnabled_success() {
    initSampleData();
    String email = "invalid@example.com";
    when(_featureFlagsConfig.isOktaMigrationEnabled()).thenReturn(true);

    // we should be able to retrieve user info for a user with invalid claims (no facility access)
    // without failing
    UserInfo result = _service.getUserByLoginEmail(email);
    verify(_dbOrgRoleClaimsService, times(2)).getOrganizationRoleClaims((ApiUser) any());
    assertThat(result.getFacilities()).isEmpty();
    assertEquals(List.of(OrganizationRole.USER), result.getRoles());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void updateUserPrivilegesAndGroupAccess_assignToAllFacilities_success() {
    initSampleData();
    final String email = "allfacilities@example.com";
    Organization orgToTestMovementTo = _dataFactory.saveValidOrganization();
    String orgToMoveExternalId = orgToTestMovementTo.getExternalId();

    _service.updateUserPrivilegesAndGroupAccess(
        email, orgToMoveExternalId, true, List.of(), Role.ADMIN);
    verify(_oktaRepo, times(1))
        .updateUserPrivilegesAndGroupAccess(
            email, orgToTestMovementTo, Set.of(), OrganizationRole.ADMIN, true);
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void
      updateUserPrivilegesAndGroupAccess_assignToAllFalseWithoutFacilities_throwsPrivilegeUpdateFacilityAccessException() {
    initSampleData();
    final String email = "allfacilities@example.com";
    Organization orgToTestMovementTo = _dataFactory.saveValidOrganization();
    String moveOrgExternalId = orgToTestMovementTo.getExternalId();
    List<UUID> emptyList = List.of();
    PrivilegeUpdateFacilityAccessException caught =
        assertThrows(
            PrivilegeUpdateFacilityAccessException.class,
            () ->
                _service.updateUserPrivilegesAndGroupAccess(
                    email, moveOrgExternalId, false, emptyList, Role.USER));
    assertEquals(PRIVILEGE_UPDATE_FACILITY_ACCESS_ERROR, caught.getMessage());

    PrivilegeUpdateFacilityAccessException caught2 =
        assertThrows(
            PrivilegeUpdateFacilityAccessException.class,
            () ->
                _service.updateUserPrivilegesAndGroupAccess(
                    email, moveOrgExternalId, false, Role.USER));
    assertEquals(PRIVILEGE_UPDATE_FACILITY_ACCESS_ERROR, caught2.getMessage());
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void updateUserPrivilegesAndGroupAccess_facilityToMoveNotFoundInOrg_throwsException() {
    initSampleData();
    final String email = "allfacilities@example.com";
    Organization orgToTestMovementTo = _dataFactory.saveValidOrganization();
    String moveOrgExternalId = orgToTestMovementTo.getExternalId();

    Organization differentOrg =
        _dataFactory.saveOrganization("other org", "k12", "OTHER_ORG", true);
    Facility facilityThatShouldThrowError = _dataFactory.createValidFacility(differentOrg);
    List<UUID> facilityListThatShouldThrowId =
        List.of(facilityThatShouldThrowError.getInternalId());

    UnidentifiedFacilityException caught =
        assertThrows(
            UnidentifiedFacilityException.class,
            () ->
                _service.updateUserPrivilegesAndGroupAccess(
                    email, moveOrgExternalId, false, facilityListThatShouldThrowId, Role.USER));
    String expectedError =
        "Facilities with id(s) "
            + facilityListThatShouldThrowId
            + " for org "
            + moveOrgExternalId
            + " weren't found. Check those facility id(s) exist in the specified organization";
    assertEquals(expectedError, caught.getMessage());
  }

  @Test
  @WithSimpleReportOrgAdminUser
  void orgAdminUser_clearUserRolesAndFacilities_error() {
    String username = "nonexistentuser@examplemail.com";
    assertThrows(AccessDeniedException.class, () -> _service.clearUserRolesAndFacilities(username));
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void siteAdminUser_clearUserRolesAndFacilities_nonExistentUser_throws() {
    final String email = "nonexistentuser@examplemail.com";

    assertThrows(
        NonexistentUserException.class,
        () -> {
          _service.clearUserRolesAndFacilities(email);
        });
  }

  @Test
  @WithSimpleReportSiteAdminUser
  void siteAdminUser_clearUserRolesAndFacilities_success() {
    initSampleData();
    final String email = TestUserIdentities.STANDARD_USER;
    ApiUser foundUser = _apiUserRepo.findByLoginEmail(email).get();

    // check initial facilities and roles
    int initialFacilitiesCount = foundUser.getFacilities().size();
    Set<OrganizationRole> initialOrgRoles = foundUser.getRoles();
    assertEquals(1, initialFacilitiesCount);
    assertEquals(1, initialOrgRoles.size());
    assertEquals("USER", initialOrgRoles.stream().findFirst().get().getName());

    ApiUser updatedUser = _service.clearUserRolesAndFacilities(email);
    // check facilities and roles after deletion
    int updatedFacilitiesCount = updatedUser.getFacilities().size();
    int updatedOrgRolesCount = updatedUser.getRoles().size();
    assertEquals(0, updatedFacilitiesCount);
    assertEquals(0, updatedOrgRolesCount);
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
