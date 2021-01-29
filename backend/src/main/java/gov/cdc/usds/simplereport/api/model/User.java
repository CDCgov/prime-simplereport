package gov.cdc.usds.simplereport.api.model;

import java.util.Optional;
import java.util.ArrayList;
import java.util.List;

import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.CurrentOrganizationRoles;

public class User {

    private ApiUser wrapped;
	private Optional<Organization> org;
	private Boolean isAdmin;
    private String roleDescription;
	private List<UserPermission> permissions;

    public User(ApiUser user, Optional<CurrentOrganizationRoles> orgwrapper, boolean isAdmin) {
        this.wrapped = user;
        this.org = orgwrapper.map(CurrentOrganizationRoles::getOrganization);
        this.permissions = new ArrayList<>();
        this.isAdmin = isAdmin;
        if (orgwrapper.isPresent()) {
            permissions.addAll(orgwrapper.get().getGrantedPermissions());
            roleDescription = orgwrapper.get().getEffectiveRole().get().getDescription();
        }
        if (isAdmin) {
            if (roleDescription == null) {
                roleDescription = "Super Admin";
            } else {
                roleDescription = roleDescription + " (SU)";
            }
        }
    }

    public User(ApiUser user, Optional<Organization> org, Boolean isAdmin, List<UserPermission> permissions) {
		super();
        this.wrapped = user;
		this.org = org;
		this.isAdmin = isAdmin;
		this.permissions = permissions;
	}

	public String getId() {
        return wrapped.getInternalId().toString();
	}

	public Optional<Organization> getOrganization() {
		return org;
	}

	public String getFirstName() {
        return wrapped.getNameInfo().getFirstName();
	}

	public String getMiddleName() {
        return wrapped.getNameInfo().getMiddleName();
	}

	public String getLastName() {
        return wrapped.getNameInfo().getLastName();
	}

	public String getSuffix() {
        return wrapped.getNameInfo().getSuffix();
	}

    // Note: we assume a user's email and login username are the same thing.
	public String getEmail() {
        return wrapped.getLoginEmail();
	}

	public Boolean getIsAdmin() {
		return isAdmin;
	}

	public List<UserPermission> getPermissions() {
		return permissions;
	}

    public String getRoleDescription() {
        return roleDescription;
    }
}
