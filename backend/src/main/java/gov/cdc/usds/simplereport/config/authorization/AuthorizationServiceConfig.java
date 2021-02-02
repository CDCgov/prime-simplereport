package gov.cdc.usds.simplereport.config.authorization;

import java.util.Collections;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.service.AuthorizationService;
import gov.cdc.usds.simplereport.service.LoggedInAuthorizationService;

@Configuration
public class AuthorizationServiceConfig {

    @Bean
    @Profile("!"+BeanProfiles.SINGLE_TENANT)
    public AuthorizationService getRealAuthorizer(OrganizationExtractor extractor) {
        return new LoggedInAuthorizationService(extractor);
    }

    @Bean
    @Profile(BeanProfiles.SINGLE_TENANT)
    public AuthorizationService getDemoAuthorizer(DemoUserConfiguration configProps) {
        final OrganizationRoles defaultOrg = configProps.getDefaultUser().getAuthorization();
        return () -> Collections.singletonList(defaultOrg);
    }
}
