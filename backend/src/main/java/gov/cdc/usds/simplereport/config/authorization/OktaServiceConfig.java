package gov.cdc.usds.simplereport.config.authorization;

import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.Map.Entry;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.InitialSetupProperties;
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
    public OktaService getDummyOktaService(InitialSetupProperties setupProps) {
        Map<String,AuthorityBasedOrganizationRoles> usernameRolesMap = new HashMap<>();
        for (Entry<IdentityAttributes, List<OrganizationRole>> userRole : setupProps.getUserRolesMap().entrySet()) {
            IdentityAttributes user = userRole.getKey();
            String username = user.getUsername();
            System.out.print("USERNAME " + username);
            System.out.print("ORG " + setupProps.getOrganization().getExternalId());
            AuthorityBasedOrganizationRoles orgRoles = 
                    new AuthorityBasedOrganizationRoles(setupProps.getOrganization().getExternalId(),
                                                        userRole.getValue());
            usernameRolesMap.put(username, orgRoles);
        }
        return new OktaServiceEmptyImpl(usernameRolesMap);
    }
}
