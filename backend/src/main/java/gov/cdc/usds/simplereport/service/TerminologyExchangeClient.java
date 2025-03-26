package gov.cdc.usds.simplereport.service;

import feign.Response;
import gov.cdc.usds.simplereport.config.TerminologyExchangeClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/**
 * Client to connect with Association of Public Health Laboratories (APHL) Terminology Exchange
 * Service (TES)
 */
@FeignClient(
    name = "terminology-exchange-service",
    url = "${aphl.tes.url}",
    configuration = TerminologyExchangeClientConfig.class)
public interface TerminologyExchangeClient {
  @GetMapping(
      value = "/ValueSet?context-type=focus&_count={count}&_getpagesoffset={pageOffset}",
      consumes = "application/text")
  Response getConditions(
      @PathVariable("count") int count, @PathVariable("pageOffset") int pageOffset);
}
