package gov.cdc.usds.simplereport.config.authorization;

import java.util.HashMap;
import java.util.Map;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration.DemoUser;
import gov.cdc.usds.simplereport.service.OktaService;
import gov.cdc.usds.simplereport.service.OktaServiceImpl;
import gov.cdc.usds.simplereport.service.model.IdentityAttributes;
import gov.cdc.usds.simplereport.service.OktaServiceEmptyImpl;

import com.okta.spring.boot.sdk.config.OktaClientProperties;

@Configuration
public class OktaServiceConfig {

    @Bean
    @Profile("!"+BeanProfiles.NO_OKTA_MGMT)
    public OktaService getRealOktaService(AuthorizationProperties authorizationProperties,
            OktaClientProperties oktaClientProperties) {
        return new OktaServiceImpl(authorizationProperties, oktaClientProperties);
    }

    @Bean
    @Profile(BeanProfiles.NO_OKTA_MGMT)
    public OktaService getDummyOktaService(InitialSetupProperties setupProps, DemoUserConfiguration demoUsers) {
        Map<String,OrganizationRoleClaims> usernameRolesMap = new HashMap<>();
        for (DemoUser altUser : demoUsers.getAlternateUsers()) {
            IdentityAttributes user = altUser.getIdentity();
            String username = user.getUsername();
            OrganizationRoleClaims orgRoles = 
                    new OrganizationRoleClaims(altUser.getAuthorization().getOrganizationExternalId(),
                                               altUser.getAuthorization().getGrantedRoles());
            usernameRolesMap.put(username, orgRoles);
        }
        return new OktaServiceEmptyImpl(usernameRolesMap);
    }
}
