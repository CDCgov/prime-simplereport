package gov.cdc.usds.simplereport.config;

import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.RetentionPolicy.RUNTIME;

import java.lang.annotation.Retention;
import java.lang.annotation.Target;

import org.springframework.context.annotation.Configuration;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;

import gov.cdc.usds.simplereport.config.authorization.UserPermission;

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

    private static final String SPEL_HAS_PERMISSION = "@" + AUTHORIZER_BEAN + ".userHasPermission("
            + "T(gov.cdc.usds.simplereport.config.authorization.UserPermission).";
    /**
     * Apply this annotation if the method should only be called by site-wide
     * administrative users ("superusers").
     */
    @Retention(RUNTIME)
    @Target(METHOD)
    @PreAuthorize("@" + AUTHORIZER_BEAN + ".userHasSiteAdminRole()")
    public @interface RequireGlobalAdminUser {
    }

    /**
     * Require the current user to have the {@link UserPermission#READ_PATIENT_LIST}
     * permission.
     */
    @Retention(RUNTIME)
    @Target(METHOD)
    @PreAuthorize(SPEL_HAS_PERMISSION + "READ_PATIENT_LIST" + ")")
    public @interface RequirePermissionReadPatientList {
    }

    /**
     * Require the current user to have the {@link UserPermission#READ_RESULT_LIST}
     * permission.
     */
    @Retention(RUNTIME)
    @Target(METHOD)
    @PreAuthorize(SPEL_HAS_PERMISSION + "READ_RESULT_LIST" + ")")
    public @interface RequirePermissionReadResultList {
    }

    /**
     * Require the current user to have the {@link UserPermission#EDIT_PATIENT}
     * permission.
     */
    @Retention(RUNTIME)
    @Target(METHOD)
    @PreAuthorize(SPEL_HAS_PERMISSION + "EDIT_PATIENT" + ")")
    public @interface RequirePermissionEditPatient {
    }

    /**
     * Require the current user to have the {@link UserPermission#EDIT_FACILITY}
     * permission.
     */
    @Retention(RUNTIME)
    @Target(METHOD)
    @PreAuthorize(SPEL_HAS_PERMISSION + "EDIT_FACILITY" + ")")
    public @interface RequirePermissionEditFacility {
    }

    /**
     * Require the current user to have the {@link UserPermission#EDIT_ORGANIZATION}
     * permission.
     */
    @Retention(RUNTIME)
    @Target(METHOD)
    @PreAuthorize(SPEL_HAS_PERMISSION + "EDIT_ORGANIZATION" + ")")
    public @interface RequirePermissionEditOrganization {
    }

    /**
     * Require the current user to have the {@link UserPermission#START_TEST}
     * permission.
     */
    @Retention(RUNTIME)
    @Target(METHOD)
    @PreAuthorize(SPEL_HAS_PERMISSION + "START_TEST" + ")")
    public @interface RequirePermissionStartTest {
    }

    /**
     * Require the current user to have the {@link UserPermission#UPDATE_TEST}
     * permission.
     */
    @Retention(RUNTIME)
    @Target(METHOD)
    @PreAuthorize(SPEL_HAS_PERMISSION + "UPDATE_TEST" + ")")
    public @interface RequirePermissionUpdateTest {
    }

    /**
     * Require the current user to have the {@link UserPermission#SUBMIT_TEST}
     * permission.
     */
    @Retention(RUNTIME)
    @Target(METHOD)
    @PreAuthorize(SPEL_HAS_PERMISSION + "SUBMIT_TEST" + ")")
    public @interface RequirePermissionSubmitTest {
    }
}
