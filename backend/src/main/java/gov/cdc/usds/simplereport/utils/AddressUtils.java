package gov.cdc.usds.simplereport.utils;

import org.apache.commons.lang3.StringUtils;

public class AddressUtils {
  private AddressUtils() {}

  public static final String ADDRESS_STATE_UNKNOWN = "NA";
  public static final String ADDRESS_ZIP_UNKNOWN = "00000";
  public static final String ADDRESS_STREET_UNKNOWN = "** Unknown / Not Given **";

  private static Boolean isAddressSectionUnk(String userAddressInput, String actual) {
    if (StringUtils.isNotBlank(userAddressInput)) {
      String rowInput = StringUtils.deleteWhitespace(userAddressInput);
      return rowInput.equalsIgnoreCase(StringUtils.deleteWhitespace(actual));
    } else {
      return false;
    }
  }

  public static Boolean isAddressUnknown(String state, String zip, String street) {
    return isAddressSectionUnk(state, ADDRESS_STATE_UNKNOWN)
        && isAddressSectionUnk(zip, ADDRESS_ZIP_UNKNOWN)
        && isAddressSectionUnk(street, ADDRESS_STREET_UNKNOWN);
  }
}
