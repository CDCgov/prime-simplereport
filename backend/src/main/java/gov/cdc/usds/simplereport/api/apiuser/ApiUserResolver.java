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
import gov.cdc.usds.simplereport.config.authorization.AuthorityBasedOrganizationRoles;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;

import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;
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
		Optional<OrganizationRoles> currentOrgRoles = _organizationService.getCurrentOrganizationRoles();
		Boolean isSiteAdmin = _userService.isSiteAdmin(currentUser);
        return new User(currentUser, currentOrgRoles, isSiteAdmin);
	}

	public List<User> getUsers() {
		Organization org = _organizationService.getCurrentOrganization();
		List<ApiUser> users = _organizationService.getUsersInCurrentOrg(OrganizationRole.USER);
		Set<String> admins = new HashSet<>(_organizationService.getUsernamesInCurrentOrg(OrganizationRole.ADMIN));
		Set<String> entryOnly = new HashSet<>(_organizationService.getUsernamesInCurrentOrg(OrganizationRole.ENTRY_ONLY));
		return users.stream().map(u -> {
			Set<OrganizationRole> roles = new HashSet<>();
			roles.add(OrganizationRole.USER);
			String email = u.getLoginEmail();
			if (admins.contains(email)) {
				roles.add(OrganizationRole.ADMIN);
			}
			if (entryOnly.contains(email)) {
				roles.add(OrganizationRole.ENTRY_ONLY);
			}
			OrganizationRoles orgRoles = new OrganizationRoles(org, roles);
			return new User(u, Optional.of(orgRoles), _userService.isSiteAdmin(u));
		}).collect(Collectors.toList());
	}
}
