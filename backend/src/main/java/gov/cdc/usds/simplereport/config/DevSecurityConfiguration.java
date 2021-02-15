package gov.cdc.usds.simplereport.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;

/**
 * Stub no-op configuration for development and test environments.
 */
@Profile(BeanProfiles.NO_SECURITY)
@Configuration
@ConditionalOnWebApplication
public class DevSecurityConfiguration extends WebSecurityConfigurerAdapter implements WebMvcConfigurer {

    private static final Logger LOG = LoggerFactory.getLogger(DevSecurityConfiguration.class);

    @Autowired
    private DemoUserConfiguration _demoUsers;

    @Override
    public void configure(HttpSecurity http) throws Exception {
        LOG.warn("SECURITY DISABLED BY {} PROFILE", BeanProfiles.NO_SECURITY);
        http.authorizeRequests().antMatchers("/**").permitAll().and().csrf().disable();
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        LOG.warn("CORS ENABLED BY {} PROFILE", BeanProfiles.NO_SECURITY);
        registry.addMapping("/**");
    }

    @Bean
    public IdentitySupplier getDemoIdentitySupplier() {
        return () -> _demoUsers.getDefaultUser().getIdentity();
    }
}
