package gov.cdc.usds.simplereport.api.apiuser;

import java.util.Optional;

import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.db.model.ApiUser;

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
		Boolean isAdmin = _userService.isAdminUser(currentUser);
        return new User(currentUser, currentOrgRoles, isAdmin);
	}
}
