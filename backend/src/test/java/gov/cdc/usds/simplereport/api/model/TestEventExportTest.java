package gov.cdc.usds.simplereport.api.model;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Collections;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase.Replace;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;

@DataJpaTest
@AutoConfigureTestDatabase(replace = Replace.NONE)
@Import({SliceTestConfiguration.class, DbTruncator.class})
@WithSimpleReportStandardUser
class TestEventExportTest {
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
}
