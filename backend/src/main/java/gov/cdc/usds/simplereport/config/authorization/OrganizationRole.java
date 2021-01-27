package gov.cdc.usds.simplereport.config.authorization;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

public enum OrganizationRole {
    ENTRY_ONLY("Test-entry users",
            EnumSet.of(UserPermission.READ_PATIENT_LIST, UserPermission.START_TEST, UserPermission.UPDATE_TEST, 
                    UserPermission.SUBMIT_TEST)),
    USER("Users",
            EnumSet.of(UserPermission.READ_PATIENT_LIST, UserPermission.READ_RESULT_LIST, UserPermission.EDIT_PATIENT,
                    UserPermission.START_TEST, UserPermission.UPDATE_TEST, UserPermission.SUBMIT_TEST)),
    ADMIN("Admins", EnumSet.allOf(UserPermission.class));

    private String description;
    private Set<UserPermission> grantedPermissions;

    private OrganizationRole(String description, Set<UserPermission> permissions) {
        this.description = description;
        this.grantedPermissions = Collections.unmodifiableSet(EnumSet.copyOf(permissions));
    }

    public String getDescription() {
        return description;
    }

    public Set<UserPermission> getGrantedPermissions() {
        return this.grantedPermissions;
    }
}
