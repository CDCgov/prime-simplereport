package gov.cdc.usds.simplereport.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

/**
 * Created by jeremyzitomer-usds on 1/7/21
 * 
 * Handles all user/organization management in Okta
 */
public class OktaServiceEmptyImpl implements OktaService {

    Map<String,OrganizationRoleClaims> usernameRolesMap;
    Map<String,Map<OrganizationRole,List<String>>> orgRoleUsernamesMap;

    public OktaServiceEmptyImpl(Map<String,OrganizationRoleClaims> usernameRolesMap) {
        this.usernameRolesMap = usernameRolesMap;
        this.orgRoleUsernamesMap = new HashMap<>();
        for (Map.Entry<String,OrganizationRoleClaims> entry : usernameRolesMap.entrySet()) {
            Map<OrganizationRole,List<String>> roleUsernamesMap = 
                    orgRoleUsernamesMap.getOrDefault(entry.getValue().getOrganizationExternalId(),
                                                     new HashMap<>());
            for (OrganizationRole role : entry.getValue().getGrantedRoles()) {
                List<String> usernames = roleUsernamesMap.getOrDefault(role, new ArrayList<>());
                usernames.add(entry.getKey());
                roleUsernamesMap.put(role, usernames);
            }
            orgRoleUsernamesMap.put(entry.getValue().getOrganizationExternalId(), roleUsernamesMap);
        }
    }

    public void createUser(IdentityAttributes userIdentity, String organizationExternalId) {}

    public void updateUser(String oldUsername, IdentityAttributes userIdentity) {}

    public void updateUserRole(String username, OrganizationRole role) {}

    public List<String> getAllUsernamesForOrganization(String externalId, OrganizationRole role) {
        return orgRoleUsernamesMap.get(externalId).get(role);
    }

    public void createOrganization(String name, String externalId) {}

    public void deleteOrganization(String externalId) {}

    public Optional<OrganizationRoleClaims> getOrganizationRoleClaimsForUser(String username) {
        return Optional.ofNullable(usernameRolesMap.get(username));
    }
}