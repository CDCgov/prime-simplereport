package gov.cdc.usds.simplereport.test_util;

import gov.cdc.usds.simplereport.config.AuditingConfig;
import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.simplereport.AdminEmailList;
import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;
import gov.cdc.usds.simplereport.service.ApiUserService;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.service.model.IdentitySupplier;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;

/**
 * Bean creation and wiring required to get slice tests to run without a full
 * application context being created. This is not annotated with a Spring
 * stereotype because we very much do not want it to be picked up automatically!
 */
@Import({ TestDataFactory.class, AuditingConfig.class, ApiUserService.class, OrganizationInitializingService.class })
@EnableConfigurationProperties({InitialSetupProperties.class, AdminEmailList.class, DataHubConfig.class})
public class SliceTestConfiguration {

    @Bean
    public IdentitySupplier dummyIdentityProvider(InitialSetupProperties props) {
        return props::getDefaultUser;
    }
}
