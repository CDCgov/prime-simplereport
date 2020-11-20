package gov.cdc.usds.simplereport.api.model;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;

import java.util.UUID;

public class User {

	private String id;
	private Person person;

	public User(UUID id, Person person) {
		super();
		this.id = id.toString();
		this.person = person;
	}

	public String getId() {
		return id;
	}

	public Organization getOrganization() {
		return person.getOrganization();
	}

	public String getFirstName() {
		return person.getFirstName();
	}

	public String getMiddleName() {
		return person.getMiddleName();
	}

	public String getLastName() {
		return person.getLastName();
	}

	public String getSuffix() {
		return person.getSuffix();
	}
}
