package gov.cdc.usds.simplereport.api.model;

import java.util.Optional;
import java.util.List;
import java.util.ArrayList;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.ApiUser;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.model.OrganizationRoles;

public class User {

    private ApiUser wrapped;
	private Optional<Organization> org;
	private Boolean isSiteAdmin;
    private String roleDescription;
    private List<UserPermission> permissions;
    private List<OrganizationRole> roles;


    public User(ApiUser user, Optional<OrganizationRoles> orgwrapper, boolean isSiteAdmin) {
        this.wrapped = user;
        this.org = orgwrapper.map(OrganizationRoles::getOrganization);
        this.permissions = new ArrayList<>();
        this.roles = new ArrayList<>();
        this.isSiteAdmin = isSiteAdmin;
        if (orgwrapper.isPresent()) {
            permissions.addAll(orgwrapper.get().getGrantedPermissions());
            roleDescription = orgwrapper.get().getEffectiveRole().get().getDescription();
            roles.addAll(orgwrapper.get().getGrantedRoles());
        }
        if (isSiteAdmin) {
            if (roleDescription == null) {
                roleDescription = "Super Admin";
            } else {
                roleDescription = roleDescription + " (SU)";
            }
        }
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

	public Boolean getisSiteAdmin() {
		return isSiteAdmin;
	}

	public List<UserPermission> getPermissions() {
		return permissions;
	}

    public String getRoleDescription() {
        return roleDescription;
    }

    public List<OrganizationRole> getRoles() {
        return roles;
    }
}
