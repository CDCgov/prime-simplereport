package gov.cdc.usds.simplereport.config.authorization;

import gov.cdc.usds.simplereport.api.model.errors.MisconfiguredUserException;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.idp.repository.OktaRepository;
import gov.cdc.usds.simplereport.service.ApiUserService;
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

  // I know all the stuff below is likely going to get moved soon anyway, 
  // so I didn't put it in a dedicated demo authorization service.
  @Bean
  @Profile(BeanProfiles.SINGLE_TENANT)
  public AuthorizationService getDemoAuthorizer(ApiUserService apiUserService, 
                                                OktaRepository oktaRepo) {
    return () -> {
      String username = apiUserService.getCurrentApiUserInContainedTransaction().getLoginEmail();
      final OrganizationRoleClaims authorization = 
          oktaRepo.getOrganizationRoleClaimsForUser(username).orElseThrow(MisconfiguredUserException::new);
      return Collections.singletonList(authorization);
    };
  }
}