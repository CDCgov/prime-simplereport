package gov.cdc.usds.simplereport.api.model;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;

public class User {

	private String id;
	private Organization org;
	private PersonName nameInfo;
	private String email;
	private Boolean isAdmin;

	public User(ApiUser user, Organization org, Boolean isAdmin) {
		super();
		this.id = user.getInternalId().toString();
		this.org = org;
		this.nameInfo = user.getNameInfo();
		// Note: we assume a user's email and login username are the same thing.
		this.email = user.getLoginEmail();
		this.isAdmin = isAdmin;
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

	public Boolean getIsAdmin() {
		return isAdmin;
	}
}
