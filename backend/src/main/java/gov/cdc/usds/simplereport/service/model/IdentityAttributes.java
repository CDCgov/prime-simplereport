package gov.cdc.usds.simplereport.service.model;

import org.springframework.boot.context.properties.ConstructorBinding;

import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;

/**
 * A container for all the attributes we extract from our OIDC token (initially just the username
 * and real name of the user, but eventually also security claims).
 */
public class IdentityAttributes extends PersonName {
	private String username;

	@ConstructorBinding
	public IdentityAttributes(String username, String firstName, String middleName, String lastName, String suffix) {
		super(firstName, middleName, lastName, suffix);
		this.username = username;
	}

	public String getUsername() {
		return username;
	}
}