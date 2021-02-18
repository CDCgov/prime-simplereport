package gov.cdc.usds.simplereport.idp.repository;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.HashSet;
import java.util.HashMap;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration.DemoUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

/**
 * Handles all user/organization management in Okta
 */
@Profile(BeanProfiles.NO_OKTA_MGMT)
@Service
public class DemoOktaRepository implements OktaRepository {

    private static final Logger LOG = LoggerFactory.getLogger(DemoOktaRepository.class);

    DemoUserConfiguration demoUsers;
    Map<String,OrganizationRoleClaims> usernameOrgRolesMap;
    Map<String,Map<OrganizationRole,List<String>>> orgRoleUsernamesMap;
    Set<String> inactiveUsernames;

    public DemoOktaRepository(DemoUserConfiguration demoUsers) {
        this.demoUsers = demoUsers;
        this.usernameOrgRolesMap = new HashMap<>();
        this.orgRoleUsernamesMap = new HashMap<>();
        this.inactiveUsernames = new HashSet<>();

        reset();

        LOG.info("Done initializing Demo Okta service.");
    }

    private void initDemoUser(DemoUser demoUser) {
        IdentityAttributes user = demoUser.getIdentity();
        String username = user.getUsername();
        String orgExternalId = demoUser.getAuthorization().getOrganizationExternalId();
        Set<OrganizationRole> roles = new HashSet<>();
        roles.add(OrganizationRole.USER);
        roles.addAll(demoUser.getAuthorization().getGrantedRoles());
        OrganizationRoleClaims orgRoles = new OrganizationRoleClaims(orgExternalId, roles);

        usernameOrgRolesMap.put(username, orgRoles);

        Map<OrganizationRole,List<String>> roleUsernamesMap = 
                orgRoleUsernamesMap.getOrDefault(orgExternalId, new HashMap<>());
        for (OrganizationRole role : roles) {
            List<String> usernames = roleUsernamesMap.getOrDefault(role, new ArrayList<>());
            usernames.add(username);
            roleUsernamesMap.put(role, usernames);
        }

        orgRoleUsernamesMap.put(orgExternalId, roleUsernamesMap);
    }

    // Does not overwrite demo users who were created on initialization
    public void createUser(IdentityAttributes userIdentity, Organization org) {
        String organizationExternalId = org.getExternalId();
        OrganizationRoleClaims orgRoles = new OrganizationRoleClaims(organizationExternalId, 
                                                                     Set.of(OrganizationRole.USER));
        usernameOrgRolesMap.putIfAbsent(userIdentity.getUsername(), orgRoles);

        Map<OrganizationRole,List<String>> roleUsernamesMap = orgRoleUsernamesMap.get(organizationExternalId);
        List<String> usernames = roleUsernamesMap.get(OrganizationRole.USER);
        if (!usernames.contains(userIdentity.getUsername())) {
            usernames.add(userIdentity.getUsername());
        }
    }

    public void updateUser(String oldUsername, IdentityAttributes userIdentity) {
        usernameOrgRolesMap.put(userIdentity.getUsername(), usernameOrgRolesMap.get(oldUsername));

        for (String org : orgRoleUsernamesMap.keySet()) {
            Map<OrganizationRole,List<String>> roleUsernamesMap = orgRoleUsernamesMap.get(org);
            for (OrganizationRole role : roleUsernamesMap.keySet()) {
                List<String> usernames = roleUsernamesMap.get(role);
                if (usernames.remove(oldUsername)) {
                    usernames.add(userIdentity.getUsername());
                }
            }
        }
    }

    public OrganizationRole updateUserRole(String username, OrganizationRole role) {
        OrganizationRoleClaims oldRoleClaims = usernameOrgRolesMap.get(username);
        Set<OrganizationRole> roles = new HashSet<>();
        roles.add(OrganizationRole.USER);
        roles.add(role);
        OrganizationRoleClaims newRoleClaims = new OrganizationRoleClaims(oldRoleClaims.getOrganizationExternalId(),
                                                                          roles);
        usernameOrgRolesMap.put(username, newRoleClaims);
        
        for (String org : orgRoleUsernamesMap.keySet()) {
            Map<OrganizationRole,List<String>> roleUsernamesMap = orgRoleUsernamesMap.get(org);
            for (OrganizationRole r : roleUsernamesMap.keySet()) {
                List<String> usernames = roleUsernamesMap.get(r);
                if (r.equals(role)) {
                    if (!usernames.contains(username)) {
                        usernames.add(username);
                    }
                } else if (!r.equals(OrganizationRole.USER)) {
                    usernames.remove(username);
                }
            }
        }

        return role;
    }

    public void setUserIsActive(String username, Boolean active) {
        if (active) {
            inactiveUsernames.remove(username);
        } else if (!active) {
            inactiveUsernames.add(username);
        }
    }

    public List<String> getAllUsernamesForOrganization(Organization org, OrganizationRole role) {
        return orgRoleUsernamesMap.getOrDefault(org.getExternalId(), new HashMap<>())
                                  .getOrDefault(role, List.of()).stream()
                .filter(u -> !inactiveUsernames.contains(u))
                .collect(Collectors.toList());
    }

    public void createOrganization(String name, String externalId) {
        Map<OrganizationRole,List<String>> roleUsernamesMap = 
                Arrays.asList(OrganizationRole.values())
                .stream().collect(Collectors.toMap(r -> r, r -> new ArrayList<>()));
        orgRoleUsernamesMap.putIfAbsent(externalId, roleUsernamesMap);
    }

    public void deleteOrganization(String externalId) {
        orgRoleUsernamesMap.remove(externalId);
        // remove all users from this map whose org roles are in the deleted org
        usernameOrgRolesMap = usernameOrgRolesMap.entrySet().stream()
                .filter(e -> !(e.getValue().getOrganizationExternalId().equals(externalId)))
                .collect(Collectors.toMap(e -> e.getKey(), e -> e.getValue()));
    }

    public Optional<OrganizationRoleClaims> getOrganizationRoleClaimsForUser(String username) {
        if (inactiveUsernames.contains(username)) {
            return Optional.empty();
        } else {
            return Optional.ofNullable(usernameOrgRolesMap.get(username));
        }
    }

    public void reset() {
        usernameOrgRolesMap.clear();
        orgRoleUsernamesMap.clear();
        inactiveUsernames.clear();

        for (DemoUser altUser : demoUsers.getAllUsers()) {
            initDemoUser(altUser);
        }
    }
}