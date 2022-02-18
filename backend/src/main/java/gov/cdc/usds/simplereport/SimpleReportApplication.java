package gov.cdc.usds.simplereport;

import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.CorsProperties;
import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.properties.AzureStorageQueueReportingProperties;
import gov.cdc.usds.simplereport.properties.ExperianProperties;
import gov.cdc.usds.simplereport.properties.OrderingProviderProperties;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import gov.cdc.usds.simplereport.properties.SmartyStreetsProperties;
import gov.cdc.usds.simplereport.properties.TwilioProperties;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import gov.cdc.usds.simplereport.service.ScheduledTasksService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnSingleCandidate;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.info.GitProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableScheduling;

@Slf4j
@SpringBootApplication
// Adding any configuration here should probably be added to SliceTestConfiguration
@EnableConfigurationProperties({
  InitialSetupProperties.class,
  AuthorizationProperties.class,
  DemoUserConfiguration.class,
  ExperianProperties.class,
  SmartyStreetsProperties.class,
  SendGridProperties.class,
  TwilioProperties.class,
  OrderingProviderProperties.class,
  CorsProperties.class,
  AzureStorageQueueReportingProperties.class
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

  @Bean
  @Profile(BeanProfiles.CREATE_SAMPLE_DEVICES)
  public CommandLineRunner initDevicesOnStartup(OrganizationInitializingService initService) {
    return args -> initService.initDevices();
  }

  @Bean
  @ConditionalOnProperty("simple-report.id-verification-reminders.enabled")
  public CommandLineRunner scheduleAccountReminderEmails(ScheduledTasksService scheduler) {
    return args -> scheduler.scheduleAccountReminderEmails("0 0 1 * * *", "America/New_York");
  }

  @Bean
  @ConditionalOnSingleCandidate(GitProperties.class)
  public CommandLineRunner logGitCommit(GitProperties gitProperties) {
    return args -> log.info("Current commit is: {}", gitProperties.getCommitId());
  }
}
