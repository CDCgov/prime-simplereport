package gov.cdc.usds.simplereport.api.apiuser;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.HashSet;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoles;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;

import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.model.CurrentOrganizationRoles;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import graphql.kickstart.tools.GraphQLQueryResolver;

/**
 * Created by jeremyzitomer-usds on 1/7/21
 */
@Component
public class ApiUserResolver implements GraphQLQueryResolver  {

	private ApiUserService _userService;
	private OrganizationService _organizationService;

	public ApiUserResolver(OrganizationService os, ApiUserService users, OrganizationInitializingService initer) {
		_organizationService = os;
		_userService = users;
	}

	public User getWhoami() {
		ApiUser currentUser = _userService.getCurrentUser();
		Optional<CurrentOrganizationRoles> currentOrgRoles = _organizationService.getCurrentOrganizationRoles();
        Optional<Organization> currentOrg;
        List<UserPermission> permissions = new ArrayList<>();
        if (currentOrgRoles.isPresent()) {
            CurrentOrganizationRoles orgRoles = currentOrgRoles.get();
            currentOrg = Optional.of(orgRoles.getOrganization());
            permissions.addAll(orgRoles.getGrantedPermissions());
        } else {
            currentOrg = Optional.empty();
        }
		Boolean isAdmin = _userService.isAdminUser(currentUser);
        return new User(currentUser, currentOrg, isAdmin, permissions);
	}

	public List<User> getUsers() {
		Organization org = _organizationService.getCurrentOrganization();
		List<ApiUser> users = _organizationService.getUsersInCurrentOrg(OrganizationRole.USER);
		Set<String> admins = new HashSet<>(_organizationService.getUsernamesInCurrentOrg(OrganizationRole.ADMIN));
		Set<String> entryOnly = new HashSet<>(_organizationService.getUsernamesInCurrentOrg(OrganizationRole.ENTRY_ONLY));
		return users.stream().map(u -> {
				String email = u.getLoginEmail();
				Set<OrganizationRole> roles = Set.of(OrganizationRole.USER);
				if (admins.contains(email)) {
					roles.add(OrganizationRole.ADMIN);
				}
				if (entryOnly.contains(email)) {
					roles.add(OrganizationRole.ENTRY_ONLY);
				}
				OrganizationRoles orgRoles = new OrganizationRoles(org.getExternalId(), roles);
				Set<UserPermission> permissions = orgRoles.getGrantedPermissions();
				return new User(u, 
							Optional.of(org), 
							_userService.isAdminUser(u), 
							permissions);				   
			}).collect(Collectors.toList());
	}
}
