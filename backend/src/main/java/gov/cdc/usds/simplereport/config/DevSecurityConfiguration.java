package gov.cdc.usds.simplereport.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;

/** Stub no-op configuration for development and test environments. */
@Profile(BeanProfiles.NO_SECURITY)
@Configuration
@ConditionalOnWebApplication
@Slf4j
public class DevSecurityConfiguration extends WebSecurityConfigurerAdapter {
  @Override
  public void configure(HttpSecurity http) throws Exception {
    log.warn("SECURITY DISABLED BY {} PROFILE", BeanProfiles.NO_SECURITY);
    http.cors().and().authorizeRequests().antMatchers("/**").permitAll().and().csrf().disable();
  }
}
