package gov.cdc.usds.simplereport.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;

/** Stub no-op configuration for development and test environments. */
@Profile(BeanProfiles.NO_SECURITY)
@Configuration
@ConditionalOnWebApplication
@Slf4j
public class DevSecurityConfiguration {
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    log.warn("SECURITY DISABLED BY {} PROFILE", BeanProfiles.NO_SECURITY);
    http.authorizeHttpRequests(
            authorizeRequest -> authorizeRequest.requestMatchers("/**").permitAll())
        .csrf(AbstractHttpConfigurer::disable)
        .cors();
    return http.build();
  }
}
