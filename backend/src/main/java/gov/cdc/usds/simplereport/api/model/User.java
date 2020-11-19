package gov.cdc.usds.simplereport.api.model;

import java.util.UUID;

public class User {

	private String id;
	private Organization organization;

	public User(Organization organization) {
		super();
		this.id = UUID.randomUUID().toString();
		this.organization = organization;
	}
}
