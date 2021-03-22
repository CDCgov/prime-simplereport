package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.nimbusds.jose.util.StandardCharset;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Map;
import java.util.stream.Collectors;
import javax.servlet.http.Part;

public class RequestVariablesSerializer extends JsonSerializer<Map<String, Object>> {

  private Object parseValue(Object value) {
    if (value instanceof Part) {
      Part part = (Part) value;
      try {
        return new BufferedReader(
                new InputStreamReader(part.getInputStream(), StandardCharset.UTF_8))
            .lines()
            .collect(Collectors.joining("\n"));
      } catch (IOException e) {
        return "Unable to read file";
      }
    }
    return value;
  }

  @Override
  public void serialize(Map<String, Object> value, JsonGenerator gen, SerializerProvider arg2)
      throws IOException, JsonProcessingException {
    Map<String, Object> parsedValue =
        value.entrySet().stream()
            .collect(Collectors.toMap(Map.Entry::getKey, e -> parseValue(e.getValue())));
    gen.writeObject(parsedValue);
  }
}
