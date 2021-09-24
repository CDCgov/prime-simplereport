package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.util.StdConverter;
import lombok.extern.slf4j.Slf4j;

/**
 * Deserialize the "race" field of serialized person objects, which (for historical reasons) may
 * have been serialized as either a scalar or an array.
 */
@Slf4j
public class RaceArrayConverter extends StdConverter<JsonNode, String> {

  @Override
  public String convert(JsonNode value) {
    log.trace("Attempting to convert a value of {}", value);
    String converted;
    if (value.isArray()) {
      converted = value.get(0).asText();
    } else {
      converted = value.asText();
    }
    log.trace("Converted to {}", value);
    return converted;
  }
}
