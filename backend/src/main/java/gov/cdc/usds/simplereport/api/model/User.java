package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;

public class User {

	private String id;
	private Organization org;
	private PersonName nameInfo;
	private String email;

	public User(ApiUser currentUser, Organization currentOrg) {
		super();
		this.id = currentUser.getInternalId().toString();
		this.org = currentOrg;
		this.nameInfo = currentUser.getNameInfo();
		// Note: we assume a user's email and login username are the same thing.
		this.email = currentUser.getLoginEmail();
	}

	public String getId() {
		return id;
	}

	public Organization getOrganization() {
		return org;
	}

	public String getFirstName() {
		return nameInfo.getFirstName();
	}

	public String getMiddleName() {
		return nameInfo.getMiddleName();
	}

	public String getLastName() {
		return nameInfo.getLastName();
	}

	public String getSuffix() {
		return nameInfo.getSuffix();
	}

	public String getEmail() {
		return email;
	}
}
