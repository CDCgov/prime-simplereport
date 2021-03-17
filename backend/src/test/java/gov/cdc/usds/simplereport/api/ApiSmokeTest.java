package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import java.io.IOException;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class ApiSmokeTest extends BaseApiTest {

  @Test
  void smoketestPatientList() throws IOException {
    JsonNode jsonResponse = runQuery("person-query");
    assertTrue(jsonResponse.get("patients").isEmpty());
    executeAddPersonMutation(
        "Baz", "Jesek", "2403-12-03", null, "BAZ", Optional.empty(), Optional.empty());
    jsonResponse = runQuery("person-query");
    assertTrue(jsonResponse.get("patients").has(0));
    assertEquals("Baz", jsonResponse.get("patients").get(0).get("firstName").asText());
  }
}
