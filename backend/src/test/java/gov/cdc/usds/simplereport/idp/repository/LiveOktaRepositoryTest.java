package gov.cdc.usds.simplereport.idp.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.okta.sdk.resource.api.ApplicationApi;
import com.okta.sdk.resource.api.ApplicationGroupsApi;
import com.okta.sdk.resource.api.GroupApi;
import com.okta.sdk.resource.api.UserApi;
import com.okta.sdk.resource.client.ApiException;
import com.okta.sdk.resource.common.PagedList;
import com.okta.sdk.resource.group.GroupBuilder;
import com.okta.sdk.resource.model.Application;
import com.okta.sdk.resource.model.Group;
import com.okta.sdk.resource.model.GroupProfile;
import com.okta.sdk.resource.model.GroupType;
import com.okta.sdk.resource.model.UpdateUserRequest;
import com.okta.sdk.resource.model.User;
import com.okta.sdk.resource.model.UserProfile;
import com.okta.sdk.resource.model.UserStatus;
import com.okta.sdk.resource.user.UserBuilder;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.model.errors.ConflictingUserException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.authorization.OrganizationExtractor;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Import;

@Import(SliceTestConfiguration.class)
class LiveOktaRepositoryTest {

  private static final AuthorizationProperties MOCK_PROPS =
      new AuthorizationProperties(null, "UNITTEST");
  private static final OrganizationExtractor MOCK_EXTRACTOR = new OrganizationExtractor(MOCK_PROPS);
  private static final ApiException USER_NOT_FOUND_API_EXCEPTION =
      new ApiException(
          7,
          Collections.emptyMap(),
          "{'errorCode':'E0000007','errorSummary':'Not found: Resource not found: boban@skylight.digitala (User)','errorLink':'E0000007','errorId':'oaeq32NECgIQ7Cbgn5ATQM2RQ','errorCauses':[]}");

  private CurrentTenantDataAccessContextHolder tenantDataAccessContextHolder =
      new CurrentTenantDataAccessContextHolder();
  private static final String MOCK_CLIENT_ID = "FAKE_CLIENT_ID";
  private final GroupApi groupApi = mock(GroupApi.class);
  private final UserApi userApi = mock(UserApi.class);
  private final ApplicationApi applicationApi = mock(ApplicationApi.class);
  private final ApplicationGroupsApi applicationGroupsApi = mock(ApplicationGroupsApi.class);
  private final Application _app = mock(Application.class);
  LiveOktaRepository _repo;
  ApiException userExistsError =
      new ApiException(
          500,
          "{\"errorCode\":\"E0000001\",\"errorSummary\":\"Api validation failed: login\",\"errorLink\":\"E0000001\",\"errorId\":\"oaeBCIl7rB1RSq4D4V0vu5C2w\",\"errorCauses\":[{\"errorSummary\":\"login: An object with this field already exists in the current organization\"}]}");

  @BeforeEach
  public void setup() {
    when(_app.getId()).thenReturn("1234");
    when(applicationApi.getApplication(anyString(), isNull())).thenReturn(_app);

    _repo =
        new LiveOktaRepository(
            MOCK_PROPS,
            MOCK_CLIENT_ID,
            MOCK_EXTRACTOR,
            tenantDataAccessContextHolder,
            groupApi,
            applicationApi,
            userApi,
            applicationGroupsApi);
  }

  @Test
  void getOrganizationRoleClaimsForUser() {
    String username = "fraud@example.com";
    User user = mock(User.class);
    Group group1 = mock(Group.class);
    Group group2 = mock(Group.class);
    Group group3 = mock(Group.class);
    Group group4 = mock(Group.class);
    GroupProfile groupProfile1 = mock(GroupProfile.class);
    GroupProfile groupProfile2 = mock(GroupProfile.class);
    GroupProfile groupProfile3 = mock(GroupProfile.class);
    GroupProfile groupProfile4 = mock(GroupProfile.class);
    List<Group> groupList = List.of(group1, group2, group3, group4);

    when(user.getId()).thenReturn("1234");
    when(userApi.getUser(username)).thenReturn(user);
    when(userApi.listUserGroups("1234")).thenReturn(groupList);
    when(group1.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(group1.getProfile()).thenReturn(groupProfile1);
    when(groupProfile1.getName()).thenReturn("SR-UNITTEST-TENANT:MYNIFTYORG:NO_ACCESS");
    when(group2.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(group2.getProfile()).thenReturn(groupProfile2);
    when(groupProfile2.getName()).thenReturn("SR-UNITTEST-TENANT:MYNIFTYORG:ENTRY_ONLY");
    when(group3.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(group3.getProfile()).thenReturn(groupProfile3);
    when(groupProfile3.getName())
        .thenReturn(
            "SR-UNITTEST-TENANT:MYNIFTYORG:FACILITY_ACCESS:80d0c820-1dc5-418e-a61e-dc6dad8c5e49");
    when(group4.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(group4.getProfile()).thenReturn(groupProfile4);
    when(groupProfile4.getName())
        .thenReturn(
            "SR-UNITTEST-TENANT:MYNIFTYORG:FACILITY_ACCESS:f49e8e27-dd41-4a9e-a29f-15ac74422923");

    Optional<OrganizationRoleClaims> optClaims = _repo.getOrganizationRoleClaimsForUser(username);

    assertTrue(optClaims.isPresent());
    OrganizationRoleClaims claims = optClaims.get();
    assertEquals("MYNIFTYORG", claims.getOrganizationExternalId());
    assertEquals(
        Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.ENTRY_ONLY), claims.getGrantedRoles());
    assertEquals(
        Set.of(
            UUID.fromString("80d0c820-1dc5-418e-a61e-dc6dad8c5e49"),
            UUID.fromString("f49e8e27-dd41-4a9e-a29f-15ac74422923")),
        claims.getFacilities());
    assertFalse(claims.grantsAllFacilityAccess());
  }

  @Test
  void getOrganizationRoleClaimsForUser_withTenantDataAccess_success() {
    String username = "fraud@example.com";
    Set<String> authorities = new HashSet<>();
    authorities.add("SR-UNITTEST-TENANT:FAKE-ORG:NO_ACCESS");
    authorities.add("SR-UNITTEST-TENANT:FAKE-ORG:ADMIN");

    tenantDataAccessContextHolder.setTenantDataAccessAuthorities(username, authorities);

    Optional<OrganizationRoleClaims> optClaims = _repo.getOrganizationRoleClaimsForUser(username);

    assertTrue(optClaims.isPresent());
    OrganizationRoleClaims claims = optClaims.get();
    assertEquals("FAKE-ORG", claims.getOrganizationExternalId());
    assertEquals(
        Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.ADMIN), claims.getGrantedRoles());
  }

  @Test
  void updateUser() {
    String username = "fraud@example.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");
    IdentityAttributes userAttributes = new IdentityAttributes(username, personName);

    User user = mock(User.class);
    UserProfile userProfile = mock(UserProfile.class);
    Group group1 = mock(Group.class);
    GroupProfile groupProfile1 = mock(GroupProfile.class);
    List<Group> groupList = List.of(group1);
    UpdateUserRequest updateRequest = new UpdateUserRequest();
    updateRequest.setProfile(userProfile);

    when(userApi.getUser(username)).thenReturn(user);
    when(user.getProfile()).thenReturn(userProfile);
    when(user.getId()).thenReturn("1234");

    when(userApi.listUserGroups("1234")).thenReturn(groupList);
    when(group1.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(group1.getProfile()).thenReturn(groupProfile1);
    when(groupProfile1.getName()).thenReturn("SR-UNITTEST-TENANT:MYNIFTYORG:NO_ACCESS");

    _repo.updateUser(userAttributes);
    verify(userProfile).setFirstName(personName.getFirstName());
    verify(userProfile).setMiddleName(personName.getMiddleName());
    verify(userProfile).setLastName(personName.getLastName());
    verify(userProfile).setHonorificSuffix(personName.getSuffix());
    verify(userApi).updateUser(user.getId(), updateRequest, false);
  }

  @Test
  void updateUserEmail_success() {
    String username = "fraud@example.com";
    String newUsername = "newemail@example.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");
    IdentityAttributes userAttributes = new IdentityAttributes(username, personName);

    User user = mock(User.class);
    UserProfile userProfile = mock(UserProfile.class);
    Group group1 = mock(Group.class);
    var groupList = List.of(group1);
    GroupProfile groupProfile1 = mock(GroupProfile.class);
    var updateRequest = new UpdateUserRequest();
    updateRequest.setProfile(userProfile);

    when(userApi.getUser(username)).thenReturn(user);
    when(user.getProfile()).thenReturn(userProfile);
    when(user.getId()).thenReturn("1234");

    when(userApi.listUserGroups("1234")).thenReturn(groupList);
    when(group1.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(group1.getProfile()).thenReturn(groupProfile1);
    when(groupProfile1.getName()).thenReturn("SR-UNITTEST-TENANT:MYNIFTYORG:NO_ACCESS");

    _repo.updateUserEmail(userAttributes, newUsername);
    verify(userProfile).setEmail(newUsername);
    verify(userApi).updateUser(user.getId(), updateRequest, false);
  }

  @Test
  void updateUser_userNotFound_error() {
    String username = "fraud@example.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");
    IdentityAttributes identityAttributes = new IdentityAttributes(username, personName);
    when(userApi.getUser(username)).thenThrow(USER_NOT_FOUND_API_EXCEPTION);

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _repo.updateUser(identityAttributes));
    assertEquals("Cannot update Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void updateUserEmail_userNotFound_error() {
    String username = "fraud@example.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");
    IdentityAttributes identityAttributes = new IdentityAttributes(username, personName);
    when(userApi.getUser(username)).thenThrow(USER_NOT_FOUND_API_EXCEPTION);

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.updateUserEmail(identityAttributes, "newemail@example.com"));
    assertEquals(
        "Cannot update email of Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void updateUserEmail_conflictingUser_error() {
    String username = "fraud@example.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");
    IdentityAttributes userAttributes = new IdentityAttributes(username, personName);

    User user = mock(User.class);
    UserProfile userProfile = mock(UserProfile.class);
    Group group1 = mock(Group.class);
    List<Group> groupList = List.of(group1);
    GroupProfile groupProfile1 = mock(GroupProfile.class);

    when(userApi.getUser(username)).thenReturn(user);
    when(user.getProfile()).thenReturn(userProfile);
    when(user.getId()).thenReturn("1234");
    when(userApi.listUserGroups("1234")).thenReturn(groupList);
    when(group1.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(group1.getProfile()).thenReturn(groupProfile1);
    when(groupProfile1.getName()).thenReturn("SR-UNITTEST-TENANT:MYNIFTYORG:NO_ACCESS");
    when(userApi.updateUser(anyString(), any(), eq(false))).thenThrow(userExistsError);

    Throwable caught =
        assertThrows(
            ConflictingUserException.class,
            () -> _repo.updateUserEmail(userAttributes, "newemail@example.com"));
    assertEquals("A user with this email address already exists.", caught.getMessage());
  }

  @Test
  void updateUserEmail_oktaResourceException_error() {
    String username = "fraud@example.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");
    IdentityAttributes userAttributes = new IdentityAttributes(username, personName);

    User user = mock(User.class);
    UserProfile userProfile = mock(UserProfile.class);
    Group group1 = mock(Group.class);
    var groupList = List.of(group1);
    GroupProfile groupProfile1 = mock(GroupProfile.class);

    when(userApi.getUser(username)).thenReturn(user);
    when(user.getProfile()).thenReturn(userProfile);
    when(user.getId()).thenReturn("1234");

    when(userApi.listUserGroups("1234")).thenReturn(groupList);
    when(group1.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(group1.getProfile()).thenReturn(groupProfile1);
    when(groupProfile1.getName()).thenReturn("SR-UNITTEST-TENANT:MYNIFTYORG:NO_ACCESS");
    when(userApi.updateUser(anyString(), any(), eq(false)))
        .thenThrow(new ApiException(500, "Something went wrong with Okta"));

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.updateUserEmail(userAttributes, "newemail@example.com"));
    assertEquals("Code: 500; Message: Something went wrong with Okta", caught.getMessage());
  }

  @Test
  void reprovisionUser_success() {
    String username = "fraud@example.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");
    User user = mock(User.class);
    var userProfile = new UserProfile();

    when(userApi.getUser(username)).thenReturn(user);
    when(user.getStatus()).thenReturn(UserStatus.SUSPENDED);
    when(user.getProfile()).thenReturn(userProfile);
    when(user.getId()).thenReturn("1234");
    IdentityAttributes identityAttributes = new IdentityAttributes(username, personName);

    _repo.reprovisionUser(identityAttributes);

    userProfile.setFirstName(personName.getFirstName());
    userProfile.setMiddleName(personName.getMiddleName());
    userProfile.setLastName(personName.getLastName());
    userProfile.setHonorificSuffix(personName.getSuffix());
    var updateUserRequest = new UpdateUserRequest();
    updateUserRequest.setProfile(userProfile);

    verify(userApi).updateUser("1234", updateUserRequest, false);
    verify(userApi).deactivateUser(user.getId(), false);
    verify(userApi).activateUser(user.getId(), true);
  }

  @Test
  void reprovisionUser_unsupportedUserState_error() {
    String username = "fraud@example.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");
    User user = mock(User.class);
    IdentityAttributes identityAttributes = new IdentityAttributes(username, personName);

    when(userApi.getUser(username)).thenReturn(user);
    when(user.getStatus()).thenReturn(UserStatus.ACTIVE);

    Throwable caught =
        assertThrows(
            ConflictingUserException.class, () -> _repo.reprovisionUser(identityAttributes));
    assertEquals("A user with this email address already exists.", caught.getMessage());
  }

  @Test
  void reprovisionUser_userNotFound_error() {
    String username = "fraud@example.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");
    IdentityAttributes identityAttributes = new IdentityAttributes(username, personName);

    when(userApi.getUser(username)).thenThrow(USER_NOT_FOUND_API_EXCEPTION);

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _repo.reprovisionUser(identityAttributes));
    assertEquals("Cannot reprovision Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void createUser() {
    var username = "fraud@example.com";
    var personName = new PersonName("First", "Middle", "Last", "Suffix");
    var identityAttributes = new IdentityAttributes(username, personName);
    var org = new Organization("orgName", "orgType", "1", true);
    var groupProfilePrefix = "SR-UNITTEST-TENANT:" + org.getExternalId();
    var groupProfileName = groupProfilePrefix + ":NO_ACCESS";
    var mockUserBuilder =
        setupAndMockUserBuilder(
            groupProfilePrefix,
            groupProfileName,
            personName.getFirstName(),
            personName.getMiddleName(),
            personName.getLastName(),
            personName.getSuffix(),
            username);

    try (var staticMockUserBuilder = mockStatic(UserBuilder.class)) {
      staticMockUserBuilder.when(UserBuilder::instance).thenReturn(mockUserBuilder);

      var actual = _repo.createUser(identityAttributes, org, Set.of(), Set.of(), true);
      verify(mockUserBuilder).setLogin(username);
      verify(mockUserBuilder).setEmail(username);
      verify(mockUserBuilder).setFirstName(personName.getFirstName());
      verify(mockUserBuilder).setMiddleName(personName.getMiddleName());
      verify(mockUserBuilder).setLastName(personName.getLastName());
      verify(mockUserBuilder).setHonorificSuffix(personName.getSuffix());
      verify(mockUserBuilder).buildAndCreate(userApi);
      verify(mockUserBuilder).setActive(true);
      verify(groupApi).assignUserToGroup("gid123", "uid123");
      assertEquals(org.getExternalId(), actual.orElseThrow().getOrganizationExternalId());
      assertEquals(Set.of(OrganizationRole.NO_ACCESS), actual.get().getGrantedRoles());
    }
  }

  @Test
  void createUser_illegalGraphqlArgumentError_withoutLastName() {
    var username = "fraud@example.com";
    var personName = new PersonName();
    var identityAttributes = new IdentityAttributes(username, personName);
    var org = new Organization("orgName", "orgType", "1", true);

    var group1 = mock(Group.class);
    var groupList = List.of(group1);
    var groupProfile1 = mock(GroupProfile.class);

    when(groupApi.listGroups(any(), any(), any(), any(), any(), any(), any(), any()))
        .thenReturn(groupList);
    when(group1.getProfile()).thenReturn(groupProfile1);
    when(groupProfile1.getName()).thenReturn("SR-UNITTEST-TENANT:1:NO_ACCESS");

    Set<Facility> facilities = Set.of();
    Set<OrganizationRole> roles = Set.of();
    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.createUser(identityAttributes, org, facilities, roles, true));
    assertEquals("Cannot create Okta user without last name", caught.getMessage());
  }

  @Test
  void createUser_illegalGraphqlArgumentError_withoutEmail() {
    var personName = new PersonName();
    personName.setLastName("LastName");
    var identityAttributes = new IdentityAttributes(null, personName);
    var org = new Organization("orgName", "orgType", "1", true);

    var group1 = mock(Group.class);
    var groupList = List.of(group1);
    var groupProfile1 = mock(GroupProfile.class);

    when(groupApi.listGroups(any(), any(), any(), any(), any(), any(), any(), any()))
        .thenReturn(groupList);
    when(group1.getProfile()).thenReturn(groupProfile1);
    when(groupProfile1.getName()).thenReturn("SR-UNITTEST-TENANT:1:NO_ACCESS");

    Set<Facility> facilities = Set.of();
    Set<OrganizationRole> roles = Set.of();
    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.createUser(identityAttributes, org, facilities, roles, true));
    assertEquals("Cannot create Okta user without username", caught.getMessage());
  }

  @Test
  void createUser_illegalGraphqlArgumentError_noOrgsFound() {
    var username = "fraud@example.com";
    var personName = new PersonName("First", "Middle", "Last", "Suffix");
    var identityAttributes = new IdentityAttributes(username, personName);
    var org = new Organization("orgName", "orgType", "1", true);
    var mockGroupList = new ArrayList<Group>();
    when(groupApi.listGroups(
            anyString(), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), isNull()))
        .thenReturn(mockGroupList);
    when(groupApi.listGroups(
            isNull(), isNull(), isNull(), isNull(), isNull(), anyString(), isNull(), isNull()))
        .thenReturn(mockGroupList);

    Set<Facility> facilities = Set.of();
    Set<OrganizationRole> roles = Set.of();
    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.createUser(identityAttributes, org, facilities, roles, true));
    assertEquals(
        "Cannot add Okta user to nonexistent organization=" + org.getExternalId(),
        caught.getMessage());
  }

  @Test
  void createUser_illegalGraphqlArgumentError_noGroupsFound() {
    var username = "fraud@example.com";
    var personName = new PersonName("First", "Middle", "Last", "Suffix");
    var identityAttributes = new IdentityAttributes(username, personName);
    var org = new Organization("orgName", "orgType", "1", true);
    var groupProfilePrefix = "SR-UNITTEST-TENANT:" + org.getExternalId();
    var groupProfileName = groupProfilePrefix + ":NO_ACCESS";

    var mockGroup = mock(Group.class);
    var mockGroupProfile = mock(GroupProfile.class);
    var mockGroupList = List.of(mockGroup);
    when(groupApi.listGroups(
            anyString(), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), isNull()))
        .thenReturn(mockGroupList);
    when(groupApi.listGroups(
            isNull(), isNull(), isNull(), isNull(), isNull(), anyString(), isNull(), isNull()))
        .thenReturn(mockGroupList);
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn("nonexistent");

    Set<Facility> facilities = Set.of();
    Set<OrganizationRole> roles = Set.of();
    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.createUser(identityAttributes, org, facilities, roles, true));
    assertEquals(
        "Cannot add Okta user to nonexistent group=" + groupProfileName, caught.getMessage());
  }

  @Test
  void createUser_conflictingUser_error() {
    var username = "fraud@example.com";
    var personName = new PersonName("First", "Middle", "Last", "Suffix");
    var identityAttributes = new IdentityAttributes(username, personName);
    var org = new Organization("orgName", "orgType", "1", true);
    var groupProfilePrefix = "SR-UNITTEST-TENANT:" + org.getExternalId();
    var groupProfileName = groupProfilePrefix + ":NO_ACCESS";
    var mockUserBuilder =
        setupAndMockUserBuilder(
            groupProfilePrefix,
            groupProfileName,
            personName.getFirstName(),
            personName.getMiddleName(),
            personName.getLastName(),
            personName.getSuffix(),
            username);

    when(mockUserBuilder.buildAndCreate(userApi)).thenThrow(userExistsError);

    try (var staticMockUserBuilder = mockStatic(UserBuilder.class)) {
      staticMockUserBuilder.when(UserBuilder::instance).thenReturn(mockUserBuilder);
      Set<Facility> facilities = Set.of();
      Set<OrganizationRole> orgRoles = Set.of();
      Throwable caught =
          assertThrows(
              ConflictingUserException.class,
              () -> _repo.createUser(identityAttributes, org, facilities, orgRoles, true));
      assertEquals("A user with this email address already exists.", caught.getMessage());
    }
  }

  @Test
  void createUser_oktaResourceException_error() {
    var username = "fraud@example.com";
    var personName = new PersonName("First", "Middle", "Last", "Suffix");
    var identityAttributes = new IdentityAttributes(username, personName);
    var org = new Organization("orgName", "orgType", "1", true);
    var groupProfilePrefix = "SR-UNITTEST-TENANT:" + org.getExternalId();
    var groupProfileName = groupProfilePrefix + ":NO_ACCESS";
    var mockUserBuilder =
        setupAndMockUserBuilder(
            groupProfilePrefix,
            groupProfileName,
            personName.getFirstName(),
            personName.getMiddleName(),
            personName.getLastName(),
            personName.getSuffix(),
            username);

    when(mockUserBuilder.buildAndCreate(userApi))
        .thenThrow(new ApiException(500, "Something went wrong with Okta"));

    try (var staticMockUserBuilder = mockStatic(UserBuilder.class)) {
      staticMockUserBuilder.when(UserBuilder::instance).thenReturn(mockUserBuilder);
      Set<Facility> facilities = Set.of();
      Set<OrganizationRole> orgRoles = Set.of();

      Throwable caught =
          assertThrows(
              IllegalGraphqlArgumentException.class,
              () -> _repo.createUser(identityAttributes, org, facilities, orgRoles, true));
      assertEquals("Code: 500; Message: Something went wrong with Okta", caught.getMessage());
    }
  }

  @Test
  void getAllUsersForOrganization() {
    var org = new Organization("orgName", "orgType", "1", true);
    var groupProfilePrefix = "SR-UNITTEST-TENANT:" + org.getExternalId() + ":NO_ACCESS";

    var mockGroup = mock(Group.class);
    var mockGroupProfile = mock(GroupProfile.class);
    var mockGroupList = List.of(mockGroup);
    var mockUser = mock(User.class);
    var mockUserProfile = mock(UserProfile.class);
    PagedList<User> mockedUserList = new PagedList<>(List.of(mockUser), "", "", null);
    when(groupApi.listGroups(
            eq(groupProfilePrefix),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull()))
        .thenReturn(mockGroupList);
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn(groupProfilePrefix);
    when(groupApi.listGroupUsers(any(), any(), any())).thenReturn(mockedUserList);
    when(mockUser.getProfile()).thenReturn(mockUserProfile);
    when(mockUserProfile.getLogin()).thenReturn("email@example.com");

    var actual = _repo.getAllUsersForOrganization(org);
    assertEquals(Set.of("email@example.com"), actual);
    assertThrows(UnsupportedOperationException.class, () -> actual.add("not_allowed"));
  }

  @Test
  void getAllUsersForOrganization_illegalGraphqlArgumentException_noGroupsFound() {
    var org = new Organization("orgName", "orgType", "1", true);

    var mockGroupList = new ArrayList<Group>();

    when(groupApi.listGroups(
            anyString(), isNull(), isNull(), isNull(), isNull(), isNull(), isNull(), isNull()))
        .thenReturn(mockGroupList);

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _repo.getAllUsersForOrganization(org));
    assertEquals("Okta group not found for this organization", caught.getMessage());
  }

  @Test
  void getAllUsersWithStatusForOrganization() {
    var org = new Organization("orgName", "orgType", "1", true);
    var groupProfilePrefix = "SR-UNITTEST-TENANT:" + org.getExternalId() + ":NO_ACCESS";

    var mockGroup = mock(Group.class);
    var mockGroupList = List.of(mockGroup);
    var mockGroupProfile = mock(GroupProfile.class);
    var mockUser = mock(User.class);
    PagedList<User> mockUserList = new PagedList<>(List.of(mockUser), "", "", null);
    var mockUserProfile = mock(UserProfile.class);
    when(groupApi.listGroups(
            eq(groupProfilePrefix),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull()))
        .thenReturn(mockGroupList);
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn(groupProfilePrefix);
    when(mockGroup.getId()).thenReturn("1234");
    when(groupApi.listGroupUsers(eq("1234"), any(), any())).thenReturn(mockUserList);
    when(mockUser.getProfile()).thenReturn(mockUserProfile);
    when(mockUserProfile.getLogin()).thenReturn("email@example.com");
    when(mockUser.getStatus()).thenReturn(UserStatus.ACTIVE);

    var actual = _repo.getAllUsersWithStatusForOrganization(org);
    assertEquals(Map.of("email@example.com", UserStatus.ACTIVE), actual);
  }

  @Test
  void updateUserPrivileges() {
    var username = "fraud@example.com";
    var org = new Organization("orgName", "orgType", "1", true);
    var groupOrgPrefix = "SR-UNITTEST-TENANT:" + org.getExternalId();
    var groupOrgDefaultName = groupOrgPrefix + ":NO_ACCESS";
    var orgRole = OrganizationRole.ADMIN;
    var mockUser = mock(User.class);
    var mockGroup = mock(Group.class);
    var mockGroupProfile = mock(GroupProfile.class);
    var mockGroupProfileToRemove = mock(GroupProfile.class);
    var mockAdminGroup = mock(Group.class);
    var mockGroupToRemove = mock(Group.class);
    var mockAdminGroupProfile = mock(GroupProfile.class);
    when(userApi.getUser(username)).thenReturn(mockUser);
    when(mockUser.getId()).thenReturn("1234");
    when(mockAdminGroup.getId()).thenReturn("adminGID");

    when(userApi.listUserGroups("1234"))
        .thenReturn(List.of(mockGroup, mockGroupToRemove), List.of(mockGroup, mockAdminGroup));
    when(mockGroup.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn(groupOrgDefaultName);
    when(mockGroupToRemove.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(mockGroupToRemove.getId()).thenReturn("removeGID");
    when(mockGroupToRemove.getProfile()).thenReturn(mockGroupProfileToRemove);
    when(mockGroupProfileToRemove.getName()).thenReturn(groupOrgPrefix + "-TO-REMOVE");
    when(groupApi.listGroups(
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            eq("profile.name sw \"" + groupOrgPrefix + "\""),
            isNull(),
            isNull()))
        .thenReturn(List.of(mockAdminGroup, mockGroupToRemove));
    when(mockAdminGroup.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(mockAdminGroup.getProfile()).thenReturn(mockAdminGroupProfile);
    when(mockAdminGroupProfile.getName()).thenReturn(groupOrgPrefix + ":" + orgRole);

    var actual = _repo.updateUserPrivileges(username, org, Set.of(), Set.of(orgRole)).orElseThrow();
    assertThat(actual.getGrantedRoles())
        .contains(OrganizationRole.ADMIN, OrganizationRole.NO_ACCESS);
    verify(groupApi).assignUserToGroup("adminGID", "1234");
    verify(groupApi).unassignUserFromGroup("removeGID", "1234");
  }

  @Test
  void updateUserPrivileges_illegalGraphqlArgumentException_whenNoUsersFound() {
    var username = "fraud@example.com";
    var org = new Organization("orgName", "orgType", "1", true);

    when(userApi.getUser(username)).thenThrow(USER_NOT_FOUND_API_EXCEPTION);

    Set<Facility> facilities = Set.of();
    Set<OrganizationRole> roles = Set.of();
    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.updateUserPrivileges(username, org, facilities, roles));
    assertEquals("Cannot update role of Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void updateUserPrivileges_illegalGraphqlArgumentException_whenGroupOrgDefaultIsNotFound() {
    var username = "fraud@example.com";
    var org = new Organization("orgName", "orgType", "1", true);

    var mockUser = mock(User.class);
    var mockGroup = mock(Group.class);
    var mockGroupList = List.of(mockGroup);
    when(userApi.getUser(username)).thenReturn(mockUser);
    var mockGroupProfile = mock(GroupProfile.class);
    when(mockUser.getId()).thenReturn("1234");

    when(userApi.listUserGroups("1234")).thenReturn(mockGroupList);
    when(mockGroup.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn("");

    Set<Facility> facilities = Set.of();
    Set<OrganizationRole> roles = Set.of();
    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.updateUserPrivileges(username, org, facilities, roles));
    assertEquals(
        "Cannot update privileges of Okta user in organization they do not belong to.",
        caught.getMessage());
  }

  @Test
  void updateUserPrivileges_illegalGraphqlArgumentException_whenNoOrganizationFound() {
    var username = "fraud@example.com";
    var org = new Organization("orgName", "orgType", "1", true);
    var groupOrgPrefix = "SR-UNITTEST-TENANT:" + org.getExternalId();
    var groupOrgDefaultName = groupOrgPrefix + ":NO_ACCESS";

    var mockUser = mock(User.class);
    var mockGroup = mock(Group.class);
    var mockGroupList = List.of(mockGroup);
    var mockGroupProfile = mock(GroupProfile.class);
    var mockEmptyGroupList = new ArrayList<Group>();

    when(userApi.getUser(username)).thenReturn(mockUser);
    when(mockUser.getId()).thenReturn("1234");

    when(userApi.listUserGroups("1234")).thenReturn(mockGroupList);
    when(mockGroup.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn(groupOrgDefaultName);
    when(groupApi.listGroups(
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            eq("profile.name sw \"" + groupOrgPrefix + "\""),
            isNull(),
            isNull()))
        .thenReturn(mockEmptyGroupList);
    Set<Facility> facilities = Set.of();
    Set<OrganizationRole> roles = Set.of(OrganizationRole.ADMIN);
    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.updateUserPrivileges(username, org, facilities, roles));
    assertEquals(
        "Cannot add Okta user to nonexistent organization=" + org.getExternalId(),
        caught.getMessage());
  }

  @Test
  void updateUserPrivileges_illegalGraphqlArgumentException_whenGroupToAddNotFound() {
    var username = "fraud@example.com";
    var org = new Organization("orgName", "orgType", "1", true);
    var groupOrgPrefix = "SR-UNITTEST-TENANT:" + org.getExternalId();
    var groupOrgDefaultName = groupOrgPrefix + ":NO_ACCESS";

    var mockUser = mock(User.class);
    var mockGroup = mock(Group.class);
    var mockGroupList = List.of(mockGroup);
    var mockGroupProfile = mock(GroupProfile.class);
    when(userApi.getUser(username)).thenReturn(mockUser);
    when(mockUser.getId()).thenReturn("1234");

    when(userApi.listUserGroups("1234")).thenReturn(mockGroupList);
    when(mockGroup.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn(groupOrgDefaultName);
    when(groupApi.listGroups(
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            eq("profile.name sw \"" + groupOrgPrefix + "\""),
            isNull(),
            isNull()))
        .thenReturn(mockGroupList);

    Set<Facility> userFacilities = Set.of();
    Set<OrganizationRole> userOrgRoles = Set.of(OrganizationRole.USER);

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.updateUserPrivileges(username, org, userFacilities, userOrgRoles));
    assertEquals(
        "Cannot add Okta user to nonexistent group=" + groupOrgPrefix + ":USER",
        caught.getMessage());
  }

  @Test
  void resetUserPassword() {
    var username = "fraud@example.com";
    var mockUser = mock(User.class);

    when(userApi.getUser(username)).thenReturn(mockUser);
    when(mockUser.getId()).thenReturn("1234");

    _repo.resetUserPassword(username);
    verify(userApi).generateResetPasswordToken("1234", true, false);
  }

  @Test
  void resetUserPassword_illegalGraphqlArgumentException_whenNoUsersFound() {
    var username = "fraud@example.com";

    when(userApi.getUser(username)).thenThrow(USER_NOT_FOUND_API_EXCEPTION);

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _repo.resetUserPassword(username));
    assertEquals(
        "Cannot reset password for Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void resetUserMfa() {
    var username = "fraud@example.com";
    var mockUser = mock(User.class);
    when(userApi.getUser(username)).thenReturn(mockUser);
    when(mockUser.getId()).thenReturn("1234");

    _repo.resetUserMfa(username);
    verify(userApi).resetFactors("1234");
  }

  @Test
  void resetUserMfa_illegalGraphqlArgumentException_whenNoUsersFound() {
    var username = "fraud@example.com";
    when(userApi.getUser(username)).thenThrow(USER_NOT_FOUND_API_EXCEPTION);

    Throwable caught =
        assertThrows(IllegalGraphqlArgumentException.class, () -> _repo.resetUserMfa(username));
    assertEquals("Cannot reset MFA for Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void setUserIsActive_suspend() {
    var username = "fraud@example.com";
    var mockUser = mock(User.class);
    when(userApi.getUser(username)).thenReturn(mockUser);
    when(mockUser.getStatus()).thenReturn(UserStatus.ACTIVE);
    when(mockUser.getId()).thenReturn("1234");

    _repo.setUserIsActive(username, false);
    verify(userApi).suspendUser("1234");
    verify(userApi, times(0)).unsuspendUser(anyString());
  }

  @Test
  void setUserIsActive_unsuspend() {
    var username = "fraud@example.com";
    var mockUser = mock(User.class);

    when(userApi.getUser(username)).thenReturn(mockUser);
    when(mockUser.getStatus()).thenReturn(UserStatus.SUSPENDED);
    when(mockUser.getId()).thenReturn("1234");

    _repo.setUserIsActive(username, true);
    verify(userApi, times(0)).suspendUser(anyString());
    verify(userApi).unsuspendUser("1234");
  }

  @Test
  void setUserIsActive_doNothing() {
    var username = "fraud@example.com";
    var mockUser = mock(User.class);

    when(userApi.getUser(username)).thenReturn(mockUser);
    when(mockUser.getStatus()).thenReturn(UserStatus.ACTIVE);

    _repo.setUserIsActive(username, true);
    verify(userApi, times(0)).suspendUser(anyString());
    verify(userApi, times(0)).unsuspendUser(anyString());
  }

  @Test
  void setUserIsActive_illegalGraphqlArgumentException_whenNoUsersFound() {
    var username = "fraud@example.com";
    when(userApi.getUser(username)).thenThrow(USER_NOT_FOUND_API_EXCEPTION);

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _repo.setUserIsActive(username, false));
    assertEquals(
        "Cannot update active status of Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void getUserStatus() {
    var username = "fraud@example.com";
    var mockUser = mock(User.class);

    when(userApi.getUser(username)).thenReturn(mockUser);
    when(mockUser.getStatus()).thenReturn(UserStatus.ACTIVE);

    var actual = _repo.getUserStatus(username);
    verify(userApi).getUser(username);
    assertEquals(UserStatus.ACTIVE, actual);
  }

  @Test
  void getUserStatus_illegalGraphqlArgumentException_whenNoUsersFound() {
    var username = "fraud@example.com";
    when(userApi.getUser(username)).thenThrow(USER_NOT_FOUND_API_EXCEPTION);

    Throwable caught =
        assertThrows(IllegalGraphqlArgumentException.class, () -> _repo.getUserStatus(username));
    assertEquals(
        "Cannot retrieve Okta user's status with unrecognized username", caught.getMessage());
  }

  @Test
  void reactivateUser() {
    var username = "fraud@example.com";
    var mockUser = mock(User.class);

    when(userApi.getUser(username)).thenReturn(mockUser);
    when(mockUser.getId()).thenReturn("1234");

    _repo.reactivateUser(username);
    verify(userApi).unsuspendUser("1234");
  }

  @Test
  void reactivateUser_illegalGraphqlArgumentException_whenNoUsersFound() {
    var username = "fraud@example.com";

    when(userApi.getUser(username)).thenThrow(USER_NOT_FOUND_API_EXCEPTION);

    Throwable caught =
        assertThrows(IllegalGraphqlArgumentException.class, () -> _repo.reactivateUser(username));
    assertEquals("Cannot reactivate Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void resendActivationEmail_reactivate() {
    var username = "fraud@example.com";
    var mockUser = mock(User.class);

    when(userApi.getUser(username)).thenReturn(mockUser);
    when(mockUser.getStatus()).thenReturn(UserStatus.PROVISIONED);
    when(mockUser.getId()).thenReturn("1234");

    _repo.resendActivationEmail(username);
    verify(userApi).reactivateUser("1234", true);
  }

  @Test
  void resendActivationEmail_activate() {
    var username = "fraud@example.com";
    var mockUser = mock(User.class);

    when(userApi.getUser(username)).thenReturn(mockUser);
    when(mockUser.getStatus()).thenReturn(UserStatus.STAGED);
    when(mockUser.getId()).thenReturn("1234");

    _repo.resendActivationEmail(username);
    verify(userApi).activateUser("1234", true);
  }

  @Test
  void resendActivationEmail_illegalGraphqlArgumentException_whenNoUsersFound() {
    var username = "fraud@example.com";
    when(userApi.getUser(username)).thenThrow(USER_NOT_FOUND_API_EXCEPTION);

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _repo.resendActivationEmail(username));
    assertEquals("Cannot reactivate Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void
      resendActivationEmail_illegalGraphqlArgumentException_whenUserStatusIsNotProvisionedOrStaged() {
    var username = "fraud@example.com";
    var mockUser = mock(User.class);
    when(userApi.getUser(username)).thenReturn(mockUser);
    when(mockUser.getStatus()).thenReturn(UserStatus.ACTIVE);

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _repo.resendActivationEmail(username));
    assertEquals("Cannot reactivate user with status: " + UserStatus.ACTIVE, caught.getMessage());
  }

  @Test
  void createOrganization() {
    var org = new Organization("orgName", "orgType", "1", true);
    var mockGroupBuilder = mock(GroupBuilder.class);
    var mockGroup = mock(Group.class);

    when(mockGroupBuilder.setName(anyString())).thenReturn(mockGroupBuilder);
    when(mockGroupBuilder.setDescription(anyString())).thenReturn(mockGroupBuilder);
    when(mockGroupBuilder.buildAndCreate(groupApi)).thenReturn(mockGroup);
    when(mockGroup.getId()).thenReturn("id");
    try (var staticMockGroupBuilder = mockStatic(GroupBuilder.class)) {
      staticMockGroupBuilder.when(GroupBuilder::instance).thenReturn(mockGroupBuilder);

      _repo.createOrganization(org);
      verify(mockGroupBuilder, times(OrganizationRole.values().length)).setName(anyString());
      verify(mockGroupBuilder, times(OrganizationRole.values().length)).setDescription(anyString());
      verify(mockGroupBuilder, times(OrganizationRole.values().length)).buildAndCreate(groupApi);
      verify(applicationGroupsApi, times(OrganizationRole.values().length))
          .assignGroupToApplication(eq("1234"), anyString(), isNull());
    }
  }

  @Test
  void deleteOrganization() {
    var org = new Organization("orgName", "orgType", "1", true);
    var mockGroup = mock(Group.class);
    var mockGroupList = List.of(mockGroup);

    when(groupApi.listGroups(
            eq("SR-UNITTEST-TENANT:" + org.getExternalId()),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull()))
        .thenReturn(mockGroupList);
    when(mockGroup.getId()).thenReturn("1234");

    _repo.deleteOrganization(org);

    verify(groupApi).deleteGroup("1234");
  }

  @Test
  void findUser_notFound_error() {
    String username = "nonexistent@example.com";
    when(userApi.getUser(username)).thenThrow(USER_NOT_FOUND_API_EXCEPTION);

    IllegalGraphqlArgumentException caught =
        assertThrows(IllegalGraphqlArgumentException.class, () -> _repo.findUser(username));
    assertEquals(
        "Cannot retrieve Okta user's status with unrecognized username", caught.getMessage());
  }

  @Test
  void findUser_success() {
    String username = "siteadmin@example.com";
    List<Group> mockUserGroups =
        List.of(createMockOktaGroup("SR-UNITTEST-ADMINS", GroupType.OKTA_GROUP));
    User mockUser = mock(User.class);

    when(userApi.getUser(username)).thenReturn(mockUser);
    when(mockUser.getId()).thenReturn("userId");
    when(mockUser.getStatus()).thenReturn(UserStatus.ACTIVE);
    when(userApi.listUserGroups(anyString())).thenReturn(mockUserGroups);

    PartialOktaUser oktaUser = _repo.findUser(username);
    assertThat(oktaUser).isNotNull();
    assertEquals(UserStatus.ACTIVE, oktaUser.getStatus());
    assertEquals(username, oktaUser.getUsername());
    assertEquals(true, oktaUser.isSiteAdmin());
    assertEquals(true, oktaUser.getOrganizationRoleClaims().isEmpty());
  }

  @Test
  void moveUserToNewOrganization_admin_success() {
    OrganizationRole roleToTest = OrganizationRole.ADMIN;
    setupMoveUserConfig(roleToTest, Set.of());

    Organization mockOrgToMoveTo = mock(Organization.class);
    when(mockOrgToMoveTo.getExternalId()).thenReturn("FOLLOWUP_GROUPS");
    List<String> assignedGroupIds =
        _repo.updateUserPrivilegesAndGroupAccess(
            "siteadmin@example.com", mockOrgToMoveTo, Set.of(), OrganizationRole.ADMIN, false);
    verify(groupApi, times(1)).unassignUserFromGroup("mockInitialGroupId", "userId");

    assertThat(assignedGroupIds)
        .contains("SR-UNITTEST-TENANT:FOLLOWUP_GROUPS:" + roleToTest)
        .contains("SR-UNITTEST-TENANT:FOLLOWUP_GROUPS:NO_ACCESS");
  }

  @Test
  void moveUserToNewOrganization_userWithFacilityList_success() {
    OrganizationRole roleToTest = OrganizationRole.USER;
    String mockUUID1 = "ce8782ca-18ba-4384-95fc-fbb7be0ef577";
    String mockUUID2 = "05bc0080-ad53-4b7a-a4b5-d1f86059a304";

    Set<Facility> mockFacilities =
        generateMockFacilitiesFromUUIDs(
            List.of(UUID.fromString(mockUUID1), UUID.fromString((mockUUID2))));
    setupMoveUserConfig(roleToTest, mockFacilities);

    Organization mockOrgToMoveTo = mock(Organization.class);
    when(mockOrgToMoveTo.getExternalId()).thenReturn("FOLLOWUP_GROUPS");

    List<String> assignedGroupIds =
        _repo.updateUserPrivilegesAndGroupAccess(
            "siteadmin@example.com", mockOrgToMoveTo, mockFacilities, OrganizationRole.USER, false);

    verify(groupApi, times(1)).unassignUserFromGroup("mockInitialGroupId", "userId");

    assertThat(assignedGroupIds)
        .contains("SR-UNITTEST-TENANT:FOLLOWUP_GROUPS:NO_ACCESS")
        .contains("SR-UNITTEST-TENANT:FOLLOWUP_GROUPS:" + roleToTest)
        .contains("SR-UNITTEST-TENANT:FOLLOWUP_GROUPS:" + "FACILITY_ACCESS" + ":" + mockUUID1)
        .contains("SR-UNITTEST-TENANT:FOLLOWUP_GROUPS:" + "FACILITY_ACCESS" + ":" + mockUUID2);
  }

  @Test
  void fetchAdminUser_emptyGroups() {
    Organization org = new Organization("orgName", "orgType", "1", true);
    when(groupApi.listGroups(anyString(), any(), any(), any(), any(), any(), any(), any()))
        .thenReturn(List.of());
    List<String> adminUserEmails = _repo.fetchAdminUserEmail(org);
    verify(groupApi, times(1))
        .listGroups("SR-UNITTEST-TENANT:1:ADMIN", null, null, null, null, null, null, null);
    assertThat(adminUserEmails).isEmpty();
  }

  @Test
  void fetchAdminUser_success() {
    Organization org = new Organization("orgName", "orgType", "1", true);
    String groupProfilePrefix = "SR-UNITTEST-TENANT:" + org.getExternalId() + ":ADMIN";

    Group mockGroup = mock(Group.class);
    List<Group> mockGroupList = List.of(mockGroup);
    User mockUser = mock(User.class);
    when(mockGroup.getId()).thenReturn("mockInitialGroupId");
    UserProfile mockUserProfile = mock(UserProfile.class);
    PagedList<User> mockedUserList = new PagedList<>(List.of(mockUser), "", "", null);
    when(groupApi.listGroups(
            eq(groupProfilePrefix),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull()))
        .thenReturn(mockGroupList);
    when(groupApi.listGroupUsers(any(), any(), any())).thenReturn(mockedUserList);
    when(mockUser.getProfile()).thenReturn(mockUserProfile);
    when(mockUserProfile.getLogin()).thenReturn("email@example.com");

    List<String> adminUserEmails = _repo.fetchAdminUserEmail(org);
    verify(groupApi, times(1))
        .listGroups("SR-UNITTEST-TENANT:1:ADMIN", null, null, null, null, null, null, null);
    verify(groupApi, times(1)).listGroupUsers("mockInitialGroupId", null, null);
    assertThat(adminUserEmails).isEqualTo(List.of("email@example.com"));
  }

  private Set<Facility> generateMockFacilitiesFromUUIDs(List<UUID> facilitiesToGenerate) {
    return facilitiesToGenerate.stream()
        .map(
            id -> {
              Facility mockFacilityToMoveTo = mock(Facility.class);
              when(mockFacilityToMoveTo.getInternalId()).thenReturn(id);
              return mockFacilityToMoveTo;
            })
        .collect(Collectors.toSet());
  }

  private void setupMoveUserConfig(OrganizationRole roleToTest, Set<Facility> facilitiesToReturn) {

    // using the tenant prefix to follow string matching in the actual method
    Group initialMockGroup =
        createMockOktaGroup("SR-DEV-TENANT-INITIAL_GROUPS", GroupType.OKTA_GROUP);
    when(initialMockGroup.getId()).thenReturn("mockInitialGroupId");
    List<Group> initialGroups = List.of(initialMockGroup);

    String username = "siteadmin@example.com";
    User mockUser = mock(User.class);

    when(userApi.getUser(username)).thenReturn(mockUser);
    when(mockUser.getId()).thenReturn("userId");
    when(userApi.listUserGroups(anyString())).thenReturn(initialGroups);

    Group mockGroup1 = createMockOktaGroup("SR-UNITTEST-TENANT", GroupType.OKTA_GROUP);
    GroupProfile mockGroupProfile1 = mock(GroupProfile.class);
    when(mockGroupProfile1.getName()).thenReturn("SR-UNITTEST-TENANT:FOLLOWUP_GROUPS:NO_ACCESS");
    when(mockGroup1.getProfile()).thenReturn(mockGroupProfile1);

    Group mockGroup2 = createMockOktaGroup("SR-UNITTEST-TENANT", GroupType.OKTA_GROUP);
    GroupProfile mockGroupProfile2 = mock(GroupProfile.class);
    when(mockGroupProfile2.getName())
        .thenReturn("SR-UNITTEST-TENANT:FOLLOWUP_GROUPS:" + roleToTest.toString());
    when(mockGroup2.getProfile()).thenReturn(mockGroupProfile2);

    Set<Group> groupsToMoveTo = new HashSet<>();
    groupsToMoveTo.addAll(Set.of(mockGroup1, mockGroup2));

    groupsToMoveTo.addAll(
        facilitiesToReturn.stream()
            .map(
                f -> {
                  String mockGroupName =
                      "SR-UNITTEST-TENANT:FOLLOWUP_GROUPS:"
                          + "FACILITY_ACCESS:"
                          + f.getInternalId();
                  GroupProfile mockGroupProfile = mock(GroupProfile.class);
                  when(mockGroupProfile.getName()).thenReturn(mockGroupName);

                  Group mockGroup = createMockOktaGroup(mockGroupName, GroupType.OKTA_GROUP);
                  when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
                  return mockGroup;
                })
            .collect(Collectors.toList()));

    when(groupApi.listGroups(
            null,
            null,
            null,
            null,
            null,
            "profile.name sw \"" + "SR-UNITTEST-TENANT:FOLLOWUP_GROUPS" + "\"",
            null,
            null))
        .thenReturn(groupsToMoveTo.stream().toList());
  }

  public Group createMockOktaGroup(String name, GroupType type) {
    Group mockGroup = mock(Group.class);
    GroupProfile mockProfile = mock(GroupProfile.class);
    when(mockProfile.getName()).thenReturn(name);
    when(mockGroup.getProfile()).thenReturn(mockProfile);
    when(mockGroup.getType()).thenReturn(type);
    return mockGroup;
  }

  private UserBuilder setupAndMockUserBuilder(
      String groupProfilePrefix,
      String groupProfileName,
      String firstName,
      String middleName,
      String lastName,
      String suffix,
      String email) {
    var mockGroup = mock(Group.class);
    var mockGroupListQ = List.of(mockGroup);
    var mockGroupListSearch = List.of(mockGroup);
    var mockGroupProfile = mock(GroupProfile.class);
    var mockUserBuilder = mock(UserBuilder.class);
    var mockUser = mock(User.class);

    when(groupApi.listGroups(
            eq(groupProfilePrefix),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull()))
        .thenReturn(mockGroupListQ);
    when(groupApi.listGroups(
            isNull(), isNull(), isNull(), isNull(), isNull(), anyString(), isNull(), isNull()))
        .thenReturn(mockGroupListSearch);
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroup.getId()).thenReturn("gid123");
    when(mockGroupProfile.getName()).thenReturn(groupProfileName);
    when(mockUserBuilder.setFirstName(firstName)).thenReturn(mockUserBuilder);
    when(mockUserBuilder.setMiddleName(middleName)).thenReturn(mockUserBuilder);
    when(mockUserBuilder.setLastName(lastName)).thenReturn(mockUserBuilder);
    when(mockUserBuilder.setHonorificSuffix(suffix)).thenReturn(mockUserBuilder);
    when(mockUserBuilder.setLogin(email)).thenReturn(mockUserBuilder);
    when(mockUserBuilder.setEmail(email)).thenReturn(mockUserBuilder);
    when(mockUserBuilder.setActive(true)).thenReturn(mockUserBuilder);
    when(mockUserBuilder.buildAndCreate(any())).thenReturn(mockUser);
    when(mockUser.getId()).thenReturn("uid123");
    return mockUserBuilder;
  }
}
