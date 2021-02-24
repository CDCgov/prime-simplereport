package gov.cdc.usds.simplereport.config.simplereport;

import java.util.List;
import java.util.ArrayList;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.ConstructorBinding;

import gov.cdc.usds.simplereport.config.authorization.OrganizationRoleClaims;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

/**
 * Bound configuration for the default demo user, and possibly more demo users
 * in the future if we make demo login more useful.
 */
@ConfigurationProperties(prefix = "simple-report.demo-users")
@ConstructorBinding
public class DemoUserConfiguration {

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
        private OrganizationRoleClaims authorization;
        private IdentityAttributes identity;

        public DemoUser(OrganizationRoleClaims authorization, IdentityAttributes identity) {
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
}
