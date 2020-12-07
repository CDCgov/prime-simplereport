package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

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
	}

	@Test
	public void fetchFakeUserData() {
		ObjectNode resp = runQuery("current-user-query");
		ObjectNode who = (ObjectNode) resp.get("whoami");
		assertEquals("Bobbity", who.get("firstName").asText());
		ObjectNode facNode = (ObjectNode) who.get("organization").get("testingFacility");
		assertEquals("Dis Organization", facNode.get("name").asText());
	}

}
