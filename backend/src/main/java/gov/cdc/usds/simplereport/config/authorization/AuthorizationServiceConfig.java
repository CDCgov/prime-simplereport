package gov.cdc.usds.simplereport.config.authorization;

import java.util.Collections;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.service.AuthorizationService;
import gov.cdc.usds.simplereport.service.LoggedInAuthorizationService;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;

@Configuration
public class AuthorizationServiceConfig {

    @Bean
    @Profile("!"+BeanProfiles.SINGLE_TENANT)
    public AuthorizationService getRealAuthorizer(OrganizationExtractor extractor,
            OrganizationInitializingService initService) {
        return new LoggedInAuthorizationService(extractor, initService);
    }

    @Bean
    @Profile(BeanProfiles.SINGLE_TENANT)
    public AuthorizationService getDummyAuthorizer(InitialSetupProperties setupProps,
            OrganizationInitializingService initService) {
        final OrganizationRoles defaultOrg = new OrganizationRoles(
                setupProps.getOrganization().getExternalId(),
                Collections.singleton(OrganizationRole.USER));
        return () -> {
            initService.initAll();
            return Collections.singletonList(defaultOrg);
        };
    }
}
