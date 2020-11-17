package gov.cdc.usds.simplereport.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

/**
 * Created by nickrobison on 11/16/20
 */
@Profile("dev") // Configuration is only active in the dev profile
@Configuration
public class DevSecurityConfiguration extends WebSecurityConfigurerAdapter {

    private static final Logger logger = LoggerFactory.getLogger(DevSecurityConfiguration.class);

    @Override
    public void configure(WebSecurity web) {
        logger.warn("SECURITY DISABLED IN DEV PROFILE");
        web
                .ignoring()
                .antMatchers("/**");
    }
}
