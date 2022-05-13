package gov.cdc.usds.simplereport.service;

import feign.Param;
import gov.cdc.usds.simplereport.config.DataHubClientConfiguration;
import gov.cdc.usds.simplereport.service.model.reportstream.TokenResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import java.util.Map;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.cloud.openfeign.SpringQueryMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(
    name = "data-hub",
    url = "${data-hub.url}",
    configuration = DataHubClientConfiguration.class)
public interface DataHubClient {

  @PostMapping(value = "/api/waters", consumes = "text/csv")
  UploadResponse uploadCSVV2(@Param("file") byte[] file);

  @PostMapping(value = "/api/reports", consumes = "text/csv")
  UploadResponse uploadCSV(@Param("file") byte[] file);

  @PostMapping(value = "/api/token")
  TokenResponse fetchAccessToken(@SpringQueryMap Map<String, String> parameters);

  @GetMapping(value = "/api/waters/report/{id}/history", consumes = "application/text")
  UploadResponse getSubmission(
      @PathVariable("id") String id,
      @RequestHeader(value = "Authorization", required = true) String authorizationHeader);
}
