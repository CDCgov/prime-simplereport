package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Disabled;

import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;

import com.okta.sdk.resource.user.User;
import com.okta.sdk.resource.group.Group;
import com.okta.sdk.resource.ResourceException;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;

import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

class OktaServiceTest extends BaseServiceTest<OktaService> {

    private static final IdentityAttributes AMOS = new IdentityAttributes("aquint@gmail.com", "Amos", null, "Quint", null);
    private static final IdentityAttributes BRAD = new IdentityAttributes("bzj@msn.com", "Bradley", "Z.", "Jones", "Jr.");
    private static final IdentityAttributes CHARLES = new IdentityAttributes("charles@gmail.com", "Charles", null, "Albemarle", "Sr.");
    private static final IdentityAttributes DEXTER = new IdentityAttributes("djones@msn.com", "Dexter", null, "Jones", null);
    private static final IdentityAttributes ELIZABETH = new IdentityAttributes("em@leo.gov", "Elizabeth", null, "Merriwether", null);
    private static final IdentityAttributes FRANK = new IdentityAttributes("bones@cdc.gov", "Frank", null, "Bones", "3");
    // has the same email as FRANK
    private static final IdentityAttributes GEORGE = new IdentityAttributes("bones@cdc.gov", "George", "Harry", "Bones", "Jr");  
    private static final Set<String> USERNAMES = Set.of(AMOS.getUsername(),
                                                        BRAD.getUsername(),
                                                        CHARLES.getUsername(),
                                                        DEXTER.getUsername(),
                                                        ELIZABETH.getUsername(),
                                                        FRANK.getUsername());

    private static final Organization ABC = new Organization("ABC Network", "ABC");
    private static final Organization DEF = new Organization("DEF Alliance", "DEF");
    private static final Organization GHI = new Organization("GHI National", "GHI");
    // same external ID as GHI
    private static final Organization GHI_DUP = new Organization("GHI Duplicate", "GHI");

    @Autowired
    private OktaService _service;

    @Override
    protected Set<String> getOktaTestUsernames() {
        return USERNAMES;
    }

    @Disabled
    @Test
    void createOrganizationAndUser() {

        _service.createOrganization(ABC.getOrganizationName(), ABC.getExternalId());
        _service.createUser(AMOS, ABC.getExternalId());

        String expectedGroupName = _authorizationProperties.getRolePrefix() +
                ABC.getExternalId() +
                ":" + OrganizationRole.USER.name();
        String expectedGroupDescription = ABC.getOrganizationName() +
                " - " + OrganizationRole.USER.getDescription();

        Group group = _oktaClient.listGroups(expectedGroupName, null, null).single();
        assertEquals(group.getProfile().getName(), expectedGroupName);
        assertEquals(group.getProfile().getDescription(), expectedGroupDescription);

        User user = _oktaClient.listUsers(AMOS.getUsername(), null, null, null, null).single();
        assertEquals(user.getProfile().getFirstName(), AMOS.getFirstName());
        assertEquals(user.getProfile().getMiddleName(), AMOS.getMiddleName());
        assertEquals(user.getProfile().getLastName(), AMOS.getLastName());
        assertEquals(user.getProfile().getHonorificSuffix(), AMOS.getSuffix());
        assertEquals(user.getProfile().getLogin(), AMOS.getUsername());
        assertEquals(user.getProfile().getEmail(), AMOS.getUsername());

        Boolean userInExpectedGroup = false;
        for (Group g : user.listGroups()) {
            if (g.getProfile().getName().equals(expectedGroupName)) {
                userInExpectedGroup |= true;
            }
        }
        assertTrue(userInExpectedGroup);
    }

    @Disabled
    @Test
    void updateUser() {

        _service.createOrganization(DEF.getOrganizationName(), DEF.getExternalId());
        _service.createUser(AMOS, DEF.getExternalId());
        _service.updateUser(AMOS.getUsername(), BRAD);

        String expectedGroupName = _authorizationProperties.getRolePrefix() +
                DEF.getExternalId() +
                ":" + OrganizationRole.USER.name();

        User user = _oktaClient.listUsers(BRAD.getUsername(), null, null, null, null).single();
        assertEquals(user.getProfile().getFirstName(), BRAD.getFirstName());
        assertEquals(user.getProfile().getMiddleName(), BRAD.getMiddleName());
        assertEquals(user.getProfile().getLastName(), BRAD.getLastName());
        assertEquals(user.getProfile().getHonorificSuffix(), BRAD.getSuffix());
        assertEquals(user.getProfile().getLogin(), BRAD.getUsername());
        assertEquals(user.getProfile().getEmail(), BRAD.getUsername());

        Boolean userInExpectedGroup = false;
        for (Group g : user.listGroups()) {
            if (g.getProfile().getName().equals(expectedGroupName)) {
                userInExpectedGroup |= true;
            }
        }
        assertTrue(userInExpectedGroup);

        Boolean oldUserExists = false;
        for (User u : _oktaClient.listUsers()) {
            if (u.getProfile().getLogin().equals(AMOS.getUsername())) {
                oldUserExists |= true;
            }
        }
        assertFalse(oldUserExists);
    }

    @Disabled
    @Test
    void getOrganizationExternalIdForUser() {
        _service.createOrganization(GHI.getOrganizationName(), GHI.getExternalId());
        _service.createUser(CHARLES, GHI.getExternalId());

        assertEquals(_service.getOrganizationExternalIdForUser(CHARLES.getUsername()),GHI.getExternalId());
    }

    @Disabled
    @Test
    void createUser_duplicateUsernames() {
        _service.createOrganization(ABC.getOrganizationName(), ABC.getExternalId());
        _service.createUser(FRANK, ABC.getExternalId());

        assertThrows(ResourceException.class, () -> {
            _service.createUser(GEORGE, ABC.getExternalId());
        });

        Boolean originalUserExists = false;
        Boolean duplicateUserExists = false;
        for (User u : _oktaClient.listUsers()) {
            if (u.getProfile().getFirstName().equals(FRANK.getFirstName())) {
                originalUserExists |= true;
            } else if (u.getProfile().getFirstName().equals(GEORGE.getFirstName())) {
                duplicateUserExists |= true;
            }
        }
        assertTrue(originalUserExists);
        assertFalse(duplicateUserExists);
    }

    @Disabled
    @Test
    void createOrganization_duplicateExternalIds() {
        _service.createOrganization(GHI.getOrganizationName(), GHI.getExternalId());
        assertThrows(ResourceException.class, () -> {
            _service.createOrganization(GHI_DUP.getOrganizationName(), GHI_DUP.getExternalId());
        });

        // group name would be the same for both organizations
        String expectedGroupName = _authorizationProperties.getRolePrefix() +
                GHI.getExternalId() +
                ":" + OrganizationRole.USER.name();
        String expectedOriginalGroupDescription = GHI.getOrganizationName() +
                " - " + OrganizationRole.USER.getDescription();
        String expectedDuplicateGroupDescription = GHI_DUP.getOrganizationName() +
                " - " + OrganizationRole.USER.getDescription();

        Boolean originalGroupExists = false;
        Boolean duplicateGroupExists = false;
        for (Group g : _oktaClient.listGroups()) {
            if (g.getProfile().getName().equals(expectedGroupName)) {
                if (g.getProfile().getDescription().equals(expectedOriginalGroupDescription)) {
                    originalGroupExists |= true;
                } else if (g.getProfile().getDescription().equals(expectedDuplicateGroupDescription)) {
                    duplicateGroupExists |= true;
                }
            }
        }

        assertTrue(originalGroupExists);
        assertFalse(duplicateGroupExists);
    }
}