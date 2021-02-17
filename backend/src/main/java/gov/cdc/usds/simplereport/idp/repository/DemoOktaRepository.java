package gov.cdc.usds.simplereport.idp.repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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

    Map<String,OrganizationRoleClaims> usernameOrgRolesMap;
    Map<String,Map<OrganizationRole,List<String>>> orgRoleUsernamesMap;

    public DemoOktaRepository(DemoUserConfiguration demoUsers) {
        this.usernameOrgRolesMap = new HashMap<>();
        this.orgRoleUsernamesMap = new HashMap<>();

        for (DemoUser altUser : demoUsers.getAlternateUsers()) {
            IdentityAttributes user = altUser.getIdentity();
            String username = user.getUsername();
            String orgExternalId = altUser.getAuthorization().getOrganizationExternalId();
            Set<OrganizationRole> roles = altUser.getAuthorization().getGrantedRoles();
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

        LOG.info("Done initializing Demo Okta service.");
    }

    // Will add to these in a PR soon.
    public void createUser(IdentityAttributes userIdentity, String organizationExternalId) {}

    public void updateUser(String oldUsername, IdentityAttributes userIdentity) {}

    public List<String> getAllUsernamesForOrganization(Organization org, OrganizationRole role) {
        return orgRoleUsernamesMap.getOrDefault(org.getExternalId(), new HashMap<>())
                                  .getOrDefault(role, List.of());
    }

    public void createOrganization(String name, String externalId) {
        orgRoleUsernamesMap.putIfAbsent(externalId, new HashMap<>());
    }

    public void deleteOrganization(String externalId) {
        orgRoleUsernamesMap.remove(externalId);
        // remove all users from this map whose org roles are in the deleted org
        usernameOrgRolesMap = usernameOrgRolesMap.entrySet().stream()
                .filter(e -> !(e.getValue().getOrganizationExternalId().equals(externalId)))
                .collect(Collectors.toMap(e -> e.getKey(), e -> e.getValue()));
    }

    public Optional<OrganizationRoleClaims> getOrganizationRolesForUser(String username) {
        return Optional.ofNullable(usernameOrgRolesMap.get(username));
    }
}