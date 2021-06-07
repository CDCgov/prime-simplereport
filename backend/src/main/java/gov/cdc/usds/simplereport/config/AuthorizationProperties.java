package gov.cdc.usds.simplereport.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "simple-report.authorization")
@ConstructorBinding
public class AuthorizationProperties {

  private final String roleClaim;
  private final String rolePrefix;
  private final String adminGroupName;
  private final String environmentName;

  public AuthorizationProperties(String roleClaim, String environmentName) {
    this.environmentName = environmentName;
    this.roleClaim = roleClaim;
    this.rolePrefix = "SR-" + environmentName.toUpperCase() + "-TENANT:";
    this.adminGroupName = "SR-" + environmentName.toUpperCase() + "-ADMINS";
  }

  // This getter exists to satisfy the config metadata parser for application.yamls
  public String getEnvironmentName() {
    return environmentName;
  }

  public String getRoleClaim() {
    return roleClaim;
  }

  public String getRolePrefix() {
    return rolePrefix;
  }

  public String getAdminGroupName() {
    return adminGroupName;
  }
}
