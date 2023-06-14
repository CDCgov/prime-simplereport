package gov.cdc.usds.simplereport.utils;

import java.util.UUID;
import org.springframework.stereotype.Component;

/**
 * A utility class for generating random UUIDs. It is primarily used to enable mocking of {@code
 * UUID.randomUUID} to allow for predictable UUIDs during testing. You can inject {@code
 * UUIDGenerator} in Spring classes that require UUID generation.
 *
 * <p>This generator avoids the limitations of mocking static methods since Mockito explicitly
 * advises against mocking static methods from the standard library such as UUID.
 */
@Component
public class UUIDGenerator {
  /**
   * Generates a new random UUID.
   *
   * @return a randomly generated UUID
   */
  public UUID randomUUID() {
    return UUID.randomUUID();
  }
}
