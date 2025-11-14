package gov.cdc.usds.simplereport;

import gov.cdc.usds.simplereport.config.AimsProperties;
import gov.cdc.usds.simplereport.config.AuthorizationProperties;
import gov.cdc.usds.simplereport.config.BeanProfiles;
import gov.cdc.usds.simplereport.config.CorsProperties;
import gov.cdc.usds.simplereport.config.HL7Properties;
import gov.cdc.usds.simplereport.config.InitialSetupProperties;
import gov.cdc.usds.simplereport.config.simplereport.DemoUserConfiguration;
import gov.cdc.usds.simplereport.properties.AzureStorageQueueReportingProperties;
import gov.cdc.usds.simplereport.properties.ExperianProperties;
import gov.cdc.usds.simplereport.properties.OrderingProviderProperties;
import gov.cdc.usds.simplereport.properties.SendGridProperties;
import gov.cdc.usds.simplereport.properties.SmartyStreetsProperties;
import gov.cdc.usds.simplereport.properties.SupportEscalationProperties;
import gov.cdc.usds.simplereport.service.DiseaseService;
import gov.cdc.usds.simplereport.service.OrganizationInitializingService;
import lombok.extern.slf4j.Slf4j;
import net.javacrumbs.shedlock.spring.annotation.EnableSchedulerLock;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.condition.ConditionalOnSingleCandidate;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.info.GitProperties;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContextHolderStrategy;

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
  OrderingProviderProperties.class,
  CorsProperties.class,
  AzureStorageQueueReportingProperties.class,
  SupportEscalationProperties.class,
  AimsProperties.class,
  HL7Properties.class
})
@EnableAsync
@EnableScheduling
@EnableSchedulerLock(defaultLockAtMostFor = "PT30S")
@EnableFeignClients
public class SimpleReportApplication {
  public static void main(String[] args) {
    SpringApplication.run(SimpleReportApplication.class, args);
  }

  @Bean
  static SecurityContextHolderStrategy securityContextHolderStrategy() {
    SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
    return SecurityContextHolder.getContextHolderStrategy();
  }

  @Bean
  public CommandLineRunner initDiseasesOnStartup(DiseaseService initService) {
    return args -> initService.initDiseases();
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
  @ConditionalOnSingleCandidate(GitProperties.class)
  public CommandLineRunner logGitCommit(GitProperties gitProperties) {
    return args -> log.info("Current commit is: {}", gitProperties.getCommitId());
  }
}
