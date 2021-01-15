package gov.cdc.usds.simplereport.service;

import org.springframework.stereotype.Service;

import java.util.Map; 
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Value;

import com.okta.sdk.client.Client;
import com.okta.sdk.client.Clients;
import com.okta.sdk.resource.user.User;
import com.okta.sdk.resource.user.UserBuilder;
import com.okta.sdk.resource.group.GroupList;
import com.okta.sdk.resource.group.GroupType;
import com.okta.sdk.resource.group.GroupBuilder;
import com.okta.sdk.authc.credentials.TokenClientCredentials;

import gov.cdc.usds.simplereport.db.model.ApiUser;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;

/**
 * Handles all user/organization management in Okta
 */
@Service
public class OktaService {

    @Value("${okta.entity-mgmt.org-url}")
    private String ORG_URL;
    @Value("${OKTA_API_KEY}")
    private String API_TOKEN;
    @Value("${simple-report.authorization.role-prefix}")
    private String ROLE_PREFIX;

    Client _client;


    public OktaService() {
        _client = Clients.builder()
            .setOrgUrl("https://hhs-prime.okta.com") // TODO: replace with ORG_URL) 
            .setClientCredentials(new TokenClientCredentials("***REMOVED***")) // TODO: replace with API_TOKEN
            .build();
    }

    public void createUser(ApiUser apiUser) {
        Map<String,Object> userProfileMap = new HashMap<String,Object>();
        userProfileMap.put("firstName",apiUser.getNameInfo().getFirstName());
        userProfileMap.put("middleName",apiUser.getNameInfo().getMiddleName());
        userProfileMap.put("lastName",apiUser.getNameInfo().getLastName());
        // This is cheating. Suffix and honorific suffix aren't the same thing. Shhh.
        userProfileMap.put("honorificSuffix",apiUser.getNameInfo().getSuffix());
        // We assume login == email
        userProfileMap.put("email",apiUser.getLoginEmail());
        userProfileMap.put("login",apiUser.getLoginEmail());

        UserBuilder.instance()
                .setProfileProperties(userProfileMap)
                .buildAndCreate(_client);
    }

    public void updateUser(String oldUsername, ApiUser apiUser) {
        User user = _client.listUsers(oldUsername, null, null, null, null).single();
        user.getProfile().setFirstName(apiUser.getNameInfo().getFirstName());
        user.getProfile().setMiddleName(apiUser.getNameInfo().getMiddleName());
        user.getProfile().setLastName(apiUser.getNameInfo().getLastName());
        // Is it our fault we don't accommodate honorific suffix? Or Okta's fault they 
        // don't have regular suffix? You decide.
        user.getProfile().setHonorificSuffix(apiUser.getNameInfo().getSuffix());
        // We assume login == email
        user.getProfile().setEmail(apiUser.getLoginEmail());
        user.getProfile().setLogin(apiUser.getLoginEmail());
        user.update();
    }

    public void createOrganization(String externalId, String name) {
        for (OrganizationRole role : OrganizationRole.values()) {
            GroupBuilder.instance()
            .setName(generateGroupName(externalId, role))
            .setDescription(generateGroupDescription(name, role))
            .buildAndCreate(_client);
        }
    }

    public void addUserToOrganization(ApiUser apiUser, String organizationExternalId) {
        User user = _client.listUsers(apiUser.getLoginEmail(), null, null, null, null).single();
        String userId = user.getId();
        // We assume that a user can only be a member of one organization at a time;
        // if user is in any groups, remove that association first
        GroupList oldGroups = user.listGroups();
        oldGroups.forEach(g->{
            System.out.print(g.toString());
            if (g.getType() == GroupType.OKTA_GROUP && g.getProfile().getName().endsWith(":USER")) {
                g.removeUser(userId);
            }
        });
        // Okta SDK's way of adding a user to a group by group name
        String groupName = generateGroupName(organizationExternalId, OrganizationRole.USER);
        GroupList groups = _client.listGroups(groupName, null, null);
        groups.forEach(g->{
            if (groupName.equals(g.getProfile().getName())) {
                user.addToGroup(g.getId());
            }
        });
    }

    private String generateGroupName(String externalId, OrganizationRole role) {
        String suffix = (role == OrganizationRole.ADMIN ) ? ":ADMIN" :
                        (role == OrganizationRole.USER  ) ? ":USER"  :
                                                            ":OTHER";
        return ROLE_PREFIX + externalId + suffix;
    }

    private String generateGroupDescription(String groupDesc, OrganizationRole role) {
        String suffix = (role == OrganizationRole.ADMIN ) ? " - Admins" :
                        (role == OrganizationRole.USER  ) ? " - Users"  :
                                                            " - Other";
        return groupDesc + suffix;
    }

}