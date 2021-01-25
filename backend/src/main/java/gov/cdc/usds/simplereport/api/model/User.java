package gov.cdc.usds.simplereport.api.model;

import java.util.Optional;
import java.util.List;

import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonName;

public class User {

	private String id;
	private Optional<Organization> org;
	private PersonName nameInfo;
	private String email;
	private Boolean isAdmin;
	private List<UserPermission> permissions;

	public User(ApiUser user, Optional<Organization> org, Boolean isAdmin, List<UserPermission> permissions) {
		super();
		this.id = user.getInternalId().toString();
		this.org = org;
		this.nameInfo = user.getNameInfo();
		// Note: we assume a user's email and login username are the same thing.
		this.email = user.getLoginEmail();
		this.isAdmin = isAdmin;
		this.permissions = permissions;
	}

	public String getId() {
		return id;
	}

	public Optional<Organization> getOrganization() {
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

	public List<UserPermission> getPermissions() {
		return permissions;
	}
}
