package gov.cdc.usds.simplereport.api.organization;

import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.CurrentOrganizationRoles;
import gov.cdc.usds.simplereport.service.OrganizationService;
import graphql.kickstart.tools.GraphQLQueryResolver;

/**
 * Created by nickrobison on 11/17/20
 */
@Component
public class OrganizationResolver implements GraphQLQueryResolver {

	private OrganizationService _organizationService;

    public OrganizationResolver(OrganizationService os) {
		_organizationService = os;
	}

	public Optional<Organization> getOrganization() {
		Optional<CurrentOrganizationRoles> roles = _organizationService.getCurrentOrganizationRoles();
		return roles.isPresent()
					? Optional.of(roles.get().getOrganization())
					: Optional.empty();
	}

    public List<Organization> getOrganizations() {
        return _organizationService.getOrganizations();
	}
}
