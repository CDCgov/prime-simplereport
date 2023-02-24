package gov.cdc.usds.simplereport.idp.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anySet;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.ArgumentMatchers.isNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.okta.sdk.error.Error;
import com.okta.sdk.error.ErrorCause;
import com.okta.sdk.error.ResourceException;
import com.okta.sdk.resource.group.GroupBuilder;
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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.openapitools.client.ApiClient;
import org.openapitools.client.api.GroupApi;
import org.openapitools.client.model.Application;
import org.openapitools.client.model.Group;
import org.openapitools.client.model.GroupProfile;
import org.openapitools.client.model.GroupType;
import org.openapitools.client.model.User;
import org.openapitools.client.model.UserProfile;
import org.openapitools.client.model.UserStatus;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;

@Import(SliceTestConfiguration.class)
class LiveOktaRepositoryTest {

  private static final AuthorizationProperties MOCK_PROPS =
      new AuthorizationProperties(null, "UNITTEST");
  private static final OrganizationExtractor MOCK_EXTRACTOR = new OrganizationExtractor(MOCK_PROPS);
  private static final CurrentTenantDataAccessContextHolder tenantDataAccessContextHolder =
      new CurrentTenantDataAccessContextHolder();
  private static final String MOCK_CLIENT_ID = "FAKE_CLIENT_ID";
  private final ApiClient _client = mock(ApiClient.class);
  private final GroupApi groupApi = mock(GroupApi.class);
  private final Application _app = mock(Application.class);
  LiveOktaRepository _repo;

  @BeforeEach
  public void setup() {
    when(_client.getApplication(MOCK_CLIENT_ID)).thenReturn(_app);
    _repo =
        new LiveOktaRepository(
            MOCK_PROPS,
            _client,
            MOCK_CLIENT_ID,
            MOCK_EXTRACTOR,
            tenantDataAccessContextHolder,
            groupApi);
  }

  @Test
  void getOrganizationRoleClaimsForUser() {
    String username = "fraud@example.com";

    UserList userList = mock(UserList.class);
    User user = mock(User.class);
    GroupList groupList = new ArrayList<Group>();
    Group group1 = mock(Group.class);
    Group group2 = mock(Group.class);
    Group group3 = mock(Group.class);
    Group group4 = mock(Group.class);
    GroupProfile groupProfile1 = mock(GroupProfile.class);
    GroupProfile groupProfile2 = mock(GroupProfile.class);
    GroupProfile groupProfile3 = mock(GroupProfile.class);
    GroupProfile groupProfile4 = mock(GroupProfile.class);

    when(_client.listUsers(null, null, "profile.login eq \"" + username + "\"", null, null))
        .thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of(user));
    when(userList.single()).thenReturn(user);
    when(user.listGroups()).thenReturn(groupList);
    when(groupList.stream()).thenReturn(Stream.of(group1, group2, group3, group4));
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

    UserList userList = mock(UserList.class);
    User user = mock(User.class);
    UserProfile userProfile = mock(UserProfile.class);
    GroupList groupList = new ArrayList<Group>();
    Group group1 = mock(Group.class);
    GroupProfile groupProfile1 = mock(GroupProfile.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of(user));
    when(userList.single()).thenReturn(user);
    when(user.getProfile()).thenReturn(userProfile);

    when(user.listGroups()).thenReturn(groupList);
    when(groupList.stream()).thenReturn(Stream.of(group1));
    when(group1.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(group1.getProfile()).thenReturn(groupProfile1);
    when(groupProfile1.getName()).thenReturn("SR-UNITTEST-TENANT:MYNIFTYORG:NO_ACCESS");

    _repo.updateUser(userAttributes);
    verify(userProfile).setFirstName(personName.getFirstName());
    verify(userProfile).setMiddleName(personName.getMiddleName());
    verify(userProfile).setLastName(personName.getLastName());
    verify(userProfile).setHonorificSuffix(personName.getSuffix());
    verify(user).update();
  }

  @Test
  void updateUserEmail_success() {
    String username = "fraud@example.com";
    String newUsername = "newemail@example.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");
    IdentityAttributes userAttributes = new IdentityAttributes(username, personName);

    UserList userList = mock(UserList.class);
    User user = mock(User.class);
    UserProfile userProfile = mock(UserProfile.class);
    GroupList groupList = new ArrayList<Group>();
    Group group1 = mock(Group.class);
    GroupProfile groupProfile1 = mock(GroupProfile.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of(user));
    when(userList.single()).thenReturn(user);
    when(user.getProfile()).thenReturn(userProfile);

    when(user.listGroups()).thenReturn(groupList);
    when(groupList.stream()).thenReturn(Stream.of(group1));
    when(group1.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(group1.getProfile()).thenReturn(groupProfile1);
    when(groupProfile1.getName()).thenReturn("SR-UNITTEST-TENANT:MYNIFTYORG:NO_ACCESS");

    _repo.updateUserEmail(userAttributes, newUsername);
    verify(userProfile).setEmail(newUsername);
    verify(user).update();
  }

  @Test
  void updateUser_userNotFound_error() {
    String username = "fraud@example.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");
    IdentityAttributes identityAttributes = new IdentityAttributes(username, personName);

    UserList userList = mock(UserList.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of());

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

    UserList userList = mock(UserList.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of());

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
    String newUsername = "newemail@example.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");
    IdentityAttributes userAttributes = new IdentityAttributes(username, personName);
    PersonName secondPersonName = new PersonName("Second", "Middle", "Last", "Suffix");
    new IdentityAttributes(newUsername, secondPersonName);

    UserList userList = mock(UserList.class);
    User user = mock(User.class);
    UserProfile userProfile = mock(UserProfile.class);
    GroupList groupList = new ArrayList<Group>();
    Group group1 = mock(Group.class);
    GroupProfile groupProfile1 = mock(GroupProfile.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of(user));
    when(userList.single()).thenReturn(user);
    when(user.getProfile()).thenReturn(userProfile);

    when(user.listGroups()).thenReturn(groupList);
    when(groupList.stream()).thenReturn(Stream.of(group1));
    when(group1.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(group1.getProfile()).thenReturn(groupProfile1);
    when(groupProfile1.getName()).thenReturn("SR-UNITTEST-TENANT:MYNIFTYORG:NO_ACCESS");
    when(user.update()).thenThrow(new ResourceException(new DuplicateUserError()));
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

    UserList userList = mock(UserList.class);
    User user = mock(User.class);
    UserProfile userProfile = mock(UserProfile.class);
    GroupList groupList = new ArrayList<Group>();
    Group group1 = mock(Group.class);
    GroupProfile groupProfile1 = mock(GroupProfile.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of(user));
    when(userList.single()).thenReturn(user);
    when(user.getProfile()).thenReturn(userProfile);

    when(user.listGroups()).thenReturn(groupList);
    when(groupList.stream()).thenReturn(Stream.of(group1));
    when(group1.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(group1.getProfile()).thenReturn(groupProfile1);
    when(groupProfile1.getName()).thenReturn("SR-UNITTEST-TENANT:MYNIFTYORG:NO_ACCESS");
    when(user.update()).thenThrow(new ResourceException(new MockOktaResourceError()));
    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.updateUserEmail(userAttributes, "newemail@example.com"));
    assertEquals(
        "HTTP 400, Okta E000001 (Something went wrong with Okta), ErrorId 0", caught.getMessage());
  }

  @Test
  void reprovisionUser_success() {
    String username = "fraud@example.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");

    UserList userList = mock(UserList.class);
    User user = mock(User.class);
    UserProfile userProfile = mock(UserProfile.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of(user));
    when(userList.single()).thenReturn(user);
    when(user.getStatus()).thenReturn(UserStatus.SUSPENDED);
    when(user.getProfile()).thenReturn(userProfile);

    IdentityAttributes identityAttributes = new IdentityAttributes(username, personName);

    _repo.reprovisionUser(identityAttributes);

    verify(user).update();
    verify(user).deactivate();
    verify(user).activate(true);
  }

  @Test
  void reprovisionUser_unsupportedUserState_error() {
    String username = "fraud@example.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");

    UserList userList = mock(UserList.class);
    User user = mock(User.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of(user));
    when(userList.single()).thenReturn(user);
    when(user.getStatus()).thenReturn(UserStatus.ACTIVE);

    IdentityAttributes identityAttributes = new IdentityAttributes(username, personName);

    Throwable caught =
        assertThrows(
            ConflictingUserException.class, () -> _repo.reprovisionUser(identityAttributes));
    assertEquals("A user with this email address already exists.", caught.getMessage());
  }

  @Test
  void reprovisionUser_userNotFound_error() {
    String username = "fraud@example.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");

    UserList userList = mock(UserList.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of());

    IdentityAttributes identityAttributes = new IdentityAttributes(username, personName);

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
    Map<String, Object> profileProperties = createValidProfileProperties(identityAttributes);
    var mockUserBuilder =
        setupAndMockUserBuilder(groupProfilePrefix, groupProfileName, profileProperties);

    try (var staticMockUserBuilder = mockStatic(UserBuilder.class)) {
      staticMockUserBuilder.when(UserBuilder::instance).thenReturn(mockUserBuilder);

      var actual = _repo.createUser(identityAttributes, org, Set.of(), Set.of(), true);
      verify(mockUserBuilder).setProfileProperties(profileProperties);
      verify(mockUserBuilder).setGroups(anySet());
      verify(mockUserBuilder).buildAndCreate(eq(_client));
      verify(mockUserBuilder).setActive(eq(true));
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

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.createUser(identityAttributes, org, Set.of(), Set.of(), true));
    assertEquals("Cannot create Okta user without last name", caught.getMessage());
  }

  @Test
  void createUser_illegalGraphqlArgumentError_withoutEmail() {
    var personName = new PersonName();
    personName.setLastName("LastName");
    var identityAttributes = new IdentityAttributes(null, personName);
    var org = new Organization("orgName", "orgType", "1", true);

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.createUser(identityAttributes, org, Set.of(), Set.of(), true));
    assertEquals("Cannot create Okta user without username", caught.getMessage());
  }

  @Test
  void createUser_illegalGraphqlArgumentError_noOrgsFound() {
    var username = "fraud@example.com";
    var personName = new PersonName("First", "Middle", "Last", "Suffix");
    var identityAttributes = new IdentityAttributes(username, personName);
    var org = new Organization("orgName", "orgType", "1", true);
    var mockGroupList = new ArrayList<Group>();
    // todo: review below
    // if you need to stream mockGroupList, then you have to do below
    //    when(mockGroupList.stream()).then(i -> Stream.of());
    when(groupApi.listGroups(anyString(), isNull(), isNull(), isNull(), isNull(), isNull()))
        .thenReturn(mockGroupList);
    when(groupApi.listGroups(isNull(), anyString(), isNull(), isNull(), isNull(), isNull()))
        .thenReturn(mockGroupList);

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.createUser(identityAttributes, org, Set.of(), Set.of(), true));
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

    var mockGroupList = new ArrayList<Group>();
    var mockGroup = mock(Group.class);
    var mockGroupProfile = mock(GroupProfile.class);
    when(groupApi.listGroups(anyString(), isNull(), isNull(), isNull(), isNull(), isNull()))
        .thenReturn(mockGroupList);
    when(groupApi.listGroups(isNull(), anyString(), isNull(), isNull(), isNull(), isNull()))
        .thenReturn(mockGroupList);
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn("nonexistent");

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.createUser(identityAttributes, org, Set.of(), Set.of(), true));
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
    Map<String, Object> profileProperties = createValidProfileProperties(identityAttributes);
    var mockUserBuilder =
        setupAndMockUserBuilder(groupProfilePrefix, groupProfileName, profileProperties);

    when(mockUserBuilder.buildAndCreate(_client))
        .thenThrow(new ResourceException(new DuplicateUserError()));

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
    Map<String, Object> profileProperties = createValidProfileProperties(identityAttributes);
    var mockUserBuilder =
        setupAndMockUserBuilder(groupProfilePrefix, groupProfileName, profileProperties);

    when(mockUserBuilder.buildAndCreate(_client))
        .thenThrow(new ResourceException(new ResourceException(new MockOktaResourceError())));

    try (var staticMockUserBuilder = mockStatic(UserBuilder.class)) {
      staticMockUserBuilder.when(UserBuilder::instance).thenReturn(mockUserBuilder);
      Set<Facility> facilities = Set.of();
      Set<OrganizationRole> orgRoles = Set.of();

      Throwable caught =
          assertThrows(
              IllegalGraphqlArgumentException.class,
              () -> _repo.createUser(identityAttributes, org, facilities, orgRoles, true));
      assertEquals(
          "HTTP 400, Okta E000001 (HTTP 400, Okta E000001 (Something went wrong with Okta), ErrorId 0), ErrorId 0",
          caught.getMessage());
    }
  }

  private Map<String, Object> createValidProfileProperties(IdentityAttributes identityAttributes) {
    return Map.of(
        "firstName",
        identityAttributes.getFirstName(),
        "middleName",
        identityAttributes.getMiddleName(),
        "lastName",
        identityAttributes.getLastName(),
        "honorificSuffix",
        identityAttributes.getSuffix(),
        "email",
        identityAttributes.getUsername(),
        "login",
        identityAttributes.getUsername());
  }

  private UserBuilder setupAndMockUserBuilder(
      String groupProfilePrefix, String groupProfileName, Map<String, Object> profileProperties) {
    var mockGroup = mock(Group.class);
    var mockGroupListQ = List.of(mockGroup);
    var mockGroupListSearch = List.of(mockGroup);
    var mockGroupProfile = mock(GroupProfile.class);
    var mockUserBuilder = mock(UserBuilder.class);

    when(mockGroupListQ.stream()).then(i -> Stream.of(mockGroup));
    when(mockGroupListSearch.stream()).then(i -> Stream.of(mockGroup));
    when(groupApi.listGroups(
            eq(groupProfilePrefix), isNull(), isNull(), isNull(), isNull(), isNull()))
        .thenReturn(mockGroupListQ);
    when(groupApi.listGroups(isNull(), anyString(), isNull(), isNull(), isNull(), isNull()))
        .thenReturn(mockGroupListSearch);
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn(groupProfileName);
    when(mockUserBuilder.setProfileProperties(profileProperties)).thenReturn(mockUserBuilder);
    when(mockUserBuilder.setGroups(anySet())).thenReturn(mockUserBuilder);
    when(mockUserBuilder.setActive(true)).thenReturn(mockUserBuilder);
    return mockUserBuilder;
  }

  @Test
  void getAllUsersForOrganization() {
    var org = new Organization("orgName", "orgType", "1", true);
    var groupProfilePrefix = "SR-UNITTEST-TENANT:" + org.getExternalId() + ":NO_ACCESS";

    var mockGroupList = new ArrayList<Group>();
    var mockGroup = mock(Group.class);
    var mockGroupProfile = mock(GroupProfile.class);
    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);
    var mockUserProfile = mock(UserProfile.class);
    when(groupApi.listGroups(
            eq(groupProfilePrefix), isNull(), isNull(), isNull(), isNull(), isNull()))
        .thenReturn(mockGroupList);
    when(mockGroupList.stream()).then(i -> Stream.of(mockGroup));
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn(groupProfilePrefix);
    when(mockGroup.listUsers()).thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
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

    when(groupApi.listGroups(anyString(), isNull(), isNull(), isNull(), isNull(), isNull()))
        .thenReturn(mockGroupList);
    when(mockGroupList.stream()).then(i -> Stream.of());

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _repo.getAllUsersForOrganization(org));
    assertEquals("Okta group not found for this organization", caught.getMessage());
  }

  @Test
  void getAllUsersWithStatusForOrganization() {
    var org = new Organization("orgName", "orgType", "1", true);
    var groupProfilePrefix = "SR-UNITTEST-TENANT:" + org.getExternalId() + ":NO_ACCESS";

    var mockGroupList = new ArrayList<Group>();
    var mockGroup = mock(Group.class);
    var mockGroupProfile = mock(GroupProfile.class);
    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);
    var mockUserProfile = mock(UserProfile.class);
    when(groupApi.listGroups(
            eq(groupProfilePrefix), isNull(), isNull(), isNull(), isNull(), isNull()))
        .thenReturn(mockGroupList);
    when(mockGroupList.stream()).then(i -> Stream.of(mockGroup));
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn(groupProfilePrefix);
    when(mockGroup.listUsers()).thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUser.getProfile()).thenReturn(mockUserProfile);
    when(mockUserProfile.getLogin()).thenReturn("email@example.com");
    when(mockUser.getStatus()).thenReturn(UserStatus.ACTIVE);

    var actual = _repo.getAllUsersWithStatusForOrganization(org);
    assertEquals(Map.of("email@example.com", UserStatus.ACTIVE), actual);
  }

  @Test
  void updateUserPrivileges() {
    var userName = "fraud@example.com";
    var org = new Organization("orgName", "orgType", "1", true);
    var groupOrgPrefix = "SR-UNITTEST-TENANT:" + org.getExternalId();
    var groupOrgDefaultName = groupOrgPrefix + ":NO_ACCESS";
    var orgRole = OrganizationRole.ADMIN;
    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);
    var mockGroupList = new ArrayList<Group>();
    var mockGroup = mock(Group.class);
    var mockGroupProfile = mock(GroupProfile.class);
    var mockFullGroupList = new ArrayList<Group>();
    var mockAdminGroup = mock(Group.class);
    var mockAdminGroupProfile = mock(GroupProfile.class);
    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + userName + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUserList.single()).thenReturn(mockUser);
    when(mockUser.listGroups()).thenReturn(mockGroupList);
    when(mockGroupList.stream())
        .then(i -> Stream.of(mockGroup))
        .then(i -> Stream.of(mockGroup, mockAdminGroup));
    when(mockGroup.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn(groupOrgDefaultName);
    when(groupApi.listGroups(
            isNull(),
            eq("profile.name sw \"" + groupOrgPrefix + "\""),
            isNull(),
            isNull(),
            isNull(),
            isNull()))
        .thenReturn(mockFullGroupList);
    when(mockFullGroupList.stream()).then(i -> Stream.of(mockAdminGroup));
    when(mockAdminGroup.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(mockAdminGroup.getProfile()).thenReturn(mockAdminGroupProfile);
    when(mockAdminGroupProfile.getName()).thenReturn(groupOrgPrefix + ":" + orgRole);

    var actual = _repo.updateUserPrivileges(userName, org, Set.of(), Set.of(orgRole)).orElseThrow();
    assertTrue(
        actual
            .getGrantedRoles()
            .containsAll(List.of(OrganizationRole.ADMIN, OrganizationRole.NO_ACCESS)));
  }

  @Test
  void updateUserPrivileges_illegalGraphqlArgumentException_whenNoUsersFound() {
    var userName = "fraud@example.com";
    var org = new Organization("orgName", "orgType", "1", true);
    var mockUserList = mock(UserList.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + userName + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of());

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.updateUserPrivileges(userName, org, Set.of(), Set.of()));
    assertEquals("Cannot update role of Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void updateUserPrivileges_illegalGraphqlArgumentException_whenGroupOrgDefaultIsNotFound() {
    var userName = "fraud@example.com";
    var org = new Organization("orgName", "orgType", "1", true);

    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);
    var mockGroupList = new ArrayList<Group>();
    var mockGroup = mock(Group.class);
    var mockGroupProfile = mock(GroupProfile.class);
    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + userName + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUserList.single()).thenReturn(mockUser);
    when(mockUser.listGroups()).thenReturn(mockGroupList);
    when(mockGroupList.stream()).then(i -> Stream.of(mockGroup));
    when(mockGroup.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn("");

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.updateUserPrivileges(userName, org, Set.of(), Set.of()));
    assertEquals(
        "Cannot update privileges of Okta user in organization they do not belong to.",
        caught.getMessage());
  }

  @Test
  void updateUserPrivileges_illegalGraphqlArgumentException_whenNoOrganizationFound() {
    var userName = "fraud@example.com";
    var org = new Organization("orgName", "orgType", "1", true);
    var groupOrgPrefix = "SR-UNITTEST-TENANT:" + org.getExternalId();
    var groupOrgDefaultName = groupOrgPrefix + ":NO_ACCESS";

    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);
    var mockGroupList = new ArrayList<Group>();
    var mockGroup = mock(Group.class);
    var mockGroupProfile = mock(GroupProfile.class);
    var mockEmptyGroupList = new ArrayList<Group>();

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + userName + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUserList.single()).thenReturn(mockUser);
    when(mockUser.listGroups()).thenReturn(mockGroupList);
    when(mockGroupList.stream()).then(i -> Stream.of(mockGroup));
    when(mockGroup.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn(groupOrgDefaultName);
    when(groupApi.listGroups(
            isNull(),
            eq("profile.name sw \"" + groupOrgPrefix + "\""),
            isNull(),
            isNull(),
            isNull(),
            isNull()))
        .thenReturn(mockEmptyGroupList);
    when(mockEmptyGroupList.stream()).then(i -> Stream.of());

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () ->
                _repo.updateUserPrivileges(
                    userName, org, Set.of(), Set.of(OrganizationRole.ADMIN)));
    assertEquals(
        "Cannot add Okta user to nonexistent organization=" + org.getExternalId(),
        caught.getMessage());
  }

  @Test
  void updateUserPrivileges_illegalGraphqlArgumentException_whenGroupToAddNotFound() {
    var userName = "fraud@example.com";
    var org = new Organization("orgName", "orgType", "1", true);
    var groupOrgPrefix = "SR-UNITTEST-TENANT:" + org.getExternalId();
    var groupOrgDefaultName = groupOrgPrefix + ":NO_ACCESS";

    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);
    var mockGroupList = new ArrayList<Group>();
    var mockGroup = mock(Group.class);
    var mockGroupProfile = mock(GroupProfile.class);
    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + userName + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUserList.single()).thenReturn(mockUser);
    when(mockUser.listGroups()).thenReturn(mockGroupList);
    when(mockGroupList.stream()).then(i -> Stream.of(mockGroup));
    when(mockGroup.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn(groupOrgDefaultName);
    when(groupApi.listGroups(
            isNull(),
            eq("profile.name sw \"" + groupOrgPrefix + "\""),
            isNull(),
            isNull(),
            isNull(),
            isNull()))
        .thenReturn(mockGroupList);
  }

  @Test
  void resetUserPassword() {
    var username = "fraud@example.com";
    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUserList.single()).thenReturn(mockUser);

    _repo.resetUserPassword(username);
    verify(mockUser).resetPassword(true);
  }

  @Test
  void resetUserPassword_illegalGraphqlArgumentException_whenNoUsersFound() {
    var username = "fraud@example.com";
    var mockUserList = mock(UserList.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of());

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _repo.resetUserPassword(username));
    assertEquals(
        "Cannot reset password for Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void resetUserMfa() {
    var username = "fraud@example.com";
    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUserList.single()).thenReturn(mockUser);

    _repo.resetUserMfa(username);
    verify(mockUser).resetFactors();
  }

  @Test
  void resetUserMfa_illegalGraphqlArgumentException_whenNoUsersFound() {
    var username = "fraud@example.com";
    var mockUserList = mock(UserList.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of());

    Throwable caught =
        assertThrows(IllegalGraphqlArgumentException.class, () -> _repo.resetUserMfa(username));
    assertEquals("Cannot reset MFA for Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void setUserIsActive_suspend() {
    var username = "fraud@example.com";
    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUserList.single()).thenReturn(mockUser);
    when(mockUser.getStatus()).thenReturn(UserStatus.ACTIVE);

    _repo.setUserIsActive(username, false);
    verify(mockUser).suspend();
    verify(mockUser, times(0)).unsuspend();
  }

  @Test
  void setUserIsActive_unsuspend() {
    var username = "fraud@example.com";
    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUserList.single()).thenReturn(mockUser);
    when(mockUser.getStatus()).thenReturn(UserStatus.SUSPENDED);

    _repo.setUserIsActive(username, true);
    verify(mockUser, times(0)).suspend();
    verify(mockUser).unsuspend();
  }

  @Test
  void setUserIsActive_doNothing() {
    var username = "fraud@example.com";
    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUserList.single()).thenReturn(mockUser);
    when(mockUser.getStatus()).thenReturn(UserStatus.ACTIVE);

    _repo.setUserIsActive(username, true);
    verify(mockUser, times(0)).suspend();
    verify(mockUser, times(0)).unsuspend();
  }

  @Test
  void setUserIsActive_illegalGraphqlArgumentException_whenNoUsersFound() {
    var username = "fraud@example.com";
    var mockUserList = mock(UserList.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of());

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _repo.setUserIsActive(username, null));
    assertEquals(
        "Cannot update active status of Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void getUserStatus() {
    var username = "fraud@example.com";
    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUserList.single()).thenReturn(mockUser);
    when(mockUser.getStatus()).thenReturn(UserStatus.ACTIVE);

    assertEquals(UserStatus.ACTIVE, _repo.getUserStatus(username));
  }

  @Test
  void getUserStatus_illegalGraphqlArgumentException_whenNoUsersFound() {
    var username = "fraud@example.com";
    var mockUserList = mock(UserList.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of());

    Throwable caught =
        assertThrows(IllegalGraphqlArgumentException.class, () -> _repo.getUserStatus(username));
    assertEquals(
        "Cannot retrieve Okta user's status with unrecognized username", caught.getMessage());
  }

  @Test
  void reactivateUser() {
    var username = "fraud@example.com";
    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUserList.single()).thenReturn(mockUser);

    _repo.reactivateUser(username);
    verify(mockUser).unsuspend();
  }

  @Test
  void reactivateUser_illegalGraphqlArgumentException_whenNoUsersFound() {
    var username = "fraud@example.com";
    var mockUserList = mock(UserList.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of());

    Throwable caught =
        assertThrows(IllegalGraphqlArgumentException.class, () -> _repo.reactivateUser(username));
    assertEquals("Cannot reactivate Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void resendActivationEmail_reactivate() {
    var username = "fraud@example.com";
    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUserList.single()).thenReturn(mockUser);
    when(mockUser.getStatus()).thenReturn(UserStatus.PROVISIONED);

    _repo.resendActivationEmail(username);
    verify(mockUser).reactivate(true);
  }

  @Test
  void resendActivationEmail_activate() {
    var username = "fraud@example.com";
    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUserList.single()).thenReturn(mockUser);
    when(mockUser.getStatus()).thenReturn(UserStatus.STAGED);

    _repo.resendActivationEmail(username);
    verify(mockUser).activate(true);
  }

  @Test
  void resendActivationEmail_illegalGraphqlArgumentException_whenNoUsersFound() {
    var username = "fraud@example.com";
    var mockUserList = mock(UserList.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of());

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _repo.resendActivationEmail(username));
    assertEquals("Cannot reactivate Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void
      resendActivationEmail_illegalGraphqlArgumentException_whenUserStatusIsNotProvisionedOrStaged() {
    var username = "fraud@example.com";
    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);

    when(_client.listUsers(
            isNull(), isNull(), eq("profile.login eq \"" + username + "\""), isNull(), isNull()))
        .thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUserList.single()).thenReturn(mockUser);
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
    when(mockGroupBuilder.buildAndCreate(_client)).thenReturn(mockGroup);
    when(mockGroup.getId()).thenReturn("id");
    try (var staticMockGroupBuilder = mockStatic(GroupBuilder.class)) {
      staticMockGroupBuilder.when(GroupBuilder::instance).thenReturn(mockGroupBuilder);

      _repo.createOrganization(org);
      verify(mockGroupBuilder, times(OrganizationRole.values().length)).setName(anyString());
      verify(mockGroupBuilder, times(OrganizationRole.values().length)).setDescription(anyString());
      verify(mockGroupBuilder, times(OrganizationRole.values().length)).buildAndCreate(_client);
      verify(_app, times(OrganizationRole.values().length)).createApplicationGroupAssignment("id");
    }
  }

  @Test
  void deleteFacility() {
    var org = new Organization("orgName", "orgType", "1", true);
    var facilityID = UUID.randomUUID();
    var groupName = "SR-UNITTEST-TENANT:1:FACILITY_ACCESS:" + facilityID;
    var mockFacility = mock(Facility.class);
    var mockGroupList = new ArrayList<Group>();
    var mockGroup = mock(Group.class);
    when(mockFacility.getOrganization()).thenReturn(org);
    when(mockFacility.getInternalId()).thenReturn(facilityID);
    when(groupApi.listGroups(eq(groupName), isNull(), isNull(), isNull(), isNull(), isNull()))
        .thenReturn(mockGroupList);
    when(mockGroupList.iterator()).thenReturn((List.of(mockGroup).iterator()));
    _repo.deleteFacility(mockFacility);
    verify(mockGroup).delete();
  }

  @Test
  void deleteOrganization() {
    var org = new Organization("orgName", "orgType", "1", true);
    var mockGroupList = new ArrayList<Group>();
    var mockGroup = mock(Group.class);

    when(groupApi.listGroups(
            eq("SR-UNITTEST-TENANT:" + org.getExternalId()),
            isNull(),
            isNull(),
            isNull(),
            isNull(),
            isNull()))
        .thenReturn(mockGroupList);
    when(mockGroupList.iterator()).thenReturn((List.of(mockGroup).iterator()));

    _repo.deleteOrganization(org);
    verify(mockGroup).delete();
  }

  // Dummy error for duplicate users.
  // Status, code, and message taken from a real Okta exception.
  private static class DuplicateUserError implements Error {
    @Override
    public int getStatus() {
      return HttpStatus.BAD_REQUEST.value();
    }

    @Override
    public String getCode() {
      return "E0000001";
    }

    @Override
    public String getMessage() {
      return "Api validation failed: login - login: An object with this field already exists in the current organization";
    }

    @Override
    public String getId() {
      return "0";
    }

    @Override
    public List<ErrorCause> getCauses() {
      return List.of();
    }

    @Override
    public Map<String, List<String>> getHeaders() {
      return Map.of();
    }
  }

  // Dummy error for Okta ResourceError
  private static class MockOktaResourceError implements Error {
    @Override
    public int getStatus() {
      return HttpStatus.BAD_REQUEST.value();
    }

    @Override
    public String getCode() {
      return "E000001";
    }

    @Override
    public String getMessage() {
      return "Something went wrong with Okta";
    }

    @Override
    public String getId() {
      return "0";
    }

    @Override
    public List<ErrorCause> getCauses() {
      return List.of();
    }

    @Override
    public Map<String, List<String>> getHeaders() {
      return Map.of();
    }
  }
}
