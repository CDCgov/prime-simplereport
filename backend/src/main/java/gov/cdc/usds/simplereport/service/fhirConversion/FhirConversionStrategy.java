package gov.cdc.usds.simplereport.service.fhirConversion;

import gov.cdc.usds.simplereport.api.model.filerow.FileRow;
import org.hl7.fhir.r4.model.Bundle;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

public interface FhirConversionStrategy {
    Bundle convertRowToFhirBundle(FileRow csvRow, UUID orgId);

    List<String> convertToFhirBundles(InputStream csvStream, UUID orgId);
}
