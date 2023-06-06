package gov.cdc.usds.simplereport.utils;

import java.util.Date;
import org.springframework.stereotype.Component;

/**
 * A utility class for generating new Date objects. It is primarily used to enable mocking of {@code
 * Date} objects to allow for predictable Dates during testing. You can inject {@code DateGenerator}
 * in Spring classes that require the current date.
 *
 * <p>This generator avoids the limitations of mocking static methods since Mockito explicitly
 * advises against mocking static methods from the standard library such as Date.
 */
@Component
public class DateGenerator {

  /**
   * Generates a new Date object representing the current date and time.
   *
   * @return a new Date object representing the current date and time
   */
  public static Date newDate() {
    return new Date();
  }
}
