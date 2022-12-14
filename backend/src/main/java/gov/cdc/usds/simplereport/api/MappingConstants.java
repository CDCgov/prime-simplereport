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
}
