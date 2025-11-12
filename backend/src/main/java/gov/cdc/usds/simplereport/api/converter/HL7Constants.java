package gov.cdc.usds.simplereport.api.converter;

public class HL7Constants {
  private HL7Constants() {
    throw new IllegalStateException("Utility class");
  }

  /** Assigned by APHL for use in MSH-4.1 Sending Facility Namespace Id */
  public static final String SENDING_FACILITY_NAMESPACE = "CDC.SimpleReport";

  /**
   * Assigned by APHL, but we are not currently using this OID itself for MSH-4.2. Instead, we are
   * using SENDING_FACILITY_FAKE_AGGREGATE_CLIA to populate MSH-4.2
   */
  public static final String SENDING_FACILITY_OID = "2.16.840.1.113883.3.8589.4.1.231";

  /**
   * A fake aggregate CLIA was assigned to SimpleReport by APHL so that STLTs can more easily
   * process HL7 messages based on MSH-4 Sending Facility. If we populated MSH-4 with the real
   * facility CLIA instead of SimpleReport's fake CLIA, then many STLTs would need to frequently
   * reconfigure their systems with a long list of possible facility CLIAs to accept. To make this
   * easier for STLTs, APHL assigns a fake CLIA to "aggregate senders" like SimpleReport. <br>
   * <br>
   * Note that for the real facility submitting the lab report, their CLIA number is still sent in
   * other segments like OBX-23.10 to identify the performing organization.
   */
  public static final String SENDING_FACILITY_FAKE_AGGREGATE_CLIA = "00Z0000064";

  public static final String SIMPLE_REPORT_NAME = "SimpleReport";

  /** Note: this is the CDC OID for now until we get a SimpleReport OID registered */
  public static final String SIMPLE_REPORT_ORG_OID = "2.16.840.1.114222.4";

  public static final String APHL_ORG_OID = "2.16.840.1.113883.3.8589";
  public static final String HL7_VERSION_ID = "2.5.1";

  public static final String MESSAGE_PROFILE_ID = "PHLabReport-NoAck";
  // AIMS validator indicated this is the required namespace id for message profile
  public static final String MESSAGE_PROFILE_NAMESPACE = "phLabResultsELRv251";
  public static final String MESSAGE_PROFILE_OID = "2.16.840.1.113883.9.11";

  public static final String DEFAULT_COUNTRY = "USA";

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
