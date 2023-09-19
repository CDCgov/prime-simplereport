package gov.cdc.usds.simplereport.service.fhirConversion;

import gov.cdc.usds.simplereport.api.model.filerow.FileRow;
import gov.cdc.usds.simplereport.api.model.filerow.TestResultRow;

import java.io.InputStream;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface Strategy {
    List<String> convertToFhirBundles(InputStream csvStream, UUID orgId);

    List<String> convertRowToFhirBundle(FileRow csvRowStream, UUID orgId);

}
