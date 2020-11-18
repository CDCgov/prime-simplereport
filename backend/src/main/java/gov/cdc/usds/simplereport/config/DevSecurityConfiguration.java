package gov.cdc.usds.simplereport.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

/**
 * Stub no-op configuration for development and test environments.
 */
@Profile(DevSecurityConfiguration.PROFILE)
@Configuration
public class DevSecurityConfiguration extends WebSecurityConfigurerAdapter {

    private static final Logger logger = LoggerFactory.getLogger(DevSecurityConfiguration.class);

    public static final String PROFILE = "no-security";

    @Override
    public void configure(WebSecurity web) {
        logger.warn("SECURITY DISABLED BY {} PROFILE", PROFILE);
        web
                .ignoring()
                .antMatchers("/**");
    }
}
