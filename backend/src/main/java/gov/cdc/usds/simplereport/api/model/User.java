package gov.cdc.usds.simplereport.api.model;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
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
        Optional<OrganizationRole> effectiveRole = orgwrapper.flatMap(CurrentOrganizationRoles::getEffectiveRole);
        this.roleDescription = buildRoleDescription(effectiveRole, isAdmin);
        effectiveRole.map(OrganizationRole::getGrantedPermissions).ifPresent(permissions::addAll);
    }

    public User(ApiUser user, Optional<Organization> org, boolean isAdmin, Optional<OrganizationRole> role) {
        this.wrapped = user;
        this.org = org;
        this.isAdmin = isAdmin;
        this.permissions = new ArrayList<>();
        role.map(OrganizationRole::getGrantedPermissions).ifPresent(permissions::addAll);
        this.roleDescription = buildRoleDescription(role, isAdmin);

    }

    private String buildRoleDescription(Optional<OrganizationRole> role, boolean isAdmin) {
        if (role.isPresent()) {
            String desc = role.get().getDescription();
            return isAdmin ? desc + " (SU)" : desc;
        } else {
            return isAdmin ? "Super Admin" : "Misconfigured user";
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
