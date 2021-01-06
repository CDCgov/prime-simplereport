package gov.cdc.usds.simplereport.config;

/**
 * Constant-holding class to describe the bean profiles available in this
 * application.
 */
public final class BeanProfiles {

    /** Profile for testing authentication and authorization */
    public static final String AUTHORIZATION_DEV = "auth-dev";
    /** Profile for mocking and bypassing most security (DEV OR TEST ONLY) */
    public static final String NO_SECURITY = "no-security";
    /**
     * Profile where we assume there is a single tenant and do not check for roles
     * in the authentication token.
     */
    public static final String SINGLE_TENANT = "single-tenant";
    /**
     * Profile for local development, sometimes also used for QA/Demo environments.
     */
    public static final String DEVELOPMENT = "dev";
    /** Profile that creates sample data on application startup. */
    public static final String CREATE_SAMPLE_DATA = "create-sample-data";

    private BeanProfiles() { /* no instances! */ }

}
