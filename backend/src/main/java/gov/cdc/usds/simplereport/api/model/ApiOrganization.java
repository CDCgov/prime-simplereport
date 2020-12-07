package gov.cdc.usds.simplereport.api.model;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import gov.cdc.usds.simplereport.db.model.Organization;

public class ApiOrganization {
	private Organization org;

	public ApiOrganization(Organization org) {
		super();
		this.org = org;
	}

	public String getName() {
		return "Via Elegante";
	}

	public String getInternalId() {
		return org.getInternalId().toString();
	}

	public List<ApiFacility> getTestingFacility() {
		if (org.getTestingFacility() == null) {
			return Collections.emptyList();
		}
		return org.getTestingFacility().stream()
		.map(f -> new ApiFacility(f))
		.collect(Collectors.toList());
	}
}
