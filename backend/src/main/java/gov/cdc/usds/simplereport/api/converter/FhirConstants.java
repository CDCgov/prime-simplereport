package gov.cdc.usds.simplereport.api.converter;

import java.util.Map;

public class FhirConstants {
  private FhirConstants() {
    throw new IllegalStateException("Utility class");
  }

  public static final String NULL_CODE_SYSTEM =
      "http://terminology.hl7.org/CodeSystem/v3-NullFlavor";
  public static final String RACE_EXTENSION_URL =
      "http://ibm.com/fhir/cdm/StructureDefinition/local-race-cd";
  public static final String RACE_CODING_SYSTEM = "http://terminology.hl7.org/CodeSystem/v3-Race";
  public static final String PROCESSING_ID_SYSTEM = "http://terminology.hl7.org/CodeSystem/v2-0103";
  public static final String ETHNICITY_EXTENSION_URL =
      "https://reportstream.cdc.gov/fhir/StructureDefinition/ethnic-group";
  public static final String ETHNICITY_CODE_SYSTEM =
      "http://terminology.hl7.org/CodeSystem/v2-0189";
  public static final String TRIBAL_AFFILIATION_EXTENSION_URL =
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-tribal-affiliation";
  public static final String TRIBAL_AFFILIATION_STRING = "tribalAffiliation";
  public static final String TRIBAL_AFFILIATION_CODE_SYSTEM =
      "http://terminology.hl7.org/CodeSystem/v3-TribalEntityUS";
  public static final String SNOMED_CODE_SYSTEM = "http://snomed.info/sct";
  public static final String LOINC_CODE_SYSTEM = "http://loinc.org";
  public static final String YESNO_CODE_SYSTEM = "http://terminology.hl7.org/ValueSet/v2-0136";

  public static final String EVENT_TYPE_CODE_SYSTEM =
      "http://terminology.hl7.org/CodeSystem/v2-0003";
  public static final String EVENT_TYPE_CODE = "R01";
  public static final String EVENT_TYPE_DISPLAY =
      "ORU/ACK - Unsolicited transmission of an observation message";
  public static final String DEFAULT_COUNTRY = "USA";
  public static final String UNIVERSAL_ID_SYSTEM = "http://terminology.hl7.org/CodeSystem/v2-0301";

  public static final Map<String, String> PROCESSING_ID_DISPLAY =
      Map.of(
          "D", "Debugging",
          "P", "Production",
          "T", "Training");
}
