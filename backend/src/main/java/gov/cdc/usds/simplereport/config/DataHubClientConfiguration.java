package gov.cdc.usds.simplereport.config;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

public class DataHubClientConfiguration {

  @Value("${datahub.api-key}")
  private String apiKey;

  @Value("${datahub.api-version}")
  private String csvApiVersion;

  @Value("${datahub.api-client}")
  private String simpleReportClientName;

  @Bean
  public RequestInterceptor headerRequestInterceptor() {
    return template -> {
      template.header("client", simpleReportClientName);
      template.header("x-api-version", csvApiVersion);
      template.header("x-functions-key", apiKey);
    };
  }
}
