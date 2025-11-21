package gov.cdc.usds.simplereport.api.graphql;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.model.Role;
import gov.cdc.usds.simplereport.config.authorization.UserPermission;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;
import java.io.IOException;
import java.util.EnumSet;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Stream;
import org.apache.commons.lang3.mutable.MutableObject;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

/** Tests for adding and fetching patients through the API */
class PatientManagementTest extends BaseGraphqlTest {

  @Autowired private TestDataFactory _dataFactory;
  @Autowired private OrganizationService _orgService;
  @MockitoBean private CurrentTenantDataAccessContextHolder _tenantDataAccessContextHolder;

  @Test
  void queryPatientWithFacility() throws Exception {
    final MutableObject<String> facilityId = new MutableObject<>(); // LOL
    TestUserIdentities.withStandardUser(
        () -> {
          Organization org = _orgService.getCurrentOrganizationNoCache();
          Facility place = _orgService.getFacilities(org).get(0);
          _dataFactory.createMinimalPerson(org, place, "Cassandra", null, "Thom", null);
          _dataFactory.createMinimalPerson(org, null, " Miriana", "Linas", "Luisito", null);
          facilityId.setValue(place.getInternalId().toString());
        });
    useOrgUser();
    JsonNode patients = fetchPatientsWithFacility();
    assertTrue(patients.get(0).get("facility").isNull());
    assertEquals(facilityId.getValue(), patients.get(1).get("facility").get("id").asText());
  }

  @Test
  void createAndFetchOnePatient() throws Exception {
    useOrgAdmin();
    String firstName = "Sansa";
    JsonNode patients =
        doCreateAndFetch(
            firstName, "Stark", "1100-12-25", "1-800-BIZ-NAME", "notbitter", Optional.empty());
    assertTrue(patients.has(0), "At least one patient found");
    JsonNode sansa = patients.get(0);
    // check that both ID fields exist and are equal
    assertTrue(sansa.has("id"), "'id' field present");
    assertTrue(sansa.has("internalId"), "'internalId' field present");
    assertEquals(sansa.get("id").asText(), sansa.get("internalId").asText());
    // check name through both flat and structured graph nodes
    assertEquals(firstName, sansa.get("firstName").asText());
    assertEquals(firstName, sansa.path("name").get("firstName").asText());
    // check address through both flat and structured graph nodes
    assertEquals("Top Floor", sansa.get("street").asText());
    assertEquals("Top Floor", sansa.path("address").get("streetOne").asText());
    assertEquals("Winterfell", sansa.get("city").asText());
    assertEquals("Winterfell", sansa.path("address").get("city").asText());
    assertEquals("NY", sansa.get("state").asText());
    assertEquals("NY", sansa.path("address").get("state").asText());
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
        Optional.of("Current user does not have permission to request [/addPatient]"));
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
  void setPatientIsDeleted_siteAdminUser_ok() throws Exception {
    useOrgAdmin();

    String orgExternalId = _orgService.getCurrentOrganization().getExternalId();

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

    useSuperUser();
    Optional<String> expectedError = Optional.empty();
    Map<String, Object> variables =
        Map.of(
            "id",
            UUID.fromString(p1.get("internalId").asText()),
            "deleted",
            true,
            "orgExternalId",
            orgExternalId);
    runQuery("delete-person", variables, expectedError.orElse(null)).get("setPatientIsDeleted");
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
  void queryingDeletedPatients_standardUser_fail() {
    useOrgUser();
    runQuery(
        "deleted-person-query",
        "getDeletedPatients",
        null,
        "Current user does not have permission to supply a non-default value for [archivedStatus]");
    assertLastAuditEntry(
        TestUserIdentities.STANDARD_USER,
        "getDeletedPatients",
        EnumSet.of(
            UserPermission.READ_PATIENT_LIST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.READ_RESULT_LIST,
            UserPermission.EDIT_PATIENT,
            UserPermission.ARCHIVE_PATIENT,
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.UPLOAD_RESULTS_SPREADSHEET),
        List.of("patients"));
  }

  @Test
  void queryingDeletedPatients_admin_ok() {
    useOrgAdmin();
    runQuery("deleted-person-query", "getDeletedPatients", null, null);
    assertLastAuditEntry(
        TestUserIdentities.ORG_ADMIN_USER,
        "getDeletedPatients",
        EnumSet.of(
            UserPermission.READ_PATIENT_LIST,
            UserPermission.READ_ARCHIVED_PATIENT_LIST,
            UserPermission.SEARCH_PATIENTS,
            UserPermission.READ_RESULT_LIST,
            UserPermission.EDIT_PATIENT,
            UserPermission.ARCHIVE_PATIENT,
            UserPermission.EDIT_FACILITY,
            UserPermission.EDIT_ORGANIZATION,
            UserPermission.MANAGE_USERS,
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST,
            UserPermission.ACCESS_ALL_FACILITIES,
            UserPermission.VIEW_ARCHIVED_FACILITIES,
            UserPermission.UPLOAD_RESULTS_SPREADSHEET),
        List.of());
  }

  @Test
  void queryingPatientLastTestResult_entryOnly_ok() throws Exception {
    executeAddPersonMutation(
        "Sansa",
        "Stark",
        "1100-12-25",
        "1-800-BIZ-NAME",
        "notbitter",
        Optional.empty(),
        Optional.empty());

    useOrgEntryOnly();
    Map<String, Object> variables = Map.of("namePrefixMatch", "San");
    runQuery(
        "person-with-last-test-result-query", "getPatientsWithLastTestResult", variables, null);
    assertLastAuditEntry(
        TestUserIdentities.ENTRY_ONLY_USER,
        "getPatientsWithLastTestResult",
        EnumSet.of(
            UserPermission.SEARCH_PATIENTS,
            UserPermission.START_TEST,
            UserPermission.UPDATE_TEST,
            UserPermission.SUBMIT_TEST),
        List.of());
  }

  @ParameterizedTest
  @MethodSource("updatePersonIllegalArguments")
  void updatePatient_invalidArguments_expectedError(
      String argName, String argValue, String expectedError) throws Exception {
    ObjectNode patient =
        (ObjectNode)
            executeAddPersonMutation(
                    "Sansa",
                    "Stark",
                    "1100-12-25",
                    "1-800-BIZ-NAME",
                    "notbitter",
                    Optional.empty(),
                    Optional.empty())
                .get("addPatient");

    HashMap<String, Object> variables = new HashMap<>();
    variables.put("patientId", patient.get("internalId").asText());
    variables.put("firstName", patient.get("firstName").asText());
    variables.put("lastName", patient.get("lastName").asText());
    variables.put("birthDate", "1100-12-25");
    variables.put(argName, argValue);
    runQuery("update-person", variables, expectedError);
  }

  private static Stream<Arguments> updatePersonIllegalArguments() {
    return Stream.of(
        Arguments.of("role", "x".repeat(33), "/updatePatient/role size must be between 0 and 32"),
        Arguments.of(
            "patientId", "x".repeat(35), "/updatePatient/patientId size must be between 36 and 36"),
        Arguments.of(
            "firstName",
            "x".repeat(500),
            "/updatePatient/firstName size must be between 0 and 256"));
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
    Map<String, Object> variables = null;
    if (facilityId.isPresent()) {
      variables = Map.of("facilityId", facilityId.get().toString());
    }
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
    Map<String, Object> variables =
        new HashMap<>(
            Map.of(
                "patientId", patientId.toString(),
                "firstName", firstName,
                "lastName", lastName,
                "birthDate", birthDate,
                "telephone", phone,
                "lookupId", lookupId));
    facilityId.ifPresent(uuid -> variables.put("facilityId", uuid.toString()));
    return runQuery("update-person", variables, expectedError.orElse(null)).get("updatePatient");
  }

  private JsonNode executeDeletePersonMutation(UUID patientId, Optional<String> expectedError)
      throws IOException {
    Map<String, Object> variables = Map.of("id", patientId.toString(), "deleted", true);
    return runQuery("delete-person", variables, expectedError.orElse(null))
        .get("setPatientIsDeleted");
  }
}
