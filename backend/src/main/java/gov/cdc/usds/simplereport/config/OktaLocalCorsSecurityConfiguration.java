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

@Configuration
@Profile("!" + BeanProfiles.NO_SECURITY + " & " + BeanProfiles.CREATE_SAMPLE_DEVICES)
@ConditionalOnWebApplication
@Slf4j
public class OktaLocalCorsSecurityConfiguration implements WebMvcConfigurer {
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
