package gov.cdc.usds.simplereport.utils;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;

public class ResultUtils {
  private ResultUtils() {
    throw new IllegalStateException("ResultUtils is a utility class");
  }

  public static TestCorrectionStatus mapTestResultStatusToSRValue(String input) {
    if (input == null) {
      return TestCorrectionStatus.ORIGINAL;
    }
    switch (input) {
      case "C":
        return TestCorrectionStatus.CORRECTED;
      case "F":
      default:
        return TestCorrectionStatus.ORIGINAL;
    }
  }
}
