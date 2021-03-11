package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.io.IOException;
import java.util.Optional;
import org.apache.commons.lang3.mutable.MutableObject;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

/** Tests for adding and fetching patients through the API */
class PatientManagementTest extends BaseApiTest {

  @Autowired private TestDataFactory _dataFactory;
  @Autowired private OrganizationService _orgService;

  @Test
  void queryPatientWithFacility() throws Exception {
    final MutableObject<String> facilityId = new MutableObject<>(); // LOL
    TestUserIdentities.withStandardUser(
        () -> {
          Organization org = _orgService.getCurrentOrganization();
          Facility place = _orgService.getFacilities(org).get(0);
          _dataFactory.createMinimalPerson(org, place, "Cassandra", null, "Thom", null);
          _dataFactory.createMinimalPerson(org, null, " Miriana", "Linas", "Luisito", null);
          facilityId.setValue(place.getInternalId().toString());
        });
    useOrgUser();
    JsonNode patients = fetchPatientsWithFacility();
    assertEquals(true, patients.get(0).get("facility").isNull());
    assertEquals(facilityId.getValue(), patients.get(1).get("facility").get("id").asText());
  }

  @Test
  void createAndFetchOnePatientIsoDate() throws Exception {
    String firstName = "Sansa";
    JsonNode patients =
        doCreateAndFetch(firstName, "Stark", "1100-12-25", "1-800-BIZ-NAME", "notbitter");
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
    doCreateAndFetch(firstName, "Stark", "1100-12-25", "1-800-BIZ-NAME", "notbitter");
  }

  @Test
  void createPatient_entryUser_fail() throws Exception {
    useOrgEntryOnly();
    String firstName = "Sansa";
    executeAddPersonMutation(
        firstName, "Stark", "1100-12-25", "1-800-BIZ-NAME", "notbitter", Optional.of(ACCESS_ERROR));
  }

  @Test
  void failsOnInvalidPhoneNumber() throws Exception {
    executeAddPersonMutation(
        "a", "b", "2020-12-29", "d", "e", Optional.of("[d] is not a valid phone number"));
  }

  private JsonNode doCreateAndFetch(
      String firstName, String lastName, String birthDate, String phone, String lookupId)
      throws IOException {
    executeAddPersonMutation(firstName, lastName, birthDate, phone, lookupId, Optional.empty());
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
