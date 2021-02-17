package gov.cdc.usds.simplereport.config.authorization;

import java.util.Collections;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.Set;
import org.springframework.core.Ordered;

/**
 * The roles that can be granted (via Okta) to a user. Since multiple roles can
 * be granted, this class also contains the logic for determining which role
 * "matters" more for determining the effective role of a user.
 * 
 * Specifically, the {@link EffectiveRoleComparator} can order a list of roles
 * such that the first role in the list is the "effective" role for the
 * applicable user.
 */
public enum OrganizationRole implements Comparable<OrganizationRole> {
    /**
     * This is the role for users who are only permitted to create and submit tests,
     * but cannot view historical data or read the entire patient roster.
     */
    ENTRY_ONLY("Test-entry user",
            EnumSet.of(UserPermission.SEARCH_PATIENTS, UserPermission.START_TEST, UserPermission.UPDATE_TEST,
                    UserPermission.SUBMIT_TEST)),
    /**
     * This is the base role that we expect every user to have. Any other role that
     * has more specific permissions takes precedence over this role.
     */
    USER("Standard user", Ordered.LOWEST_PRECEDENCE,
            EnumSet.of(UserPermission.READ_PATIENT_LIST, UserPermission.SEARCH_PATIENTS,
                    UserPermission.READ_RESULT_LIST, UserPermission.EDIT_PATIENT,
                    UserPermission.START_TEST, UserPermission.UPDATE_TEST, UserPermission.SUBMIT_TEST)),
    /**
     * This is the organization admin role: if you have this role, then you have the
     * ability to change your role, so other roles you may have are moot. This
     * role's permisisons (which is to say all of them) take precedence over any
     * other roles.
     */
    ADMIN("Admin user", Ordered.HIGHEST_PRECEDENCE, EnumSet.allOf(UserPermission.class));

    private String description;
    private Set<UserPermission> grantedPermissions;
    private int precedence;

    private OrganizationRole(String description, int precedence, Set<UserPermission> permissions) {
        this.description = description;
        this.grantedPermissions = Collections.unmodifiableSet(EnumSet.copyOf(permissions));
        this.precedence = precedence;
    }

    private OrganizationRole(String description, Set<UserPermission> permissions) {
        this(description, 0, permissions);
    }

    public String getDescription() {
        return description;
    }

    public Set<UserPermission> getGrantedPermissions() {
        return this.grantedPermissions;
    }

    public static final class EffectiveRoleComparator implements Comparator<OrganizationRole> {
        public int compare(OrganizationRole one, OrganizationRole other) {
            if (one.precedence == other.precedence) {
                return one.compareTo(other);
            }
            return Integer.compare(one.precedence, other.precedence);
        }
    }

    public static final OrganizationRole getDefault() {
        return USER;
    }
}
