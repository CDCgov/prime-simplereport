package gov.cdc.usds.simplereport.test_util;

public class TestErrorMessageUtil {
  /**
   * Returns the column header name from error messages in the following format
   *
   * @param message "$value is not an acceptable value for the $columnName column."
   */
  public static String getColumnNameFromInvalidErrorMessage(String message) {
    var startMessageToFind = "is not an acceptable value for the ";
    var splitStartIndex = message.lastIndexOf(startMessageToFind) + startMessageToFind.length();
    var endMessageToFind = " column.";
    var splitEndIndex = message.lastIndexOf(endMessageToFind);
    return message.substring(splitStartIndex, splitEndIndex);
  }
}
