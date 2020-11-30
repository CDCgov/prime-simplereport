package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.context.ActiveProfiles;

import com.fasterxml.jackson.databind.JsonNode;
import com.graphql.spring.boot.test.GraphQLResponse;
import com.graphql.spring.boot.test.GraphQLTestTemplate;

import gov.cdc.usds.simplereport.service.PersonService;
import gov.cdc.usds.simplereport.test_util.DbTruncator;

@SuppressWarnings("checkstyle:MagicNumber")
public class ApiSmokeTest extends BaseApiTest {

	@Autowired
	private PersonService _personService;
	
	@Test
	public void smoketestPatientList() throws IOException {
		truncateDb();
		GraphQLResponse postMultipart = _template.postForResource("person-query");
		assertTrue(postMultipart.isOk());
		JsonNode jsonResponse = postMultipart.readTree();
		assertTrue(jsonResponse.get("data").get("patients").isEmpty());
		// should do this as a mutator call, but not today
		_personService.addPatient("BAZ", "Baz", null, "Jesek", null, 
				LocalDate.of(2403, 12, 3),
				"Someplace", "Nice", "Capitol", "Escobar", "12345-6678",
				"(12) 2345", "visitor", "baz@dendarii.net", "Vorkosigan", null, null, "M", false, false);
		postMultipart = _template.postForResource("person-query");
		assertTrue(postMultipart.isOk());
		jsonResponse = postMultipart.readTree();
		assertTrue(jsonResponse.get("data").get("patients").has(0));
		truncateDb();
	}
}
