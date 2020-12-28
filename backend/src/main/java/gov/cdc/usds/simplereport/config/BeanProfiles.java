package gov.cdc.usds.simplereport.config;

/**
 * Constant-holding interface to describe the bean profiles available in this
 * application.
 */
public interface BeanProfiles {

    /** Profile for testing authentication and authorization */
    String AUTHORIZATION_DEV = "auth-dev";
    /** Profile for mocking and bypassing most security (DEV OR TEST ONLY) */
    String NO_SECURITY = "no-security";
}
