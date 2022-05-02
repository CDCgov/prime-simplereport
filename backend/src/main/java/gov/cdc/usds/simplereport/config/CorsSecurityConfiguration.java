package gov.cdc.usds.simplereport.config;

import java.util.List;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.web.servlet.config.annotation.CorsRegistration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Live (with Okta integration) request-level security configuration. Not to be confused with {@link
 * AuthorizationConfiguration}, which is not environment-specific and handles method-level or
 * object-level security.
 */
@Configuration
@Profile(
    "!"
        + BeanProfiles.NO_SECURITY // Activate the "no-security" profile to disable security
        + " & !"
        + BeanProfiles.CREATE_SAMPLE_DEVICES) // If we're creating sample devices,
@ConditionalOnWebApplication
@Slf4j
public class CorsSecurityConfiguration implements WebMvcConfigurer {

  @Autowired CorsProperties _corsProperties;

  @Override
  public void addCorsMappings(CorsRegistry registry) {
    CorsRegistration reg = registry.addMapping("/**");

    List<String> methods = _corsProperties.getAllowedMethods();
    if (methods != null && !methods.isEmpty()) {
      reg.allowedMethods(methods.toArray(String[]::new));
    }

    List<String> origins = _corsProperties.getAllowedOrigins();
    if (origins != null && !origins.isEmpty()) {
      reg.allowedOrigins(origins.toArray(String[]::new));
    }
  }
}
