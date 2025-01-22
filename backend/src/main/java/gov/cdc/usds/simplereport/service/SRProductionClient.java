package gov.cdc.usds.simplereport.service;

import gov.cdc.usds.simplereport.config.SRProductionClientConfiguration;
import gov.cdc.usds.simplereport.db.model.DeviceType;
import java.util.List;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

// @ConditionalOnProperty
@FeignClient(
    name = "sr-prod",
    url = "${simple-report.production.backend-url}",
    configuration = SRProductionClientConfiguration.class)
public interface SRProductionClient {
  @GetMapping(value = "/devices")
  List<DeviceType> getProdDeviceTypes();
}
