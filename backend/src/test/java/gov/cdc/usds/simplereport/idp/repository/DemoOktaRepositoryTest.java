package gov.cdc.usds.simplereport.idp.repository;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.idp.repository.DemoOktaRepository;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

import org.springframework.context.annotation.Import;

import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;

@SpringBootTest(properties = {
    "spring.main.web-application-type=NONE"
})
@Import(SliceTestConfiguration.class)
class DemoOktaRepositoryTest {

    private static final IdentityAttributes AMOS = new IdentityAttributes("aquint@gmail.com", "Amos", null, "Quint", null);
    private static final IdentityAttributes BRAD = new IdentityAttributes("bzj@msn.com", "Bradley", "Z.", "Jones", "Jr.");
    private static final IdentityAttributes CHARLES = new IdentityAttributes("charles@gmail.com", "Charles", null, "Albemarle", "Sr.");

    private static final Organization ABC = new Organization("ABC Network", "ABC");
    private static final Organization DEF = new Organization("DEF Alliance", "DEF");
    private static final Organization GHI = new Organization("GHI National", "GHI");

    @Autowired
    private DemoOktaRepository _repo;

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

        _repo.createOrganization(ABC.getOrganizationName(), ABC.getExternalId());
        _repo.createUser(AMOS, ABC);
        assertTrue(_repo.getAllUsernamesForOrganization(ABC, OrganizationRole.getDefault()).contains(AMOS.getUsername()));
    }

    @Test
    void updateUser() {

        _repo.createOrganization(DEF.getOrganizationName(), DEF.getExternalId());
        _repo.createUser(AMOS, DEF);
        _repo.updateUser(AMOS.getUsername(), BRAD);
        assertFalse(_repo.getAllUsernamesForOrganization(DEF, OrganizationRole.getDefault()).contains(AMOS.getUsername()));
        assertTrue(_repo.getAllUsernamesForOrganization(DEF, OrganizationRole.getDefault()).contains(BRAD.getUsername()));
    }

    @Test
    void updateUserRole() {

        _repo.createOrganization(DEF.getOrganizationName(), DEF.getExternalId());
        _repo.createUser(AMOS, DEF);
        assertEquals(_repo.updateUserRole(AMOS.getUsername(), DEF, OrganizationRole.ENTRY_ONLY).get().getGrantedRoles(), 
                     Set.of(OrganizationRole.USER, OrganizationRole.ENTRY_ONLY));
        assertTrue(_repo.getAllUsernamesForOrganization(DEF, OrganizationRole.getDefault()).contains(AMOS.getUsername()));
        assertTrue(_repo.getAllUsernamesForOrganization(DEF, OrganizationRole.ENTRY_ONLY).contains(AMOS.getUsername()));
        assertEquals(_repo.getOrganizationRoleClaimsForUser(AMOS.getUsername()).get().getGrantedRoles(),
                     Set.of(OrganizationRole.USER, OrganizationRole.ENTRY_ONLY));
    }

    @Test
    void getOrganizationRoleClaimsForUser() {
        _repo.createOrganization(GHI.getOrganizationName(), GHI.getExternalId());
        _repo.createUser(CHARLES, GHI);

        Optional<OrganizationRoleClaims> actual = _repo.getOrganizationRoleClaimsForUser(CHARLES.getUsername());
        Optional<OrganizationRoleClaims> expected = Optional.of(new OrganizationRoleClaims(GHI.getExternalId(),
                                                                Set.of(OrganizationRole.getDefault())));
        assertTrue(actual.isPresent());
        assertEquals(actual.get().getOrganizationExternalId(), expected.get().getOrganizationExternalId());
        assertEquals(actual.get().getGrantedRoles(), expected.get().getGrantedRoles());
    }

    @Test
    void getAllUsernamesForOrganization() {
        _repo.createOrganization(GHI.getOrganizationName(), GHI.getExternalId());
        _repo.createUser(BRAD, GHI);
        _repo.createUser(CHARLES, GHI);
        assertEquals(_repo.updateUserRole(CHARLES.getUsername(), GHI, OrganizationRole.ENTRY_ONLY).get().getGrantedRoles(),
                     Set.of(OrganizationRole.USER, OrganizationRole.ENTRY_ONLY));

        Set<String> userUsernames = _repo.getAllUsernamesForOrganization(GHI, OrganizationRole.USER);
        assertTrue(userUsernames.contains(BRAD.getUsername()));
        assertTrue(userUsernames.contains(CHARLES.getUsername()));
        Set<String> entryUsernames = _repo.getAllUsernamesForOrganization(GHI, OrganizationRole.ENTRY_ONLY);
        assertFalse(entryUsernames.contains(BRAD.getUsername()));
        assertTrue(entryUsernames.contains(CHARLES.getUsername()));
        Set<String> adminUsernames = _repo.getAllUsernamesForOrganization(GHI, OrganizationRole.ADMIN);
        assertFalse(adminUsernames.contains(BRAD.getUsername()));
        assertFalse(adminUsernames.contains(CHARLES.getUsername()));
    }

    @Test
    void deactivateUser() {
        _repo.createOrganization(GHI.getOrganizationName(), GHI.getExternalId());
        _repo.createUser(BRAD, GHI);
        _repo.createUser(CHARLES, GHI);
        _repo.setUserIsActive(CHARLES.getUsername(), false);

        assertEquals(_repo.getOrganizationRoleClaimsForUser(CHARLES.getUsername()),
                     Optional.empty());
        Set<String> userUsernames = _repo.getAllUsernamesForOrganization(GHI, OrganizationRole.USER);
        assertTrue(userUsernames.contains(BRAD.getUsername()));
        assertFalse(userUsernames.contains(CHARLES.getUsername()));
    }
}