package gov.cdc.usds.simplereport.db.model.auxiliary;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.util.StdConverter;

/**
 * Deserialize the "race" field of serialized person objects, which (for historical reasons)
 * may have been serialized as either a scalar or an array.
 */
public class RaceArrayConverter extends StdConverter<JsonNode, String>  {

	private static final Logger LOG = LoggerFactory.getLogger(RaceArrayConverter.class);

	@Override
	public String convert(JsonNode value) {
		LOG.debug("Attempting to convert a value of {}", value);
		String converted;
		if (value.isArray()) {
			converted = value.get(0).asText();
		} else {
			converted = value.asText();
		}
		LOG.debug("Converted to {}", value);
		return converted;
	}

}
