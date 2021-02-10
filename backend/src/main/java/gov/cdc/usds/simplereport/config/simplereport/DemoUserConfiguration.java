package gov.cdc.usds.simplereport.config.simplereport;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.config.authorization.OrganizationRole;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

/**
 * Bound configuration for the default demo user, and possibly more demo users
 * in the future if we make demo login more useful.
 */
@ConfigurationProperties(prefix = "simple-report.demo-users")
@ConstructorBinding
public class DemoUserConfiguration {

    private DemoCurrentUser defaultUser;
    private List<DemoAlternateUser> alternateUsers;

    public DemoUserConfiguration(DemoCurrentUser defaultUser, List<DemoAlternateUser> alternateUsers) {
        super();
        this.defaultUser = defaultUser;
        this.alternateUsers = alternateUsers == null ? List.of() : alternateUsers;
    }

    public DemoCurrentUser getDefaultUser() {
        return defaultUser;
    }

    public List<DemoAlternateUser> getAlternateUsers() {
        return alternateUsers;
    }

    @ConstructorBinding
    public static class DemoCurrentUser {
        private OrganizationRoleClaims authorization;
        private IdentityAttributes identity;

        public DemoCurrentUser(OrganizationRoleClaims authorization, IdentityAttributes identity) {
            super();
            this.authorization = authorization;
            this.identity = identity;
        }

        public OrganizationRoleClaims getAuthorization() {
            return authorization;
        }

        public IdentityAttributes getIdentity() {
            return identity;
        }
    }

    @ConstructorBinding
    public static class DemoAlternateUser {
        private List<OrganizationRole> roles;
        private IdentityAttributes identity;

        public DemoAlternateUser(List<OrganizationRole> roles, IdentityAttributes identity) {
            super();
            this.roles = roles;
            this.identity = identity;
        }

        public List<OrganizationRole> getRoles() {
            return roles;
        }

        public IdentityAttributes getIdentity() {
            return identity;
        }
    }
}
