package gov.cdc.usds.simplereport.api.apiuser;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.api.model.UserPermission;
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
		Optional<Organization> currentOrg = 
				currentOrgRoles.isPresent() ? Optional.of(currentOrgRoles.get().getOrganization())
											: Optional.empty();
		Boolean isAdmin = _userService.isAdminUser(currentUser);
		List<UserPermission> permissions = _userService.getPermissions(currentUser);
		return new User(currentUser, currentOrg, isAdmin, permissions);
	}
}
