package gov.cdc.usds.simplereport.test_util;

// import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Iterator;
import java.util.Set;

public class JsonTestUtils {

  public static String readJsonStream(InputStream is) throws IOException {
    BufferedReader reader = new BufferedReader(new InputStreamReader(is));
    StringBuilder stringBuilder = new StringBuilder();
    String line;
    while ((line = reader.readLine()) != null) {
      stringBuilder.append(line);
    }
    return stringBuilder.toString();
  }

  public static void assertJsonFieldsEqual(
      JsonNode expectedNode, JsonNode actualNode, String currentPath, Set<String> ignoredFields) {
    for (Iterator<String> it = expectedNode.fieldNames(); it.hasNext(); ) {
      String fieldName = it.next();
      JsonNode expectedFieldValue = expectedNode.get(fieldName);
      JsonNode actualFieldValue = actualNode.get(fieldName);

      // Get path for the current field
      String fieldPath = currentPath.isEmpty() ? fieldName : currentPath + "." + fieldName;

      // Check if the field should be ignored
      if (isJsonFieldIgnored(fieldPath, ignoredFields)) {
        continue; // Skip the ignored field
      }

      // Recursively compare the nested fields if the field is an object or an array
      if (expectedFieldValue.isObject() && actualFieldValue.isObject()) {
        assertJsonFieldsEqual(expectedFieldValue, actualFieldValue, fieldPath, ignoredFields);
      } else if (expectedFieldValue.isArray() && actualFieldValue.isArray()) {
        for (int i = 0; i < expectedFieldValue.size(); i++) {
          assertJsonFieldsEqual(
              expectedFieldValue.get(i),
              actualFieldValue.get(i),
              fieldPath + "[" + i + "]",
              ignoredFields);
        }
      } else { // Otherwise assert values are equal
        assertThat(actualFieldValue.toString()).isEqualTo(expectedFieldValue.toString());
      }
    }
  }

  private static boolean isJsonFieldIgnored(String fieldPath, Set<String> ignoredFields) {
    for (String ignoredField : ignoredFields) {
      if (matchesJsonFieldPath(ignoredField, fieldPath)) {
        return true;
      }
    }
    return false;
  }

  private static boolean matchesJsonFieldPath(String ignoredField, String fieldPath) {
    if (ignoredField.equals(fieldPath)) {
      return true;
    }
    // Build regex from ignored field but replacing empty bracket with index digits
    String regex = ignoredField.replace("[].", "\\[\\d+\\]\\.");
    return fieldPath.matches(regex);
  }
}
