package gov.cdc.usds.simplereport.api.organization;

import gov.cdc.usds.simplereport.api.model.User;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.OrganizationService;
import graphql.kickstart.tools.GraphQLQueryResolver;
import org.springframework.stereotype.Component;

/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class OrganizationResolver implements GraphQLQueryResolver  {

    private ApiUserService _userService;

    public OrganizationResolver(OrganizationService os, ApiUserService users) {
        _userService = users;
    }

    public Organization getOrganization() {
        return _userService.getCurrentUser().getPerson().getOrganization();
    }

    public User getWhoami() {
		ApiUser currentUser = _userService.getCurrentUser();
		return new User(currentUser.getInternalId(), currentUser.getPerson());
	}
}