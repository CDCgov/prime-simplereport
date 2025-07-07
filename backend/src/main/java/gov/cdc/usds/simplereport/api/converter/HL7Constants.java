package gov.cdc.usds.simplereport.api.converter;

public class HL7Constants {
  private HL7Constants() {
    throw new IllegalStateException("Utility class");
  }

  public static final String SIMPLE_REPORT_NAME = "SimpleReport";
  // this is the CDC OID for now until we get a SimpleReport OID registered
  public static final String SIMPLE_REPORT_ORG_OID = "2.16.840.1.114222.4";
  public static final String APHL_ORG_OID = "2.16.840.1.113883.3.8589";
  public static final String HL7_VERSION_ID = "2.5.1";

  public static final String MESSAGE_PROFILE_ID = "PHLabReport-NoAck";
  // AIMS validator indicated this is the required namespace id for message profile
  public static final String MESSAGE_PROFILE_NAMESPACE = "phLabResultsELRv251";
  public static final String MESSAGE_PROFILE_OID = "2.16.840.1.113883.9.11";

  public static final String DEFAULT_COUNTRY = "USA";

  /** FI is the value for Facility ID on HL7 value set table 0203 */
  public static final String IDENTIFIER_TYPE_CODE_FACILITY_ID = "FI";

  public static final String PATIENT_INTERNAL_IDENTIFIER_TYPE_CODE = "PI";

  // TODO: determine HL7 valid tribal affiliation code system values
  public static final String TRIBAL_AFFILIATION_CODE_SYSTEM_NAME = "TribalEntityUS";
  public static final String TRIBAL_AFFILIATION_CODE_SYSTEM_OID = "2.16.840.1.113883.5.140";
  public static final String TRIBAL_AFFILIATION_CODE_SYSTEM_VERSION = "4.0.0";

  /** SNM is the value for SNOMED on HL7 value set table 0396 */
  public static final String HL7_SNOMED_CODE_SYSTEM = "SNM";

  public static final String HL7_SNOMED_CODE_SYSTEM_VERSION_ID = "June 2025";

  /** LN is the value for LOINC on HL7 value set table 0396 */
  public static final String HL7_LOINC_CODE_SYSTEM = "LN";

  /**
   * OID for CLIA assigning authority from <a
   * href="https://terminology.hl7.org/NamingSystem-CLIA.html">https://terminology.hl7.org/NamingSystem-CLIA.html</a>
   */
  public static final String CLIA_NAMING_SYSTEM_OID = "2.16.840.1.113883.4.7";

  /**
   * OID for NPI assigning authority from <a
   * href="http://terminology.hl7.org/NamingSystem/npi">http://terminology.hl7.org/NamingSystem/npi</a>
   */
  public static final String NPI_NAMING_SYSTEM_OID = "2.16.840.1.113883.4.6";

  public static final String HL7_TABLE_ETHNIC_GROUP = "HL70189";
  public static final String HL7_TABLE_RACE = "HL70005";
}
