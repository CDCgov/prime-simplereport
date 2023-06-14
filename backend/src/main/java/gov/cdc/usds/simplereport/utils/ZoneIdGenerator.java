package gov.cdc.usds.simplereport.utils;

import java.time.ZoneId;
import org.springframework.stereotype.Component;

/**
 * A utility class for generating {@code ZoneId} objects. It is primarily used to enable mocking of
 * {@code ZoneId} objects to allow for predictable timezones during testing. You can inject {@code
 * ZoneIdGenerator} in Spring classes that require the system's default {@code ZoneId}.
 *
 * <p>This generator avoids the limitations of mocking static methods since Mockito explicitly
 * advises against mocking static methods from the standard library such as {@code
 * ZoneId.systemDefault}.
 *
 * @see ZoneId
 */
@Component
public class ZoneIdGenerator {

  /**
   * Generates a new ZoneId object representing the system's default zone id.
   *
   * @return a new Date object representing the current date and time
   */
  public ZoneId getSystemZoneId() {
    return ZoneId.systemDefault();
  }
}
