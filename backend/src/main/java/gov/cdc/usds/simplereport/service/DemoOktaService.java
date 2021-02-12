package gov.cdc.usds.simplereport.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.HashMap;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

/**
 * Created by jeremyzitomer-usds on 1/7/21
 * 
 * Handles all user/organization management in Okta
 */
public class DemoOktaService implements OktaService {

    Map<String,OrganizationRoleClaims> usernameRolesMap;
    Map<String,Map<OrganizationRole,List<String>>> orgRoleUsernamesMap;

    public DemoOktaService(Map<String,OrganizationRoleClaims> usernameOrgRolesMap) {
        this.usernameRolesMap = usernameOrgRolesMap;
        this.orgRoleUsernamesMap = new HashMap<>();
        for (Map.Entry<String,OrganizationRoleClaims> entry : usernameOrgRolesMap.entrySet()) {
            String orgExternalId = entry.getValue().getOrganizationExternalId();
            Map<OrganizationRole,List<String>> roleUsernamesMap = 
                    orgRoleUsernamesMap.getOrDefault(orgExternalId, new HashMap<>());
            for (OrganizationRole role : entry.getValue().getGrantedRoles()) {
                List<String> usernames = roleUsernamesMap.getOrDefault(role, new ArrayList<>());
                usernames.add(entry.getKey());
                roleUsernamesMap.put(role, usernames);
            }
            orgRoleUsernamesMap.put(orgExternalId, roleUsernamesMap);
        }
    }

    public void createUser(IdentityAttributes userIdentity, String organizationExternalId) {}

    public void updateUser(String oldUsername, IdentityAttributes userIdentity) {}

    public List<String> getAllUsernamesForOrganization(Organization org, OrganizationRole role) {
        return orgRoleUsernamesMap.get(org.getExternalId()).get(role);
    }

    public void createOrganization(String name, String externalId) {}

    public void deleteOrganization(String externalId) {}

    public Optional<OrganizationRoleClaims> getOrganizationRolesForUser(String username) {
        return Optional.ofNullable(usernameRolesMap.get(username));
    }
}