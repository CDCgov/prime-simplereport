package gov.cdc.usds.simplereport.service.model.crm;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public enum DynamicsValueMapping {
  // These labels are derived from the values passed in our account request.
  // The values are pulled from Dynamics 365.

  // Access devices
  AD_LAPTOP_COMPUTER(810050000),
  AD_DESKTOP_COMPUTER(810050001),
  AD_IPAD_OR_TABLET(810050002),
  AD_SMARTPHONE(810050003),

  // Testing devices
  TD_ABBOTT_BINAXNOW(810050000),
  TD_ABBOTT_IDNOW(810050001),
  TD_BD_VERITOR(810050002),
  TD_LUMIRADX(810050003),
  TD_QUIDEL_SOFIA_2(810050004),
  TD_ACCESS_BIO_CARESTART(810050005),
  TD_OTHER(810050006),

  // Testing site type
  TST_HOSPITAL_OR_CLINIC(810050000),
  TST_LONG_TERM_CARE_FACILITY(810050001),
  TST_K12_SCHOOL(810050002),
  TST_UNIVERSITY(810050003),
  TST_URGENT_CARE_CENTER(810050004),
  TST_AIRPORT(810050005),
  TST_OTHER(810050006),

  // Browsers
  B_SAFARI(810050000),
  B_CHROME(810050001),
  B_FIREFOX(810050002),
  B_OTHER(810050003),

  // Is person who does check-in also recorder?
  CIR_NO(810050000),
  CIR_YES(810050001),

  // total process time
  PT_LESS_THAN_15_MINUTES(810050000),
  PT_1530_MINUTES(810050001),
  PT_3045_MINUTES(810050002),
  PT_45_MINUTES_TO_ONE_HOUR(810050003),
  PT_MORE_THAN_AN_HOUR(810050004),

  // time spent submitting results
  SRT_LESS_THAN_30_MINUTES(810050000),
  SRT_30_MINUTES_TO_ONE_HOUR(810050001),
  SRT_12_HOURS(810050002),
  SRT_MORE_THAN_2_HOURS(810050003);

  public enum Prefix {
    AD, // Access Devices
    TD, // Testing Devices
    TST, // Testing Site Type
    B, // Browsers
    CIR, // Is person who does check-in also recorder?
    PT, // Total process time estimate
    SRT; // Estimated time spent submitting test results
  }

  private static final Logger LOG = LoggerFactory.getLogger(DynamicsValueMapping.class);

  private static final int DEFAULT_VALUE = 810050000; // don't fail on invalid mappings
  private final int value;

  private DynamicsValueMapping(final int value) {
    this.value = value;
  }

  /**
   * Convert a comma-separated string of our values to a comma-separated string of dynamics values.
   * For example, the input string "Chrome, Firefox" might become "810050001,810050002" which can be
   * sent to dynamics as the value for a multi select field.
   *
   * @param prefix value prefix
   * @param inputString comma-separated string of our values
   * @return comma-separated value string
   */
  public static String convertToValues(final Prefix prefix, final String inputString) {
    final Set<Integer> typeSet = new HashSet<>();
    for (String v : inputString.split(",")) {
      try {
        typeSet.add(getDynamicsCodeFromName(prefix, v));
      } catch (IllegalArgumentException e) {
        LOG.warn("skipping value: no mapping found");
      }
    }

    return typeSet.stream().map(String::valueOf).collect(Collectors.joining(","));
  }

  /**
   * Convert a single value to to its Dynamics value. This can be used to set the value of a code-
   * type property in Dynamics. This needs to not throw so a failed lookup here will not cause a
   * failing response from `account-request`
   *
   * @param prefix value prefix
   * @param inputString string containing one value
   * @return integer value of this option
   */
  public static int convertToCode(final Prefix prefix, final String inputString) {
    try {
      return getDynamicsCodeFromName(prefix, inputString);
    } catch (IllegalArgumentException e) {
      return DEFAULT_VALUE;
    }
  }

  // Build a key and look it up, try to fail with something that will create a record in Dynamics
  private static int getDynamicsCodeFromName(final Prefix prefix, final String inputString) {
    if (inputString == null || inputString.equals("")) {
      return DEFAULT_VALUE;
    }

    String keyPart =
        inputString.strip().toUpperCase().replaceAll("\\s+", "_").replaceAll("[^A-Z0-9_]", "");
    return DynamicsValueMapping.valueOf(prefix + "_" + keyPart).value;
  }
}
