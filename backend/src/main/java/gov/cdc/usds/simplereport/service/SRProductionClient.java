package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.SRProductionClientConfiguration;
import org.springframework.cloud.openfeign.FeignClient;

@FeignClient(
    name = "sr-prod",
    url = "${simple-report.production.backend-url}",
    configuration = SRProductionClientConfiguration.class)
public interface SRProductionClient {}
