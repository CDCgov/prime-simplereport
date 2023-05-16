package gov.cdc.usds.simplereport.config;

import feign.Request.HttpMethod;
import feign.RequestInterceptor;
import java.util.Collection;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;

public class DataHubClientConfiguration {

  @Value("${datahub.api-key}")
  private String apiKey;

  @Value("${datahub.signing-key}")
  private String signingKey;

  @Value("${datahub.csv-upload-api-client}")
  private String simpleReportCsvUploadClientName;

  @Value("${datahub.csv-upload-api-fhir-client}")
  private String simpleReportCsvUploadFhirClientName;

  @Value("${datahub.api-version}")
  private String csvApiVersion;

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
      if (template.method().equals(HttpMethod.POST.toString()) && template.body() == null) {
        template.body("{}");
      }

      template.header("client", getClientName(template.headers().get("Content-Type")));

      template.header("x-api-version", csvApiVersion);
      template.header("x-functions-key", apiKey);
    };
  }

  private String getClientName(Collection<String> contentType) {
    if (contentType != null && contentType.contains("application/fhir+ndjson")) {
      return simpleReportCsvUploadFhirClientName;
    }
    return simpleReportCsvUploadClientName;
  }
}
