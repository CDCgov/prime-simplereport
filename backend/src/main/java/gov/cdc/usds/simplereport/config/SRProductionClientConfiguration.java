package gov.cdc.usds.simplereport.config;

import static gov.cdc.usds.simplereport.config.BeanProfiles.PROD;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Profile("!" + PROD)
public class SRProductionClientConfiguration {

  @Value("${simple-report.production.devices-token}")
  private String token;

  @Bean
  public RequestInterceptor headerRequestInterceptor() {
    return template -> {
      template.header("sr-prod-devices-token", token);
    };
  }
}
