package gov.cdc.usds.simplereport.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "simple-report.authorization")
@ConstructorBinding
public class AuthorizationProperties {

    private String superuserClaim;
    private String roleClaim;
    private String rolePrefix;

    public AuthorizationProperties(String superuserClaim, String roleClaim, String rolePrefix) {
        this.superuserClaim = superuserClaim;
        this.roleClaim = roleClaim;
        this.rolePrefix = rolePrefix;
    }

    public String getSuperuserClaim() {
        return superuserClaim;
    }

    public String getRoleClaim() {
        return roleClaim;
    }

    public String getRolePrefix() {
        return rolePrefix;
    }
}
