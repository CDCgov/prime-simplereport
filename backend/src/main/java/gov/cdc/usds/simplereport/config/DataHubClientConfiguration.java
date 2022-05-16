package gov.cdc.usds.simplereport.config;

import feign.Request.HttpMethod;
import feign.RequestInterceptor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

public class DataHubClientConfiguration {

  @Value("${data-hub.api-key}")
  private String apiKey;

  @Value("${data-hub.signing-key}")
  private String signingKey;

  private static final String CSV_API_VERSION = "2021-09-21";
  private static final String SIMPLE_REPORT_CLIENT_NAME = "simple_report";

  @Bean
  public RequestInterceptor headerRequestInterceptor() {
    return template -> {
      // Some endpoints may require a `POST` verb but accept request parameters
      // as URL params/query strings instead of a body. Our client seems to set
      // a Content-Length header of `0` for such requests, resulting in a failure
      // with the non-existent body.
      //
      // As a hack, set an empty request body to force an accurate Content-Length
      // header.
      if (template.method() == HttpMethod.POST.toString()) {
        template.body("{}");
      }

      template.header("client", SIMPLE_REPORT_CLIENT_NAME);
      template.header("x-api-version", CSV_API_VERSION);
      template.header("x-functions-key", apiKey);
    };
  }
}
