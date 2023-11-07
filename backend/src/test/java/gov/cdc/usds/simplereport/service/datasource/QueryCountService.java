package gov.cdc.usds.simplereport.service.datasource;

import static java.util.Optional.ofNullable;

import java.util.Map;
import lombok.experimental.UtilityClass;
import net.ttddyy.dsproxy.QueryCount;
import net.ttddyy.dsproxy.listener.SingleQueryCountHolder;

@UtilityClass
public class QueryCountService {
  static final SingleQueryCountHolder QUERY_COUNT_HOLDER = new SingleQueryCountHolder();

  public static void clear() {
    final var map = QUERY_COUNT_HOLDER.getQueryCountMap();
    map.putIfAbsent(keyName(map), new QueryCount());
  }

  public static QueryCount get() {
    final var map = QUERY_COUNT_HOLDER.getQueryCountMap();
    return ofNullable(map.get(keyName(map))).orElseThrow();
  }

  private static String keyName(Map<String, QueryCount> map) {
    if (map.size() == 1) {
      return map.entrySet().stream().findFirst().orElseThrow().getKey();
    }
    throw new IllegalArgumentException("Query counts map should consists of one key: " + map);
  }
}
