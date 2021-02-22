package gov.cdc.usds.simplereport.idp.repository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;
import java.util.Set;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import com.okta.spring.boot.sdk.config.OktaClientProperties;
import com.okta.sdk.client.Client;
import com.okta.sdk.client.Clients;
import com.okta.sdk.resource.user.User;
import com.okta.sdk.resource.user.UserList;
import com.okta.sdk.resource.user.UserStatus;
import com.okta.sdk.resource.user.UserBuilder;
import com.okta.sdk.resource.group.Group;
import com.okta.sdk.resource.group.GroupList;
import com.okta.sdk.resource.group.GroupType;
import com.okta.sdk.resource.group.GroupBuilder;
import com.okta.sdk.authc.credentials.TokenClientCredentials;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;

import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;

/**
 * Created by jeremyzitomer-usds on 1/7/21
 * 
 * Handles all user/organization management in Okta
 */
@Profile("!"+BeanProfiles.NO_OKTA_MGMT)
@Service
public class LiveOktaRepository implements OktaRepository {

    private static final Logger LOG = LoggerFactory.getLogger(LiveOktaRepository.class);

    private String _rolePrefix;
    private Client _client;

    public LiveOktaRepository(AuthorizationProperties authorizationProperties,
                       OktaClientProperties oktaClientProperties) {
        _rolePrefix = authorizationProperties.getRolePrefix();
        _client = Clients.builder()
                .setOrgUrl(oktaClientProperties.getOrgUrl())
                .setClientCredentials(new TokenClientCredentials(oktaClientProperties.getToken()))
                .build();
    }

    public Optional<OrganizationRoleClaims> createUser(IdentityAttributes userIdentity, Organization org, OrganizationRole role) {
        // need to validate fields before adding them because Maps don't like nulls
        Map<String,Object> userProfileMap = new HashMap<String, Object>();
        if (userIdentity.getFirstName() != null && !userIdentity.getFirstName().isEmpty()) {
            userProfileMap.put("firstName", userIdentity.getFirstName());
        }
        if (userIdentity.getMiddleName() != null && !userIdentity.getMiddleName().isEmpty()) {
            userProfileMap.put("middleName", userIdentity.getMiddleName());
        }
        if (userIdentity.getLastName() != null && !userIdentity.getLastName().isEmpty()) {
            userProfileMap.put("lastName", userIdentity.getLastName());
        } else {
            // last name is required
            throw new IllegalGraphqlArgumentException("Cannot create Okta user without last name");
        }
        if (userIdentity.getSuffix() != null && !userIdentity.getSuffix().isEmpty()) {
            userProfileMap.put("honorificSuffix", userIdentity.getSuffix());
        }
        if (userIdentity.getUsername() != null && !userIdentity.getUsername().isEmpty()) {
            // we assume login == email
            userProfileMap.put("email", userIdentity.getUsername());
            userProfileMap.put("login", userIdentity.getUsername());
        } else {
            // username is required
            throw new IllegalGraphqlArgumentException("Cannot create Okta user without username");
        }

        // By default, when creating a user, we give them privileges of a standard user
        String organizationExternalId = org.getExternalId();
        Set<OrganizationRole> roles = EnumSet.of(OrganizationRole.USER, role);
        Set<String> groupIds = new HashSet<>();
        
        for (OrganizationRole r : roles) {
            String groupName = generateGroupName(organizationExternalId, r);

            // Okta SDK's way of getting a group by group name
            GroupList groups = _client.listGroups(groupName, null, null);
            if (!groups.iterator().hasNext()) {
                throw new IllegalGraphqlArgumentException(
                        String.format("Cannot add Okta user to nonexistent group=%s", groupName));
            }
            Group group = groups.single();
            groupIds.add(group.getId());
        }

        UserBuilder.instance()
                .setProfileProperties(userProfileMap)
                .setGroups(groupIds)
                .buildAndCreate(_client);

        return Optional.of(new OrganizationRoleClaims(organizationExternalId, roles));
    }

    public List<String> getAllUsernamesForOrganization(Organization org, OrganizationRole role) {
        String groupName = generateGroupName(org.getExternalId(), role);

        GroupList groups = _client.listGroups(groupName, null, null);
        if (!groups.iterator().hasNext()) {
            LOG.warn("Okta group for org={}, role={} is nonexistent; returning zero usernames",
                     org.getExternalId(), role.name());
            return List.of();
        }
        Group group = groups.single();
        return group.listUsers().stream()
                .map(u -> u.getProfile().getEmail())
                .collect(Collectors.toList());
    }

    public Optional<OrganizationRoleClaims> updateUser(String oldUsername, IdentityAttributes userIdentity) {

        UserList users = _client.listUsers(oldUsername, null, null, null, null);
        if (!users.iterator().hasNext()) {
            throw new IllegalGraphqlArgumentException("Cannot update Okta user with unrecognized username");
        }
        User user = users.single();
        user.getProfile().setFirstName(userIdentity.getFirstName());
        user.getProfile().setMiddleName(userIdentity.getMiddleName());
        user.getProfile().setLastName(userIdentity.getLastName());
        // Is it our fault we don't accommodate honorific suffix? Or Okta's fault they 
        // don't have regular suffix? You decide.
        user.getProfile().setHonorificSuffix(userIdentity.getSuffix());
        // We assume login == email
        user.getProfile().setEmail(userIdentity.getUsername());
        user.getProfile().setLogin(userIdentity.getUsername());
        user.update();

        return getOrganizationRoleClaimsForUser(user);
    }

    public OrganizationRole updateUserRole(String username, Organization org, OrganizationRole role) {
        UserList users = _client.listUsers(username, null, null, null, null);
        if (!users.iterator().hasNext()) {
            throw new IllegalGraphqlArgumentException("Cannot update role of Okta user with unrecognized username");
        }
        User user = users.single();

        String orgId = org.getExternalId();

        // Remove user from old groups
        for (Group g : user.listGroups()) {
            String groupName = g.getProfile().getName();
            for (OrganizationRole r : OrganizationRole.values()) {
                // if this Okta group matches the target environment, organization, and is a
                // non-USER group, remove the target user
                if (g.getType().equals(GroupType.OKTA_GROUP) &&
                            groupName.startsWith(_rolePrefix) &&
                            groupName.endsWith(generateRoleSuffix(r)) &&
                            orgId.equals(getOrganizationExternalIdFromGroupName(groupName, r)) &&
                            !r.equals(OrganizationRole.USER)) {
                    g.removeUser(user.getId());
                    break;
                }
            }
        }

        // Add user to new group
        String groupName = generateGroupName(orgId, role);

        // Okta SDK's way of getting a group by group name
        GroupList groups = _client.listGroups(groupName, null, null);
        if (!groups.iterator().hasNext()) {
            throw new IllegalGraphqlArgumentException("Cannot add Okta user to nonexistent group");
        }
        Group group = groups.single();
        user.addToGroup(group.getId());

        return role;
    }

    public void setUserIsActive(String username, Boolean active) {
        UserList users = _client.listUsers(username, null, null, null, null);
        if (!users.iterator().hasNext()) {
            throw new IllegalGraphqlArgumentException("Cannot update active status of Okta user with unrecognized username");
        }
        User user = users.single();
        if (active && user.getStatus().equals(UserStatus.SUSPENDED)) {
            user.unsuspend();
        } else if (!active && !user.getStatus().equals(UserStatus.SUSPENDED)) {
            user.suspend();
        }
    }

    public void createOrganization(String name, String externalId) {
        for (OrganizationRole role : OrganizationRole.values()) {
            GroupBuilder.instance()
            .setName(generateGroupName(externalId, role))
            .setDescription(generateGroupDescription(name, role))
            .buildAndCreate(_client);
        }
    }

    public void deleteOrganization(String externalId) {
        for (OrganizationRole role : OrganizationRole.values()) {
            String groupName = generateGroupName(externalId, role);
            GroupList groups = _client.listGroups(groupName, null, null);
            if (groups.iterator().hasNext()) {
                Group group = groups.single();
                group.delete();
            }
        }
    }

    // returns the external ID of the organization the specified user belongs to
    public Optional<OrganizationRoleClaims> getOrganizationRoleClaimsForUser(String username) {

        UserList users = _client.listUsers(username, null, null, null, null);
        if (!users.iterator().hasNext()) {
            throw new IllegalGraphqlArgumentException("Cannot get org external ID for nonexistent user");
        }
        User user = users.single();
        if (user.getStatus().equals(UserStatus.SUSPENDED)) {
            throw new IllegalGraphqlArgumentException("Cannot get org external ID for suspended user");
        }

        return getOrganizationRoleClaimsForUser(user);
    }

    private Optional<OrganizationRoleClaims> getOrganizationRoleClaimsForUser(User user) {
        Set<String> orgExternalIds = new HashSet<>();
        Set<OrganizationRole> roles = new HashSet<>();

        for (Group g : user.listGroups()) {
            String groupName = g.getProfile().getName();
            for (OrganizationRole role : OrganizationRole.values()) {
                if (g.getType().equals(GroupType.OKTA_GROUP) &&
                            groupName.startsWith(_rolePrefix) &&
                            groupName.endsWith(generateRoleSuffix(role))) {
                    orgExternalIds.add(getOrganizationExternalIdFromGroupName(groupName, role));
                    roles.add(role);
                    break;
                }
            }
        }

        if (orgExternalIds.size() != 1) {
            LOG.warn("User is in {} Okta organizations, not 1", orgExternalIds.size());
            return Optional.empty();
        }

        String orgExternalId = orgExternalIds.stream().collect(Collectors.toList()).get(0);
        return Optional.of(new OrganizationRoleClaims(orgExternalId, roles));
    }

    private String generateGroupName(String externalId, OrganizationRole role) {
        return String.format("%s%s%s", _rolePrefix, externalId, generateRoleSuffix(role));
    }

    private String getOrganizationExternalIdFromGroupName(String groupName, OrganizationRole role) {
        int roleSuffixOffset = groupName.lastIndexOf(generateRoleSuffix(role));
        String externalId = groupName.substring(_rolePrefix.length(), roleSuffixOffset);
        return externalId;
    }

    private String generateGroupDescription(String orgName, OrganizationRole role) {
        return String.format("%s - %ss", orgName, role.getDescription());
    }

    private String generateRoleSuffix(OrganizationRole role) {
        return ":" + role.name();
    }

}