package gov.cdc.usds.simplereport.config;

import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;

import gov.cdc.usds.simplereport.config.authorization.UserAuthorizationVerifier;
import gov.cdc.usds.simplereport.config.simplereport.AdminEmailList;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;

/**
 * Configuration (mostly static) for method-level or object-level security in
 * the application (as opposed to request-level security, which lives in
 * {@link SecurityConfiguration}).
 */
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class AuthorizationConfiguration {

    public static final String AUTHORIZER_BEAN = "simpleReportAuthVerifier";

    @Bean(AUTHORIZER_BEAN)
    public UserAuthorizationVerifier getVerifier(AdminEmailList admins, IdentitySupplier supplier,
            OrganizationService orgService) {
        return new UserAuthorizationVerifier(admins, supplier, orgService);
    }

    /**
     * Apply this annotation if the method should only be called by site-wide
     * administrative users ("superusers").
     */
    @Retention(RUNTIME)
    @Target(METHOD)
    @PreAuthorize("@" + AUTHORIZER_BEAN + ".userHasSiteAdminRole()")
    public @interface RequireGlobalAdminUser {
    }
}
