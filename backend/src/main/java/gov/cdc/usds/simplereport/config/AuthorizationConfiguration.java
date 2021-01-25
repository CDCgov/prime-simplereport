package gov.cdc.usds.simplereport.config;

import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;

/**
 * Configuration (mostly static) for method-level or object-level security in
 * the application (as opposed to request-level security, which lives in
 * {@link SecurityConfiguration}).
 */
@Configuration
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class AuthorizationConfiguration {

    /**
     * The name of the bean that is to be used in SPeL access-control annotations.
     * Should be attached to a bean by way of the Bean or Component annotation;
     * exactly one such bean must be present in the application context.
     */
    public static final String AUTHORIZER_BEAN = "simpleReportAuthVerifier";

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
