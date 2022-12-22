package gov.cdc.usds.simplereport.api.converter;

public class FhirConstants {
  private FhirConstants() {
    throw new IllegalStateException("Utility class");
  }

  public static final String NULL_CODE_SYSTEM =
      "http://terminology.hl7.org/CodeSystem/v3-NullFlavor";
  public static final String RACE_EXTENSION_URL =
      "http://ibm.com/fhir/cdm/StructureDefinition/local-race-cd";
  public static final String RACE_CODING_SYSTEM = "http://terminology.hl7.org/CodeSystem/v3-Race";
  public static final String ETHNICITY_EXTENSION_URL =
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity";
  public static final String ETHNICITY_CODE_SYSTEM = "urn:oid:2.16.840.1.113883.6.238";
  public static final String TRIBAL_AFFILIATION_EXTENSION_URL =
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-tribal-affiliation";
  public static final String TRIBAL_AFFILIATION_STRING = "tribalAffiliation";
  public static final String TRIBAL_AFFILIATION_CODE_SYSTEM =
      "http://terminology.hl7.org/CodeSystem/v3-TribalEntityUS";
  public static final String SNOMED_CODE_SYSTEM = "http://snomed.info/sct";
}
