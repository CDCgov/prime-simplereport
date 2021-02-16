package gov.cdc.usds.simplereport.idp.repository;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;

import java.util.Optional;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

class OktaRepositoryTest {

    private static final IdentityAttributes AMOS = new IdentityAttributes("aquint@gmail.com", "Amos", null, "Quint", null);
    private static final IdentityAttributes BRAD = new IdentityAttributes("bzj@msn.com", "Bradley", "Z.", "Jones", "Jr.");
    private static final IdentityAttributes CHARLES = new IdentityAttributes("charles@gmail.com", "Charles", null, "Albemarle", "Sr.");

    private static final Organization ABC = new Organization("ABC Network", "ABC");
    private static final Organization DEF = new Organization("DEF Alliance", "DEF");
    private static final Organization GHI = new Organization("GHI National", "GHI");

    @Autowired
    private OktaRepository _repo;

    @Disabled
    @Test
    void createOrganizationAndUser() {

        _repo.createOrganization(ABC.getOrganizationName(), ABC.getExternalId());
        _repo.createUser(AMOS, ABC.getExternalId());
        assertTrue(_repo.getAllUsernamesForOrganization(ABC, OrganizationRole.USER).contains(AMOS.getUsername()));
    }

    @Disabled
    @Test
    void updateUser() {

        _repo.createOrganization(DEF.getOrganizationName(), DEF.getExternalId());
        _repo.createUser(AMOS, DEF.getExternalId());
        _repo.updateUser(AMOS.getUsername(), BRAD);
        assertFalse(_repo.getAllUsernamesForOrganization(DEF, OrganizationRole.USER).contains(AMOS.getUsername()));
        assertTrue(_repo.getAllUsernamesForOrganization(DEF, OrganizationRole.USER).contains(BRAD.getUsername()));
    }

    @Disabled
    @Test
    void getOrganizationRoleClaimsForUser() {
        _repo.createOrganization(GHI.getOrganizationName(), GHI.getExternalId());
        _repo.createUser(CHARLES, GHI.getExternalId());

        assertEquals(_repo.getOrganizationRoleClaimsForUser(CHARLES.getUsername()),
                     Optional.of(new OrganizationRoleClaims(GHI.getExternalId(),
                                                            Set.of(OrganizationRole.USER))));
    }
}