package gov.cdc.usds.simplereport.db.model.auxiliary;

import java.util.HashMap;
import java.util.List;

public record FHIRBundleRecord(List<String> serializedBundle, HashMap<String, Integer> metadata) {}
