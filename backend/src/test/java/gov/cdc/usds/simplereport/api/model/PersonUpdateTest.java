package gov.cdc.usds.simplereport.api.model;

import com.fasterxml.jackson.databind.ObjectMapper;
import static org.junit.jupiter.api.Assertions.assertEquals;
import org.junit.jupiter.api.Test;

class PersonUpdateTest {
  @Test
  void object_can_be_losslessly_round_tripped_from_json() throws Exception {
    var serialized =
        "{"
            + "\"telephone\":\"(212) 867-5309\","
            + "\"role\":\"UNKNOWN\","
            + "\"email\":\"user@domain.tld\","
            + "\"race\":\"refused\","
            + "\"ethnicity\":\"not_hispanic\","
            + "\"gender\":\"female\","
            + "\"residentCongregateSetting\":false,"
            + "\"employedInHealthcare\":true,"
            + "\"address\":{"
              + "\"street\":[\"12 Someplace\",\"CA\"],"
              + "\"city\":null,"
              + "\"state\":\"CA\","
              + "\"county\":null,"
              + "\"postalCode\":\"67890\""
            + "}"
          + "}";

    var mapper = new ObjectMapper();
    var parsed = mapper.readValue(serialized, PersonUpdate.class);
    var roundTripped = mapper.writeValueAsString(parsed);

    assertEquals(mapper.readTree(serialized), mapper.readTree(roundTripped));
    assertEquals(parsed, mapper.readValue(roundTripped, PersonUpdate.class));
  }
}
