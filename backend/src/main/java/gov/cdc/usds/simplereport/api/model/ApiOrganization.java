package gov.cdc.usds.simplereport.api.model;

import java.util.List;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.Organization;

public class ApiOrganization {
	private Organization org;

	public ApiOrganization(Organization org) {
		super();
		this.org = org;
	}

	public String getInternalId() {
		return org.getInternalId().toString();
	}

	public ApiFacility getTestingFacility() {
		return new ApiFacility(org);
	}

	public ApiProvider getOrderingProvider() {
		if (org.getOrderingProvider() == null) {
			return null;
		}
		return new ApiProvider(org.getOrderingProvider());
	}

	public List<DeviceType> getDeviceTypes() {
		return org.getDeviceTypes();
	}

	public DeviceType getDefaultDeviceType() {
		return org.getDefaultDeviceType();
	}
}
