package gov.cdc.usds.simplereport.service;

import feign.Param;
import gov.cdc.usds.simplereport.config.DataHubClientConfiguration;
import gov.cdc.usds.simplereport.service.model.reportstream.LIVDResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.TokenResponse;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.cloud.openfeign.SpringQueryMap;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

@FeignClient(
    name = "datahub",
    url = "${datahub.url}",
    configuration = DataHubClientConfiguration.class)
public interface DataHubClient {

  @PostMapping(value = "/api/reports?processing=async", consumes = "text/csv")
  UploadResponse uploadCSV(@Param("file") byte[] file);

  @PostMapping(value = "/api/waters", consumes = "application/fhir+ndjson")
  UploadResponse uploadFhir(
      @RequestBody() String fhirNDJson, @RequestHeader(value = "Authorization") String authHeader);

  @PostMapping(value = "/api/token")
  TokenResponse fetchAccessToken(@SpringQueryMap Map<String, String> parameters);

  @GetMapping(value = "/api/waters/report/{id}/history", consumes = "application/text")
  UploadResponse getSubmission(
      @PathVariable("id") UUID id,
      @RequestHeader(value = "Authorization", required = true) String authorizationHeader);

  @GetMapping(value = "/api/metadata/livd", consumes = "application/text")
  List<LIVDResponse> getLIVDTable();
}
