package gov.cdc.usds.simplereport.api;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.io.IOException;
import java.util.EnumSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
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
    useOrgAdmin();
    String firstName = "Sansa";
    JsonNode patients =
        doCreateAndFetch(
            firstName, "Stark", "1100-12-25", "1-800-BIZ-NAME", "notbitter", Optional.empty());
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
    doCreateAndFetch(
        firstName, "Stark", "1100-12-25", "1-800-BIZ-NAME", "notbitter", Optional.empty());
  }

  @Test
  void createPatient_standardUser_successDependsOnFacilityAccess() throws Exception {
    executeAddPersonMutation(
        "Sansa",
        "Stark",
        "1100-12-25",
        "1-800-BIZ-NAME",
        "notbitter",
        Optional.empty(),
        Optional.empty());
    UUID facilityId = extractAllFacilitiesInOrg().get(TestUserIdentities.TEST_FACILITY_1);
    executeAddPersonMutation(
        "Sansa",
        "Stark",
        "1100-12-25",
        "1-800-BIZ-NAME",
        "notbitter",
        Optional.of(facilityId),
        Optional.of(ACCESS_ERROR));

    updateSelfPrivileges(Role.USER, true, Set.of());
    executeAddPersonMutation(
        "Sansa",
        "Stark",
        "1100-12-25",
        "1-800-BIZ-NAME",
        "notbitter",
        Optional.of(facilityId),
        Optional.empty());

    updateSelfPrivileges(Role.USER, false, Set.of(facilityId));
    executeAddPersonMutation(
        "Sansa",
        "Stark",
        "1100-12-25",
        "1-800-BIZ-NAME",
        "notbitter",
        Optional.of(facilityId),
        Optional.empty());
  }

  @Test
  void createPatient_entryUser_fail() throws Exception {
    useOrgEntryOnly();
    executeAddPersonMutation(
        "Sansa",
        "Stark",
        "1100-12-25",
        "1-800-BIZ-NAME",
        "notbitter",
        Optional.empty(),
        Optional.of(ACCESS_ERROR));
  }

  @Test
  void updatePatient_adminUser_ok() throws Exception {
    useOrgAdmin();

    UUID facility1Id = extractAllFacilitiesInOrg().get(TestUserIdentities.TEST_FACILITY_1);
    UUID facility2Id = extractAllFacilitiesInOrg().get(TestUserIdentities.TEST_FACILITY_2);

    JsonNode p1 =
        executeAddPersonMutation(
                "Sansa",
                "Stark",
                "1100-12-25",
                "1-800-BIZ-NAME",
                "notbitter",
                Optional.empty(),
                Optional.empty())
            .get("addPatient");
    executeUpdatePersonMutation(
        UUID.fromString(p1.get("internalId").asText()),
        "Sansa",
        "Stark",
        "1100-12-25",
        "1-800-BIZ-NAME",
        "notbitter",
        Optional.empty(),
        Optional.empty());

    JsonNode p2 =
        executeAddPersonMutation(
                "Jimmy",
                "Neutron",
                "2000-12-25",
                "1-800-NEU-TRON",
                "boygenius",
                Optional.of(facility1Id),
                Optional.empty())
            .get("addPatient");
    executeUpdatePersonMutation(
        UUID.fromString(p2.get("internalId").asText()),
        "Jimmy",
        "Proton",
        "2000-12-25",
        "1-800-NEU-TRON",
        "boygenius",
        Optional.of(facility1Id),
        Optional.empty());
    executeUpdatePersonMutation(
        UUID.fromString(p2.get("internalId").asText()),
        "Jimmy",
        "Proton",
        "2000-12-25",
        "1-800-NEU-TRON",
        "boygenius",
        Optional.of(facility2Id),
        Optional.empty());
  }

  @Test
  void updatePatient_standardUser_successDependsOnFacilityAccess() throws Exception {
    UUID facility1Id = extractAllFacilitiesInOrg().get(TestUserIdentities.TEST_FACILITY_1);
    UUID facility2Id = extractAllFacilitiesInOrg().get(TestUserIdentities.TEST_FACILITY_2);

    JsonNode p1 =
        executeAddPersonMutation(
                "Sansa",
                "Stark",
                "1100-12-25",
                "1-800-BIZ-NAME",
                "notbitter",
                Optional.empty(),
                Optional.empty())
            .get("addPatient");
    executeUpdatePersonMutation(
        UUID.fromString(p1.get("internalId").asText()),
        "Sansa",
        "Stark",
        "1100-12-25",
        "1-800-BIZ-NAME",
        "notbitter",
        Optional.empty(),
        Optional.empty());

    updateSelfPrivileges(Role.USER, false, Set.of(facility1Id));
    JsonNode p2 =
        executeAddPersonMutation(
                "Jimmy",
                "Neutron",
                "2000-12-25",
                "1-800-NEU-TRON",
                "boygenius",
                Optional.of(facility1Id),
                Optional.empty())
            .get("addPatient");
    executeUpdatePersonMutation(
        UUID.fromString(p2.get("internalId").asText()),
        "Jimmy",
        "Proton",
        "2000-12-25",
        "1-800-NEU-TRON",
        "boygenius",
        Optional.of(facility1Id),
        Optional.empty());
    executeUpdatePersonMutation(
        UUID.fromString(p2.get("internalId").asText()),
        "Jimmy",
        "Proton",
        "2000-12-25",
        "1-800-NEU-TRON",
        "boygenius",
        Optional.of(facility2Id),
        Optional.of(ACCESS_ERROR));

    updateSelfPrivileges(Role.USER, false, Set.of(facility1Id, facility2Id));
    executeUpdatePersonMutation(
        UUID.fromString(p2.get("internalId").asText()),
        "Jimmy",
        "Proton",
        "2000-12-25",
        "1-800-NEU-TRON",
        "boygenius",
        Optional.of(facility2Id),
        Optional.empty());

    updateSelfPrivileges(Role.USER, true, Set.of());
    executeUpdatePersonMutation(
        UUID.fromString(p2.get("internalId").asText()),
        "Jimmy",
        "Proton",
        "2000-12-25",
        "1-800-NEU-TRON",
        "boygenius",
        Optional.of(facility1Id),
        Optional.empty());
  }

  @Test
  void setPatientIsDeleted_adminUser_ok() throws Exception {
    useOrgAdmin();

    UUID facility1Id = extractAllFacilitiesInOrg().get(TestUserIdentities.TEST_FACILITY_1);

    JsonNode p1 =
        executeAddPersonMutation(
                "Sansa",
                "Stark",
                "1100-12-25",
                "1-800-BIZ-NAME",
                "notbitter",
                Optional.empty(),
                Optional.empty())
            .get("addPatient");
    executeDeletePersonMutation(UUID.fromString(p1.get("internalId").asText()), Optional.empty());

    JsonNode p2 =
        executeAddPersonMutation(
                "Jimmy",
                "Neutron",
                "2000-12-25",
                "1-800-NEU-TRON",
                "boygenius",
                Optional.of(facility1Id),
                Optional.empty())
            .get("addPatient");
    executeDeletePersonMutation(UUID.fromString(p2.get("internalId").asText()), Optional.empty());
  }

  @Test
  void setPatientIsDeleted_standardUser_successDependsOnFacilityAccess() throws Exception {
    UUID facility1Id = extractAllFacilitiesInOrg().get(TestUserIdentities.TEST_FACILITY_1);
    UUID facility2Id = extractAllFacilitiesInOrg().get(TestUserIdentities.TEST_FACILITY_2);

    JsonNode p1 =
        executeAddPersonMutation(
                "Sansa",
                "Stark",
                "1100-12-25",
                "1-800-BIZ-NAME",
                "notbitter",
                Optional.empty(),
                Optional.empty())
            .get("addPatient");
    executeDeletePersonMutation(UUID.fromString(p1.get("internalId").asText()), Optional.empty());

    updateSelfPrivileges(Role.USER, true, Set.of());
    JsonNode p2 =
        executeAddPersonMutation(
                "Jimmy",
                "Neutron",
                "2000-12-25",
                "1-800-NEU-TRON",
                "boygenius",
                Optional.of(facility1Id),
                Optional.empty())
            .get("addPatient");
    JsonNode p3 =
        executeAddPersonMutation(
                "Kim",
                "Possible",
                "2005-12-25",
                "1-800-KIM-POSS",
                "callmebeepme",
                Optional.of(facility2Id),
                Optional.empty())
            .get("addPatient");

    updateSelfPrivileges(Role.USER, false, Set.of());
    executeDeletePersonMutation(
        UUID.fromString(p2.get("internalId").asText()), Optional.of(ACCESS_ERROR));
    executeDeletePersonMutation(
        UUID.fromString(p3.get("internalId").asText()), Optional.of(ACCESS_ERROR));

    updateSelfPrivileges(Role.USER, false, Set.of(facility1Id));
    executeDeletePersonMutation(UUID.fromString(p2.get("internalId").asText()), Optional.empty());
    executeDeletePersonMutation(
        UUID.fromString(p3.get("internalId").asText()), Optional.of(ACCESS_ERROR));

    updateSelfPrivileges(Role.USER, true, Set.of());
    executeDeletePersonMutation(UUID.fromString(p3.get("internalId").asText()), Optional.empty());
  }

  @Test
  void failsOnInvalidPhoneNumber() throws Exception {
    executeAddPersonMutation(
        "a",
        "b",
        "2020-12-29",
        "d",
        "e",
        Optional.empty(),
        Optional.of("[d] is not a valid phone number"));
  }

  @Test
  void queryingDeletedPatients_standardUser_fails() {
    useOrgUser();
    runQuery("deleted-person-query", null, ACCESS_ERROR);
    assertLastAuditEntry(
        TestUserIdentities.STANDARD_USER,
        "GetDeletedPatients",
        EnumSet.of(
            UserPermission.READ_PATIENT_LIST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.READ_RESULT_LIST,
            UserPermission.EDIT_PATIENT,
            UserPermission.ARCHIVE_PATIENT,
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST),
        List.of("patients"));
  }

  @Test
  void queryingDeletedPatients_admin_ok() {
    useOrgAdmin();
    runQuery("deleted-person-query", null, null);
    assertLastAuditEntry(
        TestUserIdentities.ORG_ADMIN_USER,
        "GetDeletedPatients",
        EnumSet.allOf(UserPermission.class),
        List.of());
  }

  private JsonNode doCreateAndFetch(
      String firstName,
      String lastName,
      String birthDate,
      String phone,
      String lookupId,
      Optional<UUID> facilityId)
      throws IOException {
    executeAddPersonMutation(
        firstName, lastName, birthDate, phone, lookupId, facilityId, Optional.empty());
    JsonNode patients = fetchPatients(facilityId);
    return patients;
  }

  private JsonNode fetchPatients(Optional<UUID> facilityId) {
    ObjectNode variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("facilityId", facilityId.map(UUID::toString).orElse(null));
    return (JsonNode) runQuery("person-query", variables).get("patients");
  }

  private JsonNode fetchPatientsWithFacility() {
    return (JsonNode) runQuery("person-with-facility-query").get("patients");
  }

  private JsonNode executeUpdatePersonMutation(
      UUID patientId,
      String firstName,
      String lastName,
      String birthDate,
      String phone,
      String lookupId,
      Optional<UUID> facilityId,
      Optional<String> expectedError)
      throws IOException {
    ObjectNode variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("patientId", patientId.toString())
            .put("firstName", firstName)
            .put("lastName", lastName)
            .put("birthDate", birthDate)
            .put("telephone", phone)
            .put("lookupId", lookupId)
            .put("facilityId", facilityId.map(UUID::toString).orElse(null));
    return runQuery("update-person", variables, expectedError.orElse(null)).get("updatePatient");
  }

  private JsonNode executeDeletePersonMutation(UUID patientId, Optional<String> expectedError)
      throws IOException {
    ObjectNode variables =
        JsonNodeFactory.instance.objectNode().put("id", patientId.toString()).put("deleted", true);
    return runQuery("delete-person", variables, expectedError.orElse(null))
        .get("setPatientIsDeleted");
  }
}
