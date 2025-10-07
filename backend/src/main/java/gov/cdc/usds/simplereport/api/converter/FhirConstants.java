package gov.cdc.usds.simplereport.api.converter;

import gov.cdc.usds.simplereport.db.model.auxiliary.CodingRecord;
import java.util.Map;

public class FhirConstants {
  private FhirConstants() {
    throw new IllegalStateException("Utility class");
  }

  public static final String NULL_CODE_SYSTEM =
      "http://terminology.hl7.org/CodeSystem/v3-NullFlavor";
  public static final String SNOMED_CODE_SYSTEM = "http://snomed.info/sct";
  public static final String LOINC_CODE_SYSTEM = "http://loinc.org";
  public static final String YESNO_CODE_SYSTEM = "http://terminology.hl7.org/ValueSet/v2-0136";

  public static final String RACE_EXTENSION_URL =
      "http://ibm.com/fhir/cdm/StructureDefinition/local-race-cd";
  public static final String RACE_CODING_SYSTEM = "http://terminology.hl7.org/CodeSystem/v3-Race";
  public static final String ETHNICITY_EXTENSION_URL =
      "https://reportstream.cdc.gov/fhir/StructureDefinition/ethnic-group";
  public static final String ETHNICITY_CODE_SYSTEM =
      "http://terminology.hl7.org/CodeSystem/v2-0189";

  public static final String TESTKIT_NAME_ID_EXTENSION_URL =
      "https://reportstream.cdc.gov/fhir/StructureDefinition/testkit-name-id";
  public static final String EQUIPMENT_UID_EXTENSION_URL =
      "https://reportstream.cdc.gov/fhir/StructureDefinition/equipment-uid";

  public static final String TRIBAL_AFFILIATION_EXTENSION_URL =
      "http://hl7.org/fhir/us/core/StructureDefinition/us-core-tribal-affiliation";
  public static final String TRIBAL_AFFILIATION_STRING = "tribalAffiliation";
  public static final String TRIBAL_AFFILIATION_CODE_SYSTEM =
      "http://terminology.hl7.org/CodeSystem/v3-TribalEntityUS";

  public static final String EVENT_TYPE_CODE_SYSTEM =
      "http://terminology.hl7.org/CodeSystem/v2-0003";
  public static final String EVENT_TYPE_CODE = "R01";
  public static final String EVENT_TYPE_DISPLAY =
      "ORU/ACK - Unsolicited transmission of an observation message";

  public static final String DEFAULT_COUNTRY = "USA";
  public static final String UNIVERSAL_ID_SYSTEM = "http://terminology.hl7.org/CodeSystem/v2-0301";

  public static final String LOINC_AOE_IDENTIFIER = "81959-9";
  public static final String LOINC_AOE_SYMPTOMATIC = "95419-8";
  public static final String LOINC_AOE_SYMPTOM_ONSET = "11368-8";

  public static final String PROCESSING_ID_SYSTEM = "http://terminology.hl7.org/CodeSystem/v2-0103";
  public static final Map<String, String> PROCESSING_ID_DISPLAY =
      Map.of(
          "D", "Debugging",
          "P", "Production",
          "T", "Training");

  public static final String ORDER_CONTROL_EXTENSION_URL =
      "https://reportstream.cdc.gov/fhir/StructureDefinition/order-control";
  public static final String ORDER_CONTROL_CODE_OBSERVATIONS = "RE";
  public static final String ORDER_CONTROL_CODE_SYSTEM =
      "http://terminology.hl7.org/CodeSystem/v2-0119";

  public static final String ABNORMAL_FLAGS_CODE_SYSTEM =
      "http://terminology.hl7.org/CodeSystem/v2-0078";
  public static final CodingRecord ABNORMAL_FLAG_NORMAL = new CodingRecord("N", "Normal");
  public static final CodingRecord ABNORMAL_FLAG_ABNORMAL = new CodingRecord("A", "Abnormal");

  public static final String PRACTICIONER_IDENTIFIER_SYSTEM = "http://hl7.org/fhir/sid/us-npi";
  public static final String NPI_PREFIX = "80840";

  public static final String ORDER_EFFECTIVE_DATE_EXTENSION_URL =
      "https://reportstream.cdc.gov/fhir/StructureDefinition/order-effective-date";
}
