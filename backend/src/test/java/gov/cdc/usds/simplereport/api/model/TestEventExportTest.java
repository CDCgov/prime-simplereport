package gov.cdc.usds.simplereport.api.model;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import gov.cdc.usds.simplereport.db.model.DeviceType;
import gov.cdc.usds.simplereport.db.model.DeviceTypeDisease;
import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestEvent;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.AskOnEntrySurvey;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestCorrectionStatus;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.db.repository.BaseRepositoryTest;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Collections;
import java.util.Date;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

class TestEventExportTest extends BaseRepositoryTest {
  @Autowired protected TestDataFactory dataFactory;

  @Test
  void json_property_gender_mapping() {
    Organization o = dataFactory.saveValidOrganization();
    Facility f = dataFactory.createValidFacility(o);
    Person p = dataFactory.createFullPerson(o);
    TestEvent te = dataFactory.createTestEvent(p, f);

    assertEquals("male", p.getGender());

    TestEventExport sut = new TestEventExport(te);
    assertEquals("M", sut.getPatientGender());
  }

  @Test
  void json_property_preferredLang_mapping() {
    Organization o = dataFactory.saveValidOrganization();
    Facility f = dataFactory.createValidFacility(o);
    Person p = dataFactory.createFullPersonWithPreferredLanguage(o, "will-be-default-value");
    TestEvent te = dataFactory.createTestEvent(p, f);

    TestEventExport sut = new TestEventExport(te);
    assertEquals("will-be-default-value", sut.getPatientPreferredLanguage());
  }

  @Test
  void json_property_ethnicity_mapping() {
    Organization o = dataFactory.saveValidOrganization();
    Facility f = dataFactory.createValidFacility(o);
    Person p = dataFactory.createFullPerson(o);
    TestEvent te = dataFactory.createTestEvent(p, f);

    assertEquals("not_hispanic", p.getEthnicity());

    TestEventExport sut = new TestEventExport(te);

    assertEquals("N", sut.getPatientEthnicity());
  }

  @Test
  void json_property_test_result_mapping() {
    Organization o = dataFactory.saveValidOrganization();
    Facility f = dataFactory.createValidFacility(o);
    Person p = dataFactory.createFullPerson(o);
    TestEvent te = dataFactory.createTestEvent(p, f);

    assertEquals(TestResult.NEGATIVE, te.getCovidTestResult().get());

    TestEventExport sut = new TestEventExport(te);

    assertEquals("260415000", sut.getTestResult());
  }

  @Test
  void json_property_race_mapping() {
    Organization o = dataFactory.saveValidOrganization();
    Facility f = dataFactory.createValidFacility(o);
    Person p = dataFactory.createFullPerson(o);
    TestEvent te = dataFactory.createTestEvent(p, f);

    assertEquals("white", p.getRace());

    TestEventExport sut = new TestEventExport(te);

    assertEquals("2106-3", sut.getPatientRace());
  }

  @Test
  void json_property_site_of_care_reporting() {
    Organization o = dataFactory.saveValidOrganization();
    Facility f = dataFactory.createValidFacility(o);
    Person p = dataFactory.createFullPerson(o);
    TestEvent te = dataFactory.createTestEvent(p, f);

    TestEventExport sut = new TestEventExport(te);

    assertEquals(o.getOrganizationType(), sut.getSiteOfCare());
  }

  @Test
  void certainDateFieldsIncludeTime() {
    Organization o = dataFactory.saveValidOrganization();
    Facility f = dataFactory.createValidFacility(o);
    Person p = dataFactory.createFullPerson(o);
    TestEvent te = dataFactory.createTestEvent(p, f);

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
    Organization o = dataFactory.saveValidOrganization();
    Facility f = dataFactory.createValidFacility(o);
    Person p = dataFactory.createFullPerson(o);
    TestEvent te = dataFactory.createTestEvent(p, f, TestResult.NEGATIVE, false);

    TestEventExport sut = new TestEventExport(te);

    assertEquals("UNK", sut.getFirstTest());
  }

  @Test
  void determinesFirstTestFromTestEvent_hasPriorTest_true() {
    Organization o = dataFactory.saveValidOrganization();
    Facility f = dataFactory.createValidFacility(o);
    Person p = dataFactory.createFullPerson(o);
    TestEvent te = dataFactory.createTestEvent(p, f, TestResult.NEGATIVE, true);

    TestEventExport sut = new TestEventExport(te);

    assertEquals("N", sut.getFirstTest());
  }

  @Test
  void determinesFirstTestFromTestEvent_hasPriorTest_null() {
    Organization o = dataFactory.saveValidOrganization();
    Facility f = dataFactory.createValidFacility(o);
    Person p = dataFactory.createFullPerson(o);
    TestEvent te = dataFactory.createTestEvent(p, f, TestResult.NEGATIVE, null);

    TestEventExport sut = new TestEventExport(te);

    assertEquals("UNK", sut.getFirstTest());
  }

  @Test
  void specimenCollectionSubtractsDeviceOffset() throws ParseException {
    Organization o = dataFactory.saveValidOrganization();
    Facility f = dataFactory.createValidFacility(o);
    Person p = dataFactory.createFullPerson(o);

    TestEvent te =
        dataFactory.createTestEvent(
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
    Organization org = dataFactory.saveValidOrganization();
    Facility facility = dataFactory.createValidFacility(org);
    Person person = dataFactory.createFullPerson(org);

    LocalDate localDate = LocalDate.of(2020, 7, 23);
    Date backTestedDate = Date.from(localDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
    TestEvent originalTestEvent =
        dataFactory.createTestEvent(person, facility, null, TestResult.NEGATIVE, backTestedDate);
    String originalEventId = originalTestEvent.getInternalId().toString();
    TestEvent testEvent =
        dataFactory.createTestEventCorrection(originalTestEvent, TestCorrectionStatus.REMOVED);

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
    Organization org = dataFactory.saveValidOrganization();
    Facility facility = dataFactory.createValidFacility(org);
    Person person = dataFactory.createFullPerson(org);
    TestEvent testEvent = dataFactory.createTestEvent(person, facility, TestResult.NEGATIVE, false);

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
    assertEquals("eng", exportedEvent.getPatientPreferredLanguage());
  }

  @Test
  void sendPatientInfoWithCountryNull() {
    // GIVEN
    Organization org = dataFactory.saveValidOrganization();
    Facility facility = dataFactory.createValidFacility(org);
    Person person = dataFactory.createFullPersonWithSpecificCountry(org, null);
    TestEvent testEvent = dataFactory.createTestEvent(person, facility, TestResult.NEGATIVE, false);

    // WHEN
    TestEventExport exportedEvent = new TestEventExport(testEvent);

    // THEN
    assertEquals("USA", exportedEvent.getPatientCountry());
  }

  @Test
  void sendPatientInfoWithNonUSACountry() {
    // GIVEN
    Organization org = dataFactory.saveValidOrganization();
    Facility facility = dataFactory.createValidFacility(org);
    Person person = dataFactory.createFullPersonWithSpecificCountry(org, "CAN");
    TestEvent testEvent = dataFactory.createTestEvent(person, facility, TestResult.NEGATIVE, false);

    // WHEN
    TestEventExport exportedEvent = new TestEventExport(testEvent);

    // THEN
    assertEquals("CAN", exportedEvent.getPatientCountry());
  }

  @Test
  void sendPatientInfoWithCommonDeviceDiseaseInfo() {
    // GIVEN
    Organization org = dataFactory.saveValidOrganization();
    Facility facility = dataFactory.createValidFacility(org);
    DeviceType deviceType1 = dataFactory.createDeviceType("Abbott ID Now", "Abbott", "1");
    DeviceType deviceType2 = dataFactory.createDeviceType("Abbott ID Later", "Abbott", "2");
    dataFactory.addDiseasesToDevice(
        deviceType1,
        List.of(
            new DeviceTypeDisease(
                deviceType1.getInternalId(),
                dataFactory.getCovidDisease(),
                "94500-6",
                "covidEquipmentUID",
                "covidTestkitNameId1",
                "94500-0"),
            new DeviceTypeDisease(
                deviceType1.getInternalId(),
                dataFactory.getCovidDisease(),
                "94500-6",
                "covidEquipmentUID",
                "covidTestkitNameId2",
                "94500-0")));
    dataFactory.addDiseasesToDevice(
        deviceType2,
        List.of(
            new DeviceTypeDisease(
                deviceType2.getInternalId(),
                dataFactory.getCovidDisease(),
                "94500-6",
                "covidEquipmentUID1",
                "covidTestkitNameId",
                "94500-0"),
            new DeviceTypeDisease(
                deviceType2.getInternalId(),
                dataFactory.getCovidDisease(),
                "94500-6",
                "covidEquipmentUID2",
                "covidTestkitNameId",
                "94500-0")));

    Person person = dataFactory.createFullPerson(org);
    TestOrder testOrder1 = dataFactory.createTestOrder(person, facility);
    testOrder1.setDeviceTypeAndSpecimenType(deviceType1, dataFactory.getGenericSpecimen());
    TestEvent testEvent1 = dataFactory.submitTest(testOrder1, TestResult.NEGATIVE);

    TestOrder testOrder2 = dataFactory.createTestOrder(person, facility);
    testOrder2.setDeviceTypeAndSpecimenType(deviceType2, dataFactory.getGenericSpecimen());
    TestEvent testEvent2 = dataFactory.submitTest(testOrder2, TestResult.POSITIVE);

    // WHEN
    TestEventExport exportedEvent1 = new TestEventExport(testEvent1);
    TestEventExport exportedEvent2 = new TestEventExport(testEvent2);

    // THEN
    assertNull(exportedEvent1.getTestKitNameId());
    assertEquals("covidEquipmentUID", exportedEvent1.getEquipmentModelId());
    assertEquals("94500-6", exportedEvent1.getOrderedTestCode());

    assertNull(exportedEvent2.getEquipmentModelId());
    assertEquals("covidTestkitNameId", exportedEvent2.getTestKitNameId());
    assertEquals("94500-6", exportedEvent2.getOrderedTestCode());
  }
}
