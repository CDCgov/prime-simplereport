package gov.cdc.usds.simplereport.config;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

public class TerminologyExchangeClientConfig {

  @Value("${aphl.tes.api-key}")
  private String apiKey;

  @Bean
  public RequestInterceptor headerRequestInterceptor() {
    return template -> {
      template.header("x-api-key", apiKey);
    };
  }
}
