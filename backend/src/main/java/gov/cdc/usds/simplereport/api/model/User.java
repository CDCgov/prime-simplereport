package gov.cdc.usds.simplereport.api.model;

import java.time.LocalDate;

import gov.cdc.usds.simplereport.api.model.Organization;

public class User {

	private String id;
	private Organization organization;

	public User(Organization organization) {
		super();
		this.id = UUID.randomUUID().toString();
		this.organization = organization;
	}
}
