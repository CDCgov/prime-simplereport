package gov.cdc.usds.simplereport.config.simplereport;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.config.authorization.PermissionHolder;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

/**
 * Bound configuration for the default demo user, and possibly more demo users in the future if we
 * make demo login more useful.
 */
@ConfigurationProperties(prefix = "simple-report.demo-users")
@ConstructorBinding
public class DemoUserConfiguration {

  private static final String ALL_FACILITIES_ACCESS = "ALL_FACILITIES";

  private DemoUser defaultUser;
  private List<DemoUser> alternateUsers;

  public DemoUserConfiguration(DemoUser defaultUser, List<DemoUser> alternateUsers) {
    super();
    this.defaultUser = defaultUser;
    this.alternateUsers = alternateUsers == null ? List.of() : alternateUsers;
  }

  public DemoUser getDefaultUser() {
    return defaultUser;
  }

  public List<DemoUser> getAlternateUsers() {
    return alternateUsers;
  }

  public List<DemoUser> getAllUsers() {
    List<DemoUser> allUsers = new ArrayList<>(getAlternateUsers());
    allUsers.add(getDefaultUser());
    return allUsers;
  }

  @ConstructorBinding
  public static class DemoUser {
    private DemoAuthorization authorization;
    private IdentityAttributes identity;

    public DemoUser(DemoAuthorization authorization, IdentityAttributes identity) {
      super();
      this.authorization = authorization;
      this.identity = identity;
    }

    public DemoAuthorization getAuthorization() {
      return authorization;
    }

    public IdentityAttributes getIdentity() {
      return identity;
    }

    @ConstructorBinding
    public static class DemoAuthorization implements PermissionHolder {    
      private String organizationExternalId;
      private Optional<Set<String>> facilityRestrictions;
      private Set<OrganizationRole> grantedRoles;
  
      public DemoAuthorization(String organizationExternalId, 
                               Set<String> facilityRestrictions,
                               Set<OrganizationRole> grantedRoles) {
        super();
        this.organizationExternalId = organizationExternalId;
        this.grantedRoles = grantedRoles;
        if (facilityRestrictions.contains(ALL_FACILITIES_ACCESS)) {
          this.facilityRestrictions = Optional.empty();
        } else {
          this.facilityRestrictions = Optional.of(facilityRestrictions);
        }
      }
  
      public String getOrganizationExternalId() {
        return organizationExternalId;
      }

      public Optional<Set<String>> getFacilityRestrictions() {
        return facilityRestrictions;
      }
  
      public Set<OrganizationRole> getGrantedRoles() {
        return grantedRoles;
      }
  }
}
