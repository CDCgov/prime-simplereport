package gov.cdc.usds.simplereport.config;

import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

public class DataHubClientConfiguration {

  @Value("${datahub.api-key}")
  private String apiKey;

  @Value("${datahub.api-version}")
  private String csvApiVersion;

  @Value("${datahub.csv-upload-api-client}")
  private String simpleReportCsvUploadClientName;

  @Bean
  public RequestInterceptor headerRequestInterceptor() {
    return template -> {
      template.header("client", simpleReportCsvUploadClientName);
      template.header("x-api-version", csvApiVersion);
      template.header("x-functions-key", apiKey);
    };
  }
}
