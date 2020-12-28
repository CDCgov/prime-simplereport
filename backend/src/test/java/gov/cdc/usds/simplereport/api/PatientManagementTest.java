package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.graphql.spring.boot.test.GraphQLResponse;

/**
 * Tests for adding and fetching patients through the API
 */
public class PatientManagementTest extends BaseApiTest {

    @BeforeEach
    public void setup() {
        truncateDb();
    }

    @Test
    public void createAndFetchOnePatientUsDate() throws Exception {
        String firstName = "Jon";
        JsonNode patients = doCreateAndFetch(firstName, "Snow", "05/18/1066", "(202) 867-5309", "youknownothing");
        assertTrue(patients.has(0), "At least one patient found");
        JsonNode jon = patients.get(0);
        assertEquals(firstName, jon.get("firstName").asText());
        assertEquals("1066-05-18", jon.get("birthDate").asText());
        assertEquals("(202) 867-5309", jon.get("telephone").asText());
    }

    @Test
    public void createAndFetchOnePatientIsoDate() throws Exception {
        String firstName = "Sansa";
        JsonNode patients = doCreateAndFetch(firstName, "Stark", "12/25/1100", "1-800-BIZ-NAME", "notbitter");
        assertTrue(patients.has(0), "At least one patient found");
        JsonNode sansa = patients.get(0);
        assertEquals(firstName, sansa.get("firstName").asText());
        assertEquals("1100-12-25", sansa.get("birthDate").asText());
        assertEquals("(800) 249-6263", sansa.get("telephone").asText());
    }

    private JsonNode doCreateAndFetch(String firstName, String lastName, String birthDate, String phone, String lookupId)
            throws IOException {
        ObjectNode variables = JsonNodeFactory.instance.objectNode()
                .put("firstName", firstName)
                .put("lastName", lastName)
                .put("birthDate", birthDate)
                .put("telephone", phone)
                .put("lookupId", lookupId);
        GraphQLResponse resp = _template.perform("add-person", variables);
        assertGraphQLSuccess(resp);
        JsonNode patients = runQuery("person-query").get("patients");
        return patients;
    }
}
