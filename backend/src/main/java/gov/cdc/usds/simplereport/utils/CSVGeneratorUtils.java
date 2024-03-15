package gov.cdc.usds.simplereport.utils;

import java.nio.charset.StandardCharsets;
import java.util.List;

public class CSVGeneratorUtils {
  private CSVGeneratorUtils() {
    throw new IllegalStateException("CSVGeneratorUtils is a utility class");
  }

  private static final String EMAIL_CSV_HEADER = "email\n";

  public static byte[] generateEmailCSVInBytes(List<String> emails) {
    StringBuilder csvContent = new StringBuilder();
    csvContent.append(EMAIL_CSV_HEADER);
    for (String email : emails) {
      csvContent.append(email).append("\n");
    }
    return csvContent.toString().getBytes(StandardCharsets.UTF_8);
  }
}
