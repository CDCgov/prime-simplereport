package gov.cdc.usds.simplereport.idp.repository;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentMatcher;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest(properties = {"spring.main.web-application-type=NONE"})
@Import(SliceTestConfiguration.class)
class DemoOktaRepositoryTest {

  private static final IdentityAttributes AMOS =
      new IdentityAttributes("aquint@gmail.com", "Amos", null, "Quint", null);
  private static final IdentityAttributes BRAD =
      new IdentityAttributes("bzj@msn.com", "Bradley", "Z.", "Jones", "Jr.");
  private static final IdentityAttributes CHARLES =
      new IdentityAttributes("charles@gmail.com", "Charles", null, "Albemarle", "Sr.");
  private static final IdentityAttributes DIANE =
      new IdentityAttributes("dianek@gmail.com", "Diane", "M", "Kohl", null);

  private static final Organization ABC = new Organization("ABC General", "ABC");
  private static final Facility ABC_1 = getFacility(UUID.randomUUID(), ABC);
  private static final Facility ABC_2 = getFacility(UUID.randomUUID(), ABC);

  @Autowired private DemoOktaRepository _repo;

  @BeforeEach
  public void setup() {
    _repo.reset();
    createOrgAndFacilities();
  }

  @AfterEach
  public void cleanup() {
    _repo.reset();
  }

  @Test
  void createOrganizationFacilitiesAndUsers() {

    OrganizationRoleClaims amos_expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(ABC_1.getInternalId()),
            Set.of(OrganizationRole.MEMBER, OrganizationRole.USER));
    OrganizationRoleClaims brad_expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(),
            Set.of(
                OrganizationRole.MEMBER,
                OrganizationRole.ENTRY_ONLY,
                OrganizationRole.ALL_FACILITIES));
    OrganizationRoleClaims charles_expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(ABC_1.getInternalId(), ABC_2.getInternalId()),
            Set.of(OrganizationRole.MEMBER));
    OrganizationRoleClaims diane_expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(),
            Set.of(
                OrganizationRole.MEMBER, OrganizationRole.ALL_FACILITIES, OrganizationRole.ADMIN));

    assertTrue(
        new OrganizationRoleClaimsMatcher(amos_expected)
            .matches(
                _repo.createUser(AMOS, ABC, Set.of(ABC_1), Set.of(OrganizationRole.USER)).get()));
    assertTrue(
        new OrganizationRoleClaimsMatcher(brad_expected)
            .matches(
                _repo
                    .createUser(
                        BRAD,
                        ABC,
                        Set.of(ABC_2),
                        Set.of(OrganizationRole.ENTRY_ONLY, OrganizationRole.ALL_FACILITIES))
                    .get()));
    assertTrue(
        new OrganizationRoleClaimsMatcher(charles_expected)
            .matches(_repo.createUser(CHARLES, ABC, Set.of(ABC_1, ABC_2), Set.of()).get()));
    assertTrue(
        new OrganizationRoleClaimsMatcher(diane_expected)
            .matches(
                _repo
                    .createUser(
                        DIANE,
                        ABC,
                        Set.of(ABC_1, ABC_2),
                        Set.of(
                            OrganizationRole.MEMBER,
                            OrganizationRole.ALL_FACILITIES,
                            OrganizationRole.ADMIN))
                    .get()));

    assertTrue(
        new OrganizationRoleClaimsMatcher(amos_expected)
            .matches(_repo.getAllUsersForOrganization(ABC).get(AMOS.getUsername())));
    assertTrue(
        new OrganizationRoleClaimsMatcher(brad_expected)
            .matches(_repo.getAllUsersForOrganization(ABC).get(BRAD.getUsername())));
    assertTrue(
        new OrganizationRoleClaimsMatcher(charles_expected)
            .matches(_repo.getAllUsersForOrganization(ABC).get(CHARLES.getUsername())));
    assertTrue(
        new OrganizationRoleClaimsMatcher(diane_expected)
            .matches(_repo.getAllUsersForOrganization(ABC).get(DIANE.getUsername())));
  }

  @Test
  void updateUser() {

    OrganizationRoleClaims expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(ABC_1.getInternalId()),
            Set.of(OrganizationRole.MEMBER, OrganizationRole.USER));
    _repo.createUser(AMOS, ABC, Set.of(ABC_1), Set.of(OrganizationRole.USER));

    assertTrue(
        new OrganizationRoleClaimsMatcher(expected)
            .matches(_repo.updateUser(AMOS.getUsername(), BRAD).get()));

    assertFalse(_repo.getAllUsersForOrganization(ABC).containsKey(AMOS.getUsername()));
    assertTrue(
        new OrganizationRoleClaimsMatcher(expected)
            .matches(_repo.getAllUsersForOrganization(ABC).get(BRAD.getUsername())));
  }

  @Test
  void updateUserPrivileges() {

    OrganizationRoleClaims expected_1 =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(ABC_1.getInternalId(), ABC_2.getInternalId()),
            Set.of(OrganizationRole.MEMBER, OrganizationRole.ENTRY_ONLY));
    OrganizationRoleClaims expected_2 =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(),
            Set.of(
                OrganizationRole.MEMBER, OrganizationRole.USER, OrganizationRole.ALL_FACILITIES));
    OrganizationRoleClaims expected_3 =
        new OrganizationRoleClaims(ABC.getExternalId(), Set.of(), Set.of(OrganizationRole.MEMBER));
    _repo.createUser(AMOS, ABC, Set.of(ABC_1), Set.of(OrganizationRole.USER));

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
            .matches(_repo.getAllUsersForOrganization(ABC).get(AMOS.getUsername())));

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
            .matches(_repo.getAllUsersForOrganization(ABC).get(AMOS.getUsername())));

    assertTrue(
        new OrganizationRoleClaimsMatcher(expected_3)
            .matches(
                _repo.updateUserPrivileges(AMOS.getUsername(), ABC, Set.of(), Set.of()).get()));
    assertTrue(
        new OrganizationRoleClaimsMatcher(expected_3)
            .matches(_repo.getAllUsersForOrganization(ABC).get(AMOS.getUsername())));
  }

  @Test
  void getOrganizationRoleClaimsForUser() {
    createOrgAndFacilities();
    _repo.createUser(
        AMOS,
        ABC,
        Set.of(ABC_1, ABC_2),
        Set.of(OrganizationRole.ALL_FACILITIES, OrganizationRole.ADMIN));
    _repo.createUser(BRAD, ABC, Set.of(ABC_1), Set.of(OrganizationRole.ENTRY_ONLY));

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
                    OrganizationRole.MEMBER,
                    OrganizationRole.ALL_FACILITIES,
                    OrganizationRole.ADMIN)));
    Optional<OrganizationRoleClaims> brad_expected =
        Optional.of(
            new OrganizationRoleClaims(
                ABC.getExternalId(),
                Set.of(ABC_1.getInternalId()),
                Set.of(OrganizationRole.MEMBER, OrganizationRole.ENTRY_ONLY)));

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
            Set.of(OrganizationRole.MEMBER, OrganizationRole.USER));
    OrganizationRoleClaims brad_expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(),
            Set.of(
                OrganizationRole.MEMBER,
                OrganizationRole.ENTRY_ONLY,
                OrganizationRole.ALL_FACILITIES));
    OrganizationRoleClaims charles_expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(ABC_1.getInternalId(), ABC_2.getInternalId()),
            Set.of(OrganizationRole.MEMBER));
    OrganizationRoleClaims diane_expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(),
            Set.of(),
            Set.of(
                OrganizationRole.MEMBER, OrganizationRole.ALL_FACILITIES, OrganizationRole.ADMIN));

    _repo.createUser(AMOS, ABC, Set.of(ABC_1), Set.of(OrganizationRole.USER));
    _repo.createUser(
        BRAD,
        ABC,
        Set.of(ABC_2),
        Set.of(OrganizationRole.ENTRY_ONLY, OrganizationRole.ALL_FACILITIES));
    _repo.createUser(CHARLES, ABC, Set.of(ABC_1, ABC_2), Set.of());
    _repo.createUser(
        DIANE,
        ABC,
        Set.of(ABC_1, ABC_2),
        Set.of(OrganizationRole.MEMBER, OrganizationRole.ALL_FACILITIES, OrganizationRole.ADMIN));

    Map<String, OrganizationRoleClaims> all_users_actual = _repo.getAllUsersForOrganization(ABC);
    assertTrue(
        new OrganizationRoleClaimsMatcher(amos_expected)
            .matches(all_users_actual.get(AMOS.getUsername())));
    assertTrue(
        new OrganizationRoleClaimsMatcher(brad_expected)
            .matches(all_users_actual.get(BRAD.getUsername())));
    assertTrue(
        new OrganizationRoleClaimsMatcher(charles_expected)
            .matches(all_users_actual.get(CHARLES.getUsername())));
    assertTrue(
        new OrganizationRoleClaimsMatcher(diane_expected)
            .matches(all_users_actual.get(DIANE.getUsername())));
  }

  @Test
  void deactivateUser() {
    _repo.createUser(AMOS, ABC, Set.of(ABC_1), Set.of(OrganizationRole.USER));
    _repo.createUser(
        BRAD,
        ABC,
        Set.of(ABC_2),
        Set.of(OrganizationRole.ENTRY_ONLY, OrganizationRole.ALL_FACILITIES));
    _repo.setUserIsActive(AMOS.getUsername(), false);

    assertEquals(_repo.getOrganizationRoleClaimsForUser(AMOS.getUsername()), Optional.empty());
    assertTrue(_repo.getAllUsersForOrganization(ABC).containsKey(BRAD.getUsername()));
    assertFalse(_repo.getAllUsersForOrganization(ABC).containsKey(AMOS.getUsername()));
  }

  @Test
  void deleteOrgAndFacilities() {
    _repo.createUser(AMOS, ABC, Set.of(ABC_1), Set.of(OrganizationRole.USER));
    _repo.createUser(
        BRAD,
        ABC,
        Set.of(ABC_2),
        Set.of(OrganizationRole.ENTRY_ONLY, OrganizationRole.ALL_FACILITIES));
    _repo.deleteFacility(ABC_1);

    OrganizationRoleClaims amos_expected =
        new OrganizationRoleClaims(
            ABC.getExternalId(), Set.of(), Set.of(OrganizationRole.MEMBER, OrganizationRole.USER));

    assertTrue(
        new OrganizationRoleClaimsMatcher(amos_expected)
            .matches(_repo.getOrganizationRoleClaimsForUser(AMOS.getUsername()).get()));
    assertTrue(_repo.getAllUsersForOrganization(ABC).containsKey(AMOS.getUsername()));
    assertTrue(_repo.getAllUsersForOrganization(ABC).containsKey(BRAD.getUsername()));

    _repo.deleteOrganization(ABC);

    assertThrows(
        IllegalGraphqlArgumentException.class, () -> _repo.getAllUsersForOrganization(ABC));
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
