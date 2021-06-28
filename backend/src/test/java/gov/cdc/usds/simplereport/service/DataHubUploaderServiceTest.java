package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.fail;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.dataformat.csv.CsvGenerator;
import com.fasterxml.jackson.dataformat.csv.CsvMapper;
import com.fasterxml.jackson.dataformat.csv.CsvSchema;
import gov.cdc.usds.simplereport.api.model.TestEventExport;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

public class DataHubUploaderServiceTest extends BaseServiceTest<DataHubUploaderService> {
  @Autowired private TestDataFactory _dataFactory;

  @Test
  void serialization() {
    Organization o = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(o);
    AskOnEntrySurvey s =
        new AskOnEntrySurvey(null, Collections.emptyMap(), null, null, null, null, null, null);
    TestResult r = TestResult.NEGATIVE;
    Date d = new Date();

    Person p1 = _dataFactory.createMinimalPerson(o);
    Person p2 = _dataFactory.createMinimalPerson(o);

    TestEvent te1 = _dataFactory.createTestEvent(p1, f, s, r, d);
    TestEvent te2 = _dataFactory.createTestEvent(p2, f, s, r, d);

    TestEventExport entry1 = new TestEventExport(te1);
    TestEventExport entry2 = new TestEventExport(te2);

    CsvMapper mapper = new CsvMapper();
    mapper
        .enable(CsvGenerator.Feature.STRICT_CHECK_FOR_QUOTING)
        .enable(CsvGenerator.Feature.ALWAYS_QUOTE_STRINGS)
        .enable(CsvGenerator.Feature.ALWAYS_QUOTE_EMPTY_STRINGS);

    CsvSchema schema = mapper.schemaFor(TestEventExport.class).withHeader().withNullValue("\"\"");

    // The data factory generates unique GUIDs for model instances shared by each test event,
    // so manually overwrite those values to match
    var date = entry1.getDateResultReleased();
    var instrumentId1 = entry1.getInstrumentID();
    var patientId1 = entry1.getPatientId();
    var resultId1 = entry1.getResultID();
    var instrumentId2 = entry2.getInstrumentID();
    var patientId2 = entry2.getPatientId();
    var resultId2 = entry2.getResultID();

    var serialized =
        "\"Corrected_result_ID\",\"Date_result_released\",\"Device_ID\",\"Employed_in_healthcare\",\"First_test\",\"Illness_onset_date\",\"Instrument_ID\",\"Order_test_date\",\"Ordered_test_code\",\"Ordering_facility_city\",\"Ordering_facility_county\",\"Ordering_facility_email\",\"Ordering_facility_name\",\"Ordering_facility_phone_number\",\"Ordering_facility_state\",\"Ordering_facility_street\",\"Ordering_facility_street_2\",\"Ordering_facility_zip_code\",\"Ordering_provider_ID\",\"Ordering_provider_city\",\"Ordering_provider_county\",\"Ordering_provider_first_name\",\"Ordering_provider_last_name\",\"Ordering_provider_phone_number\",\"Ordering_provider_state\",\"Ordering_provider_street\",\"Ordering_provider_street_2\",\"Ordering_provider_zip_code\",\"Organization_name\",\"Patient_DOB\",\"Patient_ID\",\"Patient_city\",\"Patient_county\",\"Patient_email\",\"Patient_ethnicity\",\"Patient_first_name\",\"Patient_gender\",\"Patient_last_name\",\"Patient_middle_name\",\"Patient_phone_number\",\"Patient_race\",\"Patient_role\",\"Patient_state\",\"Patient_street\",\"Patient_street_2\",\"Patient_suffix\",\"Patient_zip_code\",\"Processing_mode_code\",\"Resident_congregate_setting\",\"Result_ID\",\"Specimen_collection_date_time\",\"Specimen_source_site_code\",\"Specimen_type_code\",\"Symptomatic_for_disease\",\"Test_date\",\"Test_result_code\",\"Test_result_status\",\"Testing_lab_CLIA\",\"Testing_lab_city\",\"Testing_lab_county\",\"Testing_lab_name\",\"Testing_lab_phone_number\",\"Testing_lab_state\",\"Testing_lab_street\",\"Testing_lab_street_2\",\"Testing_lab_zip_code\"\n"
            + "\"\",\""
            + date
            + "\",\"SFN\",\"UNK\",\"UNK\",\"\",\""
            + instrumentId1
            + "\",\""
            + date
            + "\",\"54321-BOOM\",\"Washington\",\"Washington\",\"facility@test.com\",\"Imaginary Site\",\"555-867-5309\",\"DC\",\"736 Jackson PI NW\",\"\",\"20503\",\"DOOOOOOM\",\"Washington\",\"Washington\",\"Doctor\",\"Doom\",\"800-555-1212\",\"DC\",\"736 Jackson PI NW\",\"\",\"20503\",\"The Mall\",\"\",\""
            + patientId1
            + "\",\"\",\"\",\"\",\"U\",\"John\",\"U\",\"Boddie\",\"Brown\",\"503-867-5309\",\"UNK\",\"STAFF\",\"\",\"\",\"\",\"Jr.\",\"\",\"P\",\"UNK\",\""
            + resultId1
            + "\",\""
            + date
            + "\",\"986543321\",\"000111222\",\"UNK\",\""
            + date
            + "\",\"260415000\",\"F\",\"123456\",\"Washington\",\"Washington\",\"Imaginary Site\",\"555-867-5309\",\"DC\",\"736 Jackson PI NW\",\"\",\"20503\"\n"
            + "\"\",\""
            + date
            + "\",\"SFN\",\"UNK\",\"UNK\",\"\",\""
            + instrumentId2
            + "\",\""
            + date
            + "\",\"54321-BOOM\",\"Washington\",\"Washington\",\"facility@test.com\",\"Imaginary Site\",\"555-867-5309\",\"DC\",\"736 Jackson PI NW\",\"\",\"20503\",\"DOOOOOOM\",\"Washington\",\"Washington\",\"Doctor\",\"Doom\",\"800-555-1212\",\"DC\",\"736 Jackson PI NW\",\"\",\"20503\",\"The Mall\",\"\",\""
            + patientId2
            + "\",\"\",\"\",\"\",\"U\",\"John\",\"U\",\"Boddie\",\"Brown\",\"503-867-5309\",\"UNK\",\"STAFF\",\"\",\"\",\"\",\"Jr.\",\"\",\"P\",\"UNK\",\""
            + resultId2
            + "\",\""
            + date
            + "\",\"986543321\",\"000111222\",\"UNK\",\""
            + date
            + "\",\"260415000\",\"F\",\"123456\",\"Washington\",\"Washington\",\"Imaginary Site\",\"555-867-5309\",\"DC\",\"736 Jackson PI NW\",\"\",\"20503\"\n";

    try {
      var fileContents = mapper.writer(schema).writeValueAsString(List.of(entry1, entry2));
      assertEquals(serialized, fileContents);
    } catch (JsonProcessingException e) {
      fail("JsonProcessingException thrown");
    }
  }
}
