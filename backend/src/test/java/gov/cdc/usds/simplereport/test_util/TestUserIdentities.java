package gov.cdc.usds.simplereport.test_util;

import gov.cdc.usds.simplereport.service.model.IdentityAttributes;

public class TestUserIdentities {

    public static final String SITE_ADMIN_USER = "ruby@example.com";
    public static final String STANDARD_USER = "bob@example.com";

    public static final IdentityAttributes STANDARD_USER_ATTRIBUTES = new IdentityAttributes(STANDARD_USER, "Bobbity",
            "Bob", "Bobberoo", null);
    public static final IdentityAttributes SITE_ADMIN_USER_ATTRIBUTES = new IdentityAttributes(SITE_ADMIN_USER, "Ruby",
            "Raven", "Reynolds", null);
}
