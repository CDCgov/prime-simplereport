package gov.cdc.usds.simplereport.utils;

import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.SupportedDisease;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;

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

  /**
   * Some test devices are configured to support multiple test order LOINCs. For example, a device
   * may test Covid, Flu A, and Flu B as a multiplex test panel under test order LOINC 12345, but
   * that same device may also be configured to support testing Covid-only under test order LOINC
   * 23456. If a single Covid result is entered for such a device, we need to use the LOINC
   * associated with Covid-only instead of the LOINC associated with the multiplex panel.
   *
   * @param deviceTypeDiseases The device type's list of SupportedDiseaseTestPerformed
   * @param disease The disease we want to filter for
   * @return The inferred test order LOINC for a single result of this disease
   */
  public static String inferTestOrderLoincForSingleResult(
      List<DeviceTypeDisease> deviceTypeDiseases, SupportedDisease disease) {
    if (deviceTypeDiseases.isEmpty()) {
      return null;
    }

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

    HashMap<String, Integer> matchingTestOrderLoincs =
        (HashMap<String, Integer>)
            testOrdersLoincs.entrySet().stream()
                .filter(
                    entry ->
                        deviceTypeDiseases.stream()
                            .anyMatch(
                                d ->
                                    d.getTestOrderedLoincCode().equals(entry.getKey())
                                        && d.getSupportedDisease().equals(disease)))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

    // Convert to arrayList and sort
    return Collections.min(
            matchingTestOrderLoincs.entrySet(), Comparator.comparingInt(Map.Entry::getValue))
        .getKey();
  }
}
