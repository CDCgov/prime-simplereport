package gov.cdc.usds.simplereport.idp.repository;

import static org.junit.jupiter.api.Assertions.*;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
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

  private static final Organization ABC = new Organization("ABC Network", "ABC");
  private static final Organization DEF = new Organization("DEF Alliance", "DEF");
  private static final Organization GHI = new Organization("GHI National", "GHI");

  @Autowired private DemoOktaRepository _repo;

  @BeforeEach
  public void setup() {
    _repo.reset();
  }

  @AfterEach
  public void cleanup() {
    _repo.reset();
  }

  @Test
  void createOrganizationAndUser() {

    _repo.createOrganization(ABC);
    _repo.createUser(AMOS, ABC, Optional.empty(), OrganizationRole.USER);
    _repo.createUser(BRAD, ABC, Optional.empty(), OrganizationRole.ENTRY_ONLY);
    assertEquals(_repo.getAllUsersForOrganization(ABC).get(AMOS.getUsername()).getEffectiveRole().get(),
                 OrganizationRole.USER);
    assertEquals(_repo.getAllUsersForOrganization(ABC).get(BRAD.getUsername()).getEffectiveRole().get(),
                 OrganizationRole.ENTRY_ONLY);
  }

  @Test
  void updateUser() {

    _repo.createOrganization(DEF);
    _repo.createUser(AMOS, DEF, Optional.empty(), OrganizationRole.USER);
    _repo.updateUser(AMOS.getUsername(), BRAD);
    assertFalse(_repo.getAllUsersForOrganization(DEF).containsKey(AMOS.getUsername()));
    assertTrue(_repo.getAllUsersForOrganization(DEF).containsKey(BRAD.getUsername()));
  }

  @Test
  void updateUserRole() {

    _repo.createOrganization(DEF);
    _repo.createUser(AMOS, DEF, Optional.empty(), OrganizationRole.USER);
    _repo.createUser(BRAD, DEF, Optional.empty(), OrganizationRole.ENTRY_ONLY);
    assertEquals(
        _repo
            .updateUserRole(AMOS.getUsername(), DEF, OrganizationRole.ENTRY_ONLY)
            .get()
            .getGrantedRoles(),
        Set.of(OrganizationRole.USER, OrganizationRole.ENTRY_ONLY));
    assertEquals(
        _repo
            .updateUserRole(BRAD.getUsername(), DEF, OrganizationRole.ADMIN)
            .get()
            .getGrantedRoles(),
        Set.of(OrganizationRole.USER, OrganizationRole.ADMIN));
    assertEquals(_repo.getAllUsersForOrganization(ABC).get(AMOS.getUsername()).getEffectiveRole().get(),
                 OrganizationRole.ENTRY_ONLY);
    assertEquals(_repo.getAllUsersForOrganization(ABC).get(BRAD.getUsername()).getEffectiveRole().get(),
                 OrganizationRole.ADMIN);
  }

  @Test
  void getOrganizationRoleClaimsForUser() {
    _repo.createOrganization(GHI);
    _repo.createUser(CHARLES, GHI, Optional.empty(), OrganizationRole.USER);

    Optional<OrganizationRoleClaims> actual =
        _repo.getOrganizationRoleClaimsForUser(CHARLES.getUsername());
    Optional<OrganizationRoleClaims> expected =
        Optional.of(
            new OrganizationRoleClaims(GHI.getExternalId(), 
                                       Optional.empty(), 
                                       Set.of(OrganizationRole.getDefault())));
    assertTrue(actual.isPresent());
    assertEquals(
        actual.get().getOrganizationExternalId(), expected.get().getOrganizationExternalId());
    assertEquals(actual.get().getGrantedRoles(), expected.get().getGrantedRoles());

    _repo.createUser(BRAD, GHI, Optional.empty(), OrganizationRole.ADMIN);

    actual = _repo.getOrganizationRoleClaimsForUser(BRAD.getUsername());
    expected =
        Optional.of(
            new OrganizationRoleClaims(GHI.getExternalId(), 
                                       Optional.empty(), 
                                       Set.of(OrganizationRole.USER, OrganizationRole.ADMIN)));
    assertTrue(actual.isPresent());
    assertEquals(
        actual.get().getOrganizationExternalId(), expected.get().getOrganizationExternalId());
    assertEquals(actual.get().getGrantedRoles(), expected.get().getGrantedRoles());
  }

  @Test
  void getAllUsersForOrganization() {
    _repo.createOrganization(GHI);
    _repo.createUser(BRAD, GHI, Optional.empty(), OrganizationRole.USER);
    _repo.createUser(CHARLES, GHI, Optional.empty(), OrganizationRole.ADMIN);
    assertEquals(
        _repo
            .updateUserRole(CHARLES.getUsername(), GHI, OrganizationRole.ENTRY_ONLY)
            .get()
            .getGrantedRoles(),
        Set.of(OrganizationRole.USER, OrganizationRole.ENTRY_ONLY));

    assertEquals(_repo.getAllUsersForOrganization(GHI).get(BRAD.getUsername()).getEffectiveRole().get(),
                 OrganizationRole.USER);
    assertEquals(_repo.getAllUsersForOrganization(GHI).get(CHARLES.getUsername()).getEffectiveRole().get(),
                 OrganizationRole.ENTRY_ONLY);
  }

  @Test
  void deactivateUser() {
    _repo.createOrganization(GHI);
    _repo.createUser(BRAD, GHI, Optional.empty(), OrganizationRole.ENTRY_ONLY);
    _repo.createUser(CHARLES, GHI, Optional.empty(), OrganizationRole.ADMIN);
    _repo.setUserIsActive(CHARLES.getUsername(), false);

    assertEquals(_repo.getOrganizationRoleClaimsForUser(CHARLES.getUsername()), Optional.empty());
    assertTrue(_repo.getAllUsersForOrganization(GHI).containsKey(BRAD.getUsername()));
    assertFalse(_repo.getAllUsersForOrganization(GHI).containsKey(CHARLES.getUsername()));
  }
}
