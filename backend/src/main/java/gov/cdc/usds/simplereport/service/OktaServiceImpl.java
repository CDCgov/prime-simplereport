package gov.cdc.usds.simplereport.service;

import org.springframework.stereotype.Component;

import java.util.Map; 
import java.util.HashMap; 

import com.okta.spring.boot.sdk.config.OktaClientProperties;
import com.okta.sdk.client.Client;
import com.okta.sdk.client.Clients;
import com.okta.sdk.resource.user.User;
import com.okta.sdk.resource.user.UserList;
import com.okta.sdk.resource.user.UserBuilder;
import com.okta.sdk.resource.group.Group;
import com.okta.sdk.resource.group.GroupList;
import com.okta.sdk.resource.group.GroupType;
import com.okta.sdk.resource.group.GroupBuilder;
import com.okta.sdk.authc.credentials.TokenClientCredentials;

import gov.cdc.usds.simplereport.api.model.errors.IllegalGraphqlArgumentException;

import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;

/**
 * Created by jeremyzitomer-usds on 1/7/21
 * 
 * Handles all user/organization management in Okta
 */
@Component
public class OktaServiceImpl implements OktaService {

    private String _rolePrefix;
    private Client _client;

    public OktaServiceImpl(AuthorizationProperties authorizationProperties,
                       OktaClientProperties oktaClientProperties) {
        _rolePrefix = authorizationProperties.getRolePrefix();
        _client = Clients.builder()
                .setOrgUrl(oktaClientProperties.getOrgUrl())
                .setClientCredentials(new TokenClientCredentials(oktaClientProperties.getToken()))
                .build();
    }

    public void createUser(IdentityAttributes userIdentity, String organizationExternalId) {
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

        // Okta SDK's way of getting a group by group name
        String groupName = generateGroupName(organizationExternalId, OrganizationRole.USER);
        GroupList groups = _client.listGroups(groupName, null, null);
        if (!groups.iterator().hasNext()) {
            throw new IllegalGraphqlArgumentException("Cannot add Okta user to nonexistent group");
        }
        Group group = groups.single();

        UserBuilder.instance()
                .setProfileProperties(userProfileMap)
                .setGroups(group.getId())
                .buildAndCreate(_client);
    }

    public void updateUser(String oldUsername, IdentityAttributes userIdentity) {
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
    public String getOrganizationExternalIdForUser(String username) {
        UserList users = _client.listUsers(username, null, null, null, null);
        if (!users.iterator().hasNext()) {
            throw new IllegalGraphqlArgumentException("Cannot get org external ID for nonexistent user");
        }
        User user = users.single();

        for (Group g : user.listGroups()) {
            String groupName = g.getProfile().getName();
            // We assume that a user is only a member of one user group
            if (g.getType() == GroupType.OKTA_GROUP &&
                    groupName.startsWith(_rolePrefix) &&
                    groupName.endsWith(generateRoleSuffix(OrganizationRole.USER))) {
                return getOrganizationExternalIdFromGroupName(groupName, 
                                                              OrganizationRole.USER);
            }
        }

        throw new IllegalGraphqlArgumentException("User is not in any Okta user groups");
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
        return String.format("%s - %s", orgName, role.getDescription());
    }

    private String generateRoleSuffix(OrganizationRole role) {
        return ":" + role.name();
    }

}