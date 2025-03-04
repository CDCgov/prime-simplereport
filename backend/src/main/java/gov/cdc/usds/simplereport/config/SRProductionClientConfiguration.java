package gov.cdc.usds.simplereport.config;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

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
