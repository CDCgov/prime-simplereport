package gov.cdc.usds.simplereport.api.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.graphql.BaseGraphqlTest;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.TestEventService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.TestPropertySource;

// added enable_lazy_load_no_trans=true because I couldn't figure out how to make the hibernate
// session work within a test that also tests our API
@TestPropertySource(
    properties = {
      "hibernate.query.interceptor.error-level=ERROR",
      "spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"
    })
@WithSimpleReportStandardUser
class TestEventExportIntegrationTest extends BaseGraphqlTest {
  @Autowired protected TestDataFactory _dataFactory;
  @Autowired private TestEventService _testEventService;
  @Autowired private OrganizationService _orgService;
  @MockBean private CurrentTenantDataAccessContextHolder _tenantDataAccessContextHolder;
  private final ObjectMapper objectMapper = new ObjectMapper();

  TestEventExport testEventExport;

  @BeforeEach
  void initData() {
    Organization organization = _orgService.getCurrentOrganizationNoCache();
    Facility facility = _orgService.getFacilities(organization).get(0);
    Person patient = _dataFactory.createFullPerson(organization);
    _dataFactory.createTestOrder(patient, facility);
    // create testEvent via the API to test the view layer hibernate session
    ObjectNode variables =
        JsonNodeFactory.instance
            .objectNode()
            .put("deviceId", facility.getDefaultDeviceType().getInternalId().toString())
            .put("patientId", patient.getInternalId().toString())
            .put("result", TestResult.NEGATIVE.toString())
            .put("dateTested", "2021-09-01T10:31:30.001Z");
    submitTestResult(variables, Optional.empty());
    // getting the testEvent can be improve to use the same context as used by the uploader
    TestEvent testEvent = _testEventService.getLastTestResultsForPatient(patient);
    testEventExport = new TestEventExport(testEvent);
  }

  @Test
  void testEventSerialization() throws Exception {
    JSONAssert.assertEquals(
        "{"
            + "\"Patient_last_name\":\"Astaire\","
            + "\"Patient_first_name\":\"Fred\","
            + "\"Patient_middle_name\":null,"
            + "\"Patient_suffix\":null,"
            + "\"Patient_race\":\"2106-3\","
            + "\"Patient_DOB\":\"18990510\","
            + "\"Patient_gender\":\"M\","
            + "\"Patient_ethnicity\":\"N\","
            + "\"Patient_street\":\"736 Jackson PI NW\","
            + "\"Patient_street_2\":\"\","
            + "\"Patient_city\":\"Washington\","
            + "\"Patient_county\":\"Washington\","
            + "\"Patient_state\":\"DC\","
            + "\"Patient_zip_code\":\"20503\","
            + "\"Patient_phone_number\":\"202-123-4567\","
            + "\"Patient_email\":\"fred@astaire.com\","
            + "\"Patient_ID\":"
            + testEventExport.getPatientId()
            + ","
            + "\"Patient_role\":\"RESIDENT\","
            + "\"Patient_tribal_affiliation\":\"\","
            + "\"Patient_preferred_language\":\"English\","
            + "\"Employed_in_healthcare\":\"N\","
            + "\"Resident_congregate_setting\":\"N\","
            + "\"Result_ID\":"
            + testEventExport.getResultID()
            + ","
            + "\"Corrected_result_ID\":\"\","
            + "\"Test_result_status\":\"F\","
            + "\"Test_result_code\":\"260415000\","
            + "\"Specimen_collection_date_time\":\""
            + testEventExport.getSpecimenCollectionDateTime()
            + "\","
            + "\"Ordering_provider_ID\":\"PEBBLES\","
            + "\"First_test\":\"UNK\","
            + "\"Symptomatic_for_disease\":\"UNK\","
            + "\"Illness_onset_date\":\"\","
            + "\"Testing_lab_name\":\"Injection Site\","
            + "\"Testing_lab_CLIA\":\"000111222-3\","
            + "\"Testing_lab_state\":null,"
            + "\"Testing_lab_street\":\"2797 N Cerrada de Beto\","
            + "\"Testing_lab_street_2\":\"\","
            + "\"Testing_lab_zip_code\":null,"
            + "\"Testing_lab_county\":null,"
            + "\"Testing_lab_phone_number\":null,"
            + "\"Testing_lab_city\":null,"
            + "\"Processing_mode_code\":\"P\","
            + "\"Ordering_facility_city\":null,"
            + "\"Ordering_facility_county\":null,"
            + "\"Ordering_facility_name\":\"Injection Site\","
            + "\"Organization_name\":\"Dis Organization\","
            + "\"Ordering_facility_phone_number\":null,"
            + "\"Ordering_facility_email\":null,"
            + "\"Ordering_facility_state\":null,"
            + "\"Ordering_facility_street\":\"2797 N Cerrada de Beto\","
            + "\"Ordering_facility_street_2\":\"\","
            + "\"Ordering_facility_zip_code\":null,"
            + "\"Ordering_provider_last_name\":\"Flintstone\","
            + "\"Ordering_provider_first_name\":\"Fred\","
            + "\"Ordering_provider_street\":\"123 Main Street\","
            + "\"Ordering_provider_street_2\":\"\","
            + "\"Ordering_provider_city\":\"Oz\","
            + "\"Ordering_provider_state\":\"KS\","
            + "\"Ordering_provider_zip_code\":null,"
            + "\"Ordering_provider_county\":null,"
            + "\"Ordering_provider_phone_number\":\"(202) 555-1212\","
            + "\"Ordered_test_code\":\"95209-3\","
            + "\"Specimen_source_site_code\":\"71836000\","
            + "\"Specimen_type_code\":\"445297001\","
            + "\"Instrument_ID\":"
            + testEventExport.getInstrumentID()
            + ","
            + "\"Device_ID\":\"LumiraDx SARS-CoV-2 Ag Test*\","
            + "\"Test_date\":\""
            + testEventExport.getTestDate()
            + "\","
            + "\"Date_result_released\":\""
            + testEventExport.getDateResultReleased()
            + "\","
            + "\"Order_test_date\":\""
            + testEventExport.getOrderTestDate()
            + "\","
            + "\"Site_of_care\":\"university\""
            + "}",
        objectMapper.writeValueAsString(testEventExport),
        false);
  }

  private JsonNode submitTestResult(ObjectNode variables, Optional<String> expectedError) {
    return runQuery("add-test-result-mutation", variables, expectedError.orElse(null));
  }
}
