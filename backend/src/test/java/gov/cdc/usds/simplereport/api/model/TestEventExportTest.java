package gov.cdc.usds.simplereport.api.model;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.repository.BaseRepositoryTest;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class TestEventExportTest extends BaseRepositoryTest {
  @Autowired protected TestDataFactory _dataFactory;

  @Test
  void json_property_gender_mapping() {
    Organization o = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(o);
    Person p = _dataFactory.createFullPerson(o);
    TestEvent te = _dataFactory.createTestEvent(p, f);

    assertEquals("male", p.getGender());

    TestEventExport sut = new TestEventExport(te);
    assertEquals("M", sut.getPatientGender());
  }

  @Test
  void json_property_ethnicity_mapping() {
    Organization o = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(o);
    Person p = _dataFactory.createFullPerson(o);
    TestEvent te = _dataFactory.createTestEvent(p, f);

    assertEquals("not_hispanic", p.getEthnicity());

    TestEventExport sut = new TestEventExport(te);

    assertEquals("N", sut.getPatientEthnicity());
  }

  @Test
  void json_property_test_result_mapping() {
    Organization o = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(o);
    Person p = _dataFactory.createFullPerson(o);
    TestEvent te = _dataFactory.createTestEvent(p, f);

    assertEquals(TestResult.NEGATIVE, te.getResult());

    TestEventExport sut = new TestEventExport(te);

    assertEquals("260415000", sut.getTestResult());
  }

  @Test
  void json_property_race_mapping() {
    Organization o = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(o);
    Person p = _dataFactory.createFullPerson(o);
    TestEvent te = _dataFactory.createTestEvent(p, f);

    assertEquals("white", p.getRace());

    TestEventExport sut = new TestEventExport(te);

    assertEquals("2106-3", sut.getPatientRace());
  }

  @Test
  void json_property_site_of_care_reporting() {
    Organization o = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(o);
    Person p = _dataFactory.createFullPerson(o);
    TestEvent te = _dataFactory.createTestEvent(p, f);

    TestEventExport sut = new TestEventExport(te);

    assertEquals(o.getOrganizationType(), sut.getSiteOfCare());
  }

  @Test
  void certainDateFieldsIncludeTime() {
    Organization o = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(o);
    Person p = _dataFactory.createFullPerson(o);
    TestEvent te = _dataFactory.createTestEvent(p, f);

    TestEventExport sut = new TestEventExport(te);

    var lengthWithoutTime = "yyyyMMdd".length();
    var lengthWithTime = "yyyyMMddHHmmss".length();

    assertEquals(lengthWithTime, sut.getSpecimenCollectionDateTime().length());
    assertEquals(lengthWithTime, sut.getTestDate().length());
    assertEquals(lengthWithTime, sut.getDateResultReleased().length());
    assertEquals(lengthWithoutTime, sut.getPatientBirthDate().length());
  }

  @Test
  void determinesFirstTestFromTestEvent_hasPriorTest_false() {
    Organization o = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(o);
    Person p = _dataFactory.createFullPerson(o);
    TestEvent te = _dataFactory.createTestEvent(p, f, TestResult.NEGATIVE, false);

    TestEventExport sut = new TestEventExport(te);

    assertEquals("UNK", sut.getFirstTest());
  }

  @Test
  void determinesFirstTestFromTestEvent_hasPriorTest_true() {
    Organization o = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(o);
    Person p = _dataFactory.createFullPerson(o);
    TestEvent te = _dataFactory.createTestEvent(p, f, TestResult.NEGATIVE, true);

    TestEventExport sut = new TestEventExport(te);

    assertEquals("N", sut.getFirstTest());
  }

  @Test
  void determinesFirstTestFromTestEvent_hasPriorTest_null() {
    Organization o = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(o);
    Person p = _dataFactory.createFullPerson(o);
    TestEvent te = _dataFactory.createTestEvent(p, f, TestResult.NEGATIVE, null);

    TestEventExport sut = new TestEventExport(te);

    assertEquals("UNK", sut.getFirstTest());
  }

  @Test
  void specimenCollectionSubtractsDeviceOffset() throws ParseException {
    Organization o = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(o);
    Person p = _dataFactory.createFullPerson(o);

    TestEvent te =
        _dataFactory.createTestEvent(
            p,
            f,
            AskOnEntrySurvey.builder().symptoms(Collections.emptyMap()).build(),
            TestResult.NEGATIVE,
            new SimpleDateFormat("yyyyMMdd").parse("20201215"));
    TestEventExport sut = new TestEventExport(te);

    assertEquals("20201215000000", sut.getTestDate());
    assertEquals("20201214234500", sut.getSpecimenCollectionDateTime());
  }

  @Test
  void sendCorrectionReason() {
    // GIVEN
    Organization org = _dataFactory.createValidOrg();
    Facility facility = _dataFactory.createValidFacility(org);
    Person person = _dataFactory.createFullPerson(org);

    LocalDate localDate = LocalDate.of(2020, 7, 23);
    Date backTestedDate = Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    TestEvent originalTestEvent =
        _dataFactory.createTestEvent(person, facility, null, null, backTestedDate);
    String originalEventId = originalTestEvent.getInternalId().toString();
    TestEvent testEvent = _dataFactory.createTestEventRemoval(originalTestEvent);

    // WHEN
    TestEventExport exportedEvent = new TestEventExport(testEvent);

    // THEN
    assertEquals("20200723000000", exportedEvent.getTestDate());
    assertEquals("Cold feet", exportedEvent.getCorrectionReason());
    assertEquals(originalEventId, exportedEvent.getCorrectedResultId());
  }

  @Test
  void sendPatientInfo() {
    // GIVEN
    Organization org = _dataFactory.createValidOrg();
    Facility facility = _dataFactory.createValidFacility(org);
    Person person = _dataFactory.createFullPerson(org);
    TestEvent testEvent =
        _dataFactory.createTestEvent(person, facility, TestResult.NEGATIVE, false);

    // WHEN
    TestEventExport exportedEvent = new TestEventExport(testEvent);

    // THEN
    assertEquals("Fred", exportedEvent.getPatientFirstName());
    assertEquals("M", exportedEvent.getPatientMiddleName());
    assertEquals("Astaire", exportedEvent.getPatientLastName());
    assertEquals("736 Jackson PI NW", exportedEvent.getPatientStreet());
    assertEquals("APT. 123", exportedEvent.getPatientStreetTwo());
    assertEquals("Washington", exportedEvent.getPatientCity());
    assertEquals("DC", exportedEvent.getPatientState());
    assertEquals("20503", exportedEvent.getPatientZipCode());
    assertEquals("Washington", exportedEvent.getPatientCounty());
    assertEquals("USA", exportedEvent.getPatientCountry());
    assertEquals("English", exportedEvent.getPatientPreferredLanguage());
  }

  @Test
  void sendPatientInfoWithCountryNull() {
    // GIVEN
    Organization org = _dataFactory.createValidOrg();
    Facility facility = _dataFactory.createValidFacility(org);
    Person person = _dataFactory.createFullPersonWithSpecificCountry(org, null);
    TestEvent testEvent =
        _dataFactory.createTestEvent(person, facility, TestResult.NEGATIVE, false);

    // WHEN
    TestEventExport exportedEvent = new TestEventExport(testEvent);

    // THEN
    assertEquals("USA", exportedEvent.getPatientCountry());
  }

  @Test
  void sendPatientInfoWithNonUSACountry() {
    // GIVEN
    Organization org = _dataFactory.createValidOrg();
    Facility facility = _dataFactory.createValidFacility(org);
    Person person = _dataFactory.createFullPersonWithSpecificCountry(org, "CAN");
    TestEvent testEvent =
        _dataFactory.createTestEvent(person, facility, TestResult.NEGATIVE, false);

    // WHEN
    TestEventExport exportedEvent = new TestEventExport(testEvent);

    // THEN
    assertEquals("CAN", exportedEvent.getPatientCountry());
  }
}
