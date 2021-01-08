package gov.cdc.usds.simplereport;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.simplereport.AdminEmailList;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;

@SpringBootApplication
@EnableConfigurationProperties({
        InitialSetupProperties.class,
        AdminEmailList.class,
        AuthorizationProperties.class,
})
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
