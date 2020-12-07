package gov.cdc.usds.simplereport.api.organization;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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

@Service
public class OrganizationDataResolver implements GraphQLResolver<ApiOrganization> {

	private static final Logger LOG = LoggerFactory.getLogger(OrganizationDataResolver.class);

	@Autowired
	private OrganizationService _orgService;

	public ApiFacility getTestingFacility(ApiOrganization o) {
		LOG.error("Asked me for a facility for {}", o);
		return new ApiFacility(getCurrentFacility());
	}

	public ApiProvider getOrderingProvider(ApiOrganization o) {
		LOG.error("Asked me for a provider for {}", o);
		return new ApiProvider(getCurrentFacility().getOrderingProvider());
	}

	private Facility getCurrentFacility() {
		Organization org = _orgService.getCurrentOrganization();
		return _orgService.getDefaultFacility(org);
	}

	public List<DeviceType> getDeviceTypes(ApiOrganization o) {
		LOG.error("Asked me for device types for {}", o);
		return getCurrentFacility().getDeviceTypes();
	}

	public DeviceType getDefaultDeviceType(ApiOrganization o) {
		LOG.error("Asked me for default device type for {}", o);
		return getCurrentFacility().getDefaultDeviceType();
	}
}
