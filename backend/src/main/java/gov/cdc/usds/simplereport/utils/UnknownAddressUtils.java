package gov.cdc.usds.simplereport.utils;

import gov.cdc.usds.simplereport.db.model.auxiliary.StreetAddress;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import org.apache.commons.lang3.StringUtils;

public class UnknownAddressUtils {
  private UnknownAddressUtils() {}

  public static final String ADDRESS_STATE_UNKNOWN = "NA";
  public static final String ADDRESS_ZIP_UNKNOWN = "00000";
  public static final String ADDRESS_STREET_UNKNOWN = "** Unknown / Not Given **";

  public static Map<String, String> unknownAddressMap() {
    Map<String, String> unkAddressMap = new HashMap<>();
    unkAddressMap.put("street", ADDRESS_STREET_UNKNOWN);
    unkAddressMap.put("state", ADDRESS_STATE_UNKNOWN);
    unkAddressMap.put("zip_code", ADDRESS_ZIP_UNKNOWN);

    return unkAddressMap;
  }

  public static boolean isAddressSectionUnk(String userAddressInput, String actual) {
    if (StringUtils.isNotBlank(userAddressInput)) {
      String rowInput = StringUtils.deleteWhitespace(userAddressInput);
      return rowInput.equalsIgnoreCase(StringUtils.deleteWhitespace(actual));
    } else {
      return false;
    }
  }

  public static boolean isAddressUnknown(String state, String zip, String street) {
    return isAddressSectionUnk(state, ADDRESS_STATE_UNKNOWN)
        && isAddressSectionUnk(zip, ADDRESS_ZIP_UNKNOWN)
        && isAddressSectionUnk(street, ADDRESS_STREET_UNKNOWN);
  }

  public static StreetAddress getUnknownStreetAddress() {
    return new StreetAddress(
        Arrays.asList(ADDRESS_STREET_UNKNOWN),
        null,
        ADDRESS_STATE_UNKNOWN,
        ADDRESS_ZIP_UNKNOWN,
        null);
  }
}
