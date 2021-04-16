package gov.cdc.usds.simplereport.utils;

public class DeviceTestLengthConverter {
  private static final Integer STANDARD_TEST_LENGTH = 15;
  private static final Integer SHORTENED_TEST_LENGTH = 10;

  private DeviceTestLengthConverter() {
    throw new IllegalStateException("DeviceTestLengthConverter is a utility class");
  }

  /**
   * Helper method to determine the test length based on the type of test. If more non-15-minute
   * test devices are added, this method should be updated.
   *
   * @param name the name of the device.
   * @return the test length, as integer minutes, associated with the given device (for now, 15
   *     minutes for all but CareStart tests).
   */
  public static int determineTestLength(String name) {
    if (name.contains("CareStart")) {
      return SHORTENED_TEST_LENGTH;
    } else {
      return STANDARD_TEST_LENGTH;
    }
  }
}
