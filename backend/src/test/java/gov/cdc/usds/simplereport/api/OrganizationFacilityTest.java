package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.graphql.spring.boot.test.GraphQLResponse;

public class OrganizationFacilityTest extends BaseApiTest {

	@BeforeEach
	public void setup() {
		truncateDb();
	}

	@Test
	public void fetchFakeUserData() {
		ObjectNode resp = runQuery("current-user-query");
		ObjectNode who = (ObjectNode) resp.get("whoami");
		assertEquals("Bobbity", who.get("firstName").asText());
	}

}
