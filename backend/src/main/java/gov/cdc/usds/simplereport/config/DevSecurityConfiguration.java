package gov.cdc.usds.simplereport.config;

import static org.springframework.security.config.Customizer.withDefaults;

import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

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
        .cors(withDefaults());
    return http.build();
  }

  @Bean
  CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(List.of("/**"));
    configuration.setAllowedMethods(List.of("*"));
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
  }
}
