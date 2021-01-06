package gov.cdc.usds.simplereport.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

@ConfigurationProperties(prefix = "simple-report.authorization")
@ConstructorBinding
public class AuthorizationProperties {

    private String roleClaim;
    private String rolePrefix;

    public AuthorizationProperties(String roleClaim, String rolePrefix) {
        this.roleClaim = roleClaim;
        this.rolePrefix = rolePrefix;
    }

    public String getRoleClaim() {
        return roleClaim;
    }

    public String getRolePrefix() {
        return rolePrefix;
    }
}
