package gov.cdc.usds.simplereport.api.model;

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

}
