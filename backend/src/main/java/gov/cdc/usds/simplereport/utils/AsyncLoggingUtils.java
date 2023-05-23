package gov.cdc.usds.simplereport.utils;

import java.util.Map;
import java.util.function.Supplier;
import org.slf4j.MDC;

public class AsyncLoggingUtils {
  public static <U> Supplier<U> withMDC(Supplier<U> supplier) {
    Map<String, String> mdc = MDC.getCopyOfContextMap();
    return () -> {
      MDC.setContextMap(mdc);
      return supplier.get();
    };
  }
}
