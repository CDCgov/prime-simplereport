package gov.cdc.usds.simplereport;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.simplereport.AdminEmailList;

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
}
