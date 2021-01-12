package gov.cdc.usds.simplereport.api.organization;

import org.springframework.stereotype.Component;

import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import graphql.kickstart.tools.GraphQLQueryResolver;

/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class OrganizationResolver implements GraphQLQueryResolver {

	private ApiUserService _userService;
	private OrganizationService _organizationService;

	public OrganizationResolver(OrganizationService os, ApiUserService users, OrganizationInitializingService initer) {
		_organizationService = os;
		_userService = users;
	}

	public Organization getOrganization() {
		return _organizationService.getCurrentOrganization();
	}

	public User getWhoami() {
		ApiUser currentUser = _userService.getCurrentUser();
		Boolean isAdmin = _userService.isAdminUser(currentUser);
		Organization currentOrg = _organizationService.getCurrentOrganization();
		return new User(currentUser, currentOrg, isAdmin);
	}
}
