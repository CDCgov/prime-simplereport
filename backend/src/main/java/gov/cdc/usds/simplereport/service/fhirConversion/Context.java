package gov.cdc.usds.simplereport.service.fhirConversion;

import lombok.AllArgsConstructor;

import java.io.InputStream;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
public class Context {
    private Strategy conversionStrategy;

    public List<String> convertToFhirBundles(InputStream csvStream, UUID orgId) {
        return conversionStrategy.convertToFhirBundles(csvStream, orgId);
    }

    public List<String> convertRowToFhirBundle(InputStream csvStream, UUID orgId) {
        return conversionStrategy.convertToFhirBundles(csvStream, orgId);
    }
}
