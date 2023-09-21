package gov.cdc.usds.simplereport.service.fhirConversion.config;

import gov.cdc.usds.simplereport.service.fhirConversion.FhirConverter;
import gov.cdc.usds.simplereport.service.fhirConversion.strategies.ConvertToFhirForBulkTestUpload;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class BulkUploadFhirConfig {
  private final ConvertToFhirForBulkTestUpload bulkTestResultUploadFhirConverter;

  @Bean
  FhirConverter bulkUploadFhirConverter() {
    return new FhirConverter(bulkTestResultUploadFhirConverter);
  }
}
