package gov.cdc.usds.simplereport.api.apiuser;

import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.ApiUserService;
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
		Organization currentOrg = _organizationService.getCurrentOrganization();
		Boolean isAdmin = _userService.isAdminUser(currentUser);
		return new User(currentUser, currentOrg, isAdmin);
	}
}
