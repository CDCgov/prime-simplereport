package gov.cdc.usds.simplereport.service.fhirConversion;

import java.util.Map;
import java.util.UUID;
import org.hl7.fhir.r4.model.Bundle;

public interface FhirConversionStrategy {
  Bundle convertRowToFhirBundle(Map<String, String> csvRow, UUID orgId);
}
