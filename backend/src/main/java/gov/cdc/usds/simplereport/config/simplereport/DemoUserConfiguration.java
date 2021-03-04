package gov.cdc.usds.simplereport.config.simplereport;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
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
    return byUsername.getOrDefault(username, defaultUser);
  }

  @ConstructorBinding
  public static class DemoUser {
    private OrganizationRoleClaims authorization;
    private IdentityAttributes identity;

    public DemoUser(OrganizationRoleClaims authorization, IdentityAttributes identity) {
      super();
      this.authorization = authorization;
      this.identity = identity;
    }

    public String getUsername() {
      return identity.getUsername();
    }

    public OrganizationRoleClaims getAuthorization() {
      return authorization;
    }

    public IdentityAttributes getIdentity() {
      return identity;
    }
  }
}
