package gov.cdc.usds.simplereport.config.authorization;

import java.util.Collection;
import java.util.Collections;
import java.util.EnumSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public class OrganizationRoleClaims implements PermissionHolder {

    private String organizationExternalId;
    private Optional<Set<UUID>> facilityRestrictions;
    private Set<OrganizationRole> grantedRoles;

    public OrganizationRoleClaims(String organizationExternalId, 
                                  Optional<Set<UUID>> facilityRestrictions, 
                                  Collection<OrganizationRole> grantedRoles) {
        super();
        this.organizationExternalId = organizationExternalId;
        this.facilityRestrictions = facilityRestrictions;
        this.grantedRoles = EnumSet.copyOf(grantedRoles);
    }

    public String getOrganizationExternalId() {
        return organizationExternalId;
    }

    /**
     * This is the collection of facilities that a user can access. An
     * {@code Optional.empty()} value signifies that the user has no
     * restrictions, i.e. they can access all facilities. An empty
     * {@code Set} value signifies that the user has no facilities they can
     * access. A non-empty {@code Set} value signifies that the user can access
     * a non-empty subset of facilities, potentially including all facilities.
     */
    public Optional<Set<UUID>> getFacilityRestrictions() {
        return facilityRestrictions.map(s -> Collections.unmodifiableSet(s));
    }

    public Set<OrganizationRole> getGrantedRoles() {
        return Collections.unmodifiableSet(grantedRoles);
    }
}
