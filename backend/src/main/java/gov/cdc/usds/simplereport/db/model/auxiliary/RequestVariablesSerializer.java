package gov.cdc.usds.simplereport.db.model.auxiliary;

import com.fasterxml.jackson.core.JsonGenerator;
import com.fasterxml.jackson.databind.JsonSerializer;
import com.fasterxml.jackson.databind.SerializerProvider;
import com.nimbusds.jose.util.StandardCharset;
import gov.cdc.usds.simplereport.api.model.errors.AuditLogFailureException;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;
import javax.servlet.http.Part;
import lombok.extern.slf4j.Slf4j;

@Slf4j
public class RequestVariablesSerializer extends JsonSerializer<Map<String, Object>> {
  private Object parseValue(Object value) {
    if (value instanceof Part part) {
      try (BufferedReader br =
          new BufferedReader(
              new InputStreamReader(part.getInputStream(), StandardCharset.UTF_8)); ) {
        return br.lines().collect(Collectors.joining("\n"));
      } catch (IOException e) {
        log.error("Unable to read uploaded file while writing audit log", e);
        throw new AuditLogFailureException();
      }
    }
    return value;
  }

  @Override
  public void serialize(Map<String, Object> value, JsonGenerator gen, SerializerProvider arg2)
      throws IOException {
    Map<String, Object> parsedValue = new HashMap<>();
    for (Map.Entry<String, Object> entry : value.entrySet()) {
      parsedValue.put(entry.getKey(), parseValue(entry.getValue()));
    }
    gen.writeObject(parsedValue);
  }
}
