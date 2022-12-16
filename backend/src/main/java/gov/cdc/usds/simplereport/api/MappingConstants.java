package gov.cdc.usds.simplereport.api;

public class MappingConstants {
  private MappingConstants() {
    throw new IllegalStateException("Utility class");
  }

  public static final String NULL_CODE_SYSTEM =
      "http://terminology.hl7.org/CodeSystem/v3-NullFlavor";
  public static final String UNK_CODE = "UNK";
  public static final String UNKNOWN_STRING = "unknown";
  public static final String U_CODE = "U";
  public static final String ASKED_BUT_UNKNOWN_CODE = "ASKU";
  public static final String RACE_EXTENSION_URL =
      "http://ibm.com/fhir/cdm/StructureDefinition/local-race-cd";
  public static final String RACE_CODING_SYSTEM = "http://terminology.hl7.org/CodeSystem/v3-Race";
  public static final String ETHNICITY_EXTENSION_URL =
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity";
  public static final String ETHNICITY_CODE_SYSTEM = "urn:oid:2.16.840.1.113883.6.238";
}
