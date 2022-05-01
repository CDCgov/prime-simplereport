package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.DataHubClientConfiguration;
import gov.cdc.usds.simplereport.service.model.reportstream.UploadResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;

@FeignClient(
    name = "data-hub",
    url = "${data-hub.url}",
    configuration = DataHubClientConfiguration.class)
public interface DataHubClient {

  @PostMapping(value = "/api/waters", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  UploadResponse uploadCSV(@RequestPart(value = "file") byte[] file);
}
