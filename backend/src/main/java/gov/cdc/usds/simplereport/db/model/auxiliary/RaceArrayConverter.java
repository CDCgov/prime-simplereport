package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.util.StdConverter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Deserialize the "race" field of serialized person objects, which (for historical reasons) may
 * have been serialized as either a scalar or an array.
 */
public class RaceArrayConverter extends StdConverter<JsonNode, String> {

  private static final Logger LOG = LoggerFactory.getLogger(RaceArrayConverter.class);

  @Override
  public String convert(JsonNode value) {
    LOG.trace("Attempting to convert a value of {}", value);
    String converted;
    if (value.isArray()) {
      converted = value.get(0).asText();
    } else {
      converted = value.asText();
    }
    LOG.trace("Converted to {}", value);
    return converted;
  }
}
