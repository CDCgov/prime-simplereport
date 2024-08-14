package gov.cdc.usds.simplereport.idp.repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.okta.sdk.resource.model.UserStatus;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.model.errors.ConflictingUserException;
import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.authorization.OrganizationExtractor;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatcher;

class DemoOktaRepositoryTest {

  private static final IdentityAttributes AMOS =
      new IdentityAttributes("aquint@gmail.com", "Amos", null, "Quint", null);
  private static final IdentityAttributes BRAD =
      new IdentityAttributes("bzj@msn.com", "Bradley", "Z.", "Jones", "Jr.");
  private static final IdentityAttributes CHARLES =
      new IdentityAttributes("charles@gmail.com", "Charles", null, "Albemarle", "Sr.");
  private static final IdentityAttributes DIANE =
      new IdentityAttributes("dianek@gmail.com", "Diane", "M", "Kohl", null);

  private static final Organization ABC = new Organization("ABC General", "k12", "ABC", true);
  private static final Facility ABC_1 = getFacility(UUID.randomUUID(), ABC);
  private static final Facility ABC_2 = getFacility(UUID.randomUUID(), ABC);

  private static final AuthorizationProperties MOCK_PROPS =
      new AuthorizationProperties(null, "UNITTEST");
  private static final OrganizationExtractor MOCK_EXTRACTOR = new OrganizationExtractor(MOCK_PROPS);
  private static final CurrentTenantDataAccessContextHolder tenantDataAccessContextHolder =
      new CurrentTenantDataAccessContextHolder();

  private DemoOktaRepository _repo =
      new DemoOktaRepository(
          MOCK_EXTRACTOR, tenantDataAccessContextHolder, mock(DemoUserConfiguration.class));

  @BeforeEach
  public void setup() {
    _repo.reset();
    createOrgAndFacilities();
  }

  @Test
  void createOrganizationFacilitiesAndUsers() {
    OrganizationRoleClaims amos_expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(ABC_1.getInternalId()),
            Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.USER));
    OrganizationRoleClaims brad_expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(),
            Set.of(
                OrganizationRole.NO_ACCESS,
                OrganizationRole.ENTRY_ONLY,
                OrganizationRole.ALL_FACILITIES));
    OrganizationRoleClaims charles_expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(ABC_1.getInternalId(), ABC_2.getInternalId()),
            Set.of(OrganizationRole.NO_ACCESS));
    OrganizationRoleClaims diane_expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(),
            Set.of(
                OrganizationRole.NO_ACCESS,
                OrganizationRole.ALL_FACILITIES,
                OrganizationRole.ADMIN));

    assertTrue(
        new OrganizationRoleClaimsMatcher(amos_expected)
            .matches(
                _repo
                    .createUser(AMOS, ABC, Set.of(ABC_1), Set.of(OrganizationRole.USER), true)
                    .get()));
    assertTrue(
        new OrganizationRoleClaimsMatcher(brad_expected)
            .matches(
                _repo
                    .createUser(
                        BRAD,
                        ABC,
                        Set.of(ABC_2),
                        Set.of(OrganizationRole.ENTRY_ONLY, OrganizationRole.ALL_FACILITIES),
                        true)
                    .get()));
    assertTrue(
        new OrganizationRoleClaimsMatcher(charles_expected)
            .matches(_repo.createUser(CHARLES, ABC, Set.of(ABC_1, ABC_2), Set.of(), true).get()));
    assertTrue(
        new OrganizationRoleClaimsMatcher(diane_expected)
            .matches(
                _repo
                    .createUser(
                        DIANE,
                        ABC,
                        Set.of(ABC_1, ABC_2),
                        Set.of(
                            OrganizationRole.NO_ACCESS,
                            OrganizationRole.ALL_FACILITIES,
                            OrganizationRole.ADMIN),
                        true)
                    .get()));

    Set<String> abcUsernames = _repo.getAllUsersForOrganization(ABC);

    assertTrue(abcUsernames.contains(AMOS.getUsername()));
    assertTrue(abcUsernames.contains(BRAD.getUsername()));
    assertTrue(abcUsernames.contains(CHARLES.getUsername()));
    assertTrue(abcUsernames.contains(DIANE.getUsername()));
  }

  @Test
  void createUser_conflictingUser_error() {
    createOrgAndFacilities();
    _repo.createUser(AMOS, ABC, Set.of(ABC_1), Set.of(OrganizationRole.USER), true);

    Set<Facility> facilities = Set.of(ABC_1);
    Set<OrganizationRole> orgRoles = Set.of(OrganizationRole.USER);

    assertThrows(
        ConflictingUserException.class,
        () -> {
          _repo.createUser(AMOS, ABC, facilities, orgRoles, true);
        });
  }

  @Test
  void updateUserPrivileges() {

    OrganizationRoleClaims expected_1 =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(ABC_1.getInternalId(), ABC_2.getInternalId()),
            Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.ENTRY_ONLY));
    OrganizationRoleClaims expected_2 =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(),
            Set.of(
                OrganizationRole.NO_ACCESS,
                OrganizationRole.USER,
                OrganizationRole.ALL_FACILITIES));
    OrganizationRoleClaims expected_3 =
        new OrganizationRoleClaims(
            ABC.getExternalId(), Set.of(), Set.of(OrganizationRole.NO_ACCESS));
    _repo.createUser(AMOS, ABC, Set.of(ABC_1), Set.of(OrganizationRole.USER), true);

    assertTrue(
        new OrganizationRoleClaimsMatcher(expected_1)
            .matches(
                _repo
                    .updateUserPrivileges(
                        AMOS.getUsername(),
                        ABC,
                        Set.of(ABC_1, ABC_2),
                        Set.of(OrganizationRole.ENTRY_ONLY))
                    .get()));
    assertTrue(
        new OrganizationRoleClaimsMatcher(expected_1)
            .matches(_repo.getOrganizationRoleClaimsForUser(AMOS.getUsername()).get()));

    assertTrue(
        new OrganizationRoleClaimsMatcher(expected_2)
            .matches(
                _repo
                    .updateUserPrivileges(
                        AMOS.getUsername(),
                        ABC,
                        Set.of(ABC_2),
                        Set.of(OrganizationRole.USER, OrganizationRole.ALL_FACILITIES))
                    .get()));
    assertTrue(
        new OrganizationRoleClaimsMatcher(expected_2)
            .matches(_repo.getOrganizationRoleClaimsForUser(AMOS.getUsername()).get()));

    assertTrue(
        new OrganizationRoleClaimsMatcher(expected_3)
            .matches(
                _repo.updateUserPrivileges(AMOS.getUsername(), ABC, Set.of(), Set.of()).get()));
    assertTrue(
        new OrganizationRoleClaimsMatcher(expected_3)
            .matches(_repo.getOrganizationRoleClaimsForUser(AMOS.getUsername()).get()));
  }

  @Test
  void updateUser() {
    createOrgAndFacilities();

    // Check that updating a non-existent user throws the proper exception
    assertThrows(
        IllegalGraphqlArgumentException.class,
        () -> {
          _repo.updateUser(AMOS);
        });

    Optional<OrganizationRoleClaims> createdAmos =
        _repo.createUser(
            AMOS,
            ABC,
            Set.of(ABC_1),
            Set.of(OrganizationRole.USER, OrganizationRole.ALL_FACILITIES),
            true);
    assertTrue(
        new OrganizationRoleClaimsMatcher(createdAmos.get()).matches(_repo.updateUser(AMOS).get()));
  }

  @Test
  void updateUserEmail_success() {
    createOrgAndFacilities();

    // Create a user and try updating their email
    Optional<OrganizationRoleClaims> createdAmos =
        _repo.createUser(
            AMOS,
            ABC,
            Set.of(ABC_1),
            Set.of(OrganizationRole.USER, OrganizationRole.ALL_FACILITIES),
            true);

    Optional<OrganizationRoleClaims> updatedRoleClaims =
        _repo.updateUserEmail(AMOS, "fake-email@example.com");
    assertTrue(
        new OrganizationRoleClaimsMatcher(createdAmos.get()).matches(updatedRoleClaims.get()));
    Set<String> users = _repo.getAllUsersForOrganization(ABC);
    assertTrue(users.contains("fake-email@example.com"));
    assertFalse(users.contains("aquint@gmail.com"));
  }

  @Test
  void updateUserEmail_nonExistentUser_error() {
    createOrgAndFacilities();
    IdentityAttributes fake = new IdentityAttributes("fake@gmail.com", "Amos", null, "Quint", null);

    assertThrows(
        IllegalGraphqlArgumentException.class,
        () -> {
          _repo.updateUserEmail(fake, "newemail@example.com");
        });
  }

  @Test
  void updateUserEmail_conflictingUser_error() {
    createOrgAndFacilities();

    _repo.createUser(
        AMOS,
        ABC,
        Set.of(ABC_1),
        Set.of(OrganizationRole.USER, OrganizationRole.ALL_FACILITIES),
        true);
    _repo.createUser(
        BRAD,
        ABC,
        Set.of(ABC_1),
        Set.of(OrganizationRole.USER, OrganizationRole.ALL_FACILITIES),
        true);

    String username = BRAD.getUsername();

    assertThrows(
        ConflictingUserException.class,
        () -> {
          _repo.updateUserEmail(AMOS, username);
        });
  }

  @Test
  void getOrganizationRoleClaimsForUser() {
    createOrgAndFacilities();
    _repo.createUser(
        AMOS,
        ABC,
        Set.of(ABC_1, ABC_2),
        Set.of(OrganizationRole.ALL_FACILITIES, OrganizationRole.ADMIN),
        true);
    _repo.createUser(BRAD, ABC, Set.of(ABC_1), Set.of(OrganizationRole.ENTRY_ONLY), true);

    Optional<OrganizationRoleClaims> amos_actual =
        _repo.getOrganizationRoleClaimsForUser(AMOS.getUsername());
    Optional<OrganizationRoleClaims> brad_actual =
        _repo.getOrganizationRoleClaimsForUser(BRAD.getUsername());

    Optional<OrganizationRoleClaims> amos_expected =
        Optional.of(
            new OrganizationRoleClaims(
                ABC.getExternalId(),
                Set.of(),
                Set.of(
                    OrganizationRole.NO_ACCESS,
                    OrganizationRole.ALL_FACILITIES,
                    OrganizationRole.ADMIN)));
    Optional<OrganizationRoleClaims> brad_expected =
        Optional.of(
            new OrganizationRoleClaims(
                ABC.getExternalId(),
                Set.of(ABC_1.getInternalId()),
                Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.ENTRY_ONLY)));

    assertTrue(amos_actual.isPresent());
    assertTrue(new OrganizationRoleClaimsMatcher(amos_expected.get()).matches(amos_actual.get()));
    assertTrue(brad_actual.isPresent());
    assertTrue(new OrganizationRoleClaimsMatcher(brad_expected.get()).matches(brad_actual.get()));
  }

  @Test
  void getAllUsersForOrganization() {
    OrganizationRoleClaims amos_expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(ABC_1.getInternalId()),
            Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.USER));
    OrganizationRoleClaims brad_expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(),
            Set.of(
                OrganizationRole.NO_ACCESS,
                OrganizationRole.ENTRY_ONLY,
                OrganizationRole.ALL_FACILITIES));
    OrganizationRoleClaims charles_expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(ABC_1.getInternalId(), ABC_2.getInternalId()),
            Set.of(OrganizationRole.NO_ACCESS));
    OrganizationRoleClaims diane_expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(),
            Set.of(
                OrganizationRole.NO_ACCESS,
                OrganizationRole.ALL_FACILITIES,
                OrganizationRole.ADMIN));

    _repo.createUser(AMOS, ABC, Set.of(ABC_1), Set.of(OrganizationRole.USER), true);
    _repo.createUser(
        BRAD,
        ABC,
        Set.of(ABC_2),
        Set.of(OrganizationRole.ENTRY_ONLY, OrganizationRole.ALL_FACILITIES),
        true);
    _repo.createUser(CHARLES, ABC, Set.of(ABC_1, ABC_2), Set.of(), true);
    _repo.createUser(
        DIANE,
        ABC,
        Set.of(ABC_1, ABC_2),
        Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.ALL_FACILITIES, OrganizationRole.ADMIN),
        true);

    assertTrue(
        new OrganizationRoleClaimsMatcher(amos_expected)
            .matches(_repo.getOrganizationRoleClaimsForUser(AMOS.getUsername()).get()));
    assertTrue(
        new OrganizationRoleClaimsMatcher(brad_expected)
            .matches(_repo.getOrganizationRoleClaimsForUser(BRAD.getUsername()).get()));
    assertTrue(
        new OrganizationRoleClaimsMatcher(charles_expected)
            .matches(_repo.getOrganizationRoleClaimsForUser(CHARLES.getUsername()).get()));
    assertTrue(
        new OrganizationRoleClaimsMatcher(diane_expected)
            .matches(_repo.getOrganizationRoleClaimsForUser(DIANE.getUsername()).get()));
  }

  @Test
  void activateUser() {
    _repo.createUser(AMOS, ABC, Set.of(ABC_1), Set.of(OrganizationRole.USER), false);
    String activatedUserResponse = _repo.activateUser(AMOS.getUsername());
    assertEquals(UserStatus.ACTIVE, _repo.getUserStatus(AMOS.getUsername()));
    assertEquals("activationToken", activatedUserResponse);
  }

  @Test
  void deactivateUser() {
    _repo.createUser(AMOS, ABC, Set.of(ABC_1), Set.of(OrganizationRole.USER), true);
    _repo.createUser(
        BRAD,
        ABC,
        Set.of(ABC_2),
        Set.of(OrganizationRole.ENTRY_ONLY, OrganizationRole.ALL_FACILITIES),
        true);
    _repo.setUserIsActive(AMOS.getUsername(), false);
    assertEquals(
        UserStatus.SUSPENDED,
        _repo.getAllUsersWithStatusForOrganization(ABC).get(AMOS.getUsername()));
    assertEquals(
        UserStatus.ACTIVE, _repo.getAllUsersWithStatusForOrganization(ABC).get(BRAD.getUsername()));
  }

  @Test
  void deleteOrg() {
    _repo.createUser(AMOS, ABC, Set.of(ABC_1), Set.of(OrganizationRole.USER), true);
    _repo.createUser(
        BRAD,
        ABC,
        Set.of(ABC_2),
        Set.of(OrganizationRole.ENTRY_ONLY, OrganizationRole.ALL_FACILITIES),
        true);

    assertTrue(_repo.getAllUsersForOrganization(ABC).contains(AMOS.getUsername()));
    assertTrue(_repo.getAllUsersForOrganization(ABC).contains(BRAD.getUsername()));

    _repo.deleteOrganization(ABC);

    Facility fakeFacility = getFacility(UUID.randomUUID(), ABC);
    assertThrows(IllegalGraphqlArgumentException.class, () -> _repo.createFacility(fakeFacility));
    assertThrows(
        IllegalGraphqlArgumentException.class, () -> _repo.getAllUsersForOrganization(ABC));
  }

  @Test
  void reprovisionUser_success() {
    _repo.createUser(AMOS, ABC, Set.of(ABC_1), Set.of(OrganizationRole.USER), true);
    _repo.setUserIsActive(AMOS.getUsername(), false);

    assertTrue(_repo.inactiveUsernames.contains(AMOS.getUsername()));

    IdentityAttributes identityAttributes =
        new IdentityAttributes(AMOS.getUsername(), "First", "Middle", "Last", "Jr");
    _repo.reprovisionUser(identityAttributes);

    assertFalse(_repo.inactiveUsernames.contains(AMOS.getUsername()));
  }

  @Test
  void reprovisionUser_error() {
    _repo.createUser(AMOS, ABC, Set.of(ABC_1), Set.of(OrganizationRole.USER), true);

    IdentityAttributes identityAttributes =
        new IdentityAttributes(AMOS.getUsername(), "First", "Middle", "Last", "Jr");
    assertThrows(
        IllegalGraphqlArgumentException.class, () -> _repo.reprovisionUser(identityAttributes));
  }

  @Test
  void fetchAdminUserEmail_successful() {
    _repo.createUser(AMOS, ABC, Set.of(ABC_1), Set.of(OrganizationRole.USER), true);
    _repo.createUser(
        BRAD,
        ABC,
        Set.of(ABC_2),
        Set.of(OrganizationRole.ENTRY_ONLY, OrganizationRole.ALL_FACILITIES),
        true);
    _repo.createUser(CHARLES, ABC, Set.of(ABC_1, ABC_2), Set.of(), true);
    _repo.createUser(
        DIANE,
        ABC,
        Set.of(ABC_1, ABC_2),
        Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.ALL_FACILITIES, OrganizationRole.ADMIN),
        true);

    assertThat(_repo.fetchAdminUserEmail(ABC)).contains("dianek@gmail.com");
  }

  @Test
  void fetchAdminUserEmail_differentOrgs_successful() {
    Set<OrganizationRole> adminRoles = Set.of(OrganizationRole.NO_ACCESS, OrganizationRole.ADMIN);
    Organization orgA = new Organization("Org A", "k12", "Org A", true);
    _repo.createOrganization(orgA);
    Facility orgAFacility = getFacility(UUID.randomUUID(), orgA);
    _repo.createFacility(orgAFacility);
    _repo.createUser(AMOS, ABC, Set.of(ABC_1), adminRoles, true);
    _repo.createUser(BRAD, orgA, Set.of(orgAFacility), adminRoles, true);

    List<String> actualABCAdminEmails = _repo.fetchAdminUserEmail(ABC);
    assertThat(actualABCAdminEmails).hasSize(1).contains(AMOS.getUsername());
    List<String> actualOrgAAdminEmails = _repo.fetchAdminUserEmail(orgA);
    assertThat(actualOrgAAdminEmails).hasSize(1).contains(BRAD.getUsername());
  }

  @Test
  void findUser_success() {
    createOrgAndFacilities();
    _repo.createUser(
        AMOS,
        ABC,
        Set.of(ABC_1, ABC_2),
        Set.of(OrganizationRole.ALL_FACILITIES, OrganizationRole.ADMIN),
        true);
    _repo.createUser(BRAD, ABC, Set.of(ABC_1), Set.of(OrganizationRole.ENTRY_ONLY), true);

    PartialOktaUser amos = _repo.findUser(AMOS.getUsername());

    Optional<OrganizationRoleClaims> amos_expected =
        Optional.of(
            new OrganizationRoleClaims(
                ABC.getExternalId(),
                Set.of(),
                Set.of(
                    OrganizationRole.NO_ACCESS,
                    OrganizationRole.ALL_FACILITIES,
                    OrganizationRole.ADMIN)));

    assertEquals(false, amos.isSiteAdmin());
    assertEquals(UserStatus.ACTIVE, amos.getStatus());
    assertEquals(AMOS.getUsername(), amos.getUsername());
    assertTrue(amos.getOrganizationRoleClaims().isPresent());
    assertTrue(
        new OrganizationRoleClaimsMatcher(amos_expected.get())
            .matches(amos.getOrganizationRoleClaims().get()));
  }

  private static Facility getFacility(UUID uuid, Organization org) {
    Facility facility = mock(Facility.class);
    when(facility.getInternalId()).thenReturn(uuid);
    when(facility.getOrganization()).thenReturn(org);
    return facility;
  }

  private void createOrgAndFacilities() {
    _repo.createOrganization(ABC);
    _repo.createFacility(ABC_1);
    _repo.createFacility(ABC_2);
  }

  public class OrganizationRoleClaimsMatcher implements ArgumentMatcher<OrganizationRoleClaims> {

    private OrganizationRoleClaims left;

    public OrganizationRoleClaimsMatcher(OrganizationRoleClaims left) {
      this.left = left;
    }

    @Override
    public boolean matches(OrganizationRoleClaims right) {
      return left.getOrganizationExternalId().equals(right.getOrganizationExternalId())
          && left.getFacilities().equals(right.getFacilities())
          && right.getGrantedRoles().equals(right.getGrantedRoles());
    }
  }
}
