package gov.cdc.usds.simplereport.config.simplereport;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.config.authorization.PermissionHolder;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

/**
 * Bound configuration for the default demo user, and possibly more demo users in the future if we
 * make demo login more useful.
 */
@ConfigurationProperties(prefix = "simple-report.demo-users")
public class DemoUserConfiguration {

  private DemoUser defaultUser;
  private List<DemoUser> users;
  private Map<String, DemoUser> byUsername;
  private Set<String> siteAdminEmails;

  public DemoUserConfiguration(List<DemoUser> allUsers) {
    this(null, allUsers, null);
  }

  @ConstructorBinding
  public DemoUserConfiguration(
      DemoUser defaultUser, List<DemoUser> alternateUsers, List<String> siteAdminEmails) {
    super();
    this.defaultUser = defaultUser;
    this.siteAdminEmails =
        siteAdminEmails != null ? new HashSet<>(siteAdminEmails) : new HashSet<>();
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

  public Set<String> getSiteAdminEmails() {
    return siteAdminEmails;
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
  }

  @ConstructorBinding
  public static class DemoAuthorization implements PermissionHolder {
    private String organizationExternalId;
    private Set<String> facilities;
    private Set<OrganizationRole> grantedRoles;

    public DemoAuthorization(
        String organizationExternalId, Set<String> facilities, Set<OrganizationRole> grantedRoles) {
      super();
      this.organizationExternalId = organizationExternalId;
      this.grantedRoles = grantedRoles;
      if (grantedRoles.contains(OrganizationRole.ALL_FACILITIES)) {
        this.facilities = Set.of();
      } else {
        this.facilities = (facilities == null) ? Set.of() : facilities;
      }
    }

    public String getOrganizationExternalId() {
      return organizationExternalId;
    }

    public Set<String> getFacilities() {
      return Collections.unmodifiableSet(facilities);
    }

    public Set<OrganizationRole> getGrantedRoles() {
      return Collections.unmodifiableSet(grantedRoles);
    }
  }
}
