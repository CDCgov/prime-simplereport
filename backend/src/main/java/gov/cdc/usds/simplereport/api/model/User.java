package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.Organization;

import java.time.LocalDate;
import java.util.UUID;

public class User {

	private String id;
	private gov.cdc.usds.simplereport.db.model.Organization organization;

	public User(Organization organization) {
		super();
		this.id = UUID.randomUUID().toString();
		this.organization = organization;
	}
}
