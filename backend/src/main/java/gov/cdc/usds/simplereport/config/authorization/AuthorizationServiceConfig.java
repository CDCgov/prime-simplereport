package gov.cdc.usds.simplereport.config.authorization;

import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.service.AuthorizationService;
import gov.cdc.usds.simplereport.service.LoggedInAuthorizationService;
import java.util.Collections;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class AuthorizationServiceConfig {

  @Bean
  @Profile("!" + BeanProfiles.SINGLE_TENANT)
  public AuthorizationService getRealAuthorizer(OrganizationExtractor extractor) {
    return new LoggedInAuthorizationService(extractor);
  }

  @Bean
  @Profile(BeanProfiles.SINGLE_TENANT)
  public AuthorizationService getDemoAuthorizer(DemoUserConfiguration configProps) {
    final OrganizationRoleClaims defaultOrg = configProps.getDefaultUser().getAuthorization();
    return () -> Collections.singletonList(defaultOrg);
  }
}
