package gov.cdc.usds.simplereport.config.simplereport;

import java.util.ArrayList;
import java.util.List;
<<<<<<< HEAD
import java.util.Optional;
import java.util.Set;

=======
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
>>>>>>> benwarfield-usds/demo-auth-refactor
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
public class DemoUserConfiguration {

  private static final String ALL_FACILITIES_ACCESS = "ALL_FACILITIES";

  private DemoUser defaultUser;
  private List<DemoUser> users;
  private Map<String, DemoUser> byUsername;

  public DemoUserConfiguration(List<DemoUser> allUsers) {
    this(null, allUsers);
  }

  @ConstructorBinding
  public DemoUserConfiguration(DemoUser defaultUser, List<DemoUser> alternateUsers) {
    super();
    this.defaultUser = defaultUser;
    this.users = new ArrayList<>();
    if (defaultUser != null) {
      users.add(defaultUser);
    }
    if (alternateUsers != null) {
      users.addAll(alternateUsers);
    }
    byUsername =
        users.stream().collect(Collectors.toMap(DemoUser::getUsername, Function.identity()));
  }

  public DemoUser getDefaultUser() {
    return defaultUser;
  }

  public List<DemoUser> getAllUsers() {
    return users;
  }

  public DemoUser getByUsername(String username) {
    return byUsername.get(username);
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

    public String getUsername() {
      return identity.getUsername();
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
