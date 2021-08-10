package gov.cdc.usds.simplereport.api.model;

import static org.junit.jupiter.api.Assertions.assertEquals;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.test_util.DbTruncator;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration;
import gov.cdc.usds.simplereport.test_util.SliceTestConfiguration.WithSimpleReportStandardUser;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
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
  void json_property_gender_mapping() throws Exception {
    Organization o = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(o);
    Person p = _dataFactory.createFullPerson(o);
    TestEvent te = _dataFactory.createTestEvent(p, f);

    assertEquals("male", p.getGender());

    TestEventExport sut = new TestEventExport(te);
    assertEquals("M", sut.getPatientGender());
  }

  @Test
  void json_property_ethnicity_mapping() throws Exception {
    Organization o = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(o);
    Person p = _dataFactory.createFullPerson(o);
    TestEvent te = _dataFactory.createTestEvent(p, f);

    assertEquals("not_hispanic", p.getEthnicity());

    TestEventExport sut = new TestEventExport(te);

    assertEquals("N", sut.getPatientEthnicity());
  }

  @Test
  void json_property_test_result_mapping() throws Exception {
    Organization o = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(o);
    Person p = _dataFactory.createFullPerson(o);
    TestEvent te = _dataFactory.createTestEvent(p, f);

    assertEquals(TestResult.NEGATIVE, te.getResult());

    TestEventExport sut = new TestEventExport(te);

    assertEquals("260415000", sut.getTestResult());
  }

  @Test
  void json_property_race_mapping() throws Exception {
    Organization o = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(o);
    Person p = _dataFactory.createFullPerson(o);
    TestEvent te = _dataFactory.createTestEvent(p, f);

    assertEquals("white", p.getRace());

    TestEventExport sut = new TestEventExport(te);

    assertEquals("2106-3", sut.getPatientRace());
  }

  @Test
  void json_property_site_of_care_reporting() throws Exception {
    Organization o = _dataFactory.createValidOrg();
    Facility f = _dataFactory.createValidFacility(o);
    Person p = _dataFactory.createFullPerson(o);
    TestEvent te = _dataFactory.createTestEvent(p, f);

    TestEventExport sut = new TestEventExport(te);

    assertEquals(o.getOrganizationType(), sut.getSiteOfCare());
  }
}
