package gov.cdc.usds.simplereport.config;

import feign.RequestInterceptor;
import feign.auth.BasicAuthRequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

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
