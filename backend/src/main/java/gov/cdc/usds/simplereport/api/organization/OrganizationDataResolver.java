package gov.cdc.usds.simplereport.api.organization;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import gov.cdc.usds.simplereport.api.model.ApiFacility;
import gov.cdc.usds.simplereport.api.model.ApiOrganization;
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
public class OrganizationDataResolver implements GraphQLResolver<ApiOrganization> {

	@Autowired
	private OrganizationService _orgService;

	public List<ApiFacility> getTestingFacility(ApiOrganization o) {
		return o.getTestingFacility();
	}

	public ApiProvider getOrderingProvider(ApiOrganization o) {
		return new ApiProvider(getCurrentFacility().getOrderingProvider());
	}

	private Facility getCurrentFacility() {
		Organization org = _orgService.getCurrentOrganization();
		return _orgService.getDefaultFacility(org);
	}

	public List<DeviceType> getDeviceTypes(ApiOrganization o) {
		return getCurrentFacility().getDeviceTypes();
	}

	public DeviceType getDefaultDeviceType(ApiOrganization o) {
		return getCurrentFacility().getDefaultDeviceType();
	}
}
