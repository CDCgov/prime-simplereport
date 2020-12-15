package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;
import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.fasterxml.jackson.databind.JsonNode;

import gov.cdc.usds.simplereport.service.PersonService;

@SuppressWarnings("checkstyle:MagicNumber")
public class ApiSmokeTest extends BaseApiTest {

	@Autowired
	private PersonService _personService;
	
	@Test
	public void smoketestPatientList() throws IOException {
		truncateDb();
		JsonNode jsonResponse = runQuery("person-query");
		assertTrue(jsonResponse.get("patients").isEmpty());
		// should do this as a mutator call, but not today
		_personService.addPatient(null, "BAZ", "Baz", null, "Jesek", null, 
				LocalDate.of(2403, 12, 3),
				"Someplace", "Nice", "Capitol", "Escobar", "12345-6678",
				"(12) 2345", "STAFF", "baz@dendarii.net", "Vorkosigan", null, null, "M", false, false);
		jsonResponse = runQuery("person-query");
		assertTrue(jsonResponse.get("patients").has(0));
		truncateDb();
	}
}
