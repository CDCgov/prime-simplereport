package gov.cdc.usds.simplereport.utils;

import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class MultiplexUtils {
  public static <K, V extends Comparable<V>> TreeMap<K, V> sort_by_values(final Map<K, V> map) {
    Comparator<K> valueComparator =
        new Comparator<K>() {
          public int compare(K k1, K k2) {
            // comparing on the basis of values
            int comp = map.get(k1).compareTo(map.get(k2));
            if (comp == 0) {
              String x1 = (String) k1;
              String x2 = (String) k2;
              return Integer.compare(x1.length(), x2.length());
            }
            return comp;
          }
          ;
        };

    // SortedMap created using the comparator
    TreeMap<K, V> sorted = new TreeMap<K, V>(valueComparator);
    sorted.putAll(map);

    return sorted;
  }

  public static String inferMultiplexTestOrderLoinc(List<DeviceTypeDisease> deviceTypeDiseases) {
    if (deviceTypeDiseases.size() <= 0) {
      return null;
    }

    // track testOrderLoinc repeats
    HashMap<String, Integer> testOrdersLoincs = new HashMap<>();
    deviceTypeDiseases.forEach(
        deviceTypeDisease -> {
          if (testOrdersLoincs.containsKey(deviceTypeDisease.getTestOrderedLoincCode())) {
            Integer results = testOrdersLoincs.get(deviceTypeDisease.getTestOrderedLoincCode());
            testOrdersLoincs.put(deviceTypeDisease.getTestOrderedLoincCode(), results + 1);
          } else {
            testOrdersLoincs.put(deviceTypeDisease.getTestOrderedLoincCode(), 1);
          }
        });

    // Convert to arrayList and sort
    TreeMap<String, Integer> sortedMap = sort_by_values(testOrdersLoincs);
    return sortedMap.lastKey();
  }
}
