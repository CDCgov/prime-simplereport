package gov.cdc.usds.simplereport.utils;

import com.vladmihalcea.hibernate.util.StringUtils;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MultiplexUtils {
  private MultiplexUtils() {}

  public static String inferMultiplexTestOrderLoinc(List<DeviceTypeDisease> deviceTypeDiseases) {
    if (deviceTypeDiseases.isEmpty()) {
      return null;
    }

    // track testOrderLoinc repeats
    HashMap<String, Integer> testOrdersLoincs = new HashMap<>();
    deviceTypeDiseases.forEach(
        deviceTypeDisease -> {
          if (!StringUtils.isBlank(deviceTypeDisease.getTestOrderedLoincCode())) {
            testOrdersLoincs.merge(deviceTypeDisease.getTestOrderedLoincCode(), 1, Integer::sum);
          }
        });

    if (testOrdersLoincs.isEmpty()) {
      return null;
    }
    // Convert to arrayList and sort
    return Collections.max(
            testOrdersLoincs.entrySet(), Comparator.comparingInt(Map.Entry::getValue))
        .getKey();
  }
}
