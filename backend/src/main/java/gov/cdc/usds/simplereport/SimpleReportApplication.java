package gov.cdc.usds.simplereport;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.authorization.AuthorizationPermissions;
import gov.cdc.usds.simplereport.config.simplereport.AdminEmailList;
import gov.cdc.usds.simplereport.config.simplereport.DataHubConfig;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;

@SpringBootApplication
// Adding any configuration here should probably be added to SliceTestConfiguration &/or SliceTestConfigurationAdmin
@EnableConfigurationProperties({
        InitialSetupProperties.class,
        AuthorizationPermissions.class,
        AdminEmailList.class,
        AuthorizationProperties.class,
        DataHubConfig.class,
})
@EnableScheduling
public class SimpleReportApplication {

    public static void main(String[] args) {
        SpringApplication.run(SimpleReportApplication.class, args);
    }

    @Bean
    @Profile(BeanProfiles.CREATE_SAMPLE_DATA)
    public CommandLineRunner initDataOnStartup(OrganizationInitializingService initService) {
        return args -> initService.initAll();
    }
}
