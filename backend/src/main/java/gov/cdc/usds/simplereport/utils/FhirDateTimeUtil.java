package gov.cdc.usds.simplereport.utils;

import org.hl7.fhir.r4.model.BaseDateTimeType;
import org.springframework.stereotype.Component;

/** A utility class for handling data and time objects in FHIR. */
@Component
public class FhirDateTimeUtil {

  /**
   * Returns an unchanged value of the {@code BaseDateTimeType} argument. Used for mocking during
   * tests to convert the value from the system default timezone to UTC so that the value can be
   * properly compared with UTC values in the expected test data.
   *
   * <p>By default, any object that inherits from {@code org.hl7.fhir.r4.model.BaseDateTimeType}
   * will use the system's default timezone when setting its value. This value can be converted to
   * UTC by using {@code BaseDateTimeType.setTimeZoneZulu}.
   *
   * @see BaseDateTimeType
   */
  public BaseDateTimeType getBaseDateTimeType(BaseDateTimeType baseDateTimeType) {
    return baseDateTimeType;
  }
}
