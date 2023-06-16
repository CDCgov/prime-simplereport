package gov.cdc.usds.simplereport.test_util;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import java.util.Iterator;
import java.util.Set;

public class JsonTestUtils {

  /**
   * A utility function that can be used to determine whether two JSON nodes are semantically
   * identical
   */
  public static void assertJsonNodesEqual(JsonNode expectedNode, JsonNode actualNode) {
    assertJsonNodesEqual(expectedNode, actualNode, null, "");
  }
  /**
   * A utility function that can be used to determine whether two JSON nodes are semantically
   * identical while also allowing certain fields to be ignored.
   *
   * @example
   *     <pre>{@code
   * ignoredFields.add("identifier.value");  // use period chaining to ignore the specific nested fields
   * ignoredFields.add("timestamp");
   * ignoredFields.add("entry[].id");  // use empty brackets [] to refer to all objects within the "entry" array
   *
   * {
   *   "resourceType": "Bundle",
   *   "identifier": {
   *     "value": "123"  // ignored
   *   },
   *   "type": "message",
   *   "timestamp": "2023-05-24T15:33:06.472-04:00",  // ignored
   *   entry: [
   *    {
   *        id: "001",  // ignored
   *        type: "example"
   *    },
   *    {
   *        id: "002",  //ignored
   *        type: "example"
   *    }
   *   ]
   *  }
   *
   * }</pre>
   */
  public static void assertJsonNodesEqual(
      JsonNode expectedNode, JsonNode actualNode, Set<String> ignoredFields, String currentPath) {
    for (Iterator<String> it = expectedNode.fieldNames(); it.hasNext(); ) {
      String fieldName = it.next();
      JsonNode expectedFieldValue = expectedNode.get(fieldName);
      JsonNode actualFieldValue = actualNode.get(fieldName);

      // Get path for the current field
      String fieldPath = currentPath.isEmpty() ? fieldName : currentPath + "." + fieldName;

      // Check if the field should be ignored
      if (ignoredFields != null && isJsonFieldIgnored(fieldPath, ignoredFields)) {
        continue; // Skip the ignored field
      }

      // Recursively compare the nested fields if the field is an object or an array
      if (expectedFieldValue.isObject() && actualFieldValue.isObject()) {
        assertJsonNodesEqual(expectedFieldValue, actualFieldValue, ignoredFields, fieldPath);
      } else if (expectedFieldValue.isArray() && actualFieldValue.isArray()) {
        assertThat(expectedFieldValue.size()).isEqualTo(actualFieldValue.size());
        for (int i = 0; i < expectedFieldValue.size(); i++) {
          assertJsonNodesEqual(
              expectedFieldValue.get(i),
              actualFieldValue.get(i),
              ignoredFields,
              fieldPath + "[" + i + "]");
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
