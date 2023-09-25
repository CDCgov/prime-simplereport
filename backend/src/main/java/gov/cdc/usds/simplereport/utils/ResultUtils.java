package gov.cdc.usds.simplereport.utils;

import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;

public class ResultUtils {

  public static TestCorrectionStatus mapTestResultStatusToSRValue(String input) {
    switch (input) {
      case "C":
        return TestCorrectionStatus.CORRECTED;
      case "F":
      default:
        return TestCorrectionStatus.ORIGINAL;
    }
  }
}
