package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.TerminologyExchangeClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * Client to connect with Association of Public Health Laboratories (APHL) Terminology Exchange
 * Service (TES)
 */
@FeignClient(
    name = "terminology-exchange-service",
    url = "${aphl.tes.url}",
    configuration = TerminologyExchangeClientConfig.class)
public interface TerminologyExchangeClient {
  @GetMapping(value = "/ValueSet?context-type=focus", consumes = "application/text")
  String getConditions();
}
