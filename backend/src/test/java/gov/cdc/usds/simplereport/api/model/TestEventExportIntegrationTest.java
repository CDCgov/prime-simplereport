package gov.cdc.usds.simplereport.api.model;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.cdc.usds.simplereport.api.CurrentTenantDataAccessContextHolder;
import gov.cdc.usds.simplereport.api.graphql.BaseGraphqlTest;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.MultiplexResultInput;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.service.OrganizationService;
import gov.cdc.usds.simplereport.service.TestEventService;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.skyscreamer.jsonassert.JSONAssert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

// added enable_lazy_load_no_trans=true because I couldn't figure out how to make the hibernate
// session work within a test that also tests our API
@TestPropertySource(properties = {"spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true"})
@WithSimpleReportStandardUser
class TestEventExportIntegrationTest extends BaseGraphqlTest {
  @Autowired private TestEventService _testEventService;
  @Autowired private OrganizationService _orgService;
  @MockitoBean private CurrentTenantDataAccessContextHolder _tenantDataAccessContextHolder;
  private final ObjectMapper objectMapper = new ObjectMapper();

  private TestEvent testEvent;

  @BeforeEach
  void initData() {
    Organization organization = _orgService.getCurrentOrganizationNoCache();
    Facility facility = _orgService.getFacilities(organization).get(0);
    Person patient = _dataFactory.createFullPerson(organization);
    _dataFactory.createTestOrder(patient, facility);
    // create testEvent via the API to test the view layer hibernate session

    Map<String, Object> variables =
        Map.of(
            "deviceId", facility.getDefaultDeviceType().getInternalId().toString(),
            "specimenId", facility.getDefaultSpecimenType().getInternalId().toString(),
            "patientId", patient.getInternalId().toString(),
            "results",
                List.of(
                    new MultiplexResultInput(
                        _diseaseService.covid().getName(), TestResult.NEGATIVE)),
            "dateTested", "2021-09-01T10:31:30.001Z");

    submitTestResult(variables, Optional.empty());
    // getting the testEvent can be improve to use the same context as used by the uploader
    testEvent = _testEventService.getLastTestResultsForPatient(patient);
  }

  @Test
  void testEventSerialization() throws Exception {
    TestEventExport testEventExport = new TestEventExport(testEvent);
    JSONAssert.assertEquals(
        "{"
            + "\"Patient_last_name\":\"Astaire\","
            + "\"Patient_first_name\":\"Fred\","
            + "\"Patient_middle_name\":\"M\","
            + "\"Patient_suffix\":null,"
            + "\"Patient_race\":\"2106-3\","
            + "\"Patient_DOB\":\"18990510\","
            + "\"Patient_gender\":\"M\","
            + "\"Patient_ethnicity\":\"N\","
            + "\"Patient_street\":\"736 Jackson PI NW\","
            + "\"Patient_street_2\":\"APT. 123\","
            + "\"Patient_city\":\"Washington\","
            + "\"Patient_county\":\"Washington\","
            + "\"Patient_state\":\"DC\","
            + "\"Patient_zip_code\":\"20503\","
            + "\"Patient_country\":\"USA\","
            + "\"Patient_phone_number\":\"202-123-4567\","
            + "\"Patient_email\":\"fred@astaire.com\","
            + "\"Patient_ID\":"
            + testEventExport.getPatientId()
            + ","
            + "\"Patient_role\":\"RESIDENT\","
            + "\"Patient_tribal_affiliation\":\"\","
            + "\"Patient_preferred_language\":\"eng\","
            + "\"Employed_in_healthcare\":\"N\","
            + "\"Resident_congregate_setting\":\"N\","
            + "\"Result_ID\":"
            + testEventExport.getResultID()
            + ","
            + "\"Corrected_result_ID\":\"\","
            + "\"Test_correction_reason\":\"\","
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
            + "\"Ordering_provider_zip_code\":\"12345\","
            + "\"Ordering_provider_county\":null,"
            + "\"Ordering_provider_phone_number\":\"(202) 555-1212\","
            + "\"Ordered_test_code\":\"95209-3\","
            + "\"Specimen_source_site_code\":\"71836000\","
            + "\"Specimen_type_code\":\"445297001\","
            + "\"Observation_result_status\":\"F\","
            + "\"Order_result_status\":\"F\","
            + "\"Test_Kit_Name_ID\":\"LumiraDx SARS-CoV-2 Ag Test_LumiraDx UK Ltd.\","
            + "\"Equipment_Model_ID\":\"LumiraDx Platform_LumiraDx\","
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
        true);
  }

  @Test
  void testCorrectedEventSerialization() throws Exception {
    TestEvent correctedTestEvent =
        _dataFactory.createTestEventCorrection(testEvent, TestCorrectionStatus.CORRECTED);
    TestEventExport correctedTestEventExport = new TestEventExport(correctedTestEvent);

    String actualStr = objectMapper.writeValueAsString(correctedTestEventExport);
    JSONAssert.assertEquals(
        "{"
            + "\"Patient_last_name\":\"Astaire\","
            + "\"Patient_first_name\":\"Fred\","
            + "\"Patient_middle_name\":\"M\","
            + "\"Patient_suffix\":null,"
            + "\"Patient_race\":\"2106-3\","
            + "\"Patient_DOB\":\"18990510\","
            + "\"Patient_gender\":\"M\","
            + "\"Patient_ethnicity\":\"N\","
            + "\"Patient_street\":\"736 Jackson PI NW\","
            + "\"Patient_street_2\":\"APT. 123\","
            + "\"Patient_city\":\"Washington\","
            + "\"Patient_county\":\"Washington\","
            + "\"Patient_state\":\"DC\","
            + "\"Patient_zip_code\":\"20503\","
            + "\"Patient_country\":\"USA\","
            + "\"Patient_phone_number\":\"202-123-4567\","
            + "\"Patient_email\":\"fred@astaire.com\","
            + "\"Patient_ID\":"
            + correctedTestEventExport.getPatientId()
            + ","
            + "\"Patient_role\":\"RESIDENT\","
            + "\"Patient_tribal_affiliation\":\"\","
            + "\"Patient_preferred_language\":\"eng\","
            + "\"Employed_in_healthcare\":\"N\","
            + "\"Resident_congregate_setting\":\"N\","
            + "\"Result_ID\":"
            + correctedTestEventExport.getResultID()
            + ","
            + "\"Corrected_result_ID\":\""
            + testEvent.getInternalId().toString()
            + "\","
            + "\"Test_correction_reason\":\"Cold feet\","
            + "\"Order_result_status\":\"C\","
            + "\"Observation_result_status\":\"C\","
            + "\"Test_result_code\":\"260415000\","
            + "\"Specimen_collection_date_time\":\""
            + correctedTestEventExport.getSpecimenCollectionDateTime()
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
            + "\"Ordering_provider_zip_code\":\"12345\","
            + "\"Ordering_provider_county\":null,"
            + "\"Ordering_provider_phone_number\":\"(202) 555-1212\","
            + "\"Ordered_test_code\":\"95209-3\","
            + "\"Specimen_source_site_code\":\"71836000\","
            + "\"Specimen_type_code\":\"445297001\","
            + "\"Test_result_status\":\"C\","
            + "\"Test_Kit_Name_ID\":\"LumiraDx SARS-CoV-2 Ag Test_LumiraDx UK Ltd.\","
            + "\"Equipment_Model_ID\":\"LumiraDx Platform_LumiraDx\","
            + "\"Instrument_ID\":"
            + correctedTestEventExport.getInstrumentID()
            + ","
            + "\"Device_ID\":\"LumiraDx SARS-CoV-2 Ag Test*\","
            + "\"Test_date\":\""
            + correctedTestEventExport.getTestDate()
            + "\","
            + "\"Date_result_released\":\""
            + correctedTestEventExport.getDateResultReleased()
            + "\","
            + "\"Order_test_date\":\""
            + correctedTestEventExport.getOrderTestDate()
            + "\","
            + "\"Site_of_care\":\"university\""
            + "}",
        actualStr,
        true);
  }

  @Test
  void testRemovedEventSerialization() throws Exception {
    TestEvent correctedTestEvent =
        _dataFactory.createTestEventCorrection(testEvent, TestCorrectionStatus.REMOVED);
    TestEventExport correctedTestEventExport = new TestEventExport(correctedTestEvent);

    String actualStr = objectMapper.writeValueAsString(correctedTestEventExport);
    JSONAssert.assertEquals(
        "{"
            + "\"Patient_last_name\":\"Astaire\","
            + "\"Patient_first_name\":\"Fred\","
            + "\"Patient_middle_name\":\"M\","
            + "\"Patient_suffix\":null,"
            + "\"Patient_race\":\"2106-3\","
            + "\"Patient_DOB\":\"18990510\","
            + "\"Patient_gender\":\"M\","
            + "\"Patient_ethnicity\":\"N\","
            + "\"Patient_street\":\"736 Jackson PI NW\","
            + "\"Patient_street_2\":\"APT. 123\","
            + "\"Patient_city\":\"Washington\","
            + "\"Patient_county\":\"Washington\","
            + "\"Patient_state\":\"DC\","
            + "\"Patient_zip_code\":\"20503\","
            + "\"Patient_country\":\"USA\","
            + "\"Patient_phone_number\":\"202-123-4567\","
            + "\"Patient_email\":\"fred@astaire.com\","
            + "\"Patient_ID\":"
            + correctedTestEventExport.getPatientId()
            + ","
            + "\"Patient_role\":\"RESIDENT\","
            + "\"Patient_tribal_affiliation\":\"\","
            + "\"Patient_preferred_language\":\"eng\","
            + "\"Employed_in_healthcare\":\"N\","
            + "\"Resident_congregate_setting\":\"N\","
            + "\"Result_ID\":"
            + correctedTestEventExport.getResultID()
            + ","
            + "\"Corrected_result_ID\":\""
            + testEvent.getInternalId().toString()
            + "\","
            + "\"Test_correction_reason\":\"Cold feet\","
            + "\"Order_result_status\":\"C\","
            + "\"Observation_result_status\":\"W\","
            + "\"Test_result_code\":\"260415000\","
            + "\"Specimen_collection_date_time\":\""
            + correctedTestEventExport.getSpecimenCollectionDateTime()
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
            + "\"Ordering_provider_zip_code\":\"12345\","
            + "\"Ordering_provider_county\":null,"
            + "\"Ordering_provider_phone_number\":\"(202) 555-1212\","
            + "\"Ordered_test_code\":\"95209-3\","
            + "\"Specimen_source_site_code\":\"71836000\","
            + "\"Specimen_type_code\":\"445297001\","
            + "\"Test_result_status\":\"W\","
            + "\"Test_Kit_Name_ID\":\"LumiraDx SARS-CoV-2 Ag Test_LumiraDx UK Ltd.\","
            + "\"Equipment_Model_ID\":\"LumiraDx Platform_LumiraDx\","
            + "\"Instrument_ID\":"
            + correctedTestEventExport.getInstrumentID()
            + ","
            + "\"Device_ID\":\"LumiraDx SARS-CoV-2 Ag Test*\","
            + "\"Test_date\":\""
            + correctedTestEventExport.getTestDate()
            + "\","
            + "\"Date_result_released\":\""
            + correctedTestEventExport.getDateResultReleased()
            + "\","
            + "\"Order_test_date\":\""
            + correctedTestEventExport.getOrderTestDate()
            + "\","
            + "\"Site_of_care\":\"university\""
            + "}",
        actualStr,
        true);
  }

  private JsonNode submitTestResult(Map<String, Object> variables, Optional<String> expectedError) {
    return runQuery("submit-queue-item", variables, expectedError.orElse(null));
  }
}
