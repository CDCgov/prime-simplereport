package gov.cdc.usds.simplereport.api.model;

import java.util.List;

import gov.cdc.usds.simplereport.db.model.Organization;

public class ApiFacility {
	private Organization org;

	public ApiFacility(Organization org) {
		super();
		this.org = org;
	}

	public String getName() {
		return org.getFacilityName();
	}

	public String getCliaNumber() {
		return org.getCliaNumber();
	}
}
