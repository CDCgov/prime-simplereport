package gov.cdc.usds.simplereport.db.model.auxiliary;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.io.IOException;
import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.json.JsonTest;
import org.springframework.boot.test.json.JacksonTester;
import org.springframework.boot.test.json.JsonContent;

@JsonTest
class GraphqlInputsSerializationTest {

  @Autowired private JacksonTester<GraphQlInputs> _tester;

  @Test
  void serialize_validObject_fieldsFound() throws IOException {
    JsonContent<GraphQlInputs> written =
        _tester.write(
            new GraphQlInputs(
                "multiplication",
                "); DROP TABLE STUDENTS",
                Map.of("x", "horizontal", "y", "vertical", "price", 3.99)));
    assertThat(written).extractingJsonPathStringValue("query").isEqualTo("); DROP TABLE STUDENTS");
    assertThat(written).extractingJsonPathStringValue("operationName").isEqualTo("multiplication");
    assertThat(written).extractingJsonPathStringValue("variables.x").isEqualTo("horizontal");
    assertThat(written).extractingJsonPathStringValue("variables.y").isEqualTo("vertical");
    assertThat(written).extractingJsonPathNumberValue("variables.price").isEqualTo(3.99);
  }

  @Test
  // IF THIS TEST BREAKS YOU HAVE BROKEN THE DATABASE AUDIT LOG. FIX THE MODEL, NOT THE TEST.
  void deserialize_fullObject_allFieldsSet() throws IOException {
    GraphQlInputs object = _tester.read("/deserialization/graphql-inputs/full.json").getObject();
    assertNotNull(object);
    assertEquals("thoracotomy", object.getOperationName());
    assertEquals("what is this thing called love?", object.getQuery());
    assertEquals(Map.of("eenie", 1, "meeney", 3, "miney", "Moe"), object.getVariables());
  }
}
