package gov.cdc.usds.simplereport.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import gov.cdc.usds.simplereport.db.model.Facility;
import gov.cdc.usds.simplereport.db.model.Organization;
import gov.cdc.usds.simplereport.db.model.PatientLink;
import gov.cdc.usds.simplereport.db.model.Person;
import gov.cdc.usds.simplereport.db.model.TestOrder;
import gov.cdc.usds.simplereport.db.model.auxiliary.PersonRole;
import gov.cdc.usds.simplereport.db.model.auxiliary.TestResult;
import gov.cdc.usds.simplereport.test_util.TestDataFactory;
import gov.cdc.usds.simplereport.test_util.TestUserIdentities;

import java.time.LocalDate;
import java.util.Collections;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;

@SuppressWarnings("checkstyle:MagicNumber")
class PatientLinkServiceTest extends BaseServiceTest<PatientLinkService> {
  @Autowired private OrganizationService _organizationService;
  @Autowired private PersonService _personService;
  @Autowired private TestOrderService _testOrderService;
  @Autowired private TestDataFactory _dataFactory;

  @BeforeEach
  void setupData() {
    initSampleData();
  }

  @Test
  void getPatientLinkCurrent() throws Exception {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createValidFacility(org);
    Person p = _dataFactory.createFullPerson(org);

    assertThrows(AccessDeniedException.class, () -> 
        _testOrderService.addPatientToQueue(
            facility.getInternalId(),
            p,
            "",
            Collections.<String, Boolean>emptyMap(),
            false,
            LocalDate.of(1865, 12, 25),
            "",
            TestResult.POSITIVE,
            LocalDate.of(1865, 12, 25),
            false));

    TestUserIdentities.addFacilityAuthorities(facility);
    TestOrder to =
        _testOrderService.addPatientToQueue(
            facility.getInternalId(),
            p,
            "",
            Collections.<String, Boolean>emptyMap(),
            false,
            LocalDate.of(1865, 12, 25),
            "",
            TestResult.POSITIVE,
            LocalDate.of(1865, 12, 25),
            false);
    TestUserIdentities.removeFacilityAuthorities(facility);      

    Organization organization =
        _service.getPatientLinkCurrent(to.getPatientLink().getInternalId().toString());
    assertEquals(organization.getInternalId(), org.getInternalId());
  }

  @Test
  void getPatientLinkVerify() throws Exception {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createValidFacility(org);
    Person p = _dataFactory.createFullPerson(org);

    assertThrows(AccessDeniedException.class, () -> 
        _testOrderService.addPatientToQueue(
            facility.getInternalId(),
            p,
            "",
            Collections.<String, Boolean>emptyMap(),
            false,
            LocalDate.of(1865, 12, 25),
            "",
            TestResult.POSITIVE,
            LocalDate.of(1865, 12, 25),
            false));

    TestUserIdentities.addFacilityAuthorities(facility);
    TestOrder to =
        _testOrderService.addPatientToQueue(
            facility.getInternalId(),
            p,
            "",
            Collections.<String, Boolean>emptyMap(),
            false,
            LocalDate.of(1865, 12, 25),
            "",
            TestResult.POSITIVE,
            LocalDate.of(1865, 12, 25),
            false);
    TestUserIdentities.removeFacilityAuthorities(facility);

    Person patient = _service.getPatientFromLink(to.getPatientLink().getInternalId().toString());
    assertEquals(patient.getInternalId(), p.getInternalId());
  }

  @Test
  void refreshPatientLink() throws Exception {
    Organization org = _organizationService.getCurrentOrganization();
    Facility facility = _dataFactory.createValidFacility(org);
    Person p = _dataFactory.createFullPerson(org);

    assertThrows(AccessDeniedException.class, () -> 
        _testOrderService.addPatientToQueue(
            facility.getInternalId(),
            p,
            "",
            Collections.<String, Boolean>emptyMap(),
            false,
            LocalDate.of(1865, 12, 25),
            "",
            TestResult.POSITIVE,
            LocalDate.of(1865, 12, 25),
            false));

    TestUserIdentities.addFacilityAuthorities(facility);
    TestOrder to =
        _testOrderService.addPatientToQueue(
            facility.getInternalId(),
            p,
            "",
            Collections.<String, Boolean>emptyMap(),
            false,
            LocalDate.of(1865, 12, 25),
            "",
            TestResult.POSITIVE,
            LocalDate.of(1865, 12, 25),
            false);

    PatientLink pl = _service.refreshPatientLink(to.getPatientLink().getInternalId().toString());
    assertNotNull(pl.getRefreshedAt());

    TestUserIdentities.removeFacilityAuthorities(facility);
    assertThrows(AccessDeniedException.class, () -> 
        _service.refreshPatientLink(to.getPatientLink().getInternalId().toString()));
  }
}
