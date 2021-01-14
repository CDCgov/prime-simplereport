package gov.cdc.usds.simplereport.api.organization;

import org.springframework.stereotype.Component;

import java.util.List;

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
public class OrganizationResolver implements GraphQLQueryResolver  {

	private OrganizationService _organizationService;

	public OrganizationResolver(OrganizationService os, /*ApiUserService users,*/ OrganizationInitializingService initer) {
		_organizationService = os;
	}

	public Organization getOrganization() {
		return _organizationService.getCurrentOrganization();
	}

    public List<Organization> getOrganizations() {
        return _organizationService.getOrganizations();
    }
}
