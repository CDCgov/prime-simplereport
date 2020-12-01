package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.fail;

import java.io.IOException;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.graphql.spring.boot.test.GraphQLResponse;

import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;

public class QueueManagementTest extends BaseApiTest {

	private static final String QUERY = "queue-dates-query";

	@Autowired
	private TestDataFactory _dataFactory;
	@Autowired
	private OrganizationService _orgService;

	private Organization _org;

	@BeforeEach
	public void init() {
		truncateDb();
		_org = _orgService.getCurrentOrganization();
	}

	@AfterEach
	public void cleanup() {
		truncateDb();
	}

	@Test
	public void enqueueOnePatient() throws Exception {
		Person p = _dataFactory.createFullPerson(_org);
		String personId = p.getInternalId().toString();
		ObjectNode variables = JsonNodeFactory.instance.objectNode()
				.put("id", personId)
				.put("previousTestDate", "05/15/2020")
				.put("symptomOnsetDate", "11/30/2020")
				;
		performEnqueueMutation(variables);
		ArrayNode queueData = (ArrayNode) runQuery(QUERY).get("queue");
		assertEquals(1, queueData.size());
		JsonNode queueEntry = queueData.get(0);
		String symptomOnset = queueEntry.get("symptomOnset").asText();
		String priorTest = queueEntry.get("priorTestDate").asText();
		assertEquals("2020-11-30", symptomOnset);
		assertEquals("2020-05-15", priorTest);
		// this assertion is kind of extra, should be on a patient management test instead
		assertEquals("1899-05-10", queueEntry.get("patient").get("birthDate").asText());
	}

	@Test
	public void enqueueOnePatientIsoDate() throws Exception {
		Person p = _dataFactory.createFullPerson(_org);
		String personId = p.getInternalId().toString();
		ObjectNode variables = JsonNodeFactory.instance.objectNode()
				.put("id", personId)
				.put("previousTestDate", "2020-05-15")
				.put("symptomOnsetDate", "2020-11-30")
				;
		performEnqueueMutation(variables);
		ArrayNode queueData = (ArrayNode) runQuery(QUERY).get("queue");
		assertEquals(1, queueData.size());
		JsonNode queueEntry = queueData.get(0);
		String symptomOnset = queueEntry.get("symptomOnset").asText();
		String priorTest = queueEntry.get("priorTestDate").asText();
		assertEquals("2020-11-30", symptomOnset);
		assertEquals("2020-05-15", priorTest);
	}

	private void performEnqueueMutation(ObjectNode variables) throws IOException {
		assertGraphQLSuccess(_template.perform("add-to-queue", variables));
	}

}
