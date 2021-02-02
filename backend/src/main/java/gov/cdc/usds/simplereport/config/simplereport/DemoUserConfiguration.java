package gov.cdc.usds.simplereport.config.simplereport;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRoles;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

/**
 * Bound configuration for the default demo user, and possibly more demo users
 * in the future if we make demo login more useful.
 */
@ConfigurationProperties(prefix = "simple-report.demo-users")
@ConstructorBinding
public class DemoUserConfiguration {

    private DemoUser defaultUser;

    public DemoUserConfiguration(DemoUser defaultUser) {
        super();
        this.defaultUser = defaultUser;
    }

    public DemoUser getDefaultUser() {
        return defaultUser;
    }

    @ConstructorBinding
    public static class DemoUser {
        private OrganizationRoles authorization;
        private IdentityAttributes identity;

        public DemoUser(OrganizationRoles authorization, IdentityAttributes identity) {
            super();
            this.authorization = authorization;
            this.identity = identity;
        }

        public OrganizationRoles getAuthorization() {
            return authorization;
        }

        public IdentityAttributes getIdentity() {
            return identity;
        }
    }
}
