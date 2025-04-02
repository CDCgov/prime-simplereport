package gov.cdc.usds.simplereport.service;

import feign.Response;
import gov.cdc.usds.simplereport.config.LoincFhirClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

/** Client to connect with LOINC FHIR API */
@FeignClient(
    name = "loinc-fhir-terminology-service",
    url = "${loinc-fhir.url}",
    configuration = LoincFhirClientConfig.class)
public interface LoincFhirClient {

  @GetMapping(
      value = "/CodeSystem/$lookup?system=http://loinc.org&code={code}",
      consumes = "application/text")
  Response getCodeSystemLookup(@PathVariable("code") String code);
}
