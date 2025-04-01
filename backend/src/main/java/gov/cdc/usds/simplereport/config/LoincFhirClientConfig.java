package gov.cdc.usds.simplereport.config;

import feign.RequestInterceptor;
import feign.auth.BasicAuthRequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

public class LoincFhirClientConfig {

  @Value("${loinc-fhir.username}")
  private String username;

  @Value("${loinc-fhir.password}")
  private String password;

  @Bean
  public RequestInterceptor headerRequestInterceptor() {
    return new BasicAuthRequestInterceptor(username, password);
  }

}
