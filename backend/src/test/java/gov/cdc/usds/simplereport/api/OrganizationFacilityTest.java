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
	public void fetchFakeOrgData() {
		ObjectNode resp = runQuery("org-settings-query");
		ObjectNode orgNode = (ObjectNode) resp.get("organization");
		JsonNode facNode = orgNode.path("testingFacility");
		assertTrue(facNode.isObject(), "facility should be an object in response");
		assertEquals("Dis Organization", facNode.get("name").asText());
		assertEquals("000111222-3", facNode.get("cliaNumber").asText());
		assertEquals("2797 N Cerrada de Beto", facNode.get("street").asText()); // oh my
		ArrayNode typeList = (ArrayNode) orgNode.get("deviceTypes");
		Set<String> deviceNames = new HashSet<>();
		typeList.iterator().forEachRemaining(t->deviceNames.add(t.get("name").asText()));
		assertTrue(deviceNames.contains("Quidel Sofia 2"), "should find Quidel Sofia 2 in " + typeList.toString());
		assertTrue(deviceNames.contains("LumiraDX"), "should find LumiraDX in " + typeList.toString());

	}

	@Test
	public void fetchFakeUserData() {
		ObjectNode resp = runQuery("current-user-query");
		ObjectNode who = (ObjectNode) resp.get("whoami");
		assertEquals("Bobbity", who.get("firstName").asText());
		ObjectNode facNode = (ObjectNode) who.get("organization").get("testingFacility");
		assertEquals("Dis Organization", facNode.get("name").asText());
	}

	@Test
	public void updateOrganizationSettings() throws IOException {
		ObjectNode resp = runQuery("org-settings-query");
		ObjectNode orgNode = (ObjectNode) resp.get("organization");
		ArrayNode typeList = (ArrayNode) orgNode.get("deviceTypes");
		String currentDefault = orgNode.get("defaultDeviceType").get("internalId").asText();
		String newID = typeList.get(0).get("internalId").asText();
		if (newID.equals(currentDefault)) {
			newID = typeList.get(1).get("internalId").asText();
		}
		ObjectNode variables = JsonNodeFactory.instance.objectNode()
				.put("newDevice", newID);
		GraphQLResponse mutated = _template.perform("update-org-settings", variables);
		assertGraphQLSuccess(mutated);
		
		resp = runQuery("org-settings-query");
		orgNode = (ObjectNode) resp.get("organization");
		assertEquals(newID, orgNode.get("defaultDeviceType").get("internalId").asText());

		JsonNode facNode = orgNode.path("testingFacility");
		assertTrue(facNode.isObject(), "facility should be an object in response");
		assertEquals("Dis Function", facNode.get("name").asText());
		assertEquals("54321", facNode.get("cliaNumber").asText());
	}
}
