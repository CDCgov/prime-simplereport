package gov.cdc.usds.simplereport.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;

/**
 * Stub no-op configuration for development and test environments.
 */
@Profile(DevSecurityConfiguration.PROFILE)
@Configuration
public class DevSecurityConfiguration extends WebSecurityConfigurerAdapter {

    private static final Logger logger = LoggerFactory.getLogger(DevSecurityConfiguration.class);

    public static final String PROFILE = "no-security";

    public static final class DummyIdentity {
        public static final String EMAIL = "bob@example.com";
        public static final String FIRST_NAME = "Bobbity";
        public static final String MIDDLE_NAME = "Bob";
        public static final String LAST_NAME = "Bobberoo";
        public static final String SUFFIX = null;
    }

    @Override
    public void configure(WebSecurity web) {
        logger.warn("SECURITY DISABLED BY {} PROFILE", PROFILE);
        web
                .ignoring()
                .antMatchers("/**");
    }

	@Bean
	public IdentitySupplier getDummyIdentity() {
		return () -> new IdentityAttributes(
			DevSecurityConfiguration.DummyIdentity.EMAIL, 
			DevSecurityConfiguration.DummyIdentity.FIRST_NAME,
			DevSecurityConfiguration.DummyIdentity.MIDDLE_NAME,
			DevSecurityConfiguration.DummyIdentity.LAST_NAME,
			DevSecurityConfiguration.DummyIdentity.SUFFIX
		);
	}
}
