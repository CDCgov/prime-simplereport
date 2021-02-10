package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.io.IOException;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.graphql.spring.boot.test.GraphQLResponse;

import org.springframework.beans.factory.annotation.Autowired;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;


/**
 * Tests for adding and fetching patients through the API
 */
class PatientManagementTest extends BaseApiTest {

    @Autowired
    private TestDataFactory _dataFactory;
    @Autowired
    private OrganizationService _orgService;

    @Test
    void queryPatientWithFacility() throws Exception {
        Organization org = _orgService.getCurrentOrganization();
        Facility place = _orgService.getFacilities(org).get(0);
        _dataFactory.createMinimalPerson(org, place, "Cassandra", null, "Thom", null);
        _dataFactory.createMinimalPerson(org, null, " Miriana", "Linas", "Luisito", null);
        JsonNode patients = fetchPatientsWithFacility();
        assertEquals(true, patients.get(0).get("facility").isNull());
        assertEquals(place.getInternalId().toString(), patients.get(1).get("facility").get("id").asText());
    }

    @Test
    void createAndFetchOnePatientUsDate() throws Exception {
        String firstName = "Jon";
        JsonNode patients = doCreateAndFetch(firstName, "Snow", "05/18/1066", "(202) 867-5309", "youknownothing");
        assertTrue(patients.has(0), "At least one patient found");
        JsonNode jon = patients.get(0);
        assertEquals(firstName, jon.get("firstName").asText());
        assertEquals("1066-05-18", jon.get("birthDate").asText());
        assertEquals("(202) 867-5309", jon.get("telephone").asText());
    }

    @Test
    void createAndFetchOnePatientIsoDate() throws Exception {
        String firstName = "Sansa";
        JsonNode patients = doCreateAndFetch(firstName, "Stark", "12/25/1100", "1-800-BIZ-NAME", "notbitter");
        assertTrue(patients.has(0), "At least one patient found");
        JsonNode sansa = patients.get(0);
        assertEquals(firstName, sansa.get("firstName").asText());
        assertEquals("1100-12-25", sansa.get("birthDate").asText());
        assertEquals("(800) 249-6263", sansa.get("telephone").asText());
    }

    @Test
    void createPatient_adminUser_ok() throws Exception {
        useOrgAdmin();
        String firstName = "Sansa";
        doCreateAndFetch(firstName, "Stark", "12/25/1100", "1-800-BIZ-NAME", "notbitter");
    }

    @Test
    void createPatient_entryUser_fail() throws Exception {
        useOrgEntryOnly();
        String firstName = "Sansa";
        GraphQLResponse mutandem = executeAddPersonMutation(firstName, "Stark", "12/25/1100", "1-800-BIZ-NAME",
                "notbitter");
        assertGraphQLOutcome(mutandem.readTree(), ACCESS_ERROR);
    }

    @Test
    void failsOnInvalidPhoneNumber() throws Exception {
        GraphQLResponse resp = executeAddPersonMutation("a", "b", "12/29/2020", "d", "e");
        JsonNode errors = resp.readTree().get("errors");
        assertNotNull(errors);
        assertTrue(errors.isArray());
        assertEquals(1, errors.size());
        assertTrue(errors.get(0).toString().contains("[d] is not a valid phone number"));
    }

    private JsonNode doCreateAndFetch(String firstName, String lastName, String birthDate, String phone, String lookupId)
            throws IOException {
        GraphQLResponse resp = executeAddPersonMutation(firstName, lastName, birthDate, phone, lookupId);
        assertGraphQLSuccess(resp);
        JsonNode patients = fetchPatients();
        return patients;
    }

    private JsonNode fetchPatients() {
        return (JsonNode) runQuery("person-query").get("patients");
    }

    private JsonNode fetchPatientsWithFacility() {
        return (JsonNode) runQuery("person-with-facility-query").get("patients");
    }
}
