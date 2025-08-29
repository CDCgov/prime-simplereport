package gov.cdc.usds.simplereport.utils;

import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.apache.commons.lang3.StringUtils;

public class MultiplexUtils {
  private MultiplexUtils() {}

  // Deprecated for when we remove FHIR bundling
  @Deprecated(forRemoval = true)
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
   * Some test devices are configured to support multiple test order LOINCs.
   *
   * <p>For one example, a device may test Covid, Flu A, and Flu B as a multiplex test panel under
   * test order LOINC 12345, but that same device may also be configured to support testing
   * Covid-only under test order LOINC 23456. If a single Covid result is entered for such a device,
   * we need to use the LOINC associated with Covid-only instead of the LOINC associated with the
   * multiplex panel.
   *
   * <p>For another example, a device may test Flu A and Flu B as a multiplex test panel with
   * different test order LOINCs such as 45678 for Flu A and 56789 for Flu B. In the context of HL7,
   * this would mean this single test event would have two OBRs to distinguish the two different
   * test order LOINCs.
   *
   * @param matchingDeviceTypeDiseases The device type's set of SupportedDiseaseTestPerformed
   * @param testEvent The test event
   * @return The inferred DeviceTypeDisease
   */
  public static DeviceTypeDisease inferMultiplexDeviceTypeDisease(
      Set<DeviceTypeDisease> matchingDeviceTypeDiseases, TestEvent testEvent) {
    if (matchingDeviceTypeDiseases.isEmpty()) {
      throw new IllegalArgumentException(
          "Could not find matching DeviceTypeDisease because the set was empty");
    }

    DeviceTypeDisease correctTestPerformed;
    if (matchingDeviceTypeDiseases.size() == 1) {
      correctTestPerformed = matchingDeviceTypeDiseases.stream().findFirst().get();
    } else {
      // Multiple matches for this result, need to infer correct DeviceTypeDisease

      // Get count of how many times test ordered LOINC is used for the device
      HashMap<String, Integer> testOrderedLoincCounts = new HashMap<>();
      testEvent
          .getDeviceType()
          .getSupportedDiseaseTestPerformed()
          .forEach(
              deviceTypeDisease -> {
                if (!StringUtils.isBlank(deviceTypeDisease.getTestOrderedLoincCode())) {
                  testOrderedLoincCounts.merge(
                      deviceTypeDisease.getTestOrderedLoincCode(), 1, Integer::sum);
                }
              });

      if (testEvent.getResults().size() == 1) {
        // Only single result on this test event, so get the DeviceTypeDisease with the least used
        // test ordered LOINC
        correctTestPerformed =
            Collections.min(
                matchingDeviceTypeDiseases,
                Comparator.comparing(a -> testOrderedLoincCounts.get(a.getTestOrderedLoincCode())));
      } else {
        // Multiple results on this test event, so get the DeviceTypeDisease with the most frequent
        // test ordered LOINC
        correctTestPerformed =
            Collections.max(
                matchingDeviceTypeDiseases,
                Comparator.comparing(a -> testOrderedLoincCounts.get(a.getTestOrderedLoincCode())));
      }
    }

    if (correctTestPerformed == null) {
      throw new IllegalArgumentException(
          "Could not find matching DeviceTypeDisease data for the result");
    }
    return correctTestPerformed;
  }
}
