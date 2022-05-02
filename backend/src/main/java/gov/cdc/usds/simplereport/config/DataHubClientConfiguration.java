package gov.cdc.usds.simplereport.config;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

public class DataHubClientConfiguration {

  @Value("${data-hub.api-key}")
  private String apiKey;

  private static final String CSV_API_VERSION = "2021-09-21";
  private static final String SIMPLE_REPORT_CLIENT_NAME = "simple_report";

  @Bean
  public RequestInterceptor headerRequestInterceptor() {
    return template -> {
      template.header("client", SIMPLE_REPORT_CLIENT_NAME);
      template.header("x-api-version", CSV_API_VERSION);
      template.header("x-functions-key", apiKey);
    };
  }
}
