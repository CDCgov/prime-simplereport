package gov.cdc.usds.simplereport.api.organization;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.api.model.ApiProvider;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.OrganizationService;
import graphql.kickstart.tools.GraphQLResolver;

/**
 * GraphQL resolver for fields of the Organization API model that are no longer fields
 * of the Organization database model. Most of the original content should probably be
 * removed before Christmas 2020.
 */
@Service
public class OrganizationDataResolver implements GraphQLResolver<Organization> {

	@Autowired
	private OrganizationService _orgService;

	public List<ApiFacility> getTestingFacility(Organization o) {
		return getCurrentFacility().stream()
			.map(f -> new ApiFacility(f))
			.collect(Collectors.toList());
	}

	private List<Facility> getCurrentFacility() {
		Organization org = _orgService.getCurrentOrganization();
		return _orgService.getFacilities(org);
	}

	private String getName(Organization o) {
		return o.getOrganizationName();
	}
}
