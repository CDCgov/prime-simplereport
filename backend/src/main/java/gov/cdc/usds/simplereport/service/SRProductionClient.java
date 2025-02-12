package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.SRProductionClientConfiguration;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

/**
 * This client is intended to make HTTP requests to PROD's backend from our non-PROD envs. However,
 * this will still run in the production environment.
 */
@FeignClient(
    name = "sr-production-client",
    url = "${simple-report.production.backend-url}",
    configuration = SRProductionClientConfiguration.class)
public interface SRProductionClient {
  @GetMapping(value = "/devices")
  List<DeviceType> getProdDeviceTypes();
}
