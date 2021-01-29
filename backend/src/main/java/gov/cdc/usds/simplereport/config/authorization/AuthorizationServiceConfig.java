package gov.cdc.usds.simplereport.config.authorization;

import java.util.Collections;
import java.util.Set;

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
    public AuthorizationService getRealAuthorizer(OrganizationExtractor extractor) {
        return new LoggedInAuthorizationService(extractor);
    }

    @Bean
    @Profile(BeanProfiles.SINGLE_TENANT)
    public AuthorizationService getDummyAuthorizer(InitialSetupProperties setupProps,
            OrganizationInitializingService initService) {
        final AuthorityBasedOrganizationRoles defaultOrg = new AuthorityBasedOrganizationRoles(
                setupProps.getOrganization().getExternalId(),
                Set.of(OrganizationRole.USER, OrganizationRole.ADMIN));
        return () -> Collections.singletonList(defaultOrg);
    }
}
