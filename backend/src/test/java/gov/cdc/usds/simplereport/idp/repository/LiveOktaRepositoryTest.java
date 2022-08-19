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
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.okta.sdk.client.Client;
import com.okta.sdk.resource.application.Application;
import com.okta.sdk.resource.group.Group;
import com.okta.sdk.resource.group.GroupList;
import com.okta.sdk.resource.group.GroupProfile;
import com.okta.sdk.resource.group.GroupType;
import com.okta.sdk.resource.user.User;
import com.okta.sdk.resource.user.UserBuilder;
import com.okta.sdk.resource.user.UserList;
import com.okta.sdk.resource.user.UserProfile;
import com.okta.sdk.resource.user.UserStatus;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.authorization.OrganizationExtractor;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.mockito.Mockito;
import org.springframework.context.annotation.Import;

@Import(SliceTestConfiguration.class)
class LiveOktaRepositoryTest {

  private static final AuthorizationProperties MOCK_PROPS =
      new AuthorizationProperties(null, "UNITTEST");
  private static final OrganizationExtractor MOCK_EXTRACTOR = new OrganizationExtractor(MOCK_PROPS);
  private static final CurrentTenantDataAccessContextHolder tenantDataAccessContextHolder =
      new CurrentTenantDataAccessContextHolder();
  private static final String MOCK_CLIENT_ID = "FAKE_CLIENT_ID";
  private final Client _client = mock(Client.class);
  private final Application _app = mock(Application.class);
  LiveOktaRepository _repo;

  @BeforeEach
  public void setup() {
    when(_client.getApplication(MOCK_CLIENT_ID)).thenReturn(_app);
    _repo =
        new LiveOktaRepository(
            MOCK_PROPS, _client, MOCK_CLIENT_ID, MOCK_EXTRACTOR, tenantDataAccessContextHolder);
  }

  @Test
  void getOrganizationRoleClaimsForUser() {
    String username = "fraud@fake.com";

    UserList userList = mock(UserList.class);
    User user = mock(User.class);
    GroupList groupList = mock(GroupList.class);
    Group group1 = mock(Group.class);
    Group group2 = mock(Group.class);
    Group group3 = mock(Group.class);
    Group group4 = mock(Group.class);
    GroupProfile groupProfile1 = mock(GroupProfile.class);
    GroupProfile groupProfile2 = mock(GroupProfile.class);
    GroupProfile groupProfile3 = mock(GroupProfile.class);
    GroupProfile groupProfile4 = mock(GroupProfile.class);

    when(_client.listUsers(username, null, null, null, null)).thenReturn(userList);
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
    String username = "fraud@fake.com";
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
    String username = "fraud@fake.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");
    IdentityAttributes userAttributes = new IdentityAttributes(username, personName);

    UserList userList = mock(UserList.class);
    User user = mock(User.class);
    UserProfile userProfile = mock(UserProfile.class);
    GroupList groupList = mock(GroupList.class);
    Group group1 = mock(Group.class);
    GroupProfile groupProfile1 = mock(GroupProfile.class);

    when(_client.listUsers(username, null, null, null, null)).thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of(user));
    when(userList.single()).thenReturn(user);
    when(user.getProfile()).thenReturn(userProfile);

    when(user.listGroups()).thenReturn(groupList);
    when(groupList.stream()).thenReturn(Stream.of(group1));
    when(group1.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(group1.getProfile()).thenReturn(groupProfile1);
    when(groupProfile1.getName()).thenReturn("SR-UNITTEST-TENANT:MYNIFTYORG:NO_ACCESS");

    _repo.updateUser(userAttributes);
    verify(userProfile, times(1)).setFirstName(personName.getFirstName());
    verify(userProfile, times(1)).setMiddleName(personName.getMiddleName());
    verify(userProfile, times(1)).setLastName(personName.getLastName());
    verify(userProfile, times(1)).setHonorificSuffix(personName.getSuffix());
    verify(user, times(1)).update();
  }

  @Test
  void updateUserEmail() {
    String username = "fraud@fake.com";
    String newUsername = "newemail@fake.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");
    IdentityAttributes userAttributes = new IdentityAttributes(username, personName);

    UserList userList = mock(UserList.class);
    User user = mock(User.class);
    UserProfile userProfile = mock(UserProfile.class);
    GroupList groupList = mock(GroupList.class);
    Group group1 = mock(Group.class);
    GroupProfile groupProfile1 = mock(GroupProfile.class);

    when(_client.listUsers(username, null, null, null, null)).thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of(user));
    when(userList.single()).thenReturn(user);
    when(user.getProfile()).thenReturn(userProfile);

    when(user.listGroups()).thenReturn(groupList);
    when(groupList.stream()).thenReturn(Stream.of(group1));
    when(group1.getType()).thenReturn(GroupType.OKTA_GROUP);
    when(group1.getProfile()).thenReturn(groupProfile1);
    when(groupProfile1.getName()).thenReturn("SR-UNITTEST-TENANT:MYNIFTYORG:NO_ACCESS");

    _repo.updateUserEmail(userAttributes, newUsername);
    verify(userProfile, times(1)).setEmail(newUsername);
    verify(user, times(1)).update();
  }

  @Test
  void updateUser_userNotFound_error() {
    String username = "fraud@fake.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");
    IdentityAttributes identityAttributes = new IdentityAttributes(username, personName);

    UserList userList = mock(UserList.class);

    when(_client.listUsers(username, null, null, null, null)).thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of());

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _repo.updateUser(identityAttributes));
    assertEquals("Cannot update Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void updateUserEmail_userNotFound_error() {
    String username = "fraud@fake.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");
    IdentityAttributes identityAttributes = new IdentityAttributes(username, personName);

    UserList userList = mock(UserList.class);

    when(_client.listUsers(username, null, null, null, null)).thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of());

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class,
            () -> _repo.updateUserEmail(identityAttributes, "newemail@fake.com"));
    assertEquals(
        "Cannot update email of Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void reprovisionUser_success() {
    String username = "fraud@fake.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");

    UserList userList = mock(UserList.class);
    User user = mock(User.class);
    UserProfile userProfile = mock(UserProfile.class);

    when(_client.listUsers(username, null, null, null, null)).thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of(user));
    when(userList.single()).thenReturn(user);
    when(user.getStatus()).thenReturn(UserStatus.SUSPENDED);
    when(user.getProfile()).thenReturn(userProfile);

    IdentityAttributes identityAttributes = new IdentityAttributes(username, personName);

    _repo.reprovisionUser(identityAttributes);

    verify(user, times(1)).update();
    verify(user, times(1)).deactivate();
    verify(user, times(1)).activate(true);
  }

  @Test
  void reprovisionUser_unsupportedUserState_error() {
    String username = "fraud@fake.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");

    UserList userList = mock(UserList.class);
    User user = mock(User.class);

    when(_client.listUsers(username, null, null, null, null)).thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of(user));
    when(userList.single()).thenReturn(user);
    when(user.getStatus()).thenReturn(UserStatus.ACTIVE);

    IdentityAttributes identityAttributes = new IdentityAttributes(username, personName);

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _repo.reprovisionUser(identityAttributes));
    assertEquals("Cannot reprovision user in unsupported state: ACTIVE", caught.getMessage());
  }

  @Test
  void reprovisionUser_userNotFound_error() {
    String username = "fraud@fake.com";
    PersonName personName = new PersonName("First", "Middle", "Last", "Suffix");

    UserList userList = mock(UserList.class);

    when(_client.listUsers(username, null, null, null, null)).thenReturn(userList);
    when(userList.stream()).thenReturn(Stream.of());

    IdentityAttributes identityAttributes = new IdentityAttributes(username, personName);

    Throwable caught =
        assertThrows(
            IllegalGraphqlArgumentException.class, () -> _repo.reprovisionUser(identityAttributes));
    assertEquals("Cannot reprovision Okta user with unrecognized username", caught.getMessage());
  }

  @Test
  void createUser() {
    var username = "fraud@fake.com";
    var personName = new PersonName("First", "Middle", "Last", "Suffix");
    var identityAttributes = new IdentityAttributes(username, personName);
    var org = new Organization("orgName", "orgType", "1", true);
    var groupProfilePrefix = "SR-UNITTEST-TENANT:" + org.getExternalId();
    var groupProfileName = groupProfilePrefix + ":NO_ACCESS";
    Map<String, Object> profileProperties =
        Map.of(
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

    var mockGroupListQ = mock(GroupList.class);
    var mockGroupListSearch = mock(GroupList.class);
    var mockGroup = mock(Group.class);
    var mockGroupProfile = mock(GroupProfile.class);
    var mockUserBuilder = mock(UserBuilder.class);

    when(mockGroupListQ.stream()).then(i -> Stream.of(mockGroup));
    when(mockGroupListSearch.stream()).then(i -> Stream.of(mockGroup));
    when(_client.listGroups(eq(groupProfilePrefix), isNull(), isNull())).thenReturn(mockGroupListQ);
    when(_client.listGroups(isNull(), anyString(), isNull())).thenReturn(mockGroupListSearch);
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn(groupProfileName);
    when(mockUserBuilder.setProfileProperties(profileProperties)).thenReturn(mockUserBuilder);
    when(mockUserBuilder.setGroups(anySet())).thenReturn(mockUserBuilder);
    when(mockUserBuilder.setActive(true)).thenReturn(mockUserBuilder);

    try (MockedStatic<UserBuilder> staticMockUserBuilder = Mockito.mockStatic(UserBuilder.class)) {
      staticMockUserBuilder.when(UserBuilder::instance).thenReturn(mockUserBuilder);

      var actual = _repo.createUser(identityAttributes, org, Set.of(), Set.of(), true);
      verify(mockUserBuilder, times(1)).setProfileProperties(profileProperties);
      verify(mockUserBuilder, times(1)).setGroups(anySet());
      verify(mockUserBuilder, times(1)).buildAndCreate(eq(_client));
      verify(mockUserBuilder, times(1)).setActive(eq(true));
      assertEquals(
          MOCK_EXTRACTOR
              .convertClaims(List.of(groupProfileName))
              .get(0)
              .getOrganizationExternalId(),
          actual.orElseThrow().getOrganizationExternalId());
    }
  }

  @Test
  void createUser_illegalGraphqlArgumentError_withoutLastName() {
    var username = "fraud@fake.com";
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
    var username = "fraud@fake.com";
    var personName = new PersonName("First", "Middle", "Last", "Suffix");
    var identityAttributes = new IdentityAttributes(username, personName);
    var org = new Organization("orgName", "orgType", "1", true);
    var mockGroupList = mock(GroupList.class);

    when(mockGroupList.stream()).then(i -> Stream.of());
    when(_client.listGroups(anyString(), isNull(), isNull())).thenReturn(mockGroupList);
    when(_client.listGroups(isNull(), anyString(), isNull())).thenReturn(mockGroupList);

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
    var username = "fraud@fake.com";
    var personName = new PersonName("First", "Middle", "Last", "Suffix");
    var identityAttributes = new IdentityAttributes(username, personName);
    var org = new Organization("orgName", "orgType", "1", true);
    var groupProfilePrefix = "SR-UNITTEST-TENANT:" + org.getExternalId();
    var groupProfileName = groupProfilePrefix + ":NO_ACCESS";

    var mockGroupList = mock(GroupList.class);
    var mockGroup = mock(Group.class);
    var mockGroupProfile = mock(GroupProfile.class);
    when(mockGroupList.stream()).then(i -> Stream.of(mockGroup));
    when(_client.listGroups(anyString(), isNull(), isNull())).thenReturn(mockGroupList);
    when(_client.listGroups(isNull(), anyString(), isNull())).thenReturn(mockGroupList);
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
  void getAllUsersForOrganization() {
    var org = new Organization("orgName", "orgType", "1", true);
    var groupProfilePrefix = "SR-UNITTEST-TENANT:" + org.getExternalId() + ":NO_ACCESS";

    var mockGroupList = mock(GroupList.class);
    var mockGroup = mock(Group.class);
    var mockGroupProfile = mock(GroupProfile.class);
    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);
    var mockUserProfile = mock(UserProfile.class);
    when(_client.listGroups(eq(groupProfilePrefix), isNull(), isNull())).thenReturn(mockGroupList);
    when(mockGroupList.stream()).then(i -> Stream.of(mockGroup));
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn(groupProfilePrefix);
    when(mockGroup.listUsers()).thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUser.getProfile()).thenReturn(mockUserProfile);
    when(mockUserProfile.getEmail()).thenReturn("email@example.com");

    var actual = _repo.getAllUsersForOrganization(org);
    assertEquals(Set.of("email@example.com"), actual);
    assertThrows(UnsupportedOperationException.class, () -> actual.add("not_allowed"));
  }

  @Test
  void getAllUsersForOrganization_illegalGraphqlArgumentException_noGroupsFound() {
    var org = new Organization("orgName", "orgType", "1", true);

    var mockGroupList = mock(GroupList.class);

    when(_client.listGroups(anyString(), isNull(), isNull())).thenReturn(mockGroupList);
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

    var mockGroupList = mock(GroupList.class);
    var mockGroup = mock(Group.class);
    var mockGroupProfile = mock(GroupProfile.class);
    var mockUserList = mock(UserList.class);
    var mockUser = mock(User.class);
    var mockUserProfile = mock(UserProfile.class);
    when(_client.listGroups(eq(groupProfilePrefix), isNull(), isNull())).thenReturn(mockGroupList);
    when(mockGroupList.stream()).then(i -> Stream.of(mockGroup));
    when(mockGroup.getProfile()).thenReturn(mockGroupProfile);
    when(mockGroupProfile.getName()).thenReturn(groupProfilePrefix);
    when(mockGroup.listUsers()).thenReturn(mockUserList);
    when(mockUserList.stream()).then(i -> Stream.of(mockUser));
    when(mockUser.getProfile()).thenReturn(mockUserProfile);
    when(mockUserProfile.getEmail()).thenReturn("email@example.com");
    when(mockUser.getStatus()).thenReturn(UserStatus.ACTIVE);

    var actual = _repo.getAllUsersWithStatusForOrganization(org);
    assertEquals(Map.of("email@example.com", UserStatus.ACTIVE), actual);
  }
}
