package gov.cdc.usds.simplereport.idp.repository;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
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
import com.okta.sdk.resource.user.UserList;
import com.okta.sdk.resource.user.UserProfile;
import com.okta.sdk.resource.user.UserStatus;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.authorization.OrganizationExtractor;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.context.annotation.Import;

@Import(SliceTestConfiguration.class)
class LiveOktaRepositoryTest {

  private static final AuthorizationProperties MOCK_PROPS =
      new AuthorizationProperties(null, "UNITTEST");
  private static final OrganizationExtractor MOCK_EXTRACTOR = new OrganizationExtractor(MOCK_PROPS);
  private static final CurrentTenantDataAccessContextHolder tenantDataAccessContextHolder =
      new CurrentTenantDataAccessContextHolder();
  private static final String MOCK_CLIENT_ID = "FAKE_CLIENT_ID";
  private Client _client = mock(Client.class);
  private Application _app = mock(Application.class);
  LiveOktaRepository _repo;

  @BeforeEach
  public void setup() {
    when(_client.getApplication(MOCK_CLIENT_ID)).thenReturn(_app);
    _repo = new LiveOktaRepository(MOCK_PROPS, _client, MOCK_CLIENT_ID, MOCK_EXTRACTOR, tenantDataAccessContextHolder);
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
            IllegalGraphqlArgumentException.class,
            () -> {
              _repo.reprovisionUser(identityAttributes);
            });
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
            IllegalGraphqlArgumentException.class,
            () -> {
              _repo.reprovisionUser(identityAttributes);
            });
    assertEquals("Cannot reprovision Okta user with unrecognized username", caught.getMessage());
  }
}
