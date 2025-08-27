package gov.cdc.usds.simplereport.db.model.auxiliary;

import java.util.HashMap;

public record HL7BatchMessage(
    String message, int recordsCount, HashMap<String, Integer> metadata) {}
